BEGIN;

create table if not exists public.telegram_pending_audio (
  chat_id bigint primary key,
  from_id bigint not null,
  file_id text not null,
  file_unique_id text null,
  source_kind text not null,
  mime_type text null,
  size_bytes bigint null,
  created_at timestamptz not null default now()
);

alter table public.telegram_pending_audio enable row level security;

COMMIT;

