export type ParticipantState='patient_direct'|'guardian_minor'|'authorized_caregiver'|'companion_unverified'|'wrong_person'|'patient_unavailable'|'multi_party_ambiguous'|'unknown';
export type RuleStatus='pass'|'fail'|'review'|'not_applicable'|'coaching';
export type PhysicianEvidence={ruleId:string;label:string;weight:number;status:RuleStatus;matched:boolean;confidence:number;critical:boolean;severity:'critical'|'major'|'minor'|'review'|'info';excerpts:string[];source:'transcript'|'workflow'|'metadata'|'mixed';reason:string};
export type VitaminDSignal={mentioned:boolean;initiator:'doctor'|'patient'|'both'|'unknown';agreement:'agreed'|'not_agreed'|'conditional'|'unknown';finalDecision:'perform'|'not_perform'|'deferred'|'unknown';prescriptionStatus:'registered'|'committed_to_register'|'discussed_only'|'not_discussed'|'unknown';externalVerification:'not_available';evidence:string[]};
export type ToneSignal={respect:'positive'|'negative'|'unknown';empathy:'positive'|'negative'|'unknown';clarity:'positive'|'negative'|'unknown';patience:'positive'|'negative'|'unknown';evidence:string[];isolatedFromQcScore:true};
export type PhysicianQC={version:string;catalogVersion:string;scoreStatus:'scored'|'review_required'|'non_scorable';conversationScore:number|null;coverage:number;risk:'low'|'medium'|'high'|'critical';requiresHumanReview:boolean;criticalFailures:string[];reviewGates:string[];findings:PhysicianEvidence[];warnings:string[];vitaminD:VitaminDSignal;tone:ToneSignal;participantState:ParticipantState;durationSignals:{durationSeconds:number;under20:boolean;under8Minutes:boolean};weightPolicy:'baseline_pending_signoff'};

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
 participantState:ParticipantState;
 patientAgeGroup:'minor'|'adult'|'unknown';
 identityVerified:'yes'|'no'|'unknown';
 expectedBrand:'drsaina'|'robra'|'doctor_doctor'|'homca'|'man'|'not_applicable'|'unknown';
 duplicateContact:'yes'|'no'|'unknown';
 rescheduleBoundary:'ok'|'violation'|'not_applicable'|'unknown';
 cancellationBoundary:'ok'|'violation'|'not_applicable'|'unknown';
 medicationDoseStatus:'complete'|'incomplete'|'not_applicable'|'unknown';
 clinicalHistoryComplete:'yes'|'no'|'unknown';
 audioIntelligibility:'good'|'poor'|'unknown';
 communicationEnergy:'good'|'low'|'unknown';
 unsupportedMedicalCertainty:'yes'|'no'|'unknown';
 speakerRoleResolved:'yes'|'no'|'unknown';
 lowConfidence:'yes'|'no'|'unknown';
 reviewerNote:string;
};

export const emptyPhysicianWorkflow:PhysicianWorkflowEvidence={
 visitOutcome:'unknown',visitAttempts:0,interpretationApplicable:'unknown',interpretationOutcome:'unknown',interpretationAttempts:0,responseRecorded:'unknown',serviceChannel:'unknown',secondOrgPrescription:'unknown',cancelled:'unknown',cancellationDuringVisit:'unknown',goldenTests:'unknown',
 participantState:'unknown',patientAgeGroup:'unknown',identityVerified:'unknown',expectedBrand:'unknown',duplicateContact:'unknown',rescheduleBoundary:'unknown',cancellationBoundary:'unknown',medicationDoseStatus:'unknown',clinicalHistoryComplete:'unknown',audioIntelligibility:'unknown',communicationEnergy:'unknown',unsupportedMedicalCertainty:'unknown',speakerRoleResolved:'unknown',lowConfidence:'unknown',reviewerNote:''
};

