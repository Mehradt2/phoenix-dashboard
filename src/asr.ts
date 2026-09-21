import{choosePlan,getMode,probeHardware,setMode,type HardwareProfile,type ModelMode,type ModelPlan}from'./modelPolicy';
import{configureTransformersRuntime,resolveModelRuntime}from'./modelRuntime';

type Progress=(p:{status:string;progress?:number;file?:string;model?:string;detail?:string})=>void;
type Loaded={pipe:any,plan:ModelPlan,hardware:HardwareProfile,fallbackReason?:string};
const cache=new Map<string,Promise<Loaded>>();
const MODEL_LOAD_TIMEOUT_MS=150_000;
const BASE_FALLBACK_ID='onnx-community/whisper-tiny';

function withTimeout<T>(promise:Promise<T>,ms:number,code:string):Promise<T>{
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error(code)),ms);
  promise.then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)});
 });
}

function fallbackPlan(h:HardwareProfile,label='Whisper Tiny · Safe fallback'):ModelPlan{
 const gpu=h.webgpu;return{mode:'standard',id:BASE_FALLBACK_ID,label,device:gpu?'webgpu':'wasm',dtype:gpu?{encoder_model:'fp32',decoder_model_merged:'q4'}:'q8',reason:'Fallback سبک: روی WebGPU از encoder fp32 + decoder q4 و روی WASM از q8 استفاده می‌شود؛ خروجی همچنان نیازمند Human Review است.',fallbackId:null,authRequired:false,subscriptionRequired:false,runtime:'browser-local',validation:'standard',licenseNotice:'Public model weights; no paid API required.'};
}

async function createOne(plan:ModelPlan,h:HardwareProfile,progress:Progress):Promise<Loaded>{
 progress({status:'model-load-start',model:plan.label,progress:0});
 const mod=await import('@huggingface/transformers');
 const runtime=await configureTransformersRuntime(mod),pipeline=mod.pipeline;
 progress({status:runtime.offlineStrict?'offline-pack-load':'model-source-ready',model:plan.label,detail:runtime.offlineStrict?runtime.localModelPath:'hub-cache'});
 let pipe:any;
 try{
  pipe=await withTimeout(
   pipeline('automatic-speech-recognition',plan.id,{device:plan.device,dtype:plan.dtype,progress_callback:(x:any)=>progress({status:String(x.status||'model-loading'),progress:Number(x.progress||0),file:x.file,model:plan.label})}as any) as Promise<any>,
   MODEL_LOAD_TIMEOUT_MS,
   'MODEL_LOAD_TIMEOUT'
  );
 }catch(e){
  const detail=e instanceof Error?e.message:String(e);
  throw new Error((runtime.offlineStrict?'OFFLINE_ASR_MODEL_UNAVAILABLE: ':'ASR_MODEL_LOAD_FAILED: ')+detail);
 }
 progress({status:'model-ready',model:plan.label,progress:100});
 return{pipe,plan,hardware:h};
}

async function create(plan:ModelPlan,h:HardwareProfile,progress:Progress):Promise<Loaded>{
 const attempts:ModelPlan[]=[plan];
 if(plan.fallbackId&&plan.fallbackId!==plan.id)attempts.push({...plan,id:plan.fallbackId,label:'Whisper Small · fallback',device:h.webgpu?'webgpu':'wasm',dtype:h.webgpu?{encoder_model:'fp32',decoder_model_merged:'q4'}:'q8',fallbackId:null,reason:'Fallback after selected model failure'});
 if(!attempts.some(x=>x.id===BASE_FALLBACK_ID))attempts.push(fallbackPlan(h));
 let last:any=null;
 for(let i=0;i<attempts.length;i++){
  const candidate=attempts[i];
  try{
   const loaded=await createOne(candidate,h,progress);
   if(last)loaded.fallbackReason=last instanceof Error?last.message:String(last);
   return loaded;
  }catch(e){
   last=e;
   progress({status:'model-fallback',model:candidate.label,detail:e instanceof Error?e.message:String(e)});
  }
 }
 throw new Error('ASR_MODEL_UNAVAILABLE: '+(last instanceof Error?last.message:String(last||'unknown')));
}

