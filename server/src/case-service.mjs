import{randomUUID}from'node:crypto';
import{q,tx}from'./db.mjs';
import{encryptJson,decryptJson,sha256}from'./crypto.mjs';
import{analyzeText,normalizeFa}from'./text-core.mjs';

export function stableSubjectKey(domain,key,name){
 const clean=String(key||'').trim();
 if(clean)return clean;
 return domain+':name:'+normalizeFa(name).replace(/\s+/g,'-').slice(0,120);
}
export async function upsertSubject({domain,subjectKey,subjectName,metadata={}}){
 const key=stableSubjectKey(domain,subjectKey,subjectName);
 const r=await q("insert into subjects(domain,external_key,display_name,metadata) values($1,$2,$3,$4) on conflict(domain,external_key) do update set display_name=excluded.display_name,metadata=subjects.metadata||excluded.metadata,updated_at=now() returning id,domain,external_key as \"externalKey\",display_name as \"displayName\",metadata,active,created_at as \"createdAt\",updated_at as \"updatedAt\"",[domain,key,subjectName,metadata]);
 return r.rows[0]
}
export async function persistTranscriptCase({
 domain,subjectName,subjectKey,transcript,segments=[],durationSeconds=0,audioSha256=null,
 sourceName='transcript',sourceSystem='oganeson',sourceRef=null,workflow={},occurredAt=null,personMeta={},actorId=null
}){
 if(!['physician','sampler','voc'].includes(domain))throw new Error('invalid_domain');
 if(!String(subjectName||'').trim())throw new Error('subject_name_required');
 if(!String(transcript||'').trim()&&workflow?.visitOutcome!=='no_answer')throw new Error('transcript_required');
 const subject=await upsertSubject({domain,subjectKey,subjectName,metadata:personMeta});
 const analysis=analyzeText(domain,transcript,{segments,durationSeconds,workflow,userKey:subject.externalKey});
 const id=randomUUID(),hash=audioSha256||sha256('transcript|'+domain+'|'+subject.externalKey+'|'+String(sourceRef||'')+'|'+transcript),enc=encryptJson(transcript);
 await tx(async c=>{
  await c.query(
   "insert into cases(id,domain,person_name,source_name,audio_sha256,duration_seconds,transcript_iv,transcript_cipher,stt_json,qc_json,status,created_by,updated_by,created_at,updated_at,occurred_at,person_meta,subject_id,subject_key,source_system,source_ref,nlp_json) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'needs_review',$11,$11,now(),now(),coalesce($12::date,current_date),$13,$14,$15,$16,$17,$18) returning id",
   [id,domain,subjectName,sourceName,hash,Number(durationSeconds||0),enc.iv,enc.cipher,{provider:sourceSystem,segments},analysis,actorId,occurredAt,personMeta,subject.id,subject.externalKey,sourceSystem,sourceRef,analysis]
  );
  await c.query("insert into profile_events(subject_id,case_id,event_type,payload,created_by) values($1,$2,$3,$4,$5)",[subject.id,id,'interaction_analyzed',{domain,analysisVersion:analysis.version,risk:analysis.risk||null,topic:analysis.topic?.id||null,satisfaction:analysis.satisfaction?.label||null},actorId]);
  await c.query("insert into audit_events(case_id,actor_id,domain,action,detail) values($1,$2,$3,$4,$5)",[id,actorId,domain,'transcript_analyzed',{sourceSystem,sourceRef,analysisVersion:analysis.version}]);
 });
 return{id,subject,analysis,audioSha256:hash}
}
export async function subjectHistory({domain,subjectKey,from=null,to=null,limit=1000}){
 const key=String(subjectKey||'').trim();if(!key)throw new Error('subject_key_required');
 const sr=await q("select id,domain,external_key as \"externalKey\",display_name as \"displayName\",metadata,active,created_at as \"createdAt\",updated_at as \"updatedAt\" from subjects where domain=$1 and external_key=$2",[domain,key]);
 if(!sr.rowCount)return null;const subject=sr.rows[0];
 const r=await q("select id,domain,person_name,source_name,audio_sha256,duration_seconds,transcript_iv,transcript_cipher,stt_json,qc_json,nlp_json,status,occurred_at,person_meta,source_system,source_ref,created_at,updated_at from cases where deleted_at is null and subject_id=$1 and ($2::date is null or occurred_at>=$2::date) and ($3::date is null or occurred_at<=$3::date) order by occurred_at desc nulls last,created_at desc limit $4",[subject.id,from,to,Math.min(5000,Math.max(1,Number(limit||1000)))]);
 const cases=r.rows.map(row=>({id:row.id,domain:row.domain,personName:row.person_name,sourceName:row.source_name,audioSha256:row.audio_sha256,durationSeconds:Number(row.duration_seconds||0),transcript:decryptJson(row.transcript_iv,row.transcript_cipher),stt:row.stt_json,qc:row.qc_json,nlp:row.nlp_json,status:row.status,occurredAt:row.occurred_at?String(row.occurred_at).slice(0,10):null,personMeta:row.person_meta,sourceSystem:row.source_system,sourceRef:row.source_ref,createdAt:row.created_at,updatedAt:row.updated_at}));
 const values=cases.map(x=>Number(x.qc?.finalScore??x.qc?.conversationScore)).filter(Number.isFinite);
 const topicCounts={},satisfactionCounts={};
 for(const c of cases){const topic=c.nlp?.topic?.id;if(topic)topicCounts[topic]=(topicCounts[topic]||0)+1;const sat=c.nlp?.satisfaction?.label;if(sat)satisfactionCounts[sat]=(satisfactionCounts[sat]||0)+1}
 return{subject,cases,summary:{count:cases.length,averageScore:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null,topicCounts,satisfactionCounts,from,to}}
}