type RuleDef={id:string;label:string;severity:'critical'|'major'|'minor'|'review'|'info';weight:number;critical:boolean;automation:'deterministic'|'hybrid'|'metadata'|'human'};
export const PHYSICIAN_RULES:RuleDef[]=[
 {id:'PVQ-026',label:'No Answer / Non-scorable',severity:'info',weight:0,critical:false,automation:'metadata'},
 {id:'PVQ-027',label:'حضور بیمار هدف و احراز هویت',severity:'major',weight:15,critical:false,automation:'hybrid'},
 {id:'PVQ-028',label:'استثنای ولی معتبر کودک',severity:'info',weight:0,critical:false,automation:'metadata'},
 {id:'PVQ-029',label:'ویزیت بیمار بالغ با همراه فاقد احراز اختیار',severity:'critical',weight:30,critical:true,automation:'metadata'},
 {id:'PVQ-030',label:'معرفی برند منطبق با Case',severity:'major',weight:15,critical:false,automation:'hybrid'},
 {id:'PVQ-031',label:'تماس تکراری پزشک',severity:'major',weight:15,critical:false,automation:'metadata'},
 {id:'PVQ-032',label:'مرز مجاز درخواست تغییر زمان',severity:'major',weight:15,critical:false,automation:'metadata'},
 {id:'PVQ-033',label:'مرز اختیار کنسلی',severity:'major',weight:15,critical:false,automation:'metadata'},
 {id:'PVQ-034',label:'ثبت دارو و دوز لازم',severity:'major',weight:15,critical:false,automation:'hybrid'},
 {id:'PVQ-035',label:'کامل بودن شرح حال ساختاریافته و آمادگی آزمایش',severity:'major',weight:15,critical:false,automation:'hybrid'},
 {id:'PVQ-036',label:'قابل فهم بودن Audio',severity:'minor',weight:5,critical:false,automation:'human'},
 {id:'PVQ-037',label:'Communication Energy',severity:'minor',weight:5,critical:false,automation:'human'},
 {id:'PVQ-038',label:'قطعیت پزشکی بدون پشتوانه',severity:'review',weight:0,critical:false,automation:'hybrid'},
 {id:'PVQ-039',label:'Speaker Role Resolution Gate',severity:'review',weight:0,critical:false,automation:'human'},
 {id:'PVQ-040',label:'Low Confidence Human Review Gate',severity:'review',weight:0,critical:false,automation:'human'}
];

