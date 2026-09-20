create extension if not exists pgcrypto;

create table if not exists users(
 id uuid primary key default gen_random_uuid(),
 email text not null unique,
 display_name text not null,
 password_salt text not null,
 password_hash text not null,
 role text not null check(role in('operator','reviewer','supervisor','admin')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists sessions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references users(id) on delete cascade,
 token_hash text not null unique,
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists idx_sessions_expiry on sessions(expires_at);

create table if not exists cases(
 id uuid primary key,
 domain text not null check(domain in('sampler','physician')),
 person_name text not null,
 source_name text not null,
 audio_sha256 text not null unique,
 duration_seconds numeric not null default 0,
 transcript_iv text not null,
 transcript_cipher text not null,
 stt_json jsonb not null default '{}'::jsonb,
 qc_json jsonb not null default '{}'::jsonb,
 status text not null check(status in('needs_review','completed')),
 created_by uuid references users(id),
 updated_by uuid references users(id),
 created_at timestamptz not null,
 updated_at timestamptz not null,
 deleted_at timestamptz
);
create index if not exists idx_cases_domain_created on cases(domain,created_at desc);
create index if not exists idx_cases_status on cases(status);
create index if not exists idx_cases_person on cases(domain,person_name);

create table if not exists reviews(
 id uuid primary key,
 case_id uuid not null references cases(id) on delete cascade,
 decision text not null check(decision in('approved','referred','overridden','rejected')),
 workflow_score numeric,
 conversation_score numeric,
 final_score numeric,
 note text not null,
 workflow_evidence jsonb,
 reviewer_id uuid not null references users(id),
 created_at timestamptz not null
);
create index if not exists idx_reviews_case on reviews(case_id,created_at);

create table if not exists ai_insights(
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references cases(id) on delete cascade,
 model text not null,
 summary_iv text not null,
 summary_cipher text not null,
 payload jsonb not null default '{}'::jsonb,
 created_by uuid not null references users(id),
 created_at timestamptz not null default now()
);

create table if not exists rule_packs(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician')),
 version text not null,
 status text not null check(status in('candidate','active','retired')),
 sha256 text not null,
 content_json jsonb not null,
 created_by uuid references users(id),
 created_at timestamptz not null default now(),
 unique(domain,version)
);

create table if not exists audit_events(
 id uuid primary key default gen_random_uuid(),
 case_id uuid references cases(id) on delete restrict,
 actor_id uuid references users(id) on delete set null,
 domain text,
 action text not null,
 detail jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_events(created_at desc);
create index if not exists idx_audit_case on audit_events(case_id,created_at);

create or replace function prevent_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'audit_events are append-only'; end $$;
drop trigger if exists audit_no_update on audit_events;
create trigger audit_no_update before update or delete on audit_events for each row execute function prevent_audit_mutation();
