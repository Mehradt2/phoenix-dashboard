export type IntelligenceDomain='physician'|'sampler'|'voc';
async function api(path:string,init:RequestInit={}){
 const r=await fetch(path,{...init,credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})}});
 const ct=r.headers.get('content-type')||'',body=ct.includes('json')?await r.json():await r.text();
 if(!r.ok)throw new Error((body as any)?.error||String(body)||('http_'+r.status));return body;
}
export const intelligenceHealth=()=>api('/api/v2/intelligence/health');
export const analyzeText=(domain:IntelligenceDomain,transcript:string,metadata:any={})=>api('/api/v2/intelligence/analyze',{method:'POST',body:JSON.stringify({domain,transcript,metadata})});
export const pullOganson=(jobId:string)=>api('/api/v2/integrations/oganson/pull/'+encodeURIComponent(jobId),{method:'POST'});
export async function listInteractions(q:Record<string,string>={}){const s=new URLSearchParams(Object.entries(q).filter(([,v])=>v));return api('/api/v2/interactions?'+s.toString())}
export async function getInteraction(id:string){return api('/api/v2/interactions/'+encodeURIComponent(id))}
export async function listProfiles(q:Record<string,string>={}){const s=new URLSearchParams(Object.entries(q).filter(([,v])=>v));return api('/api/v2/profiles?'+s.toString())}
export async function profileHistory(id:string,q:Record<string,string>={}){const s=new URLSearchParams(Object.entries(q).filter(([,v])=>v));return api('/api/v2/profiles/'+encodeURIComponent(id)+'/history?'+s.toString())}
export function exportUrl(q:Record<string,string>={}){const s=new URLSearchParams(Object.entries(q).filter(([,v])=>v));return'/api/v2/export.csv?'+s.toString()}
