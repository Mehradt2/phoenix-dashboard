import type{QcDomain}from'./domain';

export type OperationalControl={
 id:string;
 label:string;
 rule:string;
 source:'conversation'|'workflow'|'external';
 severity:'info'|'warning'|'critical';
 autoAvailable:boolean;
};

export const OPERATIONAL_POLICY:Record<QcDomain,{version:string;title:string;controls:OperationalControl[]}>={
 physician:{
  version:'physician-ops-2026-09-21',
  title:'کنترل‌های عملیاتی پزشکان',
  controls:[
   {id:'PH-OPS-01',label:'تلاش تماس ویزیت',rule:'حداقل ۳ تلاش تماس برای ویزیت باید در Evidence عملیاتی ثبت شود.',source:'workflow',severity:'critical',autoAvailable:false},
   {id:'PH-OPS-02',label:'تلاش تماس تفسیر',rule:'حداقل ۳ تلاش تماس برای تفسیر در موارد مشمول باید ثبت شود.',source:'workflow',severity:'critical',autoAvailable:false},
   {id:'PH-OPS-03',label:'ثبت پاسخ‌گویی',rule:'وضعیت پاسخ‌گویی باید به‌صورت صریح «بله/خیر» ثبت شود؛ نامشخص قابل قبول نیست.',source:'workflow',severity:'warning',autoAvailable:false},
   {id:'PH-OPS-04',label:'دامنه تفسیر',rule:'تفسیر فقط برای مسیر سازمانی مجاز است؛ B2C نباید به‌عنوان تفسیر سازمانی امتیاز بگیرد.',source:'external',severity:'critical',autoAvailable:false},
   {id:'PH-OPS-05',label:'نسخه دوم سازمانی',rule:'نسخه دوم سازمانی در سیاست جاری حذف شده و نباید به‌عنوان مرحله الزامی یا موفقیت ثبت شود.',source:'external',severity:'warning',autoAvailable:false},
   {id:'PH-OPS-06',label:'کنسلی',rule:'کنسلی فقط در جریان ویزیت و با Evidence معتبر قابل ثبت است.',source:'workflow',severity:'critical',autoAvailable:false},
   {id:'PH-OPS-07',label:'تست‌های طلایی',rule:'کنترل تست‌های طلایی باید از لیست زرد نسخه‌دار استفاده کند؛ حداقل ۴ و حداکثر ۶ مورد. تا اتصال لیست مصوب Auto-score ممنوع است.',source:'external',severity:'critical',autoAvailable:false},
   {id:'PH-OPS-08',label:'تماس بسیار کوتاه',rule:'تماس‌های کمتر از ۲۰ ثانیه اگر بیش از یک مورد در ماه باشند باید در پرونده فردی Neutral/Investigate علامت‌گذاری شوند، نه اینکه کیفیت جعلی بسازند.',source:'external',severity:'warning',autoAvailable:true},
   {id:'PH-OPS-09',label:'حداقل طول مکالمه',rule:'برای QC کامل مکالمه، آستانه عملیاتی ۸ دقیقه است؛ تماس کوتاه‌تر نیازمند دلیل و Review انسانی است.',source:'conversation',severity:'warning',autoAvailable:true}
  ]
 },
 sampler:{
  version:'sampler-ops-2026-09-21',
  title:'کنترل‌های عملیاتی نمونه‌گیران',
  controls:[
   {id:'SA-OPS-01',label:'بازه انجام',rule:'نمونه‌گیری باید در بازه عملیاتی روز انجام شود؛ انجام بعد از ۱۱:۳۰ خطای عملیاتی است.',source:'external',severity:'critical',autoAvailable:false},
   {id:'SA-OPS-02',label:'تحویل بسیار سریع',rule:'فاصله نمونه‌گیری تا تحویل کمتر از ۷–۸ دقیقه نیازمند بررسی خطای ثبت/نمونه‌گیر است.',source:'external',severity:'warning',autoAvailable:false},
   {id:'SA-OPS-03',label:'حداکثر زمان تحویل',rule:'حداکثر زمان تحویل موفق ۱۵۰ دقیقه است.',source:'external',severity:'critical',autoAvailable:false},
   {id:'SA-OPS-04',label:'CSAT نمونه‌گیر',rule:'امتیازهای ۱ تا ۳ ضعیف، ۴ معمولی و ۵ عالی هستند؛ میانگین فردی همراه Drill-down رکوردی لازم است.',source:'external',severity:'warning',autoAvailable:false},
   {id:'SA-OPS-05',label:'کنسلی و علت',rule:'علت کنسلی و درصد کنسلی ماهانه باید در پرونده فردی قابل مشاهده و Drill-down باشد.',source:'external',severity:'warning',autoAvailable:false},
   {id:'SA-OPS-06',label:'تحویل ثبت‌نشده',rule:'تحویل ثبت‌نشده باید به‌صورت Exception مستقل گزارش شود.',source:'external',severity:'critical',autoAvailable:false},
   {id:'SA-OPS-07',label:'ظرفیت آزاد نشده',rule:'اگر درخواست روز بعد برگشت به فروش شده اما ثبت کنسلی بیش از ۲ ساعت طول کشیده، باید به‌عنوان خطای آزادسازی ظرفیت ثبت شود.',source:'external',severity:'warning',autoAvailable:false},
   {id:'SA-OPS-08',label:'تماس هماهنگی عدم پاسخ',rule:'در عدم پاسخ، ۳ تلاش با فاصله ۲۰ دقیقه و Retry صبح طبق Override نسخه‌دار باید Evidence شود.',source:'workflow',severity:'critical',autoAvailable:false}
  ]
 }
};

export function derivedProfileSignals(cases:{durationSeconds?:number}[],domain:QcDomain){
 const durations=cases.map(x=>Number(x.durationSeconds||0)).filter(x=>x>0);
 if(domain==='physician'){
  const under20=durations.filter(x=>x<20).length;
  const under8m=durations.filter(x=>x<480).length;
  return{under20,under8m,totalWithDuration:durations.length,shortCallNeutralReview:under20>1};
 }
 return{under20:0,under8m:0,totalWithDuration:durations.length,shortCallNeutralReview:false};
}
