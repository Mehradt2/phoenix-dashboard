import{normalizePersian,evidenceWindows,textQuality}from'./persian.mjs';
function finding(id,label,severity,status,evidence=[],confidence=.8,note=''){return{ruleId:id,label,severity,critical:severity==='critical',status,confidence:Number(confidence.toFixed(2)),evidence,note}}
export function evaluatePhysician(text,ctx={}){
 const t=normalizePersian(text),q=textQuality(t);
 if(!q.sufficient||ctx.noAnswer===true)return{version:'physician-qc-server-0.1.0',catalog:'DOC-009 / PVQ-026..040',scoreStatus:'non_scorable',conversationScore:null,risk:'review',criticalFailures:[],reviewGates:['PVQ-026'],findings:[finding('PVQ-026','No Answer / Non-scorable','info','review',[],.99,'متن/تماس قابل امتیازدهی نیست.')],warnings:[]};
 const findings=[];
 const idEv=evidenceWindows(t,[/(با خود بیمار|خود بیمار|نام و نام خانوادگی|هویت|مشخصات.*تایید|مشخصات.*تأیید)/i]);
 findings.push(finding('PVQ-027','حضور بیمار هدف و احراز هویت','major',idEv.length?'pass':'review',idEv,idEv.length?.9:.3,'برای Fail قطعی، Participant/metadata لازم است.'));
 findings.push(finding('PVQ-029','بیمار بالغ با همراه فاقد احراز اختیار','critical',ctx.adultCompanionUnverified===true?'fail':'review',[],ctx.adultCompanionUnverified===true?.98:.2,'فقط با Metadata/Reviewer تعیین می‌شود.'));
 const brand=evidenceWindows(t,[/(دکترساینا|روبرا|دکتر دکتر|هومکا)/i]);findings.push(finding('PVQ-030','معرفی برند منطبق با Case','major',brand.length?'pass':'review',brand,brand.length?.88:.3));
 findings.push(finding('PVQ-031','تماس تکراری پزشک','major',ctx.duplicateContact===false?'pass':'review',[],ctx.duplicateContact===false?.95:.2,'نیازمند Metadata تاریخی است.'));
 const drug=evidenceWindows(t,[/(دارو|قرص|انسولین|متفورمین|لووتیروکسین|وارفارین|آسپرین)/i]),dose=evidenceWindows(t,[/\d+(?:[./]\d+)?\s*(میلی ?گرم|mg|گرم|g|واحد|unit)/i]);
 const medStatus=drug.length?(dose.length?'pass':'review'):'review';findings.push(finding('PVQ-034','ثبت دارو و دوز لازم','major',medStatus,[...drug,...dose],dose.length?.93:drug.length?.55:.25,'عدم ذکر دارو ممکن است N/A باشد و Auto-fail نمی‌شود.'));
 const hx=evidenceWindows(t,[/(سابقه|دیابت|فشار خون|عمل جراحی|بیماری زمینه|حساسیت|آلرژی|از چه زمانی|شروع شده)/i]),prep=evidenceWindows(t,[/(ناشتا|ناشتایی|آمادگی آزمایش|آب ساده)/i]);findings.push(finding('PVQ-035','شرح حال ساختاریافته و آمادگی','major',hx.length&&prep.length?'pass':'review',[...hx,...prep],hx.length&&prep.length?.9:.45));
 findings.push(finding('PVQ-036','قابل فهم بودن Audio','minor',ctx.audioIntelligibility==='good'?'pass':'review',[],ctx.audioIntelligibility==='good'?.95:.2,'از متن به تنهایی تعیین نمی‌شود.'));
 findings.push(finding('PVQ-037','Communication Energy','minor','review',[],.2,'لحن صوتی از Transcript قطعی نمی‌شود.'));
 const certainty=evidenceWindows(t,[/(قطعا|قطعاً|حتما|حتماً|صددرصد|مطمئنم که)/i]);findings.push(finding('PVQ-038','قطعیت پزشکی بدون پشتوانه','review',certainty.length?'review':'pass',certainty,certainty.length?.65:.85,certainty.length?'نیازمند Medical Review است.':'نشانه صریح یافت نشد.'));
 findings.push(finding('PVQ-039','Speaker Role Resolution Gate','review',ctx.speakerRoleResolved===true?'pass':'review',[],ctx.speakerRoleResolved===true?.99:.2));
 const low=Number(ctx.asrConfidence??1)<.72;findings.push(finding('PVQ-040','Low Confidence Human Review Gate','review',low?'review':'pass',[],low?.98:.9));
 const criticalFailures=findings.filter(x=>x.critical&&x.status==='fail').map(x=>x.ruleId),reviewGates=findings.filter(x=>x.status==='review').map(x=>x.ruleId);
 const penalty=findings.reduce((s,x)=>s+(x.status==='fail'?(x.severity==='critical'?35:18):0),0),score=Math.max(0,100-penalty),risk=criticalFailures.length?'critical':reviewGates.length?'medium':score<70?'high':'low';
 return{version:'physician-qc-server-0.1.0',catalog:'DOC-009 / PVQ-026..040',scoreStatus:reviewGates.length?'review_required':'scored',conversationScore:score,risk,criticalFailures,reviewGates,findings,warnings:['قواعد وابسته به Metadata/Audio عمداً از متن حدس زده نمی‌شوند.']};
}
