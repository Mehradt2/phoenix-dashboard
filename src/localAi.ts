export type LocalAiInsight={model:string;createdAt:string;status:'ready'|'raw';summary:string;raw?:string};
let pipePromise:Promise<any>|null=null;
async function pipe(){if(!pipePromise){pipePromise=(async()=>{const mod=await import('@huggingface/transformers');const device=(navigator as any).gpu?'webgpu':'wasm';return mod.pipeline('text-generation','onnx-community/Qwen2.5-0.5B-Instruct',{device,dtype:device==='webgpu'?'q4f16':'q4'} as any)})()}return pipePromise}
export async function localQcCopilot(transcript:string,domain:'sampler'|'physician',onProgress?:(s:string)=>void):Promise<LocalAiInsight>{
 onProgress?.('در حال بارگذاری AI محلی…');const p=await pipe();onProgress?.('در حال تحلیل Evidence…');
 const system='تو Copilot کنترل کیفیت فارسی هستی. فقط بر اساس متن داده‌شده تحلیل کن. هیچ تشخیص پزشکی، واقعیت یا Evidence جدید نساز. نتیجه‌ات توصیه‌ای است و حق تغییر امتیاز QC را ندارد.';
 const prompt=`${system}\nحوزه: ${domain==='physician'?'پزشک':'نمونه‌گیر'}\nمتن مکالمه:\n${transcript.slice(0,12000)}\n\nدر حداکثر 6 خط فارسی: 1) خلاصه 2) ریسک‌ها 3) Evidence مهم 4) پیشنهاد Coaching 5) موارد نیازمند بررسی انسانی. اگر چیزی در متن نیست صریحاً بگو نامشخص.`;
 const out=await p(prompt,{max_new_tokens:260,do_sample:false,temperature:0.1,return_full_text:false} as any),raw=Array.isArray(out)?String(out[0]?.generated_text||''):String(out);
 return{model:'Qwen2.5-0.5B-Instruct · local',createdAt:new Date().toISOString(),status:'raw',summary:raw.trim(),raw}
}
