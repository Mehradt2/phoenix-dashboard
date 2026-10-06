import{timingSafeEqual}from'node:crypto';

const BASE=(process.env.OGANSON_BASE_URL||'http://host.docker.internal:9000').replace(/\/+$/,'');
const TOKEN=process.env.OGANSON_SHARED_TOKEN||'';
const HEALTH_PATH=process.env.OGANSON_HEALTH_PATH||'/health';
const RESULT_PATH=process.env.OGANSON_RESULT_PATH||'/api/transcripts';

function safeEq(a,b){
 const aa=Buffer.from(String(a||'')),bb=Buffer.from(String(b||''));
 return aa.length===bb.length&&aa.length>0&&timingSafeEqual(aa,bb);
}
export function verifyOgansonWebhook(req){
 if(!TOKEN)return false;
 return safeEq(req.get('x-oganson-token'),TOKEN);
}
export function canonicalOgansonPayload(body={}){
 const transcript=String(body.transcript??body.text??body.result?.text??'').trim();
 const externalId=String(body.externalId??body.external_id??body.jobId??body.job_id??body.id??'').trim();
 const domain=String(body.domain??body.metadata?.domain??'').trim();
 const subject=body.subject||body.metadata?.subject||{};
 const occurredAt=body.occurredAt??body.occurred_at??body.metadata?.occurredAt??new Date().toISOString();
 const confidence=Number(body.confidence??body.asrConfidence??body.result?.confidence??body.metadata?.confidence??NaN);
 const segments=Array.isArray(body.segments)?body.segments:Array.isArray(body.result?.segments)?body.result.segments:[];
 return{
  externalId,
  domain,
  subject:{externalId:String(subject.externalId??subject.external_id??subject.id??'').trim(),name:String(subject.name??subject.displayName??'').trim()},
  customerExternalId:String(body.customerExternalId??body.customer_external_id??body.user?.id??body.metadata?.customerExternalId??'').trim(),
  transcript,
  occurredAt,
  sourceName:String(body.sourceName??body.source_name??body.fileName??body.metadata?.sourceName??'').trim(),
  asrConfidence:Number.isFinite(confidence)?confidence:null,
  language:String(body.language??body.result?.language??'fa'),
  segments,
  metadata:body.metadata&&typeof body.metadata==='object'?body.metadata:{},
  raw:body
 };
}
export async function ogansonHealth(){
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),5000);
 try{
  const r=await fetch(BASE+HEALTH_PATH,{signal:c.signal,headers:TOKEN?{'x-oganson-token':TOKEN}:{}});
  const text=await r.text();let payload;try{payload=JSON.parse(text)}catch{payload={raw:text.slice(0,500)}}
  return{ok:r.ok,status:r.status,baseUrl:BASE,payload};
 }catch(e){return{ok:false,status:0,baseUrl:BASE,error:e?.name==='AbortError'?'timeout':String(e?.message||e)}}
 finally{clearTimeout(timer)}
}
export async function fetchOgansonTranscript(jobId){
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),30000);
 try{
  const url=BASE+RESULT_PATH.replace(/\/+$/,'')+'/'+encodeURIComponent(jobId);
  const r=await fetch(url,{signal:c.signal,headers:TOKEN?{'x-oganson-token':TOKEN}:{}});
  if(!r.ok)throw new Error('oganson_http_'+r.status);
  return canonicalOgansonPayload(await r.json());
 }finally{clearTimeout(timer)}
}
export const OGANSON_CONTRACT_VERSION='oganson-adapter-0.1.0';
