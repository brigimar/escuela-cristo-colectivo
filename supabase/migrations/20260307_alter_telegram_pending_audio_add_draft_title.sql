alter table public.telegram_pending_audio
  add column if not exists draft_title text null;
