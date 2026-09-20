export type TeamUser={id:string;email:string;displayName:string;role:'operator'|'reviewer'|'supervisor'|'admin';active?:boolean;createdAt?:string};
declare global{interface Window{__KP_RUNTIME__?:{mode?:'local'|'team';apiBase?:string;release?:string}}}
export const RUNTIME=Object.freeze({mode:window.__KP_RUNTIME__?.mode==='team'?'team':'local',apiBase:(window.__KP_RUNTIME__?.apiBase||'').replace(/\/$/,''),release:window.__KP_RUNTIME__?.release||'dev'});
export const isTeamMode=()=>RUNTIME.mode==='team';
export const apiUrl=(path:string)=>RUNTIME.apiBase+path;
