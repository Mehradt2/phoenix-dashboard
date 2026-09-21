import type{CaseRecord}from'./vault';import type{QcDomain}from'./domain';
export function filtered(cases:CaseRecord[],domain:QcDomain){return cases.filter(x=>x.domain===domain)}
export function executive(cases:CaseRecord[],domain:QcDomain){
 const xs=filtered(cases,domain),scored=xs.filter(x=>x.qc?.finalScore!=null||x.qc?.conversationScore!=null),finals=scored.map(x=>Number(x.qc?.finalScore??x.qc?.conversationScore)).filter(Number.isFinite),critical=xs.filter(x=>x.qc?.criticalFailures?.length),review=xs.filter(x=>x.status==='needs_review');
 return{volume:xs.length,reviewOpen:review.length,reviewRate:xs.length?Math.round(review.length/xs.length*100):0,avg:finals.length?Math.round(finals.reduce((a,b)=>a+b,0)/finals.length*10)/10:0,criticalRate:xs.length?Math.round(critical.length/xs.length*100):0,scored:finals.length}
}
export function riskDistribution(cases:CaseRecord[],domain:QcDomain){const xs=filtered(cases,domain),o={low:0,medium:0,high:0,critical:0};for(const x of xs){const r=x.qc?.risk;if(r in o)(o as any)[r]++}return o}
export function pareto(cases:CaseRecord[],domain:QcDomain){
 const xs=filtered(cases,domain),m=new Map<string,{label:string,count:number,critical:boolean}>();
 for(const c of xs)for(const f of c.qc?.findings||[]){const failed=f.matched===false||f.status==='fail'||f.status==='partial';if(!failed)continue;const cur=m.get(f.ruleId)||{label:f.label,count:0,critical:Boolean(f.critical)};cur.count++;m.set(f.ruleId,cur)}
 return[...m.entries()].map(([id,v])=>({id,...v})).sort((a,b)=>b.count-a.count).slice(0,8)
}
export function weeklyTrend(cases:CaseRecord[],domain:QcDomain,weeks=8){
 const xs=filtered(cases,domain),now=new Date(),rows=[] as {label:string,avg:number,count:number}[];
 for(let i=weeks-1;i>=0;i--){const end=new Date(now);end.setDate(now.getDate()-i*7);const start=new Date(end);start.setDate(end.getDate()-6);start.setHours(0,0,0,0);end.setHours(23,59,59,999);const bucket=xs.filter(x=>{const d=new Date(x.createdAt);return d>=start&&d<=end});const vals=bucket.map(x=>Number(x.qc?.finalScore??x.qc?.conversationScore)).filter(Number.isFinite);rows.push({label:new Intl.DateTimeFormat('fa-IR',{month:'short',day:'numeric'}).format(end),avg:vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:0,count:bucket.length})}
 return rows
}
export function people(cases:CaseRecord[],domain:QcDomain){
 const xs=filtered(cases,domain),m=new Map<string,CaseRecord[]>();for(const c of xs)m.set(c.personName,[...(m.get(c.personName)||[]),c]);
 return[...m.entries()].map(([name,r])=>{const vals=r.map(x=>Number(x.qc?.finalScore??x.qc?.conversationScore)).filter(Number.isFinite),critical=r.reduce((s,x)=>s+(x.qc?.criticalFailures?.length||0),0);return{name,calls:r.length,avg:vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:null,pending:r.filter(x=>x.status==='needs_review').length,critical,last:r.map(x=>x.createdAt).sort().at(-1)||''}}).sort((a,b)=>b.calls-a.calls)
}

export function individualProfile(cases:CaseRecord[],domain:QcDomain,name:string){
 const rows=filtered(cases,domain).filter(x=>x.personName===name),scored=rows.filter(x=>x.qc?.scoreStatus!=='non_scorable'&&(x.qc?.finalScore!=null||x.qc?.conversationScore!=null)),nonScorable=rows.filter(x=>x.qc?.scoreStatus==='non_scorable').length,reviewOpen=rows.filter(x=>x.status==='needs_review').length,criticalCalls=rows.filter(x=>(x.qc?.criticalFailures?.length||0)>0).length;
 let applicableWeight=0,passedWeight=0,rulePass=0,ruleApplicable=0;
 for(const c of rows)for(const f of c.qc?.findings||[]){
  const status=f.status??(f.matched?'pass':'fail');
  if(status==='not_applicable'||status==='review')continue;
  ruleApplicable++;
  if(status==='pass')rulePass++;
  const w=Number(f.weight||0);if(w>0){applicableWeight+=w;if(status==='pass')passedWeight+=w}
 }
 const vals=scored.map(x=>Number(x.qc?.finalScore??x.qc?.conversationScore)).filter(Number.isFinite);
 const nScored=vals.length,avg=nScored?Math.round(vals.reduce((a,b)=>a+b,0)/nScored*10)/10:null,ruleCompliance=applicableWeight?Math.round(passedWeight/applicableWeight*1000)/10:(ruleApplicable?Math.round(rulePass/ruleApplicable*1000)/10:null);
 const sampleFlag=nScored<5?'نمونه کم':nScored<10?'قابل نمایش UAT؛ مقایسه محدود':'حجم مناسب برای تحلیل دوره‌ای';
 return{name,total:rows.length,scored:nScored,nonScorable,avg,reviewOpen,reviewRate:rows.length?Math.round(reviewOpen/rows.length*1000)/10:0,criticalCalls,criticalRate:nScored?Math.round(criticalCalls/nScored*1000)/10:0,ruleCompliance,sampleFlag,samplePolicy:'آستانه‌های ۵/۱۰ فعلاً UAT پیشنهادی‌اند و Policy نهایی نیستند.'}
}