export async function modelStatus(mode:ModelMode=getMode()){
 const h=await probeHardware(),plan=choosePlan(mode,h);
 return{mode,hardware:h,plan,modelRuntime:resolveModelRuntime(),cacheEnabled:Boolean('caches'in globalThis),policy:'browser-asr-policy-1.2.0',timeouts:{modelLoadMs:MODEL_LOAD_TIMEOUT_MS},fallbackModel:BASE_FALLBACK_ID};
}
export function setModelMode(mode:ModelMode){setMode(mode);cache.clear()}
export async function warmModel(mode:ModelMode,progress:Progress){
 const h=await probeHardware(),p=choosePlan(mode,h),k=p.id+'|'+p.device+'|'+JSON.stringify(p.dtype);
 if(!cache.has(k))cache.set(k,create(p,h,progress).catch(e=>{cache.delete(k);throw e}));
 return cache.get(k)!;
}

async function decode16k(file:File){
 const raw=await file.arrayBuffer();
 let ctx:AudioContext|null=null;
 try{
  ctx=new AudioContext();
  const decoded=await ctx.decodeAudioData(raw.slice(0));
  const rate=16000,len=Math.ceil(decoded.duration*rate),off=new OfflineAudioContext(1,len,rate),src=off.createBufferSource(),mono=off.createBuffer(1,decoded.length,decoded.sampleRate),dst=mono.getChannelData(0);
  for(let c=0;c<decoded.numberOfChannels;c++){const ch=decoded.getChannelData(c);for(let i=0;i<ch.length;i++)dst[i]+=ch[i]/decoded.numberOfChannels}
  src.buffer=mono;src.connect(off.destination);src.start();
  const out=await off.startRendering();
  return out.getChannelData(0);
 }catch(e){
  throw new Error('AUDIO_DECODE_FAILED: '+(e instanceof Error?e.message:String(e)));
 }finally{try{await ctx?.close()}catch{}}
}

function activity(a:Float32Array){let peak=0,sum=0;for(const x of a){const v=Math.abs(x);if(v>peak)peak=v;sum+=x*x}const rms=Math.sqrt(sum/Math.max(1,a.length));return{peak,rms,noSpeech:peak<.002&&rms<.0005}}
export async function sha256File(file:File){const h=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}

export async function transcribe(file:File,progress:Progress,mode:ModelMode=getMode()){
 const t0=performance.now();
 progress({status:'decode',progress:0});
 const audio=await decode16k(file),act=activity(audio),durationSeconds=audio.length/16000;
 progress({status:'decode-ready',progress:100});
 if(act.noSpeech)return{text:'',chunks:[],durationSeconds,noSpeech:true,activity:act,device:'none',modelId:null,modelMode:mode,rtf:0};
 const loaded=await warmModel(mode,progress);
 progress({status:'transcribe-start',model:loaded.plan.label,progress:0});
 const inferenceTimeout=Math.min(600_000,Math.max(180_000,Math.round(durationSeconds*8000)));
 const out:any=await withTimeout(
  loaded.pipe(audio,{language:'fa',task:'transcribe',chunk_length_s:30,stride_length_s:5,return_timestamps:true}) as Promise<any>,
  inferenceTimeout,
  'TRANSCRIBE_TIMEOUT'
 );
 const chunks=(out.chunks||[]).map((x:any)=>({text:String(x.text||'').trim(),timestamp:Array.isArray(x.timestamp)?x.timestamp:[null,null]}));
 const elapsed=(performance.now()-t0)/1000;
 progress({status:'transcribe-done',model:loaded.plan.label,progress:100});
 return{text:String(out.text||'').trim(),chunks,durationSeconds,noSpeech:false,activity:act,device:loaded.plan.device,modelId:loaded.plan.id,modelLabel:loaded.plan.label,modelMode:mode,dtype:loaded.plan.dtype,rtf:durationSeconds?Number((elapsed/durationSeconds).toFixed(3)):null,fallbackReason:loaded.fallbackReason||null,hardware:loaded.hardware,inferenceTimeoutMs:inferenceTimeout};
}
