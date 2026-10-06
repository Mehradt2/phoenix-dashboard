alter table cases drop constraint if exists cases_domain_check;
alter table cases add constraint cases_domain_check check(domain in('sampler','physician','voc'));
alter table rule_packs drop constraint if exists rule_packs_domain_check;
alter table rule_packs add constraint rule_packs_domain_check check(domain in('sampler','physician','voc'));

create table if not exists subjects(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician','voc')),
 external_key text not null,
 display_name text not null,
 metadata jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(domain,external_key)
);
create index if not exists idx_subjects_domain_name on subjects(domain,display_name);

alter table cases add column if not exists subject_id uuid references subjects(id);
alter table cases add column if not exists subject_key text;
alter table cases add column if not exists source_system text not null default 'manual';
alter table cases add column if not exists source_ref text;
alter table cases add column if not exists nlp_json jsonb not null default '{}'::jsonb;
alter table cases add column if not exists transcription_job_id uuid;
create index if not exists idx_cases_subject_date on cases(subject_id,occurred_at desc,created_at desc);
create index if not exists idx_cases_voc_user on cases(domain,subject_key,occurred_at desc) where domain='voc';

create table if not exists transcription_jobs(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician','voc')),
 subject_id uuid references subjects(id),
 subject_key text,
 subject_name text not null,
 source_name text not null,
 source_system text not null default 'operator_upload',
 source_ref text,
 audio_sha256 text not null,
 audio_bytes bigint not null default 0,
 mime_type text not null default 'audio/wav',
 spool_path text not null,
 status text not null default 'queued' check(status in('queued','running','completed','failed','dead_letter')),
 attempts integer not null default 0,
 max_attempts integer not null default 3,
 workflow_json jsonb not null default '{}'::jsonb,
 provider_json jsonb not null default '{}'::jsonb,
 result_case_id uuid references cases(id),
 last_error text,
 created_by uuid references users(id),
 created_at timestamptz not null default now(),
 started_at timestamptz,
 completed_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists idx_transcription_jobs_queue on transcription_jobs(status,created_at);
create index if not exists idx_transcription_jobs_sha on transcription_jobs(audio_sha256);

alter table cases drop constraint if exists cases_transcription_job_id_fkey;
alter table cases add constraint cases_transcription_job_id_fkey foreign key(transcription_job_id) references transcription_jobs(id) on delete set null;

create table if not exists profile_events(
 id uuid primary key default gen_random_uuid(),
 subject_id uuid not null references subjects(id) on delete cascade,
 case_id uuid references cases(id) on delete set null,
 event_type text not null,
 payload jsonb not null default '{}'::jsonb,
 created_by uuid references users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists idx_profile_events_subject on profile_events(subject_id,created_at desc);
