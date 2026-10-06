import{normalizePersian,evidenceWindows,textQuality}from'./persian.mjs';

const R=[
 {id:'C01',label:'شروع حرفه‌ای و معرفی',w:8,c:false,p:[/(سلام|وقت بخیر|صبح بخیر|عصر بخیر|شب بخیر)/],s:[/(نمونه.?گیر|از طرف|دکترساینا|روبرا|هومکا|دکتر دکتر)/]},
 {id:'C02',label:'تأیید مخاطب/هویت مناسب',w:9,c:false,p:[/(خودتون|شما هستید|با آقای|با خانم|بیمار|مراجع|برای شما)/]},
 {id:'C03',label:'تأیید روز و بازه مراجعه',w:15,c:true,p:[/(فردا|امروز|صبح|ساعت|بازه|7\s*(تا|الی)\s*8|8\s*(تا|الی)\s*9|9\s*(تا|الی)\s*10|10\s*(تا|الی)\s*11)/],s:[/(تأیید|هماهنگ|درسته|مناسبه|می.?رسم|خدمت)/]},
 {id:'C04',label:'تأیید آدرس و جزئیات دسترسی',w:15,c:true,p:[/(آدرس|لوکیشن|موقعیت)/],s:[/(خیابان|کوچه|پلاک|واحد|طبقه|زنگ|درب|ورودی|برج|بلوک)/]},
 {id:'C05',label:'اعلام زمان تقریبی/تماس قبل رسیدن',w:10,c:false,p:[/(حدود|تقریبا|تقریباً|دقیقه|می.?رسم|رسیدن|قبل از رسیدن|تماس می.?گیرم)/]},
 {id:'C06',label:'شرایط آمادگی و ناشتایی',w:20,c:true,p:[/(ناشتا|ناشتایی|ساعت ناشتایی|غذا|صبحانه)/],s:[/(آب|چای|قهوه|دارو|قرص|سیگار|آدامس|چند ساعت)/]},
 {id:'C07',label:'فرصت سؤال و رفع ابهام',w:8,c:false,p:[/(سوالی|سؤال|پرسشی|ابهامی|نکته.?ای|راهنمایی|سوال دیگه)/]},
 {id:'C08',label:'جمع‌بندی و تأیید نهایی',w:8,c:false,p:[/(پس|بنابراین|هماهنگ شد|تأیید می.?کنید|اوکی شد|فردا خدمت|ممنون از شما|درسته)/]},
 {id:'C09',label:'لحن محترمانه و حرفه‌ای',w:7,c:false,p:[/(لطفا|لطفاً|ممنون|متشکرم|خواهش می.?کنم|زحمت|بفرمایید)/],n:[/(خفه|مزاحم نشو|وظیفه.?ت|مشکل خودت|به من ربطی نداره)/]}
];

export function evaluateSampler(text){
 const t=normalizePersian(text),q=textQuality(t);
 if(!q.sufficient)return{version:'sampler-conversation-qc-2.0.0',scoreStatus:'non_scorable',conversationScore:null,coverage:0,risk:'critical',criticalFailures:['TRANSCRIPT_INSUFFICIENT'],reviewGates:['TRANSCRIPT_INSUFFICIENT'],findings:[],warnings:['Transcript ناکافی است.']};
 let score=0,covered=0;const criticalFailures=[],findings=[],warnings=[];
 for(const r of R){
  const pe=evidenceWindows(t,r.p),se=evidenceWindows(t,r.s||[]),neg=(r.n||[]).some(p=>p.test(t));
  let status='fail',confidence=0;
  if(neg){status='fail';confidence=.95}
  else if(pe.length&&(!r.s||se.length)){status='pass';confidence=Math.min(.95,.78+.06*Math.min(2,pe.length+se.length))}
  else if(pe.length){status='partial';confidence=.55}
  if(status==='pass'){score+=r.w*confidence;covered+=r.w}
  else if(status==='partial'){score+=r.w*confidence*.4;covered+=r.w*.5;warnings.push(r.id+' Evidence ناقص دارد.')}
  if(r.c&&status!=='pass')criticalFailures.push(r.id);
  findings.push({ruleId:r.id,label:r.label,weight:r.w,critical:r.c,status,confidence:Number(confidence.toFixed(2)),evidence:[...new Set([...pe,...se])].slice(0,3)});
 }
 const final=Number(score.toFixed(1)),risk=criticalFailures.length>=2?'critical':criticalFailures.length===1?'high':final<70?'medium':'low';
 return{version:'sampler-conversation-qc-2.0.0',scoreStatus:'review_required',conversationScore:final,coverage:Math.round(covered),risk,criticalFailures,reviewGates:criticalFailures,findings,warnings};
}
export const SAMPLER_RULES=R.map(x=>({id:x.id,label:x.label,weight:x.w,critical:x.c}));
