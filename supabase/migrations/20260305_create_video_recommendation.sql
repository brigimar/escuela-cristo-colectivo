BEGIN;

create table if not exists public.video_recommendation (
  id int primary key default 1,
  youtube_video_id text null,
  slug text null,
  title text null,
  thumbnail_url text null,
  published_at timestamptz null,
  set_by text null,
  set_at timestamptz not null default now(),
  constraint video_recommendation_singleton check (id = 1)
);

insert into public.video_recommendation (id)
values (1)
on conflict (id) do nothing;

alter table public.video_recommendation enable row level security;

drop policy if exists "public read video recommendation" on public.video_recommendation;
create policy "public read video recommendation"
on public.video_recommendation
for select
using (true);

COMMIT;

