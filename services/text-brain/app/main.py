from __future__ import annotations
from datetime import datetime, timezone
from typing import Literal, Optional, Any
import re, hashlib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import jdatetime

app = FastAPI(title="KulePoshti Text Brain", version="2.0.0-mvp")

Domain = Literal["physician","sampler","voc"]

ARABIC_TO_PERSIAN=str.maketrans({"ي":"ی","ى":"ی","ك":"ک","ۀ":"ه","ة":"ه","ؤ":"و","إ":"ا","أ":"ا"})
PERSIAN_DIGITS="۰۱۲۳۴۵۶۷۸۹"; ARABIC_DIGITS="٠١٢٣٤٥٦٧٨٩"

MEDICAL_LEXICON={
 "drug":["متفورمین","لووتیروکسین","آسپرین","انسولین","سیتالوپرام","آتورواستاتین","فلوکستین","لوزارتان","متوپرولول","آملودیپین"],
 "disease":["دیابت","فشار خون","تیروئید","کم خونی","کم‌خونی","آسم","صرع","تشنج","نارسایی کلیه","بیماری قلبی"],
 "symptom":["درد","تب","سرفه","سرگیجه","تهوع","استفراغ","تنگی نفس","ضعف","خستگی","سردرد"],
 "test":["قند خون","cbc","ویتامین d","ویتامین دی","tsh","آزمایش ادرار","کراتینین","کلسترول","تری گلیسرید","تری‌گلیسرید"]
}

VOC_TOPICS=[
 ("interpretation_not_received",["تفسیر","پزشک تماس نگرفت","جواب آزمایش رو توضیح","توضیح جواب"]),
 ("sampler_delay",["نمونه گیر دیر","نمونه‌گیر دیر","نمونه گیر خیلی دیر","نمونه‌گیر خیلی دیر","تاخیر نمونه گیر","تأخیر نمونه گیر","هنوز نیومده","هنوز نیامده"]),
 ("sampler_no_contact",["نمونه گیر تماس نگرفت","نمونه‌گیر تماس نگرفت","هیچ تماسی نگرفت"]),
 ("reschedule",["تغییر زمان","عوض کردن زمان","ساعت رو تغییر","ساعت را تغییر"]),
 ("wrong_upload",["آپلود اشتباه","فایل اشتباه","جواب اشتباه"]),
 ("billing",["قبض","فاکتور","صورتحساب","هزینه","مبلغ"]),
 ("add_invoice",["اضافه کردن فاکتور","فاکتور اضافه"]),
 ("cancellation",["کنسل","لغو","کنسلی"]),
 ("incomplete_result",["جواب ناقص","نتیجه ناقص","همه جواب ها نیومده","همه جواب‌ها نیامده"]),
]

NEGATIONS=["نیست","نبود","ندارم","ندارد","نشد","نمی","نه ","خیر","بدون"]
DISSAT=["ناراضی","افتضاح","بد","شکایت","عصبانی","کلافه","دیر","پیگیری نکرد","پاسخ نداد","اصلا راضی نیستم","اصلاً راضی نیستم"]
SAT=["راضی هستم","خیلی خوب","عالی","ممنونم","متشکرم","خوب بود","راضی بودم","مشکلی نبود"]

class Segment(BaseModel):
    speaker: Optional[str]=None
    start_ms: Optional[int]=None
    end_ms: Optional[int]=None
    text: str

class STTMeta(BaseModel):
    model: Optional[str]=None
    confidence: Optional[float]=None

class CanonicalTranscript(BaseModel):
    source: str = "oganson"
    source_call_id: str
    transcript_id: str
    domain: Domain
    subject_id: str
    subject_name: Optional[str]=None
    language: str="fa"
    text: str
    segments: list[Segment]=Field(default_factory=list)
    created_at: Optional[str]=None
    stt: STTMeta=Field(default_factory=STTMeta)

class Entity(BaseModel):
    type: str
    text: str
    start: int
    end: int
    negated: bool=False
    confidence: float=1.0

class Analysis(BaseModel):
    transcript_id: str
    domain: Domain
    normalized_text: str
    entities: list[Entity]
    voc: Optional[dict[str,Any]]=None
    integrity: dict[str,Any]
    pipeline_version: str="text-brain-2.0.0-mvp"

def normalize_fa(text:str)->str:
    t=text.translate(ARABIC_TO_PERSIAN)
    for i,d in enumerate(PERSIAN_DIGITS): t=t.replace(d,str(i))
    for i,d in enumerate(ARABIC_DIGITS): t=t.replace(d,str(i))
    t=t.replace("\u200c"," ")
    t=re.sub(r"[ \t]+"," ",t)
    t=re.sub(r"\s*([،؛:,.!?؟])\s*",r"\1 ",t)
    return re.sub(r"\s+"," ",t).strip().lower()

def context_negated(text:str,start:int,end:int|None=None)->bool:
    end=end if end is not None else start
    window=text[max(0,start-35):min(len(text),end+35)]
    return any(n in window for n in NEGATIONS)

