create extension if not exists pgcrypto;

create table if not exists public.video_questions (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null references public.videos(youtube_video_id) on delete cascade,
  comment_id text not null unique,
  author_name text,
  author_channel_id text,
  text_display text not null,
  like_count int not null default 0,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  is_selected boolean not null default false,
  is_hidden boolean not null default false,
  selected_at timestamptz,
  selected_by text,
  raw jsonb
);

create index if not exists video_questions_youtube_selected_idx
  on public.video_questions (youtube_video_id, is_selected);
create index if not exists video_questions_youtube_published_desc_idx
  on public.video_questions (youtube_video_id, published_at desc);
create index if not exists video_questions_selected_idx
  on public.video_questions (is_selected);

alter table public.video_questions enable row level security;
drop policy if exists video_questions_public_read on public.video_questions;
create policy video_questions_public_read
on public.video_questions
for select
to anon, authenticated
using (is_selected = true and is_hidden = false);

revoke all on table public.video_questions from anon, authenticated;
grant select on table public.video_questions to anon, authenticated;

create table if not exists public.site_messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'ticker',
  title text,
  body text not null,
  url text,
  priority int not null default 0,
  is_published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists site_messages_kind_published_priority_desc_idx
  on public.site_messages (kind, is_published, priority desc);
create index if not exists site_messages_expires_at_idx
  on public.site_messages (expires_at);

alter table public.site_messages enable row level security;
drop policy if exists site_messages_public_read on public.site_messages;
create policy site_messages_public_read
on public.site_messages
for select
to anon, authenticated
using (is_published = true and (expires_at is null or expires_at > now()));

revoke all on table public.site_messages from anon, authenticated;
grant select on table public.site_messages to anon, authenticated;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.video_categories (
  youtube_video_id text not null references public.videos(youtube_video_id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (youtube_video_id, category_id)
);

create index if not exists video_categories_category_id_idx
  on public.video_categories (category_id);
create index if not exists video_categories_youtube_video_id_idx
  on public.video_categories (youtube_video_id);

alter table public.categories enable row level security;
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (is_active = true);

revoke all on table public.categories from anon, authenticated;
grant select on table public.categories to anon, authenticated;

alter table public.video_categories enable row level security;
drop policy if exists video_categories_public_read on public.video_categories;
create policy video_categories_public_read
on public.video_categories
for select
to anon, authenticated
using (true);

revoke all on table public.video_categories from anon, authenticated;
grant select on table public.video_categories to anon, authenticated;
