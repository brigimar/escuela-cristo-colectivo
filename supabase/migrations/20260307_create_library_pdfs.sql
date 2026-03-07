create table if not exists public.library_pdfs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  author text null,
  storage_bucket text not null default 'libros-pdf',
  storage_path text not null,
  public_url text null,
  mime_type text null,
  size_bytes bigint null,
  is_published boolean not null default true,
  created_by text null,
  created_at timestamptz not null default now(),
  updated_by text null,
  updated_at timestamptz not null default now()
);

create index if not exists library_pdfs_published_created_idx
  on public.library_pdfs (is_published, created_at desc);
