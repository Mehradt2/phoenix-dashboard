export type TeamUser={id:string;email:string;displayName:string;role:'operator'|'reviewer'|'supervisor'|'admin';active?:boolean;createdAt?:string};
export type ModelSource='auto'|'bundled';
export type ModelProfile='online'|'portable'|'standard';
declare global{interface Window{__KP_RUNTIME__?:{mode?:'local'|'team';apiBase?:string;release?:string;modelSource?:ModelSource;modelBase?:string;modelProfile?:ModelProfile};__TAURI_INTERNALS__?:unknown}}
const host=(globalThis as any).window||globalThis as any;
const raw=host.__KP_RUNTIME__||{};
const source:ModelSource=raw.modelSource==='bundled'?'bundled':'auto';
const modelBase=(raw.modelBase||'./models/').trim()||'./models/';
const profile:ModelProfile=raw.modelProfile==='portable'||raw.modelProfile==='standard'?raw.modelProfile:(source==='bundled'?'portable':'online');
export const RUNTIME=Object.freeze({
 mode:raw.mode==='team'?'team':'local',
 apiBase:(raw.apiBase||'').replace(/\/$/,''),
 release:raw.release||'dev',
 modelSource:source,
 modelBase:modelBase.endsWith('/')?modelBase:modelBase+'/',
 modelProfile:profile
});
export const isTeamMode=()=>RUNTIME.mode==='team';
export const isOfflineStrict=()=>RUNTIME.modelSource==='bundled';
export const isTauriRuntime=()=>Boolean(host.__TAURI_INTERNALS__);
export const apiUrl=(path:string)=>RUNTIME.apiBase+path;
