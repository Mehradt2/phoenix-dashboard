from __future__ import annotations
import json,re,hashlib
from pathlib import Path
from .normalizer import normalize_fa,sentences,excerpt

BASE=Path(__file__).resolve().parent.parent
LEX=json.loads((BASE/"knowledge"/"medical_lexicon_v1.json").read_text(encoding="utf-8"))
VERSION="text-intelligence-fa-2.0.0"

def _hits(text:str,terms:list[str],kind:str):
    out=[];low=text.casefold()
    for term in terms:
        needle=normalize_fa(term).casefold()
        for m in re.finditer(re.escape(needle),low):
            out.append({"type":kind,"value":term,"start":m.start(),"end":m.end(),"evidence":excerpt(text,m.start(),m.end())})
    return out

def extract_entities(text:str):
    return {
      "medications":_hits(text,LEX["medications"],"medication"),
      "diseases":_hits(text,LEX["diseases"],"disease"),
      "labTests":_hits(text,LEX["lab_tests"],"lab_test"),
      "symptoms":_hits(text,LEX["symptoms"],"symptom"),
      "negations":_hits(text,LEX["negations"],"negation"),
      "numbers":[{"type":"number","value":m.group(0),"start":m.start(),"end":m.end(),"evidence":excerpt(text,m.start(),m.end())} for m in re.finditer(r"\b\d+(?:[./]\d+)?\b",text)]
    }

SAMPLER_RULES=[
 ("C01","شروع حرفه‌ای و معرفی",8,False,[r"سلام|وقت بخیر|صبح بخیر|عصر بخیر"],[r"نمونه ?گیر|روبرا|دکترساینا|از طرف"]),
 ("C02","تأیید مخاطب/هویت",9,False,[r"خودتون|خود شما|با آقای|با خانم|بیمار|مراجع"],[]),
 ("C03","تأیید روز و بازه مراجعه",15,True,[r"فردا|امروز|صبح|ساعت|بازه|\b(?:7|8|9|10)\s*(?:تا|الی)\s*(?:8|9|10|11)\b"],[r"تایید|تأیید|هماهنگ|مناسب|درسته"]),
 ("C04","تأیید آدرس و جزئیات دسترسی",15,True,[r"آدرس|لوکیشن|موقعیت"],[r"خیابان|کوچه|پلاک|واحد|طبقه|زنگ|بلوک"]),
 ("C05","اعلام زمان تقریبی/تماس قبل رسیدن",10,False,[r"قبل از رسیدن|تماس می ?گیرم|حدود|تقریبا|تقریباً|دقیقه"],[]),
 ("C06","شرایط آمادگی و ناشتایی",20,True,[r"ناشتا|ناشتایی|غذا|صبحانه"],[r"آب|چای|قهوه|دارو|قرص|سیگار|آدامس"]),
 ("C07","فرصت سؤال و رفع ابهام",8,False,[r"سوال|سؤال|پرسش|ابهام"],[]),
 ("C08","جمع‌بندی و تأیید نهایی",8,False,[r"هماهنگ شد|تایید می|تأیید می|پس |ممنون|درسته"],[]),
 ("C09","لحن حرفه‌ای",7,False,[r"لطفا|لطفاً|ممنون|خواهش|تشکر"],[])
]

PHYSICIAN_RULES=[
 ("PVQ-027","احراز بیمار هدف",15,False,[r"خود بیمار|هویت|نام و نام خانوادگی|مشخصات.*تایید|مشخصات.*تأیید"],[]),
 ("PVQ-030","معرفی برند/نقش",15,False,[r"پزشک|دکتر.*هستم|دکترساینا|روبرا|از طرف"],[]),
 ("PVQ-034","دارو و دوز",15,False,[r"دارو.*مصرف|دارویی.*مصرف|قرص.*مصرف"],[r"دوز|میلی ?گرم|تعداد|روزانه"]),
 ("PVQ-035","شرح حال ساختاریافته",20,False,[r"از چه زمانی|از کی|سابقه|بیماری زمینه|عمل جراحی|حساسیت"],[r"ناشتا|آمادگی|علائم|درد"]),
 ("PVQ-038","پرهیز از قطعیت پزشکی بی‌پشتوانه",20,True,[r"قطعا|قطعاً|حتما.*این بیماری|حتماً.*این بیماری|صددرصد|هیچ شکی نیست"],[])
]

VOC_TOPICS={
 "result_delay":["جواب آزمایش","نتیجه","دیر شده","هنوز جواب","تاخیر جواب","تأخیر جواب"],
 "sampler_delay":["نمونه گیر","نمونه‌گیر","دیر رسید","نیامد","تاخیر نمونه","تأخیر نمونه"],
 "schedule_change":["تغییر زمان","ساعت رو عوض","زمان رو عوض","جابجا"],
 "interpretation_missing":["تفسیر","پزشک تماس نگرفت","برای تفسیر"],
 "wrong_upload":["آپلود اشتباه","فایل اشتباه","جواب اشتباه"],
 "invoice_billing":["قبض","فاکتور","هزینه","مبلغ","پرداخت"],
 "cancellation":["کنسل","لغو","لغوش"],
 "incomplete_result":["جواب ناقص","نتیجه ناقص","همه آزمایش"],
 "support_behavior":["پشتیبانی","کارشناس","برخورد","پاسخگویی"],
 "doctor_visit":["ویزیت","پزشک","دکتر"],
 "other":[]
}

