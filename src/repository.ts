import*as vault from'./vault';import{apiUrl,isTeamMode,type TeamUser}from'./runtime';import type{CaseRecord,Review,AuditEvent}from'./vault';

async function api(path:string,init:RequestInit={}){
 const headers=new Headers(init.headers);if(init.body&&!headers.has('content-type'))headers.set('content-type','application/json');
 const r=await fetch(apiUrl(path),{...init,headers,credentials:'include'});if(r.status===204)return null;
 const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body?.error||`api_${r.status}`);return body
}
export async function session():Promise<TeamUser|null>{if(!isTeamMode())return null;try{return(await api('/api/auth/me')).user}catch{return null}}
export async function login(email:string,password:string):Promise<TeamUser>{return(await api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})})).user}
export async function logout(){if(isTeamMode())await api('/api/auth/logout',{method:'POST'});else vault.lockVault()}
export const localVault={hasVault:vault.hasVault,initVault:vault.initVault,unlockVault:vault.unlockVault,lockVault:vault.lockVault};

export async function existsHash(hash:string){if(!isTeamMode())return vault.existsHash(hash);return Boolean((await api('/api/cases/hash/'+encodeURIComponent(hash))).exists)}
export async function putCase(c:CaseRecord){if(!isTeamMode())return vault.putCase(c);await api('/api/cases',{method:'POST',body:JSON.stringify({case:c})})}
export async function listCases():Promise<CaseRecord[]>{if(!isTeamMode())return vault.listCases();return(await api('/api/cases')).cases}
export async function getCase(id:string):Promise<CaseRecord|null>{if(!isTeamMode())return vault.getCase(id);try{return(await api('/api/cases/'+encodeURIComponent(id))).case}catch{return null}}
export async function deleteCase(id:string){if(!isTeamMode())return vault.deleteCase(id);await api('/api/cases/'+encodeURIComponent(id),{method:'DELETE'})}
export async function saveAiInsight(id:string,insight:any){if(!isTeamMode())return vault.saveAiInsight(id,insight);await api('/api/cases/'+encodeURIComponent(id)+'/ai-insight',{method:'POST',body:JSON.stringify({model:insight?.model||'local',summary:insight?.summary||'',payload:{createdAt:insight?.createdAt,status:insight?.status}})});return getCase(id)}
export async function listAudit():Promise<AuditEvent[]>{if(!isTeamMode())return vault.listAudit();try{return(await api('/api/audit')).audit}catch{return[]}}
export async function submitReview(id:string,decision:Review['decision'],workflow:number|null,note:string,workflowEvidence?:any){
 if(!isTeamMode())return vault.submitReview(id,decision,workflow,note,workflowEvidence);
 const c=await getCase(id);if(!c)throw new Error('پرونده پیدا نشد');const convRaw=c.qc?.conversationScore;if(convRaw==null)throw new Error('Conversation Score معتبر نیست');
 const conv=Number(convRaw),final=c.domain==='sampler'?(workflow==null?null:Math.round((conv*.7+workflow*.3)*10)/10):Math.round(conv*10)/10;
 await api('/api/cases/'+encodeURIComponent(id)+'/reviews',{method:'POST',body:JSON.stringify({decision,workflowScore:workflow,conversationScore:conv,finalScore:final,note,workflowEvidence})});
 return getCase(id)
}
export async function exportBackup(){if(!isTeamMode())return vault.exportBackup();throw new Error('در Team Mode، Backup در سطح PostgreSQL/Docker مدیریت می‌شود.')}
export async function importBackup(b:any){if(!isTeamMode())return vault.importBackup(b);throw new Error('Restore در Team Mode فقط توسط مدیر زیرساخت و Runbook انجام می‌شود.')}

export async function listUsers():Promise<TeamUser[]>{if(!isTeamMode())return[];return(await api('/api/users')).users}
export async function createUser(input:{email:string;displayName:string;role:TeamUser['role'];password:string}):Promise<TeamUser>{if(!isTeamMode())throw new Error('team_mode_required');return(await api('/api/users',{method:'POST',body:JSON.stringify(input)})).user}
export async function updateUser(id:string,input:{active:boolean;role?:TeamUser['role']}):Promise<void>{if(!isTeamMode())throw new Error('team_mode_required');await api('/api/users/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify(input)})}
