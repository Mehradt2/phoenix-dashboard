import{RUNTIME,type ModelSource}from'./runtime';

export type ModelRuntimePolicy={
 source:ModelSource;
 localModelPath:string;
 allowLocalModels:boolean;
 allowRemoteModels:boolean;
 useBrowserCache:boolean;
 offlineStrict:boolean;
};

export function resolveModelRuntime(input:{modelSource?:ModelSource;modelBase?:string}=RUNTIME):ModelRuntimePolicy{
 const source=input.modelSource==='bundled'?'bundled':'auto';
 const base=(input.modelBase||'./models/').trim()||'./models/';
 return{
  source,
  localModelPath:base.endsWith('/')?base:base+'/',
  allowLocalModels:source==='bundled',
  allowRemoteModels:source!=='bundled',
  useBrowserCache:true,
  offlineStrict:source==='bundled'
 };
}

export function configureTransformersRuntime(mod:any){
 const p=resolveModelRuntime();
 const e=mod.env;
 e.useBrowserCache=p.useBrowserCache;
 (e as any).useWasmCache=true;
 (e as any).cacheKey='kp-model-runtime-v3';
 e.allowLocalModels=p.allowLocalModels;
 e.allowRemoteModels=p.allowRemoteModels;
 if(p.allowLocalModels)e.localModelPath=p.localModelPath;
 return p;
}

export function modelSourceLabel(p:ModelRuntimePolicy=resolveModelRuntime()){
 return p.offlineStrict?'Bundled Offline · اینترنت ممنوع':'Hub bootstrap + Browser Cache';
}
