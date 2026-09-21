import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const root=path.resolve(process.argv[2]||process.env.KP_MODEL_PACK_DIR||'offline-models');
const profile=process.argv[3]||process.env.KP_MODEL_PACK_PROFILE||'portable';
const spec=JSON.parse(fs.readFileSync('offline/model-pack.json','utf8'));
if(!spec.profiles[profile])throw new Error('unknown profile '+profile);
function models(name){const p=spec.profiles[name],rows=p.extends?models(p.extends):[];return[...rows,...(p.models||[])]}
const uniq=new Map(models(profile).map(x=>[x.id,x])),report=[];
for(const m of uniq.values()){
 const dir=path.join(root,...m.id.split('/')),missing=m.requiredFiles.filter(x=>!fs.existsSync(path.join(dir,x)));
 if(missing.length)throw new Error(m.id+' missing: '+missing.join(', '));
 let bytes=0,files=0;for(const rel of m.requiredFiles){const p=path.join(dir,rel),s=fs.statSync(p);bytes+=s.size;files++}
 report.push({id:m.id,requiredFiles:files,requiredBytes:bytes});
}
const lockPath=path.join(root,'model-pack.lock.json');
let lockOk=false;if(fs.existsSync(lockPath)){const lock=JSON.parse(fs.readFileSync(lockPath,'utf8'));lockOk=lock.profile===profile&&Array.isArray(lock.models)&&lock.models.length>=uniq.size}
console.log(JSON.stringify({ok:true,profile,root,lockOk,models:report,totalRequiredBytes:report.reduce((s,x)=>s+x.requiredBytes,0)},null,2));
