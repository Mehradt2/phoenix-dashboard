-- KulePoshti v2 local text-intelligence / Oganson integration
alter table cases drop constraint if exists cases_domain_check;
alter table cases add constraint cases_domain_check check(domain in('sampler','physician','voc'));
alter table cases add column if not exists subject_id text;
alter table cases add column if not exists source_call_id text;
alter table cases add column if not exists transcript_id text;
create index if not exists idx_cases_subject_date on cases(domain,subject_id,coalesce(occurred_at,created_at::date),created_at desc);
create unique index if not exists uq_cases_source_transcript on cases(transcript_id) where transcript_id is not null;

alter table rule_packs drop constraint if exists rule_packs_domain_check;
alter table rule_packs add constraint rule_packs_domain_check check(domain in('sampler','physician','voc'));

create table if not exists ingest_jobs(
 id uuid primary key default gen_random_uuid(),
 source text not null,
 source_call_id text not null,
 transcript_id text not null unique,
 domain text not null check(domain in('sampler','physician','voc')),
 subject_id text not null,
 subject_name text,
 transcript_iv text not null,
 transcript_cipher text not null,
 segments_json jsonb not null default '[]'::jsonb,
 stt_json jsonb not null default '{}'::jsonb,
 analysis_json jsonb not null default '{}'::jsonb,
 status text not null check(status in('received','analyzed','scored','needs_review','failed')),
 error_code text,
 occurred_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(source,source_call_id)
);
create index if not exists idx_ingest_jobs_status_created on ingest_jobs(status,created_at);
create index if not exists idx_ingest_subject on ingest_jobs(domain,subject_id,occurred_at);

create table if not exists voc_interactions(
 id uuid primary key default gen_random_uuid(),
 ingest_job_id uuid references ingest_jobs(id) on delete set null,
 subject_id text not null,
 subject_name text,
 topic text not null,
 subtopic text,
 satisfaction text not null check(satisfaction in('satisfied','neutral','dissatisfied','mixed','unknown')),
 confidence numeric,
 evidence_json jsonb not null default '{}'::jsonb,
 resolution_status text not null default 'unknown',
 created_at timestamptz not null default now()
);
create index if not exists idx_voc_subject_created on voc_interactions(subject_id,created_at desc);
create index if not exists idx_voc_topic_created on voc_interactions(topic,created_at desc);

create table if not exists profile_notes(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician','voc')),
 subject_id text not null,
 note text not null,
 created_by uuid references users(id),
 created_at timestamptz not null default now()
);
create index if not exists idx_profile_notes_subject on profile_notes(domain,subject_id,created_at desc);
