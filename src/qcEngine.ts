export type Evidence={ruleId:string,label:string,matched:boolean,confidence:number,excerpts:string[],critical:boolean,source:'transcript'|'human'};
export type ConversationQC={version:string,conversationScore:number|null,coverage:number,risk:'low'|'medium'|'high'|'critical',requiresHumanReview:boolean,criticalFailures:string[],findings:Evidence[],warnings:string[]};

const norm=(s:string)=>s
  .replace(/[يى]/g,'ی').replace(/[ك]/g,'ک')
  .replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و')
  .replace(/[إأآ]/g,'ا')
  .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/\s+/g,' ').trim();

type Rule={id:string;label:string;weight:number;critical:boolean;patterns:RegExp[];negative?:RegExp[]};
const RULES:Rule[]=[
 {id:'C01',label:'شروع حرفه‌ای و معرفی',weight:8,critical:false,patterns:[/(سلام|وقت بخیر|صبح بخیر|شب بخیر)/,/(نمونه.?گیر|از طرف|دکترساینا|روبرا|هومکا|دکتر دکتر)/]},
 {id:'C02',label:'تأیید مخاطب/هویت مناسب',weight:7,critical:false,patterns:[/(خودتون|شما هستید|با آقای|با خانم|بیمار|مراجع|برای شما)/]},
 {id:'C03',label:'تأیید روز و بازه مراجعه',weight:15,critical:true,patterns:[/(فردا|امروز|صبح|ساعت|بازه|بین\s*\d+\s*(تا|الی)\s*\d+)/]},
 {id:'C04',label:'تأیید آدرس و دسترسی',weight:15,critical:true,patterns:[/(آدرس|لوکیشن|موقعیت|خیابان|کوچه|پلاک|واحد|طبقه|زنگ|درب)/]},
 {id:'C05',label:'اعلام زمان تقریبی رسیدن',weight:10,critical:false,patterns:[/(حدود|تقریبا|تقریباً|دقیقه|می.?رسم|رسیدن|قبل از رسیدن|تماس می.?گیرم)/]},
 {id:'C06',label:'شرایط آمادگی نمونه‌گیری',weight:20,critical:true,patterns:[/(ناشتا|ناشتایی|آب|غذا|صبحانه|چای|قهوه|دارو|قرص|ساعت ناشتایی)/]},
 {id:'C07',label:'فرصت سؤال و رفع ابهام',weight:10,critical:false,patterns:[/(سوالی|سؤال|پرسشی|ابهامی|نکته.?ای|خدمتتون|راهنمایی)/]},
 {id:'C08',label:'جمع‌بندی و تأیید نهایی',weight:8,critical:false,patterns:[/(پس|بنابراین|هماهنگ شد|تأیید می.?کنید|اوکی شد|فردا خدمت|ممنون از شما)/]},
 {id:'C09',label:'لحن محترمانه و حرفه‌ای',weight:7,critical:false,patterns:[/(لطفا|لطفاً|ممنون|متشکرم|خواهش می.?کنم|زحمت)/],negative:[/(خفه|مزاحم نشو|وظیفه.?ت|مشکل خودت|به من ربطی نداره)/]}
];

function excerpts(text:string,patterns:RegExp[]){const t=norm(text),out:string[]=[];for(const p of patterns){const m=t.match(p);if(m){const i=m.index??0;out.push(t.slice(Math.max(0,i-32),Math.min(t.length,i+m[0].length+48)));if(out.length>=2)break}}return out}
export function evaluateConversation(transcript:string):ConversationQC{
 const t=norm(transcript),warnings:string[]=[];
 if(t.length<20)return{version:'sampler-conversation-qc-1.0.0',conversationScore:null,coverage:0,risk:'critical',requiresHumanReview:true,criticalFailures:['TRANSCRIPT_INSUFFICIENT'],findings:[],warnings:['Transcript برای امتیازدهی کافی نیست.']};
 let weighted=0,covered=0,criticalFailures:string[]=[];
 const findings=RULES.map(r=>{
   const hits=r.patterns.filter(p=>p.test(t));
   const neg=(r.negative||[]).some(p=>p.test(t));
   const matched=hits.length>0&&!neg;
   const confidence=neg?0:matched?Math.min(1,.72+.12*Math.min(2,hits.length)):0;
   if(matched){weighted+=r.weight*confidence;covered+=r.weight}
   if(r.critical&&!matched)criticalFailures.push(r.id);
   if(neg)warnings.push(`نشانه لحن نامناسب برای ${r.id} یافت شد و نیازمند بررسی انسانی است.`);
   return{ruleId:r.id,label:r.label,matched,confidence:Number(confidence.toFixed(2)),excerpts:excerpts(t,r.patterns),critical:r.critical,source:'transcript' as const};
 });
 const score=Math.round(weighted*10)/10,coverage=Math.round(covered);
 const risk=criticalFailures.length>=2?'critical':criticalFailures.length===1?'high':score<70?'medium':'low';
 return{version:'sampler-conversation-qc-1.0.0',conversationScore:score,coverage,risk,requiresHumanReview:true,criticalFailures,findings,warnings};
}

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
 return{workflowScore:Math.max(0,Math.min(100,score)),issues,requiresHumanReview:true,policyVersion:'sampler-workflow-policy-2026-09-override'};
}
export function finalScore(conversation:number|null,workflow:number|null){if(conversation==null||workflow==null)return null;return Math.round((conversation*.7+workflow*.3)*10)/10}
