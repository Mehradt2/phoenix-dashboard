export type PhysicianEvidence={ruleId:string;label:string;weight:number;status:'pass'|'partial'|'fail'|'uncertain';confidence:number;critical:boolean;excerpts:string[]};
export type VitaminDSignal={mentioned:boolean;initiator:'doctor'|'patient'|'both'|'unknown';agreement:'agreed'|'not_agreed'|'conditional'|'unknown';finalDecision:'perform'|'not_perform'|'deferred'|'unknown';prescriptionStatus:'registered'|'committed_to_register'|'discussed_only'|'not_discussed'|'unknown';externalVerification:'not_available';evidence:string[]};
export type ToneSignal={respect:'positive'|'negative'|'unknown';empathy:'positive'|'negative'|'unknown';clarity:'positive'|'negative'|'unknown';patience:'positive'|'negative'|'unknown';evidence:string[];isolatedFromQcScore:true};
export type PhysicianQC={version:string;conversationScore:number|null;coverage:number;risk:'low'|'medium'|'high'|'critical';requiresHumanReview:boolean;criticalFailures:string[];findings:PhysicianEvidence[];warnings:string[];vitaminD:VitaminDSignal;tone:ToneSignal};

const norm=(s:string)=>s.replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه').replace(/[ؤ]/g,'و').replace(/[إأآ]/g,'ا').replace(/\s+/g,' ').trim();
const clip=(t:string,p:RegExp)=>{const m=t.match(p);if(!m)return[];const i=m.index||0;return[t.slice(Math.max(0,i-42),Math.min(t.length,i+m[0].length+62))]};
type Rule={id:string;label:string;weight:number;critical:boolean;primary:RegExp[];support?:RegExp[];negative?:RegExp[]};
export const PHYSICIAN_RULES:Rule[]=[
 {id:'P01',label:'شروع حرفه‌ای و معرفی',weight:8,critical:false,primary:[/(سلام|وقت بخیر|صبح بخیر|عصر بخیر)/],support:[/(دکتر|پزشک|از طرف|دکترساینا|روبرا)/]},
 {id:'P02',label:'احراز مخاطب و نقش پاسخ‌دهنده',weight:12,critical:true,primary:[/(خودتون|بیمار|مادر|پدر|ولی|همراه|مراقب|با آقای|با خانم)/],support:[/(هستید|صحبت می.?کنم|نسبت شما)/]},
 {id:'P03',label:'علت مراجعه و علائم',weight:12,critical:false,primary:[/(علت|مشکل|علامت|علائم|درد|تب|سرفه|ضعف|سرگیجه|حال عمومی|برای چه موردی)/]},
 {id:'P04',label:'سوابق پزشکی/جراحی',weight:12,critical:false,primary:[/(سابقه|بیماری زمینه|جراحی|عمل|دیابت|فشار خون|تیروئید|قلب|کلیه)/]},
 {id:'P05',label:'دارو و دوز/نحوه مصرف',weight:12,critical:false,primary:[/(دارو|قرص|کپسول|شربت|انسولین|مصرف می.?کن)/],support:[/(دوز|میلی.?گرم|چند بار|روزانه|شب|صبح|واحد)/]},
 {id:'P06',label:'حساسیت و هشدارهای مرتبط',weight:8,critical:false,primary:[/(حساسیت|آلرژی|واکنش|عارضه دارویی)/]},
 {id:'P07',label:'پرسش روشن‌کننده و گوش‌دادن',weight:10,critical:false,primary:[/(از کی|چند روز|شدتش|بیشتر توضیح|منظورتون|درست متوجه شدم|سؤال)/]},
 {id:'P08',label:'برنامه/اقدام بعدی و جمع‌بندی',weight:12,critical:true,primary:[/(پیشنهاد|لازم است|بهتره|آزمایش|پیگیری|نسخه|جمع.?بندی|مرحله بعد|انجام بدید)/]},
 {id:'P09',label:'فرصت سؤال بیمار',weight:6,critical:false,primary:[/(سوالی دارید|سؤال دیگه|ابهامی|نکته.?ای مونده|پرسشی)/]},
 {id:'P10',label:'احترام، همدلی و وضوح',weight:8,critical:false,primary:[/(ممنون|خواهش می.?کنم|متوجه.?ام|درک می.?کنم|نگران نباشید|لطفا|لطفاً)/],negative:[/(خفه|مزاحم نشو|به من ربطی نداره|مشکل خودته)/]}
];