def extract_entities(text:str)->list[Entity]:
    out:list[Entity]=[]
    for typ,terms in MEDICAL_LEXICON.items():
        for term in terms:
            for m in re.finditer(re.escape(term.lower()),text):
                out.append(Entity(type=typ,text=m.group(0),start=m.start(),end=m.end(),negated=context_negated(text,m.start(),m.end()),confidence=.98))
    patterns=[
      ("dose",r"\b\d+(?:\.\d+)?\s*(?:میلی ?گرم|mg|واحد)\b"),
      ("time",r"\b(?:[01]?\d|2[0-3])[:٫.]?[0-5]?\d?\b"),
      ("duration",r"\b\d+\s*(?:دقیقه|ساعت|روز|هفته|ماه)\b")
    ]
    for typ,p in patterns:
        for m in re.finditer(p,text,re.I):
            out.append(Entity(type=typ,text=m.group(0),start=m.start(),end=m.end(),negated=context_negated(text,m.start(),m.end()),confidence=.95))
    out.sort(key=lambda x:(x.start,x.end,x.type))
    ded=[]; seen=set()
    for e in out:
        k=(e.type,e.start,e.end)
        if k not in seen: seen.add(k); ded.append(e)
    return ded

def voc_analysis(text:str)->dict[str,Any]:
    scores=[]
    for topic,terms in VOC_TOPICS:
        hits=[x for x in terms if x in text]
        if hits:scores.append((topic,len(hits),hits))
    scores.sort(key=lambda x:x[1],reverse=True)
    topic=scores[0][0] if scores else "other"
    topic_evidence=scores[0][2] if scores else []
    neg=[x for x in DISSAT if x in text]; pos=[x for x in SAT if x in text]
    if neg and not pos: sentiment="dissatisfied"
    elif pos and not neg: sentiment="satisfied"
    elif pos and neg: sentiment="mixed"
    else: sentiment="unknown"
    return {
      "topic":topic,
      "topic_confidence": .90 if len(topic_evidence)>=2 else .72 if topic_evidence else .20,
      "topic_evidence":topic_evidence,
      "satisfaction":sentiment,
      "satisfaction_confidence": .88 if (neg or pos) else .20,
      "satisfaction_evidence":(neg+pos)[:5],
      "requires_human_review": topic=="other" or sentiment in ("unknown","mixed")
    }

def integrity(t:CanonicalTranscript,norm:str)->dict[str,Any]:
    seg_text=" ".join(s.text for s in t.segments).strip()
    return {
      "non_empty":bool(norm),
      "length_chars":len(norm),
      "has_segments":bool(t.segments),
      "speaker_labels_present":any(bool(s.speaker) for s in t.segments),
      "segment_text_present":bool(seg_text),
      "stt_confidence":t.stt.confidence,
      "needs_review":len(norm)<20 or (t.stt.confidence is not None and t.stt.confidence<.65)
    }

@app.get("/healthz")
def health():
    return {"ok":True,"service":"text-brain","version":"2.0.0-mvp","local_only":True}

@app.get("/v1/capabilities")
def caps():
    return {
      "language":["fa"],"domains":["physician","sampler","voc"],
      "normalization":"persian-v1","entities":["drug","disease","symptom","test","dose","time","duration"],
      "voc":["topic","satisfaction"],"paid_api":False
    }

@app.post("/v1/analyze",response_model=Analysis)
def analyze(t:CanonicalTranscript):
    if t.language!="fa": raise HTTPException(422,"language_not_supported")
    n=normalize_fa(t.text)
    ents=extract_entities(n)
    voc=voc_analysis(n) if t.domain=="voc" else None
    return Analysis(transcript_id=t.transcript_id,domain=t.domain,normalized_text=n,entities=ents,voc=voc,integrity=integrity(t,n))

@app.post("/v1/oganson/ingest")
def oganson_ingest(t:CanonicalTranscript):
    result=analyze(t)
    idem=hashlib.sha256(f"{t.source}:{t.source_call_id}:{t.transcript_id}".encode()).hexdigest()
    return {"accepted":True,"idempotency_key":idem,"analysis":result.model_dump(),"next":"qc-engine"}

class DateRange(BaseModel):
    calendar: Literal["gregorian","jalali"]
    start: str
    end: str

@app.post("/v1/date-range")
def date_range(r:DateRange):
    try:
        if r.calendar=="jalali":
            sy,sm,sd=map(int,r.start.split("-")); ey,em,ed=map(int,r.end.split("-"))
            s=jdatetime.date(sy,sm,sd).togregorian(); e=jdatetime.date(ey,em,ed).togregorian()
        else:
            s=datetime.strptime(r.start,"%Y-%m-%d").date(); e=datetime.strptime(r.end,"%Y-%m-%d").date()
        if e<s: raise ValueError("end_before_start")
        return {
          "start_utc":datetime(s.year,s.month,s.day,tzinfo=timezone.utc).isoformat(),
          "end_utc_exclusive":datetime(e.year,e.month,e.day,tzinfo=timezone.utc).isoformat(),
          "gregorian":{"start":s.isoformat(),"end":e.isoformat()},
          "jalali":{"start":str(jdatetime.date.fromgregorian(date=s)),"end":str(jdatetime.date.fromgregorian(date=e))}
        }
    except Exception as exc:
        raise HTTPException(422,f"invalid_date_range:{exc}")
