export type VocTopic={id:string;label:string;confidence:number;evidence:string[]};
export type VocResult={
 version:string;domain:'voc';conversationScore:null;coverage:number;risk:'low'|'medium'|'high'|'critical';
 requiresHumanReview:boolean;criticalFailures:string[];findings:any[];warnings:string[];
 topic:{id:string;label:string;confidence:number;candidates:VocTopic[]};
 satisfaction:{label:'satisfied'|'neutral'|'dissatisfied'|'unknown';confidence:number;positiveEvidence:string[];negativeEvidence:string[]};
 resolution:'resolved'|'unresolved'|'unknown';requiresUrgentHumanReview:boolean;entities:any[];
};
const norm=(s:string)=>String(s||'').normalize('NFKC').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأٱ]/g,'ا').replace(/[‌ـ]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const topics=[
 ['sampler_delay','تاخیر نمونه‌گیر',['تاخیر نمونه گیر','نمونه گیر دیر','دیر رسید','هنوز نیومده','هنوز نرسیده']],
 ['sampler_no_show','عدم حضور/عدم تماس نمونه‌گیر',['نمونه گیر نیومد','نمونه گیر نیامد','نمونه گیر تماس نگرفت']],
 ['doctor_interpretation','عدم دریافت تفسیر/ویزیت',['تفسیر نگرفتم','پزشک تماس نگرفت','ویزیت انجام نشد','دکتر زنگ نزد']],
 ['result_delay','تاخیر جواب آزمایش',['جواب دیر','نتیجه دیر','هنوز جواب نیومده','تاخیر آزمایشگاه']],
 ['incomplete_result','جواب ناقص',['جواب ناقص','نتیجه ناقص','تست جا افتاده']],
 ['billing','قبض/فاکتور/مغایرت مالی',['قبض','فاکتور','مغایرت','هزینه اضافه','پرداخت','مبلغ']],
 ['insurance','بیمه',['بیمه','دانا','البرز','دی']],
 ['reschedule','تغییر زمان',['تغییر زمان','زمان رو عوض','ساعت رو عوض']],
 ['cancellation','کنسلی',['کنسل','لغو','انصراف']],
 ['wrong_upload','آپلود اشتباه',['آپلود اشتباه','فایل اشتباه','جواب اشتباه']],
 ['app_issue','مشکل اپ/سامانه',['اپ باز نمیشه','برنامه باز نمیشه','سامانه مشکل','خطا میده']],
 ['lab_issue','مسئله آزمایشگاه',['آزمایشگاه','ازمایشگاه','پذیرش آزمایشگاه']],
 ['sampling_pain','تجربه نمونه‌گیری/درد',['درد','کبودی','رگ پیدا نکرد','چند بار سوزن','خونگیری بد']],
 ['behavior','رفتار و ارتباط',['بی ادب','بی‌ادب','رفتار بد','لحن بد','محترمانه نبود','عجله داشت']],
 ['pricing','قیمت/هزینه',['گرون','گران','قیمت','هزینه زیاد','مبلغ زیاد']]
] as const;
const pos=['راضی','خیلی خوب','عالی','ممنون','متشکرم','خوب بود','مشکلم حل شد','پیگیری شد','برخورد خوب','سریع انجام شد'];
const neg=['ناراضی','بد بود','افتضاح','خیلی بد','مشکل دارم','پیگیری نشده','جواب نگرفتم','دیر','تاخیر','اعتراض','شکایت','بی ادب','بی‌ادب','کنسل شد'];
const clip=(t:string,k:string)=>{const i=t.indexOf(k);return i<0?'':t.slice(Math.max(0,i-45),Math.min(t.length,i+k.length+70))};
export function evaluateVoc(input:string):VocResult{
 const t=norm(input),candidates:VocTopic[]=[];
 for(const [id,label,keys] of topics){const ev=keys.map(k=>clip(t,norm(k))).filter(Boolean);if(ev.length)candidates.push({id,label,confidence:Math.min(.95,.6+.08*ev.length),evidence:[...new Set(ev)].slice(0,3)})}
 candidates.sort((a,b)=>b.confidence-a.confidence);const topic=candidates[0]||{id:'other',label:'سایر',confidence:.2,evidence:[]};
 const pe=pos.map(k=>clip(t,norm(k))).filter(Boolean),ne=neg.map(k=>clip(t,norm(k))).filter(Boolean),raw=pe.length-ne.length;
 const satisfaction=raw>=2?'satisfied':raw<=-1?'dissatisfied':raw===0?'unknown':'neutral';
 const resolved=/(حل شد|برطرف شد|انجام شد|پیگیری شد|اوکی شد)/.test(t),unresolved=/(هنوز|پیگیری نشده|جواب نگرفتم|حل نشده|برطرف نشده)/.test(t),urgent=/(خونریزی شدید|بیهوش|تنگی نفس شدید|درد شدید قفسه سینه|تهدید)/.test(t);
 return{version:'voc-text-1.0.0',domain:'voc',conversationScore:null,coverage:t.length>=20?100:30,risk:urgent?'critical':satisfaction==='dissatisfied'?'high':'low',requiresHumanReview:true,criticalFailures:urgent?['VOC_URGENT_REVIEW']:[],findings:[],warnings:t.length<20?['متن کوتاه است؛ Review انسانی الزامی است.']:[],topic:{...topic,candidates:candidates.slice(0,4)},satisfaction:{label:satisfaction,confidence:Math.min(.95,.45+Math.abs(raw)*.12),positiveEvidence:pe.slice(0,4),negativeEvidence:ne.slice(0,4)},resolution:resolved&&!unresolved?'resolved':unresolved?'unresolved':'unknown',requiresUrgentHumanReview:urgent,entities:[]}
}
