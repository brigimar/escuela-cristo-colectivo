create table if not exists public.telegram_pending_pdf (
  chat_id bigint primary key,
  from_id bigint not null,
  file_id text not null,
  file_unique_id text null,
  mime_type text null,
  size_bytes bigint null,
  draft_title text null,
  draft_description text null,
  draft_author text null,
  awaiting_field text null,
  created_at timestamptz not null default now(),
  constraint telegram_pending_pdf_awaiting_field_check
    check (awaiting_field is null or awaiting_field in ('title', 'description', 'author'))
);
