import{probeHardware}from'./modelPolicy';
import{configureTransformersRuntime,resolveModelRuntime}from'./modelRuntime';

export type LocalAiInsight={
 model:string;
 createdAt:string;
 status:'ready'|'raw';
 summary:string;
 raw?:string;
 device?:'webgpu'|'wasm';
 modelSource?:'auto'|'bundled';
};

const MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
const LOAD_TIMEOUT_MS=180_000;
const GENERATE_TIMEOUT_MS=90_000;
let pipePromise:Promise<{pipe:any;device:'webgpu'|'wasm';dtype:string;source:'auto'|'bundled'}>|null=null;

function withTimeout<T>(promise:Promise<T>,ms:number,code:string):Promise<T>{
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error(code)),ms);
  promise.then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)});
 });
}

export async function localAiStatus(){
 const h=await probeHardware(),runtime=resolveModelRuntime(),canF16=h.webgpu&&h.webgpuF16;
 return{
  modelId:MODEL_ID,
  label:'Qwen2.5-0.5B-Instruct',
  device:canF16?'webgpu':'wasm',
  dtype:canF16?'q4f16':'q4',
  modelRuntime:runtime,
  hardware:h,
  advisoryOnly:true,
  scoreMutation:false,
  loadTimeoutMs:LOAD_TIMEOUT_MS,
  generationTimeoutMs:GENERATE_TIMEOUT_MS
 };
}

export async function warmLocalAi(onProgress?:(s:string)=>void){
 if(!pipePromise){
  pipePromise=(async()=>{
   const mod=await import('@huggingface/transformers'),runtime=configureTransformersRuntime(mod),h=await probeHardware();
   const canF16=h.webgpu&&h.webgpuF16,device:'webgpu'|'wasm'=canF16?'webgpu':'wasm',dtype=canF16?'q4f16':'q4';
   onProgress?.(runtime.offlineStrict?'در حال بارگذاری Copilot از Model Pack آفلاین…':'در حال آماده‌سازی Copilot محلی و Cache مدل…');
   try{
    const pipe=await withTimeout(mod.pipeline('text-generation',MODEL_ID,{device,dtype,progress_callback:(x:any)=>onProgress?.(`Copilot · ${String(x.status||'loading')}${x.progress!=null?' · '+Math.round(Number(x.progress))+'%':''}`)}as any) as Promise<any>,LOAD_TIMEOUT_MS,'LOCAL_AI_MODEL_LOAD_TIMEOUT');
    return{pipe,device,dtype,source:runtime.source};
   }catch(e){
    pipePromise=null;
    const detail=e instanceof Error?e.message:String(e);
    throw new Error((runtime.offlineStrict?'OFFLINE_COPILOT_MODEL_UNAVAILABLE: ':'LOCAL_AI_MODEL_UNAVAILABLE: ')+detail);
   }
  })();
 }
 return pipePromise;
}

export async function localQcCopilot(transcript:string,domain:'sampler'|'physician',onProgress?:(s:string)=>void):Promise<LocalAiInsight>{
 const clean=transcript.trim();
 if(!clean)throw new Error('LOCAL_AI_EMPTY_TRANSCRIPT');
 const loaded=await warmLocalAi(onProgress);
 onProgress?.('در حال تحلیل Evidence با AI محلی…');
 const system='تو Copilot کنترل کیفیت فارسی هستی. فقط بر اساس متن داده‌شده تحلیل کن. هیچ تشخیص پزشکی، واقعیت، نام، عدد یا Evidence جدید نساز. اگر Evidence کافی نیست صریحاً بنویس نامشخص. این تحلیل توصیه‌ای است و حق تغییر امتیاز QC، Critical Rule یا نتیجه Human Review را ندارد.';
 const scope=domain==='physician'?'تمرکز: احراز هویت، شرح حال، دارو، دستور/توضیح، ریسک ارتباطی و موارد نیازمند Medical/QC Review.':'تمرکز: معرفی، هماهنگی زمان/آدرس، آمادگی آزمایش، کیفیت ارتباط، ابهام عملیاتی و Coaching.';
 const prompt=`${system}\nحوزه: ${domain==='physician'?'پزشک':'نمونه‌گیر'}\n${scope}\nمتن مکالمه:\n${clean.slice(0,12000)}\n\nخروجی را در حداکثر 6 خط فارسی و دقیقاً با این عنوان‌ها بده: خلاصه: | ریسک‌ها: | Evidence: | Coaching: | بررسی انسانی:. از حدس‌زدن خودداری کن.`;
 let out:any;
 try{
  out=await withTimeout(loaded.pipe(prompt,{max_new_tokens:260,do_sample:false,temperature:0,return_full_text:false}as any) as Promise<any>,GENERATE_TIMEOUT_MS,'LOCAL_AI_GENERATION_TIMEOUT');
 }catch(e){
  const detail=e instanceof Error?e.message:String(e);
  throw new Error('LOCAL_AI_GENERATION_FAILED: '+detail);
 }
 const raw=Array.isArray(out)?String(out[0]?.generated_text||''):String(out),summary=raw.trim();
 if(!summary)throw new Error('LOCAL_AI_EMPTY_OUTPUT');
 return{model:'Qwen2.5-0.5B-Instruct · local',createdAt:new Date().toISOString(),status:'ready',summary,raw,device:loaded.device,modelSource:loaded.source};
}
