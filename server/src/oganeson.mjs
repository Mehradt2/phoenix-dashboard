const BASE=(process.env.OGANESON_BASE_URL||'').replace(/\/$/,'');
const HEALTH_PATH=process.env.OGANESON_HEALTH_PATH||'/health';
const TRANSCRIBE_PATH=process.env.OGANESON_TRANSCRIBE_PATH||'/v1/transcribe';
const FILE_FIELD=process.env.OGANESON_FILE_FIELD||'file';
const TIMEOUT_MS=Number(process.env.OGANESON_TIMEOUT_MS||180000);

function url(path){if(!BASE)throw new Error('OGANESON_BASE_URL is not configured');return BASE+path}
async function withTimeout(promise,ms=TIMEOUT_MS){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),ms);try{return await promise(ctrl.signal)}finally{clearTimeout(timer)}}
function parsePayload(data){
 const root=data?.result&&typeof data.result==='object'?data.result:data;
 const text=String(root?.text??root?.transcript??data?.text??data?.transcript??'').trim();
 const segments=Array.isArray(root?.segments)?root.segments:Array.isArray(data?.segments)?data.segments:[];
 const durationSeconds=Number(root?.durationSeconds??root?.duration??data?.durationSeconds??data?.duration??0)||0;
 const language=String(root?.language??data?.language??'fa');
 const confidence=root?.confidence??data?.confidence??null;
 if(!text)throw new Error('oganeson_empty_transcript');
 return{text,segments,durationSeconds,language,confidence,rawMeta:{provider:'oganeson',model:root?.model??data?.model??null,requestId:root?.requestId??data?.requestId??null}};
}
export async function oganesonHealth(){
 if(!BASE)return{ok:false,configured:false,error:'OGANESON_BASE_URL_missing'};
 try{
  const response=await withTimeout(signal=>fetch(url(HEALTH_PATH),{signal}),Math.min(TIMEOUT_MS,8000));
  const body=await response.text();return{ok:response.ok,configured:true,status:response.status,body:body.slice(0,500)}
 }catch(e){return{ok:false,configured:true,error:String(e?.message||e)}}
}
export async function transcribeWithOganeson(buffer,{fileName='audio.wav',mimeType='audio/wav',domain='unknown',jobId=null}={}){
 const form=new FormData();
 form.append(FILE_FIELD,new Blob([buffer],{type:mimeType}),fileName);
 form.append('language','fa');
 form.append('domain',domain);
 if(jobId)form.append('job_id',jobId);
 form.append('timestamps','true');
 form.append('speaker_labels','true');
 const response=await withTimeout(signal=>fetch(url(TRANSCRIBE_PATH),{method:'POST',body:form,signal}));
 const raw=await response.text();
 if(!response.ok)throw new Error('oganeson_http_'+response.status+':'+raw.slice(0,300));
 let data;try{data=JSON.parse(raw)}catch{data={text:raw}}
 return parsePayload(data)
}
export const OGANESON_CONTRACT={version:'oganeson-adapter-1.0.0',baseConfigured:Boolean(BASE),healthPath:HEALTH_PATH,transcribePath:TRANSCRIBE_PATH,fileField:FILE_FIELD,language:'fa',rawAudioCloud:false};
