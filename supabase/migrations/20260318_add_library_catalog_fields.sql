alter table public.library_pdfs
  add column if not exists category text,
  add column if not exists cover_url text,
  add column if not exists sort_order integer,
  add column if not exists is_featured boolean not null default false;

update public.library_pdfs
set category = 'General'
where category is null or btrim(category) = '';

update public.library_pdfs
set cover_url = '/images/library/library-default-cover.svg'
where cover_url is null or btrim(cover_url) = '';

with ranked as (
  select id, row_number() over (
    order by coalesce(sort_order, 2147483647), coalesce(is_recommended, false) desc, created_at desc, id
  ) as seq
  from public.library_pdfs
)
update public.library_pdfs as lp
set sort_order = ranked.seq
from ranked
where lp.id = ranked.id
  and lp.sort_order is null;

update public.library_pdfs
set is_featured = coalesce(is_recommended, false)
where is_featured is distinct from coalesce(is_recommended, false);

alter table public.library_pdfs
  alter column category set default 'General',
  alter column category set not null,
  alter column cover_url set default '/images/library/library-default-cover.svg',
  alter column cover_url set not null,
  alter column sort_order set default 9999,
  alter column sort_order set not null;

create index if not exists library_pdfs_public_catalog_idx
  on public.library_pdfs (is_published, is_hidden, category, author, sort_order, created_at desc);

create index if not exists library_pdfs_featured_sort_idx
  on public.library_pdfs (is_featured desc, sort_order asc, created_at desc);