const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأ]/g,'ا').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\s+/g,' ').trim();
const clip=(t:string,p:RegExp)=>{const m=t.match(p);if(!m)return[];const i=m.index||0;return[t.slice(Math.max(0,i-55),Math.min(t.length,i+m[0].length+85))]};
const def=(id:string)=>PHYSICIAN_RULES.find(x=>x.id===id)!;
function evidence(id:string,status:RuleStatus,confidence:number,excerpts:string[],source:PhysicianEvidence['source'],reason:string):PhysicianEvidence{const r=def(id);return{ruleId:id,label:r.label,weight:r.weight,status,matched:status==='pass',confidence:Number(confidence.toFixed(2)),critical:r.critical,severity:r.severity,excerpts:[...new Set(excerpts)].slice(0,3),source,reason}}
function fromField(id:string,value:string,pass:string[],fail:string[],na:string[],reasonPass:string,reasonFail:string){
 if(na.includes(value))return evidence(id,'not_applicable',1,[],'metadata','Rule برای این Case قابل اعمال نیست.');
 if(pass.includes(value))return evidence(id,'pass',.98,[`[Structured Evidence] ${value}`],'metadata',reasonPass);
 if(fail.includes(value))return evidence(id,'fail',.98,[`[Structured Evidence] ${value}`],'metadata',reasonFail);
 return evidence(id,'review',.2,[],'metadata','Structured Evidence کافی ثبت نشده است.');
}
function detectBrand(t:string){if(/دکتر\s*ساینا|دکترساینا|ساینا/.test(t))return'drsaina';if(/روبرا/.test(t))return'robra';if(/دکتر\s*دکتر/.test(t))return'doctor_doctor';if(/هومکا/.test(t))return'homca';if(/\bمان\b/.test(t))return'man';return null}
function detectParticipantEvidence(t:string){return clip(t,/(خود بیمار|خودتون بیمار هستید|با خود بیمار|مادر|پدر|ولی|سرپرست|خواهر|برادر|همسر|مراقب|پرستار|بیمار حضور نداره|بیمار نیست)/)}
function detectMedication(t:string){return clip(t,/(دارو|قرص|کپسول|شربت|انسولین|لووتیروکسین|متفورمین|آسپرین|سیتالوپرام)/)}
function detectDose(t:string){return clip(t,/(\d+\s*(میلی.?گرم|mg|واحد)|دوز|روزی\s*(یک|دو|سه)|صبح|شب)/i)}
function detectHistory(t:string){return clip(t,/(سابقه|بیماری زمینه|جراحی|عمل|دیابت|فشار خون|تیروئید|قلب|کلیه|بارداری|تشنج|قاعدگی|خانوادگی)/)}
function detectPrep(t:string){return clip(t,/(ناشتا|ناشتایی|آب|قهوه|چای|آمادگی آزمایش|آمادگی ازمایش)/)}
function vitaminD(t:string):VitaminDSignal{
 const mentioned=/(ویتامین\s*[دd]|vitamin\s*d)/i.test(t);
 if(!mentioned)return{mentioned:false,initiator:'unknown',agreement:'unknown',finalDecision:'unknown',prescriptionStatus:'not_discussed',externalVerification:'not_available',evidence:[]};
 const ev=clip(t,/(ویتامین\s*[دd]|vitamin\s*d)/i),registered=/(ثبت کردم|اضافه کردم|داخل نسخه گذاشتم|نوشتم)/.test(t),committed=/(ثبت می.?کنم|اضافه می.?کنم|می.?نویسم|داخل نسخه می.?ذارم)/.test(t),context=t.match(/.{0,140}(ویتامین\s*[دd]|vitamin\s*d).{0,220}/i)?.[0]||'',agree=/((انجام|بزن|آزمایش).{0,70}(باشه|بله|اوکی|موافق)|(?:باشه|بله|اوکی|موافق).{0,70}(انجام|بزن|آزمایش))/.test(context),decline=/(نمی.?خوام|انجام نمی.?دم|لازم نیست|موافق نیستم)/.test(context);
 return{mentioned:true,initiator:'unknown',agreement:decline?'not_agreed':agree?'agreed':'unknown',finalDecision:decline?'not_perform':agree?'perform':'unknown',prescriptionStatus:registered?'registered':committed?'committed_to_register':'discussed_only',externalVerification:'not_available',evidence:ev}
}
function tone(t:string):ToneSignal{const neg=/(خفه|مزاحم نشو|مشکل خودته|به من ربطی نداره)/.test(t),respect=/(لطفا|لطفاً|ممنون|خواهش می.?کنم|بفرمایید)/.test(t),empathy=/(درک می.?کنم|متوجه.?ام|نگران|حق دارید)/.test(t),clarity=/(یعنی|منظورم|جمع.?بندی|مرحله بعد|توضیح)/.test(t),patience=/(بفرمایید|گوش می.?دم|آرام|دوباره توضیح)/.test(t),excerpts=clip(t,/(لطفا|لطفاً|ممنون|درک می.?کنم|متوجه.?ام|جمع.?بندی|بفرمایید|خفه|مزاحم نشو)/);return{respect:neg?'negative':respect?'positive':'unknown',empathy:empathy?'positive':'unknown',clarity:clarity?'positive':'unknown',patience:patience?'positive':'unknown',evidence:excerpts,isolatedFromQcScore:true}}