def _find(text,patterns):
    ev=[]
    for p in patterns:
        for m in re.finditer(p,text,re.I):
            ev.append(excerpt(text,m.start(),m.end()))
    return list(dict.fromkeys(ev))[:4]

def score_sampler(text:str):
    findings=[];earned=0;total=0;critical=[]
    for rid,label,w,crit,primary,support in SAMPLER_RULES:
        p=_find(text,primary);s=_find(text,support) if support else []
        passed=bool(p) and (not support or bool(s))
        total+=w
        if passed:earned+=w
        if crit and not passed:critical.append(rid)
        findings.append({"ruleId":rid,"label":label,"weight":w,"status":"pass" if passed else "fail","critical":crit,"evidence":(p+s)[:4],"confidence":0.98 if passed else 0.85})
    score=round(earned/total*100,1) if total else None
    return {"version":"sampler-text-qc-2.0.0","scoreStatus":"scored","conversationScore":score,"finalScore":None,"criticalFailures":critical,"requiresHumanReview":bool(critical),"risk":"critical" if critical else ("high" if score is not None and score<60 else "medium" if score is not None and score<80 else "low"),"findings":findings}

def score_physician(text:str):
    findings=[];earned=0;total=0;critical=[];review=["metadata_rules_pending"]
    for rid,label,w,crit,primary,support in PHYSICIAN_RULES:
        p=_find(text,primary);s=_find(text,support) if support else []
        if rid=="PVQ-038":
            passed=not bool(p);ev=p
        else:
            passed=bool(p) and (not support or bool(s));ev=(p+s)
        total+=w
        if passed:earned+=w
        if crit and not passed:critical.append(rid)
        findings.append({"ruleId":rid,"label":label,"weight":w,"status":"pass" if passed else "fail","critical":crit,"evidence":ev[:4],"confidence":0.96 if passed else 0.82})
    score=round(earned/total*100,1) if total else None
    return {"version":"physician-text-qc-2.1.0","scoreStatus":"review_required","conversationScore":score,"finalScore":None,"criticalFailures":critical,"reviewGates":review,"requiresHumanReview":True,"risk":"critical" if critical else ("high" if score is not None and score<60 else "medium"),"findings":findings}

def score_voc(text:str):
    topics=[]
    for code,terms in VOC_TOPICS.items():
        ev=[]
        for term in terms:
            ev+=_find(text,[re.escape(term)])
        if ev:
            topics.append({"code":code,"confidence":min(0.99,0.72+0.05*len(ev)),"evidence":ev[:4]})
    if not topics:
        topics=[{"code":"other","confidence":0.45,"evidence":[]}]
    pos=sum(len(_find(text,[re.escape(x)])) for x in LEX["satisfaction_positive"])
    neg=sum(len(_find(text,[re.escape(x)])) for x in LEX["satisfaction_negative"])
    if neg>pos:
        sat="dissatisfied";sent=-1 if neg>=2 else -0.6
    elif pos>neg:
        sat="satisfied";sent=0.7
    elif pos and neg:
        sat="mixed";sent=0
    else:
        sat="neutral";sent=0
    urgent=bool(re.search(r"فوری|اورژانس|شکایت رسمی|پیگیری فوری|خطر|خیلی ناراضی",text))
    return {"version":"voc-intelligence-1.0.0","scoreStatus":"classified","conversationScore":None,"finalScore":None,"requiresHumanReview":sat in("mixed","neutral") or topics[0]["code"]=="other","criticalFailures":[],"risk":"high" if urgent else ("medium" if sat=="dissatisfied" else "low"),"topics":topics,"satisfaction":sat,"sentimentScore":sent,"urgency":"urgent" if urgent else "normal","findings":[]}

def analyze(text:str,domain:str,metadata:dict|None=None):
    normalized=normalize_fa(text)
    base={"version":VERSION,"domain":domain,"normalizedText":normalized,"sentences":sentences(normalized),"entities":extract_entities(normalized),"lexiconVersion":LEX["version"],"fingerprint":hashlib.sha256(normalized.encode()).hexdigest(),"metadataEcho":metadata or {}}
    if len(normalized)<8:
        base["qc"]={"version":"insufficient","scoreStatus":"non_scorable","conversationScore":None,"finalScore":None,"requiresHumanReview":True,"criticalFailures":["TRANSCRIPT_INSUFFICIENT"],"risk":"high","findings":[]}
        return base
    base["qc"]=score_sampler(normalized) if domain=="sampler" else score_physician(normalized) if domain=="physician" else score_voc(normalized)
    return base
