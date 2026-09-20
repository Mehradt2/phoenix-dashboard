export type PhysicianEvidence={ruleId:string;label:string;weight:number;status:'pass'|'partial'|'fail'|'uncertain';confidence:number;critical:boolean;excerpts:string[]};
export type VitaminDSignal={mentioned:boolean;initiator:'doctor'|'patient'|'both'|'unknown';agreement:'agreed'|'not_agreed'|'conditional'|'unknown';finalDecision:'perform'|'not_perform'|'deferred'|'unknown';prescriptionStatus:'registered'|'committed_to_register'|'discussed_only'|'not_discussed'|'unknown';externalVerification:'not_available';evidence:string[]};
export type ToneSignal={respect:'positive'|'negative'|'unknown';empathy:'positive'|'negative'|'unknown';clarity:'positive'|'negative'|'unknown';patience:'positive'|'negative'|'unknown';evidence:string[];isolatedFromQcScore:true};
export type PhysicianQC={version:string;conversationScore:number|null;coverage:number;risk:'low'|'medium'|'high'|'critical';requiresHumanReview:boolean;criticalFailures:string[];findings:PhysicianEvidence[];warnings:string[];vitaminD:VitaminDSignal;tone:ToneSignal;durationSignals?:{durationSeconds:number;under20:boolean;under8Minutes:boolean}};

export type PhysicianWorkflowEvidence={
 visitOutcome:'answered'|'no_answer'|'unknown';
 visitAttempts:0|1|2|3;
 interpretationApplicable:'yes'|'no'|'unknown';
 interpretationOutcome:'answered'|'no_answer'|'not_applicable'|'unknown';
 interpretationAttempts:0|1|2|3;
 responseRecorded:'yes'|'no'|'unknown';
 serviceChannel:'organization'|'b2c'|'unknown';
 secondOrgPrescription:'no'|'yes'|'not_applicable'|'unknown';
 cancelled:'yes'|'no'|'unknown';
 cancellationDuringVisit:'yes'|'no'|'not_applicable'|'unknown';
 goldenTests:'verified'|'failed'|'not_applicable'|'unknown';
 reviewerNote:string;
};

export const emptyPhysicianWorkflow:PhysicianWorkflowEvidence={
 visitOutcome:'unknown',visitAttempts:0,interpretationApplicable:'unknown',interpretationOutcome:'unknown',interpretationAttempts:0,responseRecorded:'unknown',serviceChannel:'unknown',secondOrgPrescription:'unknown',cancelled:'unknown',cancellationDuringVisit:'unknown',goldenTests:'unknown',reviewerNote:''
};

const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأآ]/g,'ا').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\s+/g,' ').trim();
const clip=(t:string,p:RegExp)=>{const m=t.match(p);if(!m)return[];const i=m.index||0;return[t.slice(Math.max(0,i-48),Math.min(t.length,i+m[0].length+72))]};
type Rule={id:string;label:string;weight:number;critical:boolean;primary:RegExp[];support?:RegExp[];negative?:RegExp[]};
export const PHYSICIAN_RULES:Rule[]=[
 {id:'P01',label:'شروع حرفه‌ای و معرفی',weight:7,critical:false,primary:[/(سلام|وقت بخیر|صبح بخیر|عصر بخیر)/],support:[/(دکتر|پزشک|از طرف|دکترساینا|روبرا)/]},
 {id:'P02',label:'احراز هویت بیمار/نقش همراه',weight:12,critical:true,primary:[/(خود بیمار|خودتون|بیمار|مادر|پدر|ولی|همراه|مراقب|با آقای|با خانم|نسبت شما)/],support:[/(هستید|صحبت می.?کنم|نسبت|همراه)/]},
 {id:'P03',label:'آمادگی و اجازه ادامه مکالمه',weight:8,critical:false,primary:[/(الان وقت مناسبه|امکان صحبت|می.?تونیم صحبت|اجازه بدید|مزاحم نیستم|وقت دارید)/]},
 {id:'P04',label:'علت مراجعه و علائم اصلی',weight:10,critical:false,primary:[/(علت|مشکل|علامت|علائم|درد|تب|سرفه|ضعف|سرگیجه|حال عمومی|برای چه موردی)/]},
 {id:'P05',label:'سابقه پزشکی/جراحی مرتبط',weight:10,critical:false,primary:[/(سابقه|بیماری زمینه|جراحی|عمل|دیابت|فشار خون|تیروئید|قلب|کلیه)/]},
 {id:'P06',label:'دارو، دوز و حساسیت',weight:10,critical:false,primary:[/(دارو|قرص|کپسول|شربت|انسولین|مصرف می.?کن|حساسیت|آلرژی)/],support:[/(دوز|میلی.?گرم|چند بار|روزانه|شب|صبح|واحد|حساسیت|آلرژی)/]},
 {id:'P07',label:'سؤال روشن‌کننده و توالی علائم',weight:8,critical:false,primary:[/(از کی|چند روز|چند وقت|شدتش|بیشتر توضیح|منظورتون|درست متوجه شدم|تغییر کرده)/]},
 {id:'P08',label:'برنامه درمانی/آزمایش/پیگیری روشن',weight:12,critical:true,primary:[/(پیشنهاد|لازم است|بهتره|آزمایش|پیگیری|نسخه|مرحله بعد|انجام بدید|ارجاع)/],support:[/(بعدش|سپس|تا|زمان|ثبت|نسخه|آزمایش|پیگیری)/]},
 {id:'P09',label:'شفاف‌سازی نسخه و اقدام ثبت‌شده',weight:8,critical:false,primary:[/(نسخه|ثبت کردم|ثبت می.?کنم|اضافه کردم|اضافه می.?کنم|می.?نویسم)/]},
 {id:'P10',label:'فرصت سؤال بیمار',weight:5,critical:false,primary:[/(سوالی دارید|سؤال دیگه|ابهامی|نکته.?ای مونده|پرسشی)/]},
 {id:'P11',label:'جمع‌بندی و پایان مشخص',weight:5,critical:false,primary:[/(جمع.?بندی|پس|بنابراین|ممنون از شما|خدانگهدار|روز خوش|پیگیری می.?کنیم)/]},
 {id:'P12',label:'احترام، همدلی و وضوح',weight:5,critical:false,primary:[/(ممنون|خواهش می.?کنم|متوجه.?ام|درک می.?کنم|لطفا|لطفاً|بفرمایید)/],negative:[/(خفه|مزاحم نشو|به من ربطی نداره|مشکل خودته)/]}
];