export function evaluatePhysician(transcript:string,durationSeconds=0,ctx:PhysicianWorkflowEvidence=emptyPhysicianWorkflow):PhysicianQC{
 const t=norm(transcript),warnings:string[]=[],durationSignals={durationSeconds:Number(durationSeconds||0),under20:durationSeconds>0&&durationSeconds<20,under8Minutes:durationSeconds>0&&durationSeconds<480};
 if(durationSignals.under20)warnings.push('تماس کمتر از ۲۰ ثانیه است؛ در سطح پرونده دوره‌ای Neutral/Investigate بررسی شود.');
 else if(durationSignals.under8Minutes)warnings.push('تماس کوتاه‌تر از آستانه عملیاتی ۸ دقیقه است؛ این سیگنال به‌تنهایی Clinical Fail نیست.');

 if(ctx.visitOutcome==='no_answer'){
  const findings=PHYSICIAN_RULES.map(r=>r.id==='PVQ-026'?evidence(r.id,'pass',1,['[Workflow Evidence] no_answer'],'metadata','No Answer به‌درستی Non-scorable است.'):evidence(r.id,'not_applicable',1,[],'metadata','No-answer: Rule محتوایی قابل اعمال نیست.'));
  return{version:'physician-qc-2.0.0',catalogVersion:'DOC-009 / PVQ-026..040',scoreStatus:'non_scorable',conversationScore:null,coverage:100,risk:'low',requiresHumanReview:true,criticalFailures:[],reviewGates:[],findings,warnings:['No Answer مطابق PVQ-026 از امتیاز پزشک کسر نمی‌شود.',...warnings],vitaminD:vitaminD(t),tone:tone(t),participantState:ctx.participantState,durationSignals,weightPolicy:'baseline_pending_signoff'}
 }

 const findings:PhysicianEvidence[]=[];
 findings.push(evidence('PVQ-026','not_applicable',1,[],'metadata','تماس دارای محتوای ویزیت است.'));
 const identityEx=detectParticipantEvidence(t);
 if(ctx.identityVerified==='yes')findings.push(evidence('PVQ-027','pass',.98,identityEx.length?identityEx:['[Structured Evidence] identityVerified=yes'],'mixed','هویت/حضور بیمار هدف توسط Reviewer تأیید شده است.'));
 else if(ctx.identityVerified==='no')findings.push(evidence('PVQ-027','fail',.98,identityEx,'mixed','احراز هویت/حضور بیمار هدف رد شده است.'));
 else findings.push(evidence('PVQ-027',identityEx.length?'review':'review',identityEx.length?.55:.2,identityEx,'transcript','Keyword به‌تنهایی برای احراز هویت کافی نیست؛ Reviewer باید State را تعیین کند.'));

 if(ctx.participantState==='guardian_minor'&&ctx.patientAgeGroup==='minor')findings.push(evidence('PVQ-028','pass',.99,identityEx,'metadata','ولی/سرپرست معتبر کودک به‌عنوان Exception مجاز ثبت شده است.'));
 else if(ctx.patientAgeGroup==='minor'&&ctx.participantState==='unknown')findings.push(evidence('PVQ-028','review',.25,identityEx,'metadata','برای بیمار Minor، وضعیت Guardian باید مشخص شود.'));
 else findings.push(evidence('PVQ-028','not_applicable',1,[],'metadata','Case به استثنای Guardian Minor نیاز ندارد.'));

 if(ctx.patientAgeGroup==='adult'&&ctx.participantState==='companion_unverified')findings.push(evidence('PVQ-029','fail',.99,identityEx,'mixed','ویزیت بیمار بالغ با همراه فاقد احراز اختیار؛ Critical.'));
 else if(['patient_direct','authorized_caregiver'].includes(ctx.participantState)||ctx.patientAgeGroup==='minor')findings.push(evidence('PVQ-029','not_applicable',1,[],'metadata','Unauthorized adult proxy مشاهده نشده است.'));
 else findings.push(evidence('PVQ-029','review',.2,identityEx,'metadata','Participant State برای رد/تأیید Critical Proxy کافی نیست.'));

 const heardBrand=detectBrand(t),brandEx=clip(t,/(دکتر\s*ساینا|دکترساینا|ساینا|روبرا|دکتر\s*دکتر|هومکا|\bمان\b)/);
 if(ctx.expectedBrand==='not_applicable')findings.push(evidence('PVQ-030','not_applicable',1,[],'metadata','Brand برای Case قابل اعمال نیست.'));
 else if(ctx.expectedBrand==='unknown')findings.push(evidence('PVQ-030','review',heardBrand?.6:.2,brandEx,'mixed','Expected Brand در Case Metadata ثبت نشده است.'));
 else if(!heardBrand)findings.push(evidence('PVQ-030','review',.35,[],'transcript','Brand قابل اتکا در Transcript پیدا نشد؛ Audio/Metadata Review لازم است.'));
 else if(heardBrand===ctx.expectedBrand)findings.push(evidence('PVQ-030','pass',.9,brandEx,'mixed','Brand گفته‌شده با Expected Brand همخوان است.'));
 else findings.push(evidence('PVQ-030','fail',.9,brandEx,'mixed',`Brand شنیده‌شده (${heardBrand}) با Expected Brand (${ctx.expectedBrand}) مغایر است.`));

 findings.push(fromField('PVQ-031',ctx.duplicateContact,['no'],['yes'],[], 'Duplicate Contact در Metadata رد شده است.','Duplicate Physician Contact در Metadata تأیید شده است.'));
 findings.push(fromField('PVQ-032',ctx.rescheduleBoundary,['ok'],['violation'],['not_applicable'],'درخواست تغییر زمان داخل مرز Policy مدیریت شده است.','تعهد/اقدام تغییر زمان خارج از مرز Policy ثبت شده است.'));
 findings.push(fromField('PVQ-033',ctx.cancellationBoundary,['ok'],['violation'],['not_applicable'],'کنسلی داخل مرز اختیار Policy بوده است.','کنسلی/تعهد کنسلی خارج از مرز اختیار Policy ثبت شده است.'));

 const medEx=detectMedication(t),doseEx=detectDose(t);
 if(ctx.medicationDoseStatus==='complete')findings.push(evidence('PVQ-034','pass',.98,[...medEx,...doseEx],'mixed','ثبت دارو/دوز لازم توسط Reviewer کامل تأیید شده است.'));
 else if(ctx.medicationDoseStatus==='incomplete')findings.push(evidence('PVQ-034','fail',.98,[...medEx,...doseEx],'mixed','ثبت دارو/دوز موردنیاز ناقص تأیید شده است.'));
 else if(ctx.medicationDoseStatus==='not_applicable')findings.push(evidence('PVQ-034','not_applicable',1,[],'metadata','Medication/Dose برای Case قابل اعمال نیست.'));
 else findings.push(evidence('PVQ-034','review',medEx.length?.55:.2,[...medEx,...doseEx],'transcript','«در صورت نیاز دوز» نیازمند Context پزشکی/Reviewer است و از Keyword Auto-fail نمی‌شود.'));

 const histEx=detectHistory(t),prepEx=detectPrep(t);
 if(ctx.clinicalHistoryComplete==='yes')findings.push(evidence('PVQ-035','pass',.98,[...histEx,...prepEx],'mixed','کامل بودن شرح حال و آمادگی آزمایش توسط Reviewer تأیید شده است.'));
 else if(ctx.clinicalHistoryComplete==='no')findings.push(evidence('PVQ-035','fail',.98,[...histEx,...prepEx],'mixed','شرح حال/آمادگی آزمایش ناقص تأیید شده است.'));
 else findings.push(evidence('PVQ-035','review',histEx.length&&prepEx.length?.65:.25,[...histEx,...prepEx],'transcript','Domain-based completeness بدون Reviewer/Case Context Auto-final نمی‌شود.'));

 if(ctx.audioIntelligibility==='good')findings.push(evidence('PVQ-036','pass',.98,[],'metadata','Audio قابل فهم تأیید شده است.'));
 else if(ctx.audioIntelligibility==='poor')findings.push(evidence('PVQ-036','coaching',.98,[],'metadata','افت intelligibility به‌عنوان Operational/Coaching ثبت شده است.'));
 else findings.push(evidence('PVQ-036','review',.2,[],'metadata','Audio intelligibility هنوز adjudicate نشده است.'));

 if(ctx.communicationEnergy==='good')findings.push(evidence('PVQ-037','pass',.95,[],'metadata','Communication Energy مناسب تأیید شده است.'));
 else if(ctx.communicationEnergy==='low')findings.push(evidence('PVQ-037','coaching',.95,[],'metadata','Low Energy فقط Coaching Signal است و Clinical Fail نیست.'));
 else findings.push(evidence('PVQ-037','review',.2,[],'metadata','Communication Energy از Transcript متنی قابل قضاوت قطعی نیست.'));

 const certaintyEx=clip(t,/(قطعا|قطعاً|حتما|حتماً|صددرصد|مطمئنم که|شما حتما)/);
 if(ctx.unsupportedMedicalCertainty==='no')findings.push(evidence('PVQ-038','pass',.98,certaintyEx,'mixed','Reviewer قطعیت پزشکی بدون پشتوانه را رد کرده است.'));
 else if(ctx.unsupportedMedicalCertainty==='yes')findings.push(evidence('PVQ-038','review',.98,certaintyEx,'mixed','نشانه Unsupported Medical Certainty نیازمند SME/Medical Review است.'));
 else findings.push(evidence('PVQ-038','review',certaintyEx.length?.65:.2,certaintyEx,'transcript','این Rule بدون Medical Context Auto-fail نمی‌شود.'));

 if(ctx.speakerRoleResolved==='yes')findings.push(evidence('PVQ-039','pass',.99,[],'metadata','نقش Speakerها توسط Reviewer/Metadata حل شده است.'));
 else findings.push(evidence('PVQ-039','review',ctx.speakerRoleResolved==='no'?.95:.2,[],'metadata','نقش پزشک/بیمار/ولی/مراقب از Speaker A/B حدس زده نمی‌شود.'));

 if(ctx.lowConfidence==='no')findings.push(evidence('PVQ-040','pass',.98,[],'metadata','Low-confidence gate توسط Reviewer بسته شده است.'));
 else findings.push(evidence('PVQ-040','review',ctx.lowConfidence==='yes'?.98:.2,[],'metadata','خروجی کم‌اطمینان یا نامشخص Auto-final نمی‌شود.'));

 const criticalFailures=findings.filter(x=>x.critical&&x.status==='fail').map(x=>x.ruleId),reviewGates=findings.filter(x=>x.status==='review').map(x=>x.ruleId);
 const penalty=findings.reduce((s,x)=>s+((x.status==='fail'||x.status==='coaching')?x.weight:0),0),score=Math.max(0,100-penalty);
 const resolved=findings.filter(x=>x.status!=='review').length,coverage=Math.round(resolved/findings.length*100);
 const scoreStatus=reviewGates.length?'review_required':'scored',risk=criticalFailures.length?'critical':score<70?'high':score<85?'medium':'low';
 warnings.push('Rule Pack پزشک اکنون مستقیماً بر DOC-009 / PVQ-026..040 بنا شده است؛ Weightها Baseline و تا Sign-off نهایی Candidate هستند.');
 warnings.push('PVQ-039: نقش Speaker از A/B یا Keyword حدس زده نمی‌شود. PVQ-040: Confidence پایین Auto-final نمی‌شود.');
 return{version:'physician-qc-2.0.0',catalogVersion:'DOC-009 / PVQ-026..040',scoreStatus,conversationScore:score,coverage,risk,requiresHumanReview:true,criticalFailures,reviewGates,findings,warnings,vitaminD:vitaminD(t),tone:tone(t),participantState:ctx.participantState,durationSignals,weightPolicy:'baseline_pending_signoff'}
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
 if(e.visitOutcome!=='no_answer'){
  if(e.participantState==='unknown'||e.participantState==='multi_party_ambiguous')issues.push('Participant State رسمی PVQ مشخص نشده است.');
  if(e.identityVerified==='unknown')issues.push('PVQ-027: احراز هویت/حضور بیمار تعیین تکلیف نشده است.');
  if(e.patientAgeGroup==='unknown'&&['guardian_minor','companion_unverified'].includes(e.participantState))issues.push('گروه سنی برای Rule Proxy مشخص نیست.');
  if(e.expectedBrand==='unknown')issues.push('PVQ-030: Expected Brand Case مشخص نیست.');
  if(e.duplicateContact==='unknown')issues.push('PVQ-031: Duplicate Contact Metadata مشخص نیست.');
  if(e.rescheduleBoundary==='unknown')issues.push('PVQ-032: مرز تغییر زمان تعیین تکلیف نشده است.');
  if(e.cancellationBoundary==='unknown')issues.push('PVQ-033: مرز کنسلی تعیین تکلیف نشده است.');
  if(e.medicationDoseStatus==='unknown')issues.push('PVQ-034: وضعیت Medication/Dose تعیین تکلیف نشده است.');
  if(e.clinicalHistoryComplete==='unknown')issues.push('PVQ-035: کامل بودن شرح حال/آمادگی تعیین تکلیف نشده است.');
  if(e.audioIntelligibility==='unknown')issues.push('PVQ-036: Audio Intelligibility تعیین تکلیف نشده است.');
  if(e.communicationEnergy==='unknown')issues.push('PVQ-037: Communication Energy تعیین تکلیف نشده است.');
  if(e.unsupportedMedicalCertainty==='unknown')issues.push('PVQ-038: Medical Certainty تعیین تکلیف نشده است.');
  if(e.speakerRoleResolved!=='yes')issues.push('PVQ-039: Speaker Role باید توسط Reviewer حل شود.');
  if(e.lowConfidence!=='no')issues.push('PVQ-040: Low-confidence gate باید بسته شود.');
 }
 return{ok:issues.length===0,issues,policyVersion:'physician-ops-2026-09-21',ruleCatalog:'DOC-009 / PVQ-026..040'}
}
