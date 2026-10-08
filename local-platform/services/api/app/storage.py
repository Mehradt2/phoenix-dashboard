from jdatetime import date as jdate
import os,json,uuid
from datetime import datetime,timezone
from sqlalchemy import create_engine,text
DB=os.getenv("DATABASE_URL","sqlite:///./qc.db")
engine=create_engine(DB,future=True)
DDL=[
"CREATE TABLE IF NOT EXISTS qc_cases(id TEXT PRIMARY KEY,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,occurred_at TEXT NOT NULL,transcript TEXT NOT NULL,result_json TEXT NOT NULL,created_at TEXT NOT NULL)",
"CREATE INDEX IF NOT EXISTS ix_qc_cases_entity ON qc_cases(entity_type,entity_id,occurred_at)"
]
def init_db():
    with engine.begin() as c:
        for s in DDL:c.execute(text(s))
def save_case(req,result):
    cid=str(uuid.uuid4());when=(req.occurred_at or datetime.now(timezone.utc)).isoformat()
    with engine.begin() as c:
        c.execute(text("INSERT INTO qc_cases VALUES (:id,:et,:ei,:at,:tx,:r,:cr)"),{"id":cid,"et":req.entity_type,"ei":req.entity_id,"at":when,"tx":req.transcript,"r":json.dumps(result,ensure_ascii=False),"cr":datetime.now(timezone.utc).isoformat()})
    return cid
def _rows(et,ei=None,df=None,dt=None):
    q="SELECT * FROM qc_cases WHERE entity_type=:et";p={"et":et}
    if ei:q+=" AND entity_id=:ei";p["ei"]=ei
    if df:q+=" AND occurred_at>=:df";p["df"]=df
    if dt:q+=" AND occurred_at<=:dt";p["dt"]=dt
    q+=" ORDER BY occurred_at DESC"
    with engine.begin() as c:return [dict(r) for r in c.execute(text(q),p).mappings().all()]
def get_history(et,ei):
    rows=_rows(et,ei)
    return {"entity_type":et,"entity_id":ei,"items":[json.loads(r["result_json"])|{"case_id":r["id"],"occurred_at":r["occurred_at"]} for r in rows]}
def get_profile(et,ei):
    rows=_rows(et,ei);results=[json.loads(r["result_json"]) for r in rows]
    scores=[x["score"] for x in results if isinstance(x.get("score"),(int,float))]
    return {"entity_type":et,"entity_id":ei,"cases":len(results),"score":round(sum(scores)/len(scores),1) if scores else None,"last_score":scores[0] if scores else None,"history":results}
def list_cases(et,df=None,dt=None,calendar="gregorian"):
    if calendar=="jalali":
        if df:
            y,m,d=[int(x) for x in df.replace("-","/").split("/")]; df=datetime(y,m,d).date().isoformat()
        if dt:
            y,m,d=[int(x) for x in dt.replace("-","/").split("/")]; dt=datetime(y,m,d).date().isoformat()

    rows=_rows(et,None,df,dt);items=[]
    for r in rows:
        x=json.loads(r["result_json"])
        items.append({"id":r["id"],"entity_type":et,"entity_id":r["entity_id"],"occurred_at":r["occurred_at"],"score":x.get("score"),"status":x.get("status"),"topic":x.get("voc",{}).get("topic"),"satisfaction":x.get("voc",{}).get("satisfaction")})
    return {"entity_type":et,"from":df,"to":dt,"count":len(items),"items":items}