function findStatus(t:string,r:Rule):PhysicianEvidence{
 const primary=r.primary.flatMap(p=>clip(t,p)),support=(r.support||[]).flatMap(p=>clip(t,p)),negative=(r.negative||[]).some(p=>p.test(t));
 let status:PhysicianEvidence['status']='fail',confidence=0;
 if(negative){status='fail';confidence=.96}
 else if(primary.length&&(!r.support||support.length)){status='pass';confidence=Math.min(.95,.77+.05*Math.min(3,primary.length+support.length))}
 else if(primary.length){status='partial';confidence=.58}
 const excerpts=[...new Set([...primary,...support])].slice(0,3);
 return{ruleId:r.id,label:r.label,weight:r.weight,status,confidence:Number(confidence.toFixed(2)),critical:r.critical,excerpts}
}

function vitaminD(t:string):VitaminDSignal{
 const mentioned=/(ویتامین\s*[دd]|vitamin\s*d)/i.test(t);
 if(!mentioned)return{mentioned:false,initiator:'unknown',agreement:'unknown',finalDecision:'unknown',prescriptionStatus:'not_discussed',externalVerification:'not_available',evidence:[]};
 const ev=clip(t,/(ویتامین\s*[دd]|vitamin\s*d)/i),registered=/(ثبت کردم|اضافه کردم|داخل نسخه گذاشتم|نوشتم)/.test(t),committed=/(ثبت می.?کنم|اضافه می.?کنم|می.?نویسم|داخل نسخه می.?ذارم)/.test(t),context=t.match(/.{0,140}(ویتامین\s*[دd]|vitamin\s*d).{0,220}/i)?.[0]||'',agree=/((انجام|بزن|آزمایش).{0,70}(باشه|بله|اوکی|موافق)|(?:باشه|بله|اوکی|موافق).{0,70}(انجام|بزن|آزمایش))/.test(context),decline=/(نمی.?خوام|انجام نمی.?دم|لازم نیست|موافق نیستم)/.test(context);
 return{mentioned:true,initiator:'unknown',agreement:decline?'not_agreed':agree?'agreed':'unknown',finalDecision:decline?'not_perform':agree?'perform':'unknown',prescriptionStatus:registered?'registered':committed?'committed_to_register':'discussed_only',externalVerification:'not_available',evidence:ev}
}

function tone(t:string):ToneSignal{
 const neg=/(خفه|مزاحم نشو|مشکل خودته|به من ربطی نداره)/.test(t),respect=/(لطفا|لطفاً|ممنون|خواهش می.?کنم|بفرمایید)/.test(t),empathy=/(درک می.?کنم|متوجه.?ام|نگران|حق دارید)/.test(t),clarity=/(یعنی|منظورم|جمع.?بندی|مرحله بعد|توضیح)/.test(t),patience=/(بفرمایید|گوش می.?دم|آرام|دوباره توضیح)/.test(t),evidence=[...clip(t,/(لطفا|لطفاً|ممنون|درک می.?کنم|متوجه.?ام|جمع.?بندی|بفرمایید|خفه|مزاحم نشو)/)].slice(0,3);
 return{respect:neg?'negative':respect?'positive':'unknown',empathy:empathy?'positive':'unknown',clarity:clarity?'positive':'unknown',patience:patience?'positive':'unknown',evidence,isolatedFromQcScore:true}
}

