#!/usr/bin/env python3
import argparse,json
from pathlib import Path
from app.engine import analyze

def safe_div(a,b):return a/b if b else 0.0
def main():
 ap=argparse.ArgumentParser();ap.add_argument("manifest");args=ap.parse_args()
 rows=[json.loads(x) for x in Path(args.manifest).read_text(encoding="utf-8").splitlines() if x.strip()]
 critical_tp=critical_total=topic_tp=topic_pred=topic_total=diss_tp=diss_total=0
 entity_tp=entity_total=0
 details=[]
 for row in rows:
  r=analyze(row["text"],row["domain"],row.get("metadata",{}));exp=row.get("expected",{});q=r["qc"]
  expected_critical=set(exp.get("criticalFailures",[]));actual_critical=set(q.get("criticalFailures",[]));critical_tp+=len(expected_critical&actual_critical);critical_total+=len(expected_critical)
  expected_topics=set(exp.get("topics",[]));actual_topics={x["code"] for x in q.get("topics",[])};topic_tp+=len(expected_topics&actual_topics);topic_pred+=len(actual_topics);topic_total+=len(expected_topics)
  if exp.get("satisfaction")=="dissatisfied":diss_total+=1;diss_tp+=int(q.get("satisfaction")=="dissatisfied")
  exp_entities=exp.get("entities",{});actual=r.get("entities",{})
  for kind,vals in exp_entities.items():
   want={str(x).casefold() for x in vals};got={str(x.get("value","")).casefold() for x in actual.get(kind,[])};entity_tp+=len(want&got);entity_total+=len(want)
  details.append({"id":row.get("id"),"domain":row["domain"],"qc":q})
 precision=safe_div(topic_tp,topic_pred);recall=safe_div(topic_tp,topic_total);f1=safe_div(2*precision*recall,precision+recall)
 metrics={"cases":len(rows),"criticalRuleRecall":round(safe_div(critical_tp,critical_total),4),"medicalEntityRecall":round(safe_div(entity_tp,entity_total),4),"vocTopicPrecision":round(precision,4),"vocTopicRecall":round(recall,4),"vocTopicF1":round(f1,4),"vocDissatisfactionRecall":round(safe_div(diss_tp,diss_total),4)}
 gates={"criticalRuleRecall":metrics["criticalRuleRecall"]>=.98 if critical_total else None,"medicalEntityRecall":metrics["medicalEntityRecall"]>=.95 if entity_total else None,"vocTopicF1":metrics["vocTopicF1"]>=.90 if topic_total else None,"vocDissatisfactionRecall":metrics["vocDissatisfactionRecall"]>=.95 if diss_total else None}
 print(json.dumps({"engine":"text-intelligence-fa-2.0.0","metrics":metrics,"gates":gates,"details":details},ensure_ascii=False,indent=2))
if __name__=="__main__":main()
