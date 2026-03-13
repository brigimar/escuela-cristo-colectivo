alter table public.library_pdfs
  add column if not exists is_hidden boolean not null default false,
  add column if not exists is_recommended boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();
