export type VocTopic={code:string;label:string;confidence:number;evidence:string[]};
export type VocQC={version:string;scoreStatus:'classified'|'non_scorable';conversationScore:null;finalScore:null;risk:'low'|'medium'|'high'|'critical';requiresHumanReview:boolean;criticalFailures:string[];findings:any[];topics:VocTopic[];satisfaction:'satisfied'|'neutral'|'dissatisfied'|'mixed';sentimentScore:number;urgency:'normal'|'urgent'};
const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
const TOPICS:{code:string;label:string;terms:string[]}[]=[
 {code:'result_delay',label:'تاخیر/عدم دریافت جواب',terms:['جواب آزمایش','نتیجه','دیر شده','هنوز جواب','تاخیر جواب','تأخیر جواب']},
 {code:'sampler_delay',label:'تاخیر/عدم حضور نمونه‌گیر',terms:['نمونه گیر','نمونه‌گیر','دیر رسید','نیامد','تاخیر نمونه','تأخیر نمونه']},
 {code:'schedule_change',label:'تغییر زمان',terms:['تغییر زمان','ساعت رو عوض','زمان رو عوض','جابجا']},
 {code:'interpretation_missing',label:'عدم دریافت تفسیر',terms:['تفسیر','پزشک تماس نگرفت','برای تفسیر']},
 {code:'wrong_upload',label:'آپلود/فایل اشتباه',terms:['آپلود اشتباه','فایل اشتباه','جواب اشتباه']},
 {code:'invoice_billing',label:'قبض/فاکتور/هزینه',terms:['قبض','فاکتور','هزینه','مبلغ','پرداخت']},
 {code:'cancellation',label:'کنسلی/لغو',terms:['کنسل','لغو','لغوش']},
 {code:'incomplete_result',label:'جواب ناقص',terms:['جواب ناقص','نتیجه ناقص','همه آزمایش']},
 {code:'support_behavior',label:'رفتار/پاسخگویی پشتیبانی',terms:['پشتیبانی','کارشناس','برخورد','پاسخگویی']},
 {code:'doctor_visit',label:'ویزیت پزشک',terms:['ویزیت','پزشک','دکتر']}
];
const POS=['راضی بودم','راضی هستم','خیلی خوب بود','عالی بود','ممنون','تشکر','خوب بود','مشکلی نداشتم','رضایت داشتم'];
const NEG=['ناراضی','راضی نبودم','افتضاح','خیلی بد','بد بود','شکایت','اعتراض','تاخیر','تأخیر','جواب نداد','پاسخ نداد','نیامد','کنسل','لغو شد','اشتباه','ناقص'];
const ev=(t:string,term:string)=>{const i=t.indexOf(term);return i<0?null:t.slice(Math.max(0,i-45),Math.min(t.length,i+term.length+45))};
export function evaluateVoc(text:string):VocQC{
 const t=norm(text);if(t.length<8)return{version:'voc-intelligence-1.0.0',scoreStatus:'non_scorable',conversationScore:null,finalScore:null,risk:'high',requiresHumanReview:true,criticalFailures:['TRANSCRIPT_INSUFFICIENT'],findings:[],topics:[],satisfaction:'neutral',sentimentScore:0,urgency:'normal'};
 const topics=TOPICS.map(x=>{const evidence=x.terms.map(y=>ev(t,y)).filter(Boolean) as string[];return evidence.length?{code:x.code,label:x.label,confidence:Math.min(.99,.72+.05*evidence.length),evidence:[...new Set(evidence)].slice(0,4)}:null}).filter(Boolean) as VocTopic[];
 if(!topics.length)topics.push({code:'other',label:'سایر/نیازمند دسته‌بندی',confidence:.45,evidence:[]});
 const pos=POS.filter(x=>t.includes(x)).length,neg=NEG.filter(x=>t.includes(x)).length;
 const satisfaction=neg>pos?'dissatisfied':pos>neg?'satisfied':pos&&neg?'mixed':'neutral';
 const urgent=/فوری|اورژانس|شکایت رسمی|پیگیری فوری|خطر|خیلی ناراضی/.test(t);
 return{version:'voc-intelligence-1.0.0',scoreStatus:'classified',conversationScore:null,finalScore:null,risk:urgent?'high':satisfaction==='dissatisfied'?'medium':'low',requiresHumanReview:satisfaction==='mixed'||satisfaction==='neutral'||topics[0]?.code==='other',criticalFailures:[],findings:topics.map(x=>({ruleId:x.code,label:x.label,status:'pass',matched:true,critical:false,confidence:x.confidence,excerpts:x.evidence})),topics,satisfaction, sentimentScore:neg>pos?(neg>=2?-1:-.6):pos>neg?.7:0,urgency:urgent?'urgent':'normal'}
}
export const VOC_TOPICS=TOPICS;
