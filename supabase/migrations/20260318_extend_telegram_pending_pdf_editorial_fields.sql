alter table public.telegram_pending_pdf
  add column if not exists draft_category text,
  add column if not exists draft_cover_url text,
  add column if not exists draft_sort_order integer,
  add column if not exists draft_is_featured boolean not null default false;

update public.telegram_pending_pdf
set draft_category = coalesce(nullif(btrim(draft_category), ''), 'General')
where draft_category is null or btrim(draft_category) = '';

update public.telegram_pending_pdf
set draft_cover_url = coalesce(nullif(btrim(draft_cover_url), ''), '/images/library/library-default-cover.svg')
where draft_cover_url is null or btrim(draft_cover_url) = '';

update public.telegram_pending_pdf
set draft_sort_order = coalesce(draft_sort_order, 9999)
where draft_sort_order is null;

alter table public.telegram_pending_pdf
  alter column draft_category set default 'General',
  alter column draft_cover_url set default '/images/library/library-default-cover.svg',
  alter column draft_sort_order set default 9999;

alter table public.telegram_pending_pdf
  drop constraint if exists telegram_pending_pdf_awaiting_field_check;

alter table public.telegram_pending_pdf
  add constraint telegram_pending_pdf_awaiting_field_check
  check (
    awaiting_field is null or awaiting_field in ('title', 'description', 'author', 'category', 'cover_url', 'sort_order')
  );
