create table if not exists public.daily_reading_current (
  id integer primary key default 1,
  title text not null,
  content_md text not null,
  reference_text text null,
  author text null,
  is_published boolean not null default true,
  set_by text null,
  set_at timestamptz not null default now(),
  updated_by text null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint daily_reading_current_singleton_check check (id = 1)
);

create index if not exists daily_reading_current_published_idx
  on public.daily_reading_current (is_published, updated_at desc);
