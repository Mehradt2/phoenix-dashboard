import{normalizePersian,evidenceWindows,lexicalNegated,textQuality}from'./persian.mjs';

const TOPICS=[
 ['result_delay','تاخیر جواب/نتیجه',[/جواب.*(دیر|نیامد|نیومد|تاخیر)|نتیجه.*(دیر|نیامد|نیومد|تاخیر)/i]],
 ['incomplete_result','جواب ناقص/اشتباه',[/جواب.*(ناقص|اشتباه|کم)|نتیجه.*(ناقص|اشتباه)/i]],
 ['sampler_delay','تاخیر نمونه‌گیر',[/نمونه.?گیر.*(دیر|تاخیر|نرسید)|دیر.*نمونه.?گیر/i]],
 ['sampler_no_show','عدم حضور/تماس نمونه‌گیر',[/نمونه.?گیر.*(نیامد|نیومد|تماس نگرفت|زنگ نزد|نرسید)/i]],
 ['reschedule','تغییر زمان/هماهنگی',[/تغییر.*(زمان|ساعت)|جابجا|جابه.?جا|هماهنگی.*زمان|وقت.*عوض/i]],
 ['cancellation','کنسلی',[/کنسل|لغو|انصراف/i]],
 ['interpretation','تفسیر/ویزیت پزشک',[/تفسیر|ویزیت|پزشک.*(تماس|زنگ)|تماس.*پزشک/i]],
 ['billing','قبض/هزینه/بیمه',[/قبض|فاکتور|هزینه|قیمت|بیمه|پرداخت|پول/i]],
 ['sampling_experience','تجربه نمونه‌گیری',[/رگ|سوزن|خونگیری|نمونه.?گیری|کبودی|درد.*نمونه/i]],
 ['support','پشتیبانی/تماس',[/پشتیبان|پشتیبانی|کارشناس|تماس.*جواب|پاسخگو/i]],
 ['technical','مشکل فنی/آپلود',[/آپلود|سایت|اپ|لینک|خطا|فنی|باز نمی/i]]
];
const POS=['عالی','خوب بود','راضی','ممنون','سپاس','خوش برخورد','به موقع','سریع','حرفه ای','حرفه‌ای','اوکی بود','مشکلی نبود'];
const NEG=['بد','ناراضی','افتضاح','اصلا راضی','اصلاً راضی','دیر','تاخیر','مشکل','اشتباه','ناقص','نیامد','نیومد','جواب نداد','پاسخ نداد','بی ادب','بی‌ادب','دردناک','کبودی','شکایت'];

function lexHits(t,words){
 const out=[];
 const esc=s=>s.replace(/[.*+?^$(){}|[\]\\]/g,'\\function lexHits(t,words){
 const out=[];
 for(const w of words){
  let from=0;
  while(true){
   const i=t.indexOf(w,from);if(i<0)break;
   if(!lexicalNegated(t,i))out.push({term:w,index:i});
   from=i+w.length;
  }
 }
 return out;
}');
 for(const w of words){
  const re=new RegExp('(^|[^\\p{L}\\p{N}])('+esc(w)+')(?=$|[^\\p{L}\\p{N}])','giu');
  for(const m of t.matchAll(re)){
   const i=(m.index||0)+m[1].length;
   if(!lexicalNegated(t,i))out.push({term:w,index:i});
  }
 }
 return out;
}
export function evaluateVoc(transcript){
 const t=normalizePersian(transcript),q=textQuality(t);
 if(!q.sufficient)return{version:'voc-fa-0.1.0',scoreStatus:'non_scorable',primaryTopic:'unknown',topics:[],sentiment:'unknown',satisfaction:'unknown',confidence:0,evidence:[],urgency:'review',warnings:['Transcript برای VOC کافی نیست.']};
 const topics=TOPICS.map(([id,label,patterns])=>{const ev=evidenceWindows(t,patterns);return{id,label,matched:ev.length>0,evidence:ev}}).filter(x=>x.matched);
 const ph=lexHits(t,POS),nh=lexHits(t,NEG);
 let sentiment='neutral',satisfaction='neutral';
 if(ph.length&&nh.length){sentiment='mixed';satisfaction='mixed'}
 else if(nh.length){sentiment='negative';satisfaction='dissatisfied'}
 else if(ph.length){sentiment='positive';satisfaction='satisfied'}
 const urgent=/(خونریزی شدید|بیهوش|غش|تنگی نفس شدید|درد شدید|واکنش حساسیتی شدید)/.test(t);
 const evidence=[...ph.slice(0,3).map(x=>x.term),...nh.slice(0,3).map(x=>x.term)];
 const confidence=Math.min(.95,.5+.1*Math.min(3,topics.length)+.08*Math.min(3,ph.length+nh.length));
 return{version:'voc-fa-0.1.0',scoreStatus:'classified',primaryTopic:topics[0]?.id||'other',topics,sentiment,satisfaction,confidence:Number(confidence.toFixed(2)),evidence,urgency:urgent?'urgent_review':'normal',warnings:topics.length?[]:['موضوع با Confidence کافی به Taxonomy فعلی نگاشت نشد؛ Review انسانی پیشنهاد می‌شود.']};
}
export const VOC_TOPIC_TAXONOMY=TOPICS.map(([id,label])=>({id,label}));
