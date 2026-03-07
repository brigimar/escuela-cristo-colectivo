BEGIN;

create table if not exists public.video_questions (
  id uuid primary key default gen_random_uuid(),

  youtube_video_id text null,
  comment_id text null,

  author_name text null,
  author_channel_id text null,

  text_display text null,
  like_count integer null,

  published_at timestamptz null,
  fetched_at timestamptz null,

  is_selected boolean not null default false,
  is_hidden boolean not null default false,

  selected_at timestamptz null,
  selected_by text null,

  raw jsonb null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_questions_public_idx
  on public.video_questions (is_selected, is_hidden, selected_at desc);

create index if not exists video_questions_youtube_video_id_idx
  on public.video_questions (youtube_video_id);

create index if not exists video_questions_comment_id_idx
  on public.video_questions (comment_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_video_questions_updated_at on public.video_questions;
create trigger trg_video_questions_updated_at
before update on public.video_questions
for each row execute function public.set_updated_at();

COMMIT;

alter table public.video_questions enable row level security;

drop policy if exists "public read selected questions" on public.video_questions;
create policy "public read selected questions"
on public.video_questions
for select
using (is_selected = true and is_hidden = false);

