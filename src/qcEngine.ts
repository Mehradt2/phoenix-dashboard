export type Evidence={ruleId:string,label:string,matched:boolean,confidence:number,excerpts:string[],critical:boolean,source:'transcript'|'human',status?:'pass'|'partial'|'fail'};
export type ConversationQC={version:string,conversationScore:number|null,coverage:number,risk:'low'|'medium'|'high'|'critical',requiresHumanReview:boolean,criticalFailures:string[],findings:Evidence[],warnings:string[]};

const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/[ك]/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأ]/g,'ا').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\s+/g,' ').trim();

type Rule={id:string;label:string;weight:number;critical:boolean;primary:RegExp[];support?:RegExp[];negative?:RegExp[]};
export const CONVERSATION_RULES:Rule[]=[
 {id:'C01',label:'شروع حرفه‌ای و معرفی',weight:8,critical:false,primary:[/(سلام|وقت بخیر|صبح بخیر|عصر بخیر|شب بخیر)/],support:[/(نمونه.?گیر|از طرف|دکترساینا|روبرا|هومکا|دکتر دکتر)/]},
 {id:'C02',label:'تأیید مخاطب/هویت مناسب',weight:9,critical:false,primary:[/(خودتون|شما هستید|با آقای|با خانم|بیمار|مراجع|برای شما)/]},
 {id:'C03',label:'تأیید روز و بازه مراجعه',weight:15,critical:true,primary:[/(فردا|امروز|صبح|ساعت|بازه|7\s*(تا|الی)\s*8|8\s*(تا|الی)\s*9|9\s*(تا|الی)\s*10|10\s*(تا|الی)\s*11)/],support:[/(تأیید|هماهنگ|درسته|مناسبه|می.?رسم|خدمت)/]},
 {id:'C04',label:'تأیید آدرس و جزئیات دسترسی',weight:15,critical:true,primary:[/(آدرس|لوکیشن|موقعیت)/],support:[/(خیابان|کوچه|پلاک|واحد|طبقه|زنگ|درب|ورودی|برج|بلوک)/]},
 {id:'C05',label:'اعلام زمان تقریبی/تماس قبل رسیدن',weight:10,critical:false,primary:[/(حدود|تقریبا|تقریباً|دقیقه|می.?رسم|رسیدن|قبل از رسیدن|تماس می.?گیرم)/]},
 {id:'C06',label:'شرایط آمادگی و ناشتایی',weight:20,critical:true,primary:[/(ناشتا|ناشتایی|ساعت ناشتایی|غذا|صبحانه)/],support:[/(آب|چای|قهوه|دارو|قرص|سیگار|آدامس|چند ساعت)/]},
 {id:'C07',label:'فرصت سؤال و رفع ابهام',weight:8,critical:false,primary:[/(سوالی|سؤال|پرسشی|ابهامی|نکته.?ای|راهنمایی|سوال دیگه)/]},
 {id:'C08',label:'جمع‌بندی و تأیید نهایی',weight:8,critical:false,primary:[/(پس|بنابراین|هماهنگ شد|تأیید می.?کنید|اوکی شد|فردا خدمت|ممنون از شما|درسته)/]},
 {id:'C09',label:'لحن محترمانه و حرفه‌ای',weight:7,critical:false,primary:[/(لطفا|لطفاً|ممنون|متشکرم|خواهش می.?کنم|زحمت|بفرمایید)/],negative:[/(خفه|مزاحم نشو|وظیفه.?ت|مشکل خودت|به من ربطی نداره)/]}
];

function clips(t:string,patterns:RegExp[]){const out:string[]=[];for(const p of patterns){const m=t.match(p);if(m){const i=m.index??0;out.push(t.slice(Math.max(0,i-38),Math.min(t.length,i+m[0].length+58)));if(out.length>=3)break}}return out}

