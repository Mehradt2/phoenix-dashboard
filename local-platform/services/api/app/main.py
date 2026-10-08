from fastapi import FastAPI,HTTPException,Query
from fastapi.responses import PlainTextResponse,FileResponse
from pydantic import BaseModel,Field
from datetime import datetime,timezone
from .storage import init_db,save_case,get_profile,get_history,list_cases
from .engine import analyze_case
from .ogason import OgasonClient
from .ai import LocalAI

app=FastAPI(title="KulePoshti QC Operations OS",version="2.5.0")
init_db()

class AnalyzeRequest(BaseModel):
    entity_type:str=Field(pattern="^(doctor|sampler|user)$")
    entity_id:str=Field(min_length=1,max_length=200)
    occurred_at:datetime|None=None
    transcript:str=Field(min_length=1)
    source:str="ogason"
    visit_id:str|None=None

@app.get("/api/health")
def health():
    return {"status":"ok","service":"kuleposhti-qc","version":"2.5.0","signature":"mehradtorabi1"}

@app.get("/api/ai/status")
def ai_status(): return LocalAI().status()

@app.get("/api/rules")
def rules():
    return {"doctor":"doctor-v2.5.0","sampler":"sampler-v1.0.0","voc":"voc-v1.0.0","source_of_truth":"raw_transcript"}

@app.post("/api/cases/analyze")
def analyze(req:AnalyzeRequest):
    result=analyze_case(req.entity_type,req.entity_id,req.transcript,req.occurred_at,req.visit_id)
    return {"case_id":save_case(req,result),**result}

@app.post("/api/ogason/analyze")
def ogason_analyze(req:dict):
    text=req.get("transcript")
    if text:return analyze_case(req.get("entity_type","user"),req.get("entity_id","unknown"),text,None,req.get("visit_id"))
    try:transcript=OgasonClient().transcribe(req.get("audio_base64",""),req.get("filename","audio.wav"))
    except Exception as exc:raise HTTPException(502,f"Ogason unavailable: {exc}")
    return analyze_case(req.get("entity_type","user"),req.get("entity_id","unknown"),transcript,None,req.get("visit_id"))

@app.get("/api/profiles/{entity_type}/{entity_id}")
def profile(entity_type:str,entity_id:str):return get_profile(entity_type,entity_id)

@app.get("/api/profiles/{entity_type}/{entity_id}/history")
def history(entity_type:str,entity_id:str):return get_history(entity_type,entity_id)

@app.get("/api/reports/{entity_type}")
def report(entity_type:str,date_from:str|None=Query(None),date_to:str|None=Query(None),calendar:str="gregorian"):\n    return list_cases(entity_type,date_from,date_to,calendar)

@app.get("/api/reports/{entity_type}.csv",response_class=PlainTextResponse)
def report_csv(entity_type:str,date_from:str|None=Query(None),date_to:str|None=Query(None)):
    rows=list_cases(entity_type,date_from,date_to)["items"]
    headers=["id","entity_type","entity_id","occurred_at","score","status","topic","satisfaction"]
    return "\n".join([",".join(headers)]+[",".join(str(r.get(h,"")).replace(","," ") for h in headers) for r in rows])

@app.get("/",include_in_schema=False)
def web_home():
    return FileResponse("/app/web/index.html")

@app.get("/app.css",include_in_schema=False)
def web_css():
    return FileResponse("/app/web/app.css")

@app.get("/app.js",include_in_schema=False)
def web_js():
    return FileResponse("/app/web/app.js")
