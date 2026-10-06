import React,{useEffect,useMemo,useState}from'react';
import{Activity,Download,RefreshCw,Search,ShieldCheck,Stethoscope,TestTube2,Users,Webhook}from'lucide-react';
import{analyzeText,exportUrl,getInteraction,intelligenceHealth,listInteractions,listProfiles,profileHistory,pullOganson,type IntelligenceDomain}from'./intelligenceApi';
import{isTeamMode}from'./runtime';

const fa=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
const LABEL={
 physician:{title:'پزشکان',person:'پزشک',icon:Stethoscope},
 sampler:{title:'نمونه‌گیران',person:'نمونه‌گیر',icon:TestTube2},
 voc:{title:'VOC کاربران',person:'کاربر',icon:Users}
} as const;

export default function IntelligenceCenter(){
 const[domain,setDomain]=useState<IntelligenceDomain>('physician'),[health,setHealth]=useState<any>(null),[rows,setRows]=useState<any[]>([]),[profiles,setProfiles]=useState<any[]>([]),[selected,setSelected]=useState<any>(null),[history,setHistory]=useState<any[]>([]),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false);
 const[from,setFrom]=useState(''),[to,setTo]=useState(''),[fromJ,setFromJ]=useState(''),[toJ,setToJ]=useState(''),[topic,setTopic]=useState(''),[sentiment,setSentiment]=useState(''),[jobId,setJobId]=useState(''),[text,setText]=useState(''),[preview,setPreview]=useState<any>(null);
 const q=useMemo(()=>({domain,from,to,fromJalali:fromJ,toJalali:toJ,topic:domain==='voc'?topic:'',sentiment:domain==='voc'?sentiment:''}),[domain,from,to,fromJ,toJ,topic,sentiment]);

 async function load(){
  if(!isTeamMode())return;
  setLoading(true);setMsg('');
  try{
   const[a,b,h]=await Promise.all([listInteractions(q),listProfiles(q),intelligenceHealth().catch(()=>null)]);
   setRows(a.interactions||[]);setProfiles(b.profiles||[]);setHealth(h);
  }catch(e:any){setMsg(e.message||'خطا در دریافت داده')}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[domain]);

 async function openProfile(p:any){try{setSelected({type:'profile',data:p});const h=await profileHistory(p.id,q);setHistory(h.history||[])}catch(e:any){setMsg(e.message||'خطا')}}
 async function openInteraction(id:string){try{const x=await getInteraction(id);setSelected({type:'interaction',data:x.interaction});setHistory([])}catch(e:any){setMsg(e.message||'خطا')}}
 async function pull(){if(!jobId.trim())return;setLoading(true);try{const r=await pullOganson(jobId.trim());setMsg(r.duplicate?'این Job قبلاً ثبت شده بود.':'Transcript از Oganson دریافت و پرونده ساخته شد.');setJobId('');await load()}catch(e:any){setMsg('Oganson: '+(e.message||e))}finally{setLoading(false)}}
 async function analyze(){if(!text.trim())return;setLoading(true);try{setPreview(await analyzeText(domain,text));setMsg('تحلیل متن انجام شد؛ این Preview در DB ذخیره نشده است.')}catch(e:any){setMsg(e.message||'خطا')}finally{setLoading(false)}}

 if(!isTeamMode())return<section className="panel"><div className="panel-title"><div><span className="eyebrow">LOCAL SERVER REQUIRED</span><h3>Text Intelligence v2</h3><p>این بخش برای Runtime سرور داخلی/Team طراحی شده است. Browser-local قدیمی فقط برای Recovery و Pilot باقی می‌ماند.</p></div><ShieldCheck/></div></section>;

 const meta=LABEL[domain],Icon=meta.icon;
 return<>
 <section className="section-head"><div><span className="eyebrow">LOCAL TEXT INTELLIGENCE V2</span><h2>مغز QC و پرونده‌سازی فارسی</h2><p>Oganson متن را تحویل می‌دهد؛ امتیاز، موضوع، رضایت، پرونده و History در کوله‌پشتی ساخته می‌شوند.</p></div><button onClick={load}><RefreshCw/> بروزرسانی</button></section>
 {msg&&<div className="toast">{msg}<button onClick={()=>setMsg('')}>×</button></div>}
 <section className="panel"><div className="domain-switch intel-domain">
 {(['physician','sampler','voc'] as IntelligenceDomain[]).map(d=>{const D=LABEL[d].icon;return<button key={d} className={domain===d?'active':''} onClick={()=>{setDomain(d);setSelected(null);setPreview(null)}}><D/>{LABEL[d].title}</button>})}
 </div></section>

 <section className="kpis">
  <article><span>Interaction</span><b>{fa.format(rows.length)}</b><small>در بازه فعلی</small></article>
  <article><span>Profiles</span><b>{fa.format(profiles.length)}</b><small>پرونده تجمیعی</small></article>
  <article><span>Review باز</span><b>{fa.format(rows.filter(x=>x.status==='needs_review').length)}</b><small>Human-in-the-loop</small></article>
  <article><span>Oganson</span><b>{health?.oganson?.ok?'Online':'Check'}</b><small>{health?.oganson?.baseUrl||'—'}</small></article>
 </section>

 <section className="two-col">
  <article className="panel"><div className="panel-title"><div><span className="eyebrow">OGANSON BRIDGE</span><h3>دریافت Transcript محلی</h3><p>Job ID را Pull کنید؛ Webhook نیز خودکار پشتیبانی می‌شود.</p></div><Webhook/></div><div className="stack-actions"><input placeholder="Oganson Job ID" value={jobId} onChange={e=>setJobId(e.target.value)}/><button className="primary" disabled={loading||!jobId.trim()} onClick={pull}>دریافت و پرونده‌سازی</button></div><div className="secure-note"><ShieldCheck/><div><b>Boundary</b><span>Audio وارد API کوله‌پشتی نمی‌شود؛ فقط Transcript + Metadata.</span></div></div></article>
  <article className="panel"><div className="panel-title"><div><span className="eyebrow">QA WORKBENCH</span><h3>تست مستقیم متن فارسی</h3><p>برای کالیبراسیون Ruleها؛ نتیجه Preview ذخیره نمی‌شود.</p></div><Activity/></div><textarea rows={6} placeholder="متن فارسی مکالمه…" value={text} onChange={e=>setText(e.target.value)}/><button className="primary" disabled={loading||!text.trim()} onClick={analyze}>تحلیل متن</button></article>
 </section>

 <section className="panel report-filters"><div className="filter-grid">
  <label>از تاریخ میلادی<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
  <label>تا تاریخ میلادی<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
  <label>از تاریخ شمسی<input placeholder="1405-07-15" value={fromJ} onChange={e=>setFromJ(e.target.value)}/></label>
  <label>تا تاریخ شمسی<input placeholder="1405-07-30" value={toJ} onChange={e=>setToJ(e.target.value)}/></label>
  {domain==='voc'&&<><label>موضوع<input placeholder="result_delay" value={topic} onChange={e=>setTopic(e.target.value)}/></label><label>Sentiment<select value={sentiment} onChange={e=>setSentiment(e.target.value)}><option value="">همه</option><option value="positive">مثبت</option><option value="negative">منفی</option><option value="mixed">ترکیبی</option><option value="neutral">خنثی</option></select></label></>}
  <button className="primary" onClick={load}><Search/>اعمال فیلتر</button><a className="file-action" href={exportUrl(q)}><Download/> CSV</a>
 </div></section>

 <section className="dashboard-grid">
  <article className="panel span2"><div className="panel-title"><div><h3>Interaction History · {meta.title}</h3><p>تاریخ شمسی/میلادی، Score/Topic و وضعیت Review.</p></div><Icon/></div><div className="table"><table><thead><tr><th>تاریخ</th><th>{meta.person}</th><th>{domain==='voc'?'موضوع':'امتیاز'}</th><th>{domain==='voc'?'رضایت':'ریسک'}</th><th>وضعیت</th></tr></thead><tbody>
   {rows.map(x=><tr key={x.id} onClick={()=>openInteraction(x.id)} style={{cursor:'pointer'}}><td><b>{x.jalaliDate||'—'}</b><small className="latin-date">{String(x.occurredAt||'').slice(0,10)}</small></td><td>{x.subjectName}</td><td>{domain==='voc'?(x.primaryTopic||'other'):(x.score??'—')}</td><td>{domain==='voc'?(x.satisfaction||'—'):(x.risk||'—')}</td><td>{x.status}</td></tr>)}
   {!rows.length&&<tr><td colSpan={5}><div className="empty compact">داده‌ای در بازه فعلی وجود ندارد.</div></td></tr>}
  </tbody></table></div></article>
  <article className="panel"><div className="panel-title"><div><h3>پرونده‌ها</h3><p>History تجمیعی هر {meta.person}</p></div><Users/></div><div className="mini-list">
   {profiles.slice(0,12).map(p=><button key={p.id} onClick={()=>openProfile(p)}><span>{p.display_name||p.displayName}</span><b>{p.interactions} تماس</b><small>{domain==='voc'?String(p.dissatisfied_count||0)+' ناراضی':'Avg '+String(p.avg_score??'—')}</small></button>)}
  </div></article>
 </section>

 {preview&&<section className="panel"><div className="panel-title"><div><h3>Preview تحلیل</h3><p>{preview.version}</p></div><ShieldCheck/></div><div className="score-row"><div><span>Score</span><b>{preview.analysis?.conversationScore??'—'}</b></div><div><span>Status</span><b>{preview.analysis?.scoreStatus??'—'}</b></div><div><span>{domain==='voc'?'Topic':'Risk'}</span><b>{domain==='voc'?preview.analysis?.primaryTopic:preview.analysis?.risk}</b></div><div><span>{domain==='voc'?'رضایت':'Entities'}</span><b>{domain==='voc'?preview.analysis?.satisfaction:(preview.medicalEntities?.length||0)}</b></div></div><details><summary>JSON Evidence</summary><pre>{JSON.stringify(preview,null,2)}</pre></details></section>}

 {selected?.type==='interaction'&&<section className="panel"><div className="panel-title"><div><h3>جزئیات Interaction</h3><p>{selected.data.subjectName} · {selected.data.jalaliDate}</p></div><button onClick={()=>setSelected(null)}>بستن</button></div><div className="score-row"><div><span>Score</span><b>{selected.data.score??'—'}</b></div><div><span>Risk</span><b>{selected.data.risk??'—'}</b></div><div><span>Topic</span><b>{selected.data.primaryTopic??'—'}</b></div><div><span>Sentiment</span><b>{selected.data.sentiment??'—'}</b></div></div><details open><summary>Transcript</summary><pre>{selected.data.transcript}</pre></details><details><summary>Analysis / Evidence</summary><pre>{JSON.stringify(selected.data.analysis,null,2)}</pre></details></section>}

 {selected?.type==='profile'&&<section className="panel"><div className="panel-title"><div><h3>History · {selected.data.display_name||selected.data.displayName}</h3><p>پرونده در بازه انتخاب‌شده</p></div><button onClick={()=>setSelected(null)}>بستن</button></div><div className="table"><table><thead><tr><th>تاریخ شمسی</th><th>تاریخ میلادی</th><th>{domain==='voc'?'موضوع':'Score'}</th><th>ریسک/رضایت</th><th>وضعیت</th></tr></thead><tbody>{history.map(x=><tr key={x.id}><td>{x.jalaliDate}</td><td>{String(x.occurredAt||'').slice(0,10)}</td><td>{domain==='voc'?x.primaryTopic:(x.score??'—')}</td><td>{domain==='voc'?x.satisfaction:x.risk}</td><td>{x.status}</td></tr>)}</tbody></table></div></section>}
 </>;
}