export function evaluateConversation(transcript:string):ConversationQC{
 const t=norm(transcript),warnings:string[]=[];
 if(t.length<20)return{version:'sampler-conversation-qc-1.1.0',conversationScore:null,coverage:0,risk:'critical',requiresHumanReview:true,criticalFailures:['TRANSCRIPT_INSUFFICIENT'],findings:[],warnings:['Transcript برای امتیازدهی کافی نیست.']};
 let weighted=0,covered=0;const criticalFailures:string[]=[];
 const findings=CONVERSATION_RULES.map(r=>{
  const primary=clips(t,r.primary),support=clips(t,r.support||[]),neg=(r.negative||[]).some(p=>p.test(t));
  let status:'pass'|'partial'|'fail'='fail',confidence=0;
  if(neg){status='fail';confidence=0;warnings.push(`نشانه لحن نامناسب برای ${r.id} یافت شد؛ Review انسانی الزامی است.`)}
  else if(primary.length&&(!r.support||support.length)){status='pass';confidence=Math.min(.95,.78+.06*Math.min(2,primary.length+support.length))}
  else if(primary.length){status='partial';confidence=.55;warnings.push(`${r.id} Evidence ناقص دارد و نباید Pass کامل شود.`)}
  const matched=status==='pass';
  if(status==='pass'){weighted+=r.weight*confidence;covered+=r.weight}
  else if(status==='partial'){weighted+=r.weight*confidence*.4;covered+=Math.round(r.weight*.5)}
  if(r.critical&&status!=='pass')criticalFailures.push(r.id);
  return{ruleId:r.id,label:r.label,matched,confidence:Number(confidence.toFixed(2)),excerpts:[...new Set([...primary,...support])].slice(0,3),critical:r.critical,source:'transcript' as const,status};
 });
 const score=Math.round(weighted*10)/10,coverage=Math.round(covered),risk=criticalFailures.length>=2?'critical':criticalFailures.length===1?'high':score<70?'medium':'low';
 return{version:'sampler-conversation-qc-1.1.0',conversationScore:score,coverage,risk,requiresHumanReview:true,criticalFailures,findings,warnings}
}

export const WORKFLOW_POLICY={
 version:'sampler-workflow-policy-2026-09-21',
 playbook:'QP-01-V1 + operational override',
 currentOperationalOverride:'در عدم پاسخ، سه تلاش با فاصله ۲۰ دقیقه ثبت شود؛ سپس Retry صبح قبل از لغو عدم پاسخ Evidence شود.',
 sourceConflict:'این بخش Workflow مستقل از Transcript است و فقط با Evidence عملیاتی/Reviewer امتیاز می‌گیرد.'
} as const;

export type WorkflowEvidence={
 nightAttempts:0|1|2|3;
 twentyMinuteSpacing:'yes'|'no'|'unknown';
 morningRetry:'yes'|'no'|'not_applicable'|'unknown';
 userAnswered:'yes'|'no'|'unknown';
 finalStatus:'confirmed'|'user_declined'|'no_answer_cancelled'|'rescheduled'|'unknown';
 coordinationRecorded:'yes'|'no'|'unknown';
 reviewerNote:string;
};
export function scoreWorkflow(e:WorkflowEvidence){
 let score=0;const issues:string[]=[];
 if(e.userAnswered==='yes'){
  score+=25;
  if(e.finalStatus==='confirmed'||e.finalStatus==='user_declined'||e.finalStatus==='rescheduled')score+=25;else issues.push('وضعیت نهایی کاربر روشن نیست.');
  if(e.coordinationRecorded==='yes')score+=30;else issues.push('ثبت هماهنگی نهایی Evidence ندارد.');
  score+=20;
 }else if(e.userAnswered==='no'){
  if(e.nightAttempts>=3)score+=35;else issues.push('سه تلاش تماس کامل نشده است.');
  if(e.twentyMinuteSpacing==='yes')score+=25;else issues.push('فاصله ۲۰ دقیقه‌ای تماس‌ها تأیید نشده است.');
  if(e.morningRetry==='yes')score+=20;else issues.push('Retry صبح طبق سیاست عملیاتی فعلی Evidence ندارد.');
  if(e.finalStatus==='no_answer_cancelled'&&e.coordinationRecorded==='yes')score+=20;else issues.push('لغو/ثبت وضعیت نهایی کامل نیست.');
 }else issues.push('پاسخ/عدم پاسخ کاربر مشخص نشده است.');
 return{workflowScore:Math.max(0,Math.min(100,score)),issues,requiresHumanReview:true,policyVersion:WORKFLOW_POLICY.version};
}
export function finalScore(conversation:number|null,workflow:number|null){if(conversation==null||workflow==null)return null;return Math.round((conversation*.7+workflow*.3)*10)/10}
