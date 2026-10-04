-- KulePoshti v2 text-intelligence / Oganson / VOC schema
do $$ begin
  alter table cases drop constraint if exists cases_domain_check;
exception when undefined_object then null; end $$;
alter table cases add constraint cases_domain_check check(domain in('sampler','physician','voc'));

create table if not exists subjects(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician','voc')),
 external_key text,
 display_name text not null,
 metadata jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(domain,external_key)
);
create index if not exists idx_subjects_domain_name on subjects(domain,display_name);

alter table cases add column if not exists subject_id uuid references subjects(id) on delete set null;
alter table cases add column if not exists external_source text;
alter table cases add column if not exists external_id text;
alter table cases add column if not exists occurred_at_ts timestamptz;
alter table cases add column if not exists transcript_analysis_json jsonb not null default '{}'::jsonb;
alter table cases add column if not exists processing_version text;
create unique index if not exists uq_cases_external_source_id on cases(external_source,external_id) where external_id is not null;
create index if not exists idx_cases_subject_time on cases(subject_id,occurred_at_ts desc);
create index if not exists idx_cases_domain_time on cases(domain,occurred_at_ts desc);

create table if not exists voc_topics(
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references cases(id) on delete cascade,
 topic_code text not null,
 confidence numeric not null default 0,
 satisfaction text,
 urgency text,
 evidence jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 unique(case_id,topic_code)
);
create index if not exists idx_voc_topics_code on voc_topics(topic_code,created_at desc);

create table if not exists processing_events(
 id uuid primary key default gen_random_uuid(),
 case_id uuid references cases(id) on delete cascade,
 external_id text,
 stage text not null,
 status text not null,
 detail jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_processing_events_case on processing_events(case_id,created_at);

create table if not exists medical_lexicon_versions(
 id uuid primary key default gen_random_uuid(),
 version text not null unique,
 sha256 text not null,
 status text not null check(status in('candidate','active','retired')),
 content_json jsonb not null,
 created_by uuid references users(id),
 created_at timestamptz not null default now()
);
