import{spawnSync}from'node:child_process';import fs from'node:fs';import path from'node:path';
const root=process.cwd(),pack=path.resolve(process.env.KP_MODEL_PACK_DIR||'offline-models'),profile=process.env.KP_MODEL_PACK_PROFILE||'portable';
function run(cmd,args,extra={}){const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',shell:process.platform==='win32',env:{...process.env,...extra}});if(r.status!==0)process.exit(r.status||1)}
run(process.execPath,['scripts/verify-offline-model-pack.mjs',pack,profile]);
run(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{KP_BASE:'./'});
const dst=path.join(root,'dist','models');fs.rmSync(dst,{recursive:true,force:true});fs.cpSync(pack,dst,{recursive:true});
fs.writeFileSync(path.join(root,'dist','runtime-config.js'),`window.__KP_RUNTIME__={mode:"local",apiBase:"",release:"windows-offline",modelSource:"bundled",modelBase:"./models/"};\n`);
const lock=path.join(pack,'model-pack.lock.json'),lockData=fs.existsSync(lock)?JSON.parse(fs.readFileSync(lock,'utf8')):null;
fs.writeFileSync(path.join(root,'dist','OFFLINE_BUILD.txt'),[
 'runtime=windows-tauri',
 'model_source=bundled',
 'remote_models_allowed=false',
 'audio_cloud_transport=false',
 'paid_ai_api=false',
 'model_profile='+profile,
 'model_pack_version='+(lockData?.packVersion||'unlocked'),
 'model_pack_bytes='+(lockData?.bytes||'unknown')
].join('\n')+'\n');
console.log(JSON.stringify({ok:true,profile,pack,dst,lock:Boolean(lockData)}));
