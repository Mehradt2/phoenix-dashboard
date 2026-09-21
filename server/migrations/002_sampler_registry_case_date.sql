alter table cases add column if not exists occurred_at date;
alter table cases add column if not exists person_meta jsonb not null default '{}'::jsonb;
create index if not exists idx_cases_domain_occurred on cases(domain,occurred_at desc);

create table if not exists samplers(
 id uuid primary key default gen_random_uuid(),
 full_name text not null unique,
 grade text not null,
 city text not null,
 active boolean not null default true,
 source text not null default 'manual' check(source in('seed','manual')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

insert into samplers(full_name,grade,city,source) values
('شایان مؤمن زاده','A','تهران','seed'),
('محمد حسین محمدیانی','B','تهران','seed'),
('محمد اسدزاده کلجاهی','A+','تهران','seed'),
('پانیذ حاجی حسین','B','تهران','seed'),
('داریوش روستایی','A','تهران','seed'),
('نسا مالمیر','A','تهران','seed'),
('بردیا اکبری','A+','تهران','seed'),
('مهرنوش مدرسی نژاد','A','تهران','seed'),
('پیام پورحسینی','A+','تهران','seed'),
('آتوسا عصار','A+','تهران','seed'),
('میعاد صنگور','A+','تهران','seed'),
('مریم محمدی','A+','تهران','seed'),
('سید مهدی عمادی','A','تهران','seed'),
('مسعود یاراحمدی','A+','تهران','seed'),
('یکتا محمدی','A+','تهران','seed'),
('زهرا هاشم زاده','A+','تهران','seed'),
('احمد مهری قلعه جوق','A+','تهران','seed'),
('یعقوب خضری','A+','تهران','seed'),
('زعیم جاویدمهر','A+','تهران','seed'),
('غزاله دژند','A+','تهران','seed'),
('داتیس رضازاده واصل','A','تهران','seed'),
('علی ابوالفتحی','A','تهران','seed'),
('مصطفی پارسائی','A','تهران','seed'),
('مهران مقدم فر','A','تهران','seed'),
('پگاه ایوبی','A','تهران','seed'),
('محمدامین جمشیدی','A','تهران','seed'),
('ستایش علی دادی','A','تهران','seed'),
('محدثه پهلوانی','A','تهران','seed'),
('سمانه آقایی','A','تهران','seed'),
('محمد محمدپور حسنوند','A','تهران','seed')
on conflict(full_name) do update set grade=excluded.grade,city=excluded.city,active=true,updated_at=now();

create index if not exists idx_samplers_active_name on samplers(active,full_name);