function findStatus(t:string,r:Rule):PhysicianEvidence{
 const primary=r.primary.flatMap(p=>clip(t,p)),support=(r.support||[]).flatMap(p=>clip(t,p)),negative=(r.negative||[]).some(p=>p.test(t));
 let status:PhysicianEvidence['status']='fail',confidence=0;
 if(negative){status='fail';confidence=.92}
 else if(primary.length&&(!r.support||support.length)){status='pass';confidence=Math.min(.94,.76+.06*Math.min(3,primary.length+support.length))}
 else if(primary.length){status='partial';confidence=.62}
 const excerpts=[...new Set([...primary,...support])].slice(0,3);
 return{ruleId:r.id,label:r.label,weight:r.weight,status,confidence:Number(confidence.toFixed(2)),critical:r.critical,excerpts}
}
function vitaminD(t:string):VitaminDSignal{
 const mentioned=/(ویتامین\s*[دd]|vitamin\s*d)/i.test(t);
 if(!mentioned)return{mentioned:false,initiator:'unknown',agreement:'unknown',finalDecision:'unknown',prescriptionStatus:'not_discussed',externalVerification:'not_available',evidence:[]};
 const ev=clip(t,/(ویتامین\s*[دd]|vitamin\s*d)/i);
 const registered=/(ثبت کردم|اضافه کردم|داخل نسخه گذاشتم|نوشتم)/.test(t);
 const committed=/(ثبت می.?کنم|اضافه می.?کنم|می.?نویسم|داخل نسخه می.?ذارم)/.test(t);
 const context=t.match(/.{0,120}(ویتامین\s*[دd]|vitamin\s*d).{0,180}/i)?.[0]||'';
 const agree=/((انجام|بزن|آزمایش).{0,60}(باشه|بله|اوکی|موافق)|(?:باشه|بله|اوکی|موافق).{0,60}(انجام|بزن|آزمایش))/.test(context);
 const decline=/(نمی.?خوام|انجام نمی.?دم|لازم نیست|موافق نیستم)/.test(context);
 return{mentioned:true,initiator:'unknown',agreement:decline?'not_agreed':agree?'agreed':'unknown',finalDecision:decline?'not_perform':agree?'perform':'unknown',prescriptionStatus:registered?'registered':committed?'committed_to_register':'discussed_only',externalVerification:'not_available',evidence:ev}
}
function tone(t:string):ToneSignal{
 const neg=/(خفه|مزاحم نشو|مشکل خودته|به من ربطی نداره)/.test(t),respect=/(لطفا|لطفاً|ممنون|خواهش می.?کنم)/.test(t),empathy=/(درک می.?کنم|متوجه.?ام|نگران|حق دارید)/.test(t),clarity=/(یعنی|منظورم|جمع.?بندی|مرحله بعد|توضیح)/.test(t),patience=/(بفرمایید|گوش می.?دم|آرام|دوباره توضیح)/.test(t);
 const evidence=[...clip(t,/(لطفا|لطفاً|ممنون|درک می.?کنم|متوجه.?ام|جمع.?بندی|بفرمایید|خفه|مزاحم نشو)/)].slice(0,3);
 return{respect:neg?'negative':respect?'positive':'unknown',empathy:empathy?'positive':'unknown',clarity:clarity?'positive':'unknown',patience:patience?'positive':'unknown',evidence,isolatedFromQcScore:true}
}
export function evaluatePhysician(transcript:string):PhysicianQC{
 const t=norm(transcript),warnings:string[]=[];
 if(t.length<30)return{version:'physician-qc-1.0-candidate',conversationScore:null,coverage:0,risk:'critical',requiresHumanReview:true,criticalFailures:['TRANSCRIPT_INSUFFICIENT'],findings:[],warnings:['Transcript برای QC پزشک کافی نیست.'],vitaminD:vitaminD(t),tone:tone(t)};
 const findings=PHYSICIAN_RULES.map(r=>findStatus(t,r));
 const covered=findings.filter(x=>x.status==='pass'||x.status==='partial').reduce((s,x)=>s+x.weight,0);
 const earned=findings.reduce((s,x)=>s+x.weight*(x.status==='pass'?x.confidence:x.status==='partial'?x.confidence*.5:0),0);
 const criticalFailures=findings.filter(x=>x.critical&&(x.status==='fail'||x.status==='uncertain')).map(x=>x.ruleId);
 const score=Math.round(earned*10)/10,risk=criticalFailures.length>=2?'critical':criticalFailures.length===1?'high':score<70?'medium':'low';
 warnings.push('امتیاز خودکار پزشک Candidate است و تا Calibration فارسی پزشکی نیازمند Human Review باقی می‌ماند.');
 return{version:'physician-qc-1.0-candidate',conversationScore:score,coverage:covered,risk,requiresHumanReview:true,criticalFailures,findings,warnings,vitaminD:vitaminD(t),tone:tone(t)}
}
