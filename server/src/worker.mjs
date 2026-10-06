import{randomUUID}from'node:crypto';
import{q,tx}from'./db.mjs';
import{encryptJson}from'./crypto.mjs';
import{readEncryptedAudio,removeSpool}from'./audio-spool.mjs';
import{transcribeWithOganeson,oganesonHealth}from'./oganeson.mjs';
import{analyzeText,normalizeFa}from'./text-core.mjs';

const POLL_MS=Number(process.env.STT_WORKER_POLL_MS||900);
let stopping=false;

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function safeSubjectKey(domain,key,name){
 const clean=String(key||'').trim();
 if(clean)return clean;
 return domain+':name:'+normalizeFa(name).replace(/\s+/g,'-').slice(0,120);
}

async function claimJob(){
 return tx(async c=>{
  const sql="select * from transcription_jobs where status='queued' and attempts<max_attempts order by created_at for update skip locked limit 1";
  const r=await c.query(sql);
  if(!r.rowCount)return null;
  const row=r.rows[0];
  await c.query("update transcription_jobs set status='running',attempts=attempts+1,started_at=coalesce(started_at,now()),updated_at=now() where id=$1",[row.id]);
  return{...row,attempts:Number(row.attempts)+1};
 });
}

async function markFailure(job,error){
 const terminal=job.attempts>=Number(job.max_attempts||3);
 await q("update transcription_jobs set status=$2,last_error=$3,updated_at=now(),completed_at=case when $2='dead_letter' then now() else completed_at end where id=$1",
  [job.id,terminal?'dead_letter':'queued',String(error?.message||error).slice(0,1800)]);
 if(terminal)console.error('STT job dead-letter',job.id,error);
}

async function persist(job,stt,analysis){
 const caseId=randomUUID(),subjectKey=safeSubjectKey(job.domain,job.subject_key,job.subject_name),tr=encryptJson(stt.text);
 return tx(async c=>{
  const sr=await c.query(
   "insert into subjects(domain,external_key,display_name,metadata) values($1,$2,$3,$4) on conflict(domain,external_key) do update set display_name=excluded.display_name,metadata=subjects.metadata||excluded.metadata,updated_at=now() returning id",
   [job.domain,subjectKey,job.subject_name,job.workflow_json?.subjectMeta||{}]
  );
  const subjectId=sr.rows[0].id;
  const insertCase="insert into cases(id,domain,person_name,source_name,audio_sha256,duration_seconds,transcript_iv,transcript_cipher,stt_json,qc_json,status,created_by,updated_by,created_at,updated_at,occurred_at,person_meta,subject_id,subject_key,source_system,source_ref,nlp_json,transcription_job_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'needs_review',$11,$11,now(),now(),coalesce($12::date,current_date),$13,$14,$15,$16,$17,$18,$19,$20)";
  await c.query(insertCase,[
    caseId,job.domain,job.subject_name,job.source_name,job.audio_sha256,
    Number(stt.durationSeconds||job.workflow_json?.durationSeconds||0),tr.iv,tr.cipher,
    {provider:'oganeson',language:stt.language,confidence:stt.confidence,segments:stt.segments,meta:stt.rawMeta},
    analysis,job.created_by,job.workflow_json?.occurredAt||null,job.workflow_json?.personMeta||{},
    subjectId,subjectKey,job.source_system,job.source_ref,analysis,job.id
  ]);
  await c.query(
    "insert into profile_events(subject_id,case_id,event_type,payload,created_by) values($1,$2,$3,$4,$5)",
    [subjectId,caseId,'interaction_analyzed',{domain:job.domain,version:analysis.version,risk:analysis.risk||null,topic:analysis.topic?.id||null,satisfaction:analysis.satisfaction?.label||null},job.created_by]
  );
  await c.query(
    "insert into audit_events(case_id,actor_id,domain,action,detail) values($1,$2,$3,$4,$5)",
    [caseId,job.created_by,job.domain,'oganeson_analysis_completed',{jobId:job.id,analysisVersion:analysis.version,provider:stt.rawMeta?.provider||'oganeson'}]
  );
  await c.query(
    "update transcription_jobs set status='completed',result_case_id=$2,provider_json=$3,completed_at=now(),updated_at=now(),last_error=null where id=$1",
    [job.id,caseId,{language:stt.language,confidence:stt.confidence,durationSeconds:stt.durationSeconds,meta:stt.rawMeta}]
  );
  return{caseId,subjectId};
 });
}

async function processJob(job){
 try{
  const buffer=await readEncryptedAudio(job.spool_path);
  const stt=await transcribeWithOganeson(buffer,{fileName:job.source_name,mimeType:job.mime_type,domain:job.domain,jobId:job.id});
  const analysis=analyzeText(job.domain,stt.text,{
    segments:stt.segments,
    durationSeconds:stt.durationSeconds,
    workflow:job.workflow_json?.workflow||{},
    userKey:job.subject_key||null
  });
  const result=await persist(job,stt,analysis);
  await removeSpool(job.spool_path);
  console.log('STT job completed',job.id,result.caseId,job.domain);
 }catch(e){
  console.error('STT job failed',job.id,e);
  await markFailure(job,e);
 }
}

async function boot(){
 const health=await oganesonHealth();
 console.log('Oganeson health at worker start',health);
 while(!stopping){
  const job=await claimJob().catch(e=>{console.error('claim failed',e);return null});
  if(!job){await sleep(POLL_MS);continue}
  await processJob(job);
 }
}

process.on('SIGTERM',()=>{stopping=true});
process.on('SIGINT',()=>{stopping=true});
boot().catch(e=>{console.error(e);process.exit(1)});
