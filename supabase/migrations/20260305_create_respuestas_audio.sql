BEGIN;

create table if not exists public.respuestas_audio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_bucket text not null default 'respuestas-audio',
  storage_path text not null,
  public_url text null,
  mime_type text null,
  size_bytes bigint null,
  duration_seconds integer null,
  created_by text null,
  created_at timestamptz not null default now()
);

create index if not exists respuestas_audio_created_at_idx
on public.respuestas_audio (created_at desc);

alter table public.respuestas_audio enable row level security;

drop policy if exists "public read respuestas_audio" on public.respuestas_audio;
create policy "public read respuestas_audio"
on public.respuestas_audio
for select
using (true);

COMMIT;

