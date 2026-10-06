export type VocSatisfaction='satisfied'|'neutral'|'dissatisfied'|'mixed'|'unknown';
export type VocQC={
 version:string;
 scoreStatus:'classified'|'review_required';
 conversationScore:null;
 finalScore:null;
 topic:string;
 topicConfidence:number;
 satisfaction:VocSatisfaction;
 satisfactionConfidence:number;
 risk:'low'|'medium'|'high'|'critical';
 requiresHumanReview:boolean;
 criticalFailures:string[];
 findings:{ruleId:string;label:string;matched:boolean;confidence:number;critical:boolean;status:'pass'|'review';excerpts:string[]}[];
 warnings:string[];
};
const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/[ك]/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأ]/g,'ا').replace(/‌/g,' ').replace(/s+/g,' ').trim().toLowerCase();
const TOPICS=[
 ['interpretation_not_received','عدم دریافت تفسیر',['تفسیر','پزشک تماس نگرفت','توضیح جواب','جواب آزمایش رو توضیح']],
 ['sampler_delay','تأخیر نمونه‌گیر',['نمونه گیر دیر','نمونه‌گیر دیر','هنوز نیومده','هنوز نیامده','تاخیر نمونه گیر','تأخیر نمونه گیر']],
 ['sampler_no_contact','عدم تماس نمونه‌گیر',['نمونه گیر تماس نگرفت','نمونه‌گیر تماس نگرفت','هیچ تماسی نگرفت']],
 ['reschedule','تغییر زمان',['تغییر زمان','عوض کردن زمان','ساعت رو تغییر','ساعت را تغییر']],
 ['wrong_upload','آپلود اشتباه',['آپلود اشتباه','فایل اشتباه','جواب اشتباه']],
 ['billing','قبض/فاکتور/هزینه',['قبض','فاکتور','صورتحساب','هزینه','مبلغ']],
 ['add_invoice','اضافه‌کردن فاکتور',['اضافه کردن فاکتور','فاکتور اضافه']],
 ['cancellation','کنسلی',['کنسل','لغو','کنسلی']],
 ['incomplete_result','جواب ناقص',['جواب ناقص','نتیجه ناقص','همه جواب ها نیومده','همه جواب‌ها نیامده']]
] as const;
const DISSAT=['ناراضی','افتضاح','شکایت','عصبانی','کلافه','خیلی دیر','پاسخ نداد','پیگیری نکرد','اصلا راضی نیستم','اصلاً راضی نیستم'];
const SAT=['خیلی خوب','عالی','ممنونم','متشکرم','خوب بود','راضی هستم','مشکلی نبود'];

export function evaluateVoc(transcript:string):VocQC{
 const t=norm(transcript),warnings:string[]=[];
 if(t.length<12)return{version:'voc-qc-1.0.0-candidate',scoreStatus:'review_required',conversationScore:null,finalScore:null,topic:'unknown',topicConfidence:.1,satisfaction:'unknown',satisfactionConfidence:.1,risk:'medium',requiresHumanReview:true,criticalFailures:[],findings:[],warnings:['متن برای طبقه‌بندی VOC کافی نیست.']};
 const ranked=TOPICS.map(([id,label,terms])=>({id,label,hits:terms.filter(x=>t.includes(x))})).filter(x=>x.hits.length).sort((a,b)=>b.hits.length-a.hits.length);
 const top=ranked[0],topic=top?.id||'other',topicConfidence=top?(top.hits.length>=2?.92:.74):.2;
 const neg=DISSAT.filter(x=>t.includes(x)),pos=SAT.filter(x=>t.includes(x)).filter(x=>!(x==='راضی هستم'&&t.includes('ناراضی')));
 let satisfaction:VocSatisfaction='unknown';if(neg.length&&!pos.length)satisfaction='dissatisfied';else if(pos.length&&!neg.length)satisfaction='satisfied';else if(pos.length&&neg.length)satisfaction='mixed';
 const satisfactionConfidence=(neg.length||pos.length)?.88:.2,needs=topic==='other'||satisfaction==='unknown'||satisfaction==='mixed';
 const findings=[
  {ruleId:'VOC-TOPIC',label:'موضوع تماس',matched:topic!=='other',confidence:topicConfidence,critical:false,status:(topic!=='other'?'pass':'review') as 'pass'|'review',excerpts:top?.hits||[]},
  {ruleId:'VOC-SAT',label:'رضایت/عدم رضایت',matched:satisfaction!=='unknown'&&satisfaction!=='mixed',confidence:satisfactionConfidence,critical:false,status:(satisfaction!=='unknown'&&satisfaction!=='mixed'?'pass':'review') as 'pass'|'review',excerpts:[...neg,...pos].slice(0,5)}
 ];
 if(needs)warnings.push('VOC برای یکی از ابعاد Topic/Satisfaction به Human Review نیاز دارد.');
 const risk=satisfaction==='dissatisfied'?'high':needs?'medium':'low';
 return{version:'voc-qc-1.0.0-candidate',scoreStatus:needs?'review_required':'classified',conversationScore:null,finalScore:null,topic,topicConfidence,satisfaction,satisfactionConfidence,risk,requiresHumanReview:needs,criticalFailures:[],findings,warnings}
}
