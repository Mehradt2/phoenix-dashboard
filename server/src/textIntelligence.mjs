const BASE=(process.env.TEXT_INTELLIGENCE_URL||'http://text-intelligence:8090').replace(/\/$/,'');
export async function analyzeTranscript(payload){
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),Number(process.env.TEXT_INTELLIGENCE_TIMEOUT_MS||15000));
 try{
  const r=await fetch(BASE+'/v1/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
  if(!r.ok)throw new Error('text_intelligence_http_'+r.status);
  return await r.json()
 }finally{clearTimeout(timeout)}
}
export async function textIntelligenceHealth(){
 const r=await fetch(BASE+'/health',{signal:AbortSignal.timeout(3000)});if(!r.ok)throw new Error('unhealthy');return r.json()
}
