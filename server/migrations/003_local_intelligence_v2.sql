create table if not exists subjects(
 id uuid primary key default gen_random_uuid(),
 domain text not null check(domain in('sampler','physician','voc')),
 external_id text,
 display_name text not null,
 metadata jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(domain,external_id)
);
create index if not exists idx_subjects_domain_name on subjects(domain,display_name);

create table if not exists interactions(
 id uuid primary key default gen_random_uuid(),
 external_id text,
 source_provider text not null default 'manual',
 domain text not null check(domain in('sampler','physician','voc')),
 subject_id uuid not null references subjects(id) on delete restrict,
 customer_external_id text,
 source_name text not null default '',
 occurred_at timestamptz not null,
 transcript_iv text not null,
 transcript_cipher text not null,
 payload_iv text,
 payload_cipher text,
 analysis_iv text not null,
 analysis_cipher text not null,
 asr_confidence numeric,
 score numeric,
 score_status text not null,
 risk text,
 primary_topic text,
 sentiment text,
 satisfaction text,
 status text not null default 'needs_review' check(status in('needs_review','completed','non_scorable')),
 engine_version text not null,
 rule_pack_version text,
 created_by uuid references users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(source_provider,external_id)
);
create index if not exists idx_interactions_domain_date on interactions(domain,occurred_at desc);
create index if not exists idx_interactions_subject_date on interactions(subject_id,occurred_at desc);
create index if not exists idx_interactions_topic_date on interactions(domain,primary_topic,occurred_at desc);
create index if not exists idx_interactions_sentiment_date on interactions(domain,sentiment,occurred_at desc);
create index if not exists idx_interactions_status on interactions(status,occurred_at desc);

create table if not exists interaction_reviews(
 id uuid primary key default gen_random_uuid(),
 interaction_id uuid not null references interactions(id) on delete cascade,
 decision text not null check(decision in('approved','referred','overridden','rejected')),
 final_score numeric,
 note text not null,
 evidence jsonb,
 reviewer_id uuid not null references users(id),
 created_at timestamptz not null default now()
);
create index if not exists idx_interaction_reviews on interaction_reviews(interaction_id,created_at);

create table if not exists interaction_audit_events(
 id uuid primary key default gen_random_uuid(),
 interaction_id uuid references interactions(id) on delete restrict,
 actor_id uuid references users(id) on delete set null,
 domain text,
 action text not null,
 detail jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_interaction_audit_created on interaction_audit_events(created_at desc);
create index if not exists idx_interaction_audit_interaction on interaction_audit_events(interaction_id,created_at);

create or replace function prevent_interaction_audit_mutation() returns trigger language plpgsql as $$
begin raise exception 'interaction_audit_events are append-only'; end $$;
drop trigger if exists interaction_audit_no_update on interaction_audit_events;
create trigger interaction_audit_no_update before update or delete on interaction_audit_events for each row execute function prevent_interaction_audit_mutation();
