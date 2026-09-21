export type ModelMode='auto'|'standard'|'quality';
export type HardwareProfile={webgpu:boolean;deviceMemoryGb:number|null;hardwareConcurrency:number;storageQuotaMb:number|null;storageUsageMb:number|null;browser:string};
export type ModelPlan={mode:ModelMode;id:string;label:string;device:'webgpu'|'wasm';dtype:any;reason:string;fallbackId:string|null;authRequired:false;subscriptionRequired:false;runtime:'browser-local';validation:'standard'|'candidate';licenseNotice:string};
export const CATALOG={
  compatibility:{id:'onnx-community/whisper-tiny',label:'Whisper Tiny · بازیابی سریع',validation:'standard' as const},
  standard:{id:'onnx-community/whisper-small',label:'Whisper Small · استاندارد',validation:'standard' as const},
  quality:{id:'onnx-community/whisper-large-v3-turbo',label:'Whisper Large v3 Turbo · کاندید کیفیت',validation:'candidate' as const}
} as const;
function browserName(){const u=navigator.userAgent;if(/Edg\//.test(u))return'Edge';if(/Chrome\//.test(u))return'Chrome';if(/Firefox\//.test(u))return'Firefox';if(/Safari\//.test(u))return'Safari';return'Browser'}
export async function probeHardware():Promise<HardwareProfile>{const n=navigator as Navigator&{deviceMemory?:number;gpu?:unknown};let q:null|number=null,u:null|number=null;try{const e=await navigator.storage?.estimate?.();q=e?.quota?Math.round(e.quota/1048576):null;u=e?.usage?Math.round(e.usage/1048576):null}catch{}return{webgpu:Boolean(n.gpu),deviceMemoryGb:typeof n.deviceMemory==='number'?n.deviceMemory:null,hardwareConcurrency:navigator.hardwareConcurrency||1,storageQuotaMb:q,storageUsageMb:u,browser:browserName()}}
function freeStorageMb(h:HardwareProfile){return h.storageQuotaMb==null?null:Math.max(0,h.storageQuotaMb-(h.storageUsageMb||0))}
function turboSafe(h:HardwareProfile){const mem=h.deviceMemoryGb==null?h.hardwareConcurrency>=12:h.deviceMemoryGb>=8;const free=freeStorageMb(h);return h.webgpu&&mem&&h.hardwareConcurrency>=8&&(free==null||free>=6000)}
const common={authRequired:false as const,subscriptionRequired:false as const,runtime:'browser-local' as const,licenseNotice:'Public model weights; no API token or paid inference subscription is required. Verify model/license metadata during release pin.'};
export function choosePlan(mode:ModelMode,h:HardwareProfile):ModelPlan{
  if(mode==='quality'&&turboSafe(h))return{mode,id:CATALOG.quality.id,label:CATALOG.quality.label,device:'webgpu',dtype:'fp16',reason:'High Quality فقط به درخواست کاربر و پس از Hardware Guard فعال شد؛ نتیجه هنوز Candidate است تا Gold فارسی PASS شود.',fallbackId:CATALOG.standard.id,validation:'candidate',...common};
  if(mode==='auto'&&!h.webgpu){return{mode,id:CATALOG.compatibility.id,label:CATALOG.compatibility.label,device:'wasm',dtype:'q8',reason:'Auto روی دستگاه بدون WebGPU مدل Tiny را برای شروع سریع و جلوگیری از گیرکردن Browser انتخاب می‌کند؛ نتیجه نیازمند Human Review است.',fallbackId:null,validation:'standard',...common}}
  const reason=mode==='quality'?'Hardware Guard مدل Turbo را رد کرد؛ برای پایداری Small انتخاب شد.':mode==='auto'?'Auto روی WebGPU مدل Small را انتخاب می‌کند؛ در خطای مدل، Tiny بازیابی سریع است.':'Standard انتخاب شد.';
  return{mode,id:CATALOG.standard.id,label:CATALOG.standard.label,device:h.webgpu?'webgpu':'wasm',dtype:h.webgpu?'fp16':'q8',reason,fallbackId:CATALOG.compatibility.id,validation:'standard',...common}
}
export function getMode():ModelMode{try{const x=globalThis.localStorage?.getItem('kp-model-mode');return x==='quality'||x==='standard'||x==='auto'?x:'auto'}catch{return'auto'}}
export function setMode(x:ModelMode){try{globalThis.localStorage?.setItem('kp-model-mode',x)}catch{}}
export async function requestPersistentStorage(){try{return await navigator.storage?.persist?.()??false}catch{return false}}
