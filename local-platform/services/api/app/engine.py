"""Deterministic Persian QC engine. AI is an accelerator, never the source of truth. Signature: mehradtorabi1"""
import re
MEDICAL={"ویتامین د","ویتامین D","قند خون","فشار خون","تیروئید","کم‌خونی","کم خونی","کلسترول","تری‌گلیسرید","آزمایش خون","دارو","نسخه","دوز","قرص","سرگیجه","سردرد","درد","تب","سرفه","حالت تهوع","ریفلاکس"}
POS={"ممنون","خیلی خوب","عالی","متشکرم","لطفا","لطفاً","نگران نباشید","حتماً","حتما","خواهش می‌کنم","در خدمت"}
NEG={"ناراضی","افتضاح","بد","بی‌احترامی","بی احترامی","عصبانی","اعتراض","شکایت","اصلاً","اصلا","قطع کنید"}
AGREE={"باشه","بله","حتما","حتماً","انجام میدم","انجام می‌دم","موافقم","اوکی","قبوله"}
REGISTERED={"ثبت کردم","ثبت شد","در نسخه گذاشتم","در نسخه ثبت کردم","اضافه کردم","نوشتم"}
COMMIT={"اضافه می‌کنم","اضافه میکنم","می‌نویسم","مینویسم","در نسخه می‌گذارم","در نسخه میذارم"}
NOANSWER={"پاسخ نداد","بی‌پاسخ","بی پاسخ","no answer","تماس برقرار نشد"}

def normalize(t):
    return re.sub(r"[ \t]+"," ",t.replace("ي","ی").replace("ك","ک").replace("\u200c","‌")).strip()

def contains(t,terms):
    return [x for x in terms if x.lower() in t.lower()]

def roles(t):
    chunks=re.split(r"(?=(?:پزشک|دکتر|کاربر|بیمار|همراه|اپراتور)\s*[:：])",t);out=[]
    for c in chunks:
        if not c.strip():continue
        m=re.match(r"(پزشک|دکتر|کاربر|بیمار|همراه|اپراتور)\s*[:：]\s*(.*)",c,re.S)
        out.append((m.group(1) if m else "unknown",m.group(2) if m else c))
    return out

def evidence(t,terms):
    return [{"term":x,"evidence":x} for x in contains(t,terms)]

def vitamin_d(t):
    low=t.lower()
    mentioned=bool(re.search(r"ویتامین\s*[- ]?d|ویتامین\s*دی",low))
    if not mentioned:
        return {"mentioned":False,"agreement":False,"registration":"not_mentioned","evidence":[],"external_verification":"not_available"}
    rs=roles(t)
    doctor=" ".join(v for k,v in rs if k in ("پزشک","دکتر"))
    user=" ".join(v for k,v in rs if k in ("کاربر","بیمار","همراه"))
    d_ag=bool(contains(doctor,AGREE) or contains(doctor,REGISTERED) or contains(doctor,COMMIT) or re.search(r"انجام.*ویتامین|ویتامین.*انجام",doctor))
    u_ag=bool(contains(user,AGREE) or re.search(r"انجام.*ویتامین|ویتامین.*انجام",user))
    reg="registered" if contains(doctor,REGISTERED) else ("committed_to_register" if contains(doctor,COMMIT) else "discussed_only")
    return {"mentioned":True,"agreement":bool(d_ag and u_ag),"registration":reg,"external_verification":"not_available","evidence":evidence(t,["ویتامین د","ویتامین D"]+list(REGISTERED)+list(COMMIT))}

def doctor_score(t):
    if any(x.lower() in t.lower() for x in NOANSWER):
        return {"score":None,"status":"no_answer","dimensions":{}}
    d={
      "احترام و همدلی":min(20,10+2*len(contains(t,POS))),
      "شفافیت و ارتباط":min(20,10+2*len(re.findall(r"توضیح|یعنی|منظور|دقت کنید|توجه کنید",t))),
      "ایمنی/دقت پزشکی":min(25,12+3*len(contains(t,MEDICAL))),
      "مدیریت مکالمه":min(20,10+2*len(re.findall(r"بفرمایید|گوش می‌کنم|متوجه شدم|اجازه بدهید|اجازه بدید",t))),
      "جمع‌بندی/اقدام":min(15,7+3*len(re.findall(r"پس|بنابراین|در نتیجه|پیگیری|نسخه|آزمایش",t)))
    }
    return {"score":max(0,min(100,sum(d.values())-min(25,5*len(contains(t,NEG))))),"status":"scored","dimensions":d,"negative_signals":contains(t,NEG)}

def sampler_score(t):
    if any(x.lower() in t.lower() for x in NOANSWER):
        return {"score":None,"status":"no_answer","dimensions":{}}
    d={
      "احراز هویت و تطبیق":20 if re.search(r"نام|کد|احراز|مشخصات",t) else 8,
      "راهنمایی و شفافیت":20 if re.search(r"توضیح|راهنمایی|توضیح میدم|توضیح می‌دم",t) else 10,
      "ایمنی نمونه‌گیری":25 if re.search(r"ناشتا|نمونه|خون|شرایط|دستور",t) else 12,
      "رفتار حرفه‌ای":20 if contains(t,POS) else 12,
      "ثبت/پیگیری":15 if re.search(r"ثبت|پیگیری|آزمایشگاه|تحویل",t) else 8
    }
    return {"score":sum(d.values()),"status":"scored","dimensions":d,"negative_signals":contains(t,NEG)}

def voc_score(t):
    neg=len(contains(t,NEG));pos=len(contains(t,POS));topic="عمومی"
    for name,pat in [("نوبت/زمان",r"نوبت|زمان|ساعت|تأخیر|تاخیر"),("نمونه‌گیری",r"نمونه|نمونه‌گیری|خون‌گیری"),("پزشک/ویزیت",r"پزشک|دکتر|ویزیت"),("نسخه/دارو",r"نسخه|دارو|قرص"),("آزمایش/نتیجه",r"آزمایش|نتیجه|جواب"),("هزینه/پرداخت",r"هزینه|پرداخت|مبلغ")]:
        if re.search(pat,t.lower()):topic=name;break
    return {"topic":topic,"satisfaction":"dissatisfied" if neg>pos else ("satisfied" if pos>neg else "neutral"),"positive_signals":contains(t,POS),"negative_signals":contains(t,NEG)}

def analyze_case(entity_type,entity_id,raw_text,occurred_at=None,visit_id=None):
    n=normalize(raw_text)
    r={"entity_type":entity_type,"entity_id":entity_id,"visit_id":visit_id,"source_of_truth":"raw_transcript","transcript_integrity":{"raw_preserved":True,"derived_text":n},"medical_entities":sorted(set(contains(n,MEDICAL))),"vitamin_d":vitamin_d(n)}
    if entity_type=="doctor":r.update(doctor_score(n))
    elif entity_type=="sampler":r.update(sampler_score(n))
    else:r.update({"score":None,"status":"voc_only"})
    r["voc"]=voc_score(n);r["evidence_guard"]="literal_grounded";return r