export function evaluatePhysician(transcript:string,durationSeconds=0):PhysicianQC{
 const t=norm(transcript),warnings:string[]=[];
 const durationSignals={durationSeconds:Number(durationSeconds||0),under20:durationSeconds>0&&durationSeconds<20,under8Minutes:durationSeconds>0&&durationSeconds<480};
 if(durationSignals.under20)warnings.push('تماس کمتر از ۲۰ ثانیه است؛ در سطح پرونده ماهانه باید Neutral/Investigate بررسی شود.');
 else if(durationSignals.under8Minutes)warnings.push('طول مکالمه کمتر از آستانه عملیاتی ۸ دقیقه است؛ دلیل کوتاهی تماس در Review ثبت شود.');
 if(t.length<30)return{version:'physician-qc-1.1.0',conversationScore:null,coverage:0,risk:'critical',requiresHumanReview:true,criticalFailures:['TRANSCRIPT_INSUFFICIENT'],findings:[],warnings:['Transcript برای QC پزشک کافی نیست.',...warnings],vitaminD:vitaminD(t),tone:tone(t),durationSignals};
 const findings=PHYSICIAN_RULES.map(r=>findStatus(t,r)),covered=findings.filter(x=>x.status==='pass'||x.status==='partial').reduce((s,x)=>s+x.weight,0),earned=findings.reduce((s,x)=>s+x.weight*(x.status==='pass'?x.confidence:x.status==='partial'?x.confidence*.45:0),0),criticalFailures=findings.filter(x=>x.critical&&(x.status==='fail'||x.status==='uncertain'||x.status==='partial')).map(x=>x.ruleId),score=Math.round(earned*10)/10,risk=criticalFailures.length>=2?'critical':criticalFailures.length===1?'high':score<70?'medium':'low';
 warnings.push('QC پزشک Evidence-first است؛ کنترل‌های SLA/نسخه/تفسیر فقط با Workflow Evidence یا دیتای عملیاتی تأیید می‌شوند.');
 return{version:'physician-qc-1.1.0',conversationScore:score,coverage:covered,risk,requiresHumanReview:true,criticalFailures,findings,warnings,vitaminD:vitaminD(t),tone:tone(t),durationSignals}
}

export function scorePhysicianWorkflow(e:PhysicianWorkflowEvidence){
 const issues:string[]=[];
 if(e.visitOutcome==='unknown')issues.push('نتیجه تماس ویزیت مشخص نیست.');
 else if(e.visitOutcome==='answered'&&e.visitAttempts<1)issues.push('تعداد تلاش ویزیت ثبت نشده است.');
 else if(e.visitOutcome==='no_answer'&&e.visitAttempts<3)issues.push('برای عدم پاسخ ویزیت، ۳ تلاش تماس کامل نشده است.');
 if(e.responseRecorded!=='yes')issues.push('ثبت پاسخ‌گویی «بله/خیر» تأیید نشده است.');
 if(e.interpretationApplicable==='unknown')issues.push('مشمول بودن تفسیر مشخص نیست.');
 if(e.interpretationApplicable==='yes'){
  if(e.serviceChannel!=='organization')issues.push('تفسیر فقط در مسیر سازمانی مجاز است.');
  if(e.interpretationOutcome==='unknown'||e.interpretationOutcome==='not_applicable')issues.push('نتیجه تماس تفسیر مشخص نیست.');
  else if(e.interpretationOutcome==='answered'&&e.interpretationAttempts<1)issues.push('تعداد تلاش تفسیر ثبت نشده است.');
  else if(e.interpretationOutcome==='no_answer'&&e.interpretationAttempts<3)issues.push('برای عدم پاسخ تفسیر، ۳ تلاش تماس کامل نشده است.');
 }
 if(e.interpretationApplicable==='no'&&e.interpretationOutcome!=='not_applicable'&&e.interpretationOutcome!=='unknown')issues.push('تفسیر نامرتبط نباید Outcome عملیاتی داشته باشد.');
 if(e.secondOrgPrescription==='yes')issues.push('نسخه دوم سازمانی طبق سیاست جاری مجاز نیست.');
 if(e.secondOrgPrescription==='unknown'&&e.serviceChannel==='organization')issues.push('وضعیت نسخه دوم سازمانی مشخص نیست.');
 if(e.cancelled==='yes'&&e.cancellationDuringVisit!=='yes')issues.push('کنسلی فقط در جریان ویزیت با Evidence معتبر قابل ثبت است.');
 if(e.cancelled==='unknown')issues.push('وضعیت کنسلی مشخص نیست.');
 if(e.goldenTests==='failed')issues.push('کنترل تست‌های طلایی رد شده است.');
 if(e.goldenTests==='unknown')issues.push('وضعیت کنترل تست‌های طلایی/عدم شمول مشخص نیست.');
 return{ok:issues.length===0,issues,policyVersion:'physician-ops-2026-09-21'}
}
