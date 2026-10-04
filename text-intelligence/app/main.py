from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
from typing import Literal,Any
from .engine import analyze,VERSION,LEX

app=FastAPI(title="KulePoshti Persian Text Intelligence",version=VERSION)

class AnalyzeIn(BaseModel):
    domain:Literal["physician","sampler","voc"]
    text:str=Field(min_length=1,max_length=200000)
    metadata:dict[str,Any]={}

@app.get("/health")
def health():
    return {"ok":True,"service":"kuleposhti-text-intelligence","version":VERSION,"lexiconVersion":LEX["version"]}

@app.post("/v1/analyze")
def analyze_route(body:AnalyzeIn):
    try:
        return analyze(body.text,body.domain,body.metadata)
    except Exception as exc:
        raise HTTPException(status_code=422,detail=str(exc))
