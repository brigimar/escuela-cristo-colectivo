create extension if not exists pgcrypto;

create table if not exists public.editorial_dimensions (
  id smallint primary key,
  code text not null unique,
  name text not null,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.editorial_terms (
  id uuid primary key default gen_random_uuid(),
  dimension_id smallint not null references public.editorial_dimensions(id) on delete restrict,
  slug text not null,
  label text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editorial_terms_dimension_slug_key unique (dimension_id, slug)
);

create table if not exists public.video_editorial_overrides (
  video_id uuid not null references public.videos(id) on delete cascade,
  dimension_id smallint not null references public.editorial_dimensions(id) on delete restrict,
  term_id uuid not null references public.editorial_terms(id) on delete restrict,
  reason text null,
  set_by text not null,
  set_at timestamptz not null default now(),
  is_active boolean not null default true,
  primary key (video_id, dimension_id)
);

create table if not exists public.video_editorial_classification_current (
  video_id uuid not null references public.videos(id) on delete cascade,
  dimension_id smallint not null references public.editorial_dimensions(id) on delete restrict,
  term_id uuid not null references public.editorial_terms(id) on delete restrict,
  source_kind text not null,
  source_ref text null,
  confidence numeric(5,4) not null default 0.5000,
  resolved_at timestamptz not null default now(),
  resolver_version text not null default 'v1',
  primary key (video_id, dimension_id),
  constraint video_editorial_classification_current_source_kind_check
    check (source_kind in ('manual', 'title_rule', 'fallback')),
  constraint video_editorial_classification_current_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.video_editorial_classification_log (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  dimension_id smallint not null references public.editorial_dimensions(id) on delete restrict,
  term_id uuid not null references public.editorial_terms(id) on delete restrict,
  source_kind text not null,
  source_ref text null,
  confidence numeric(5,4) not null,
  resolver_version text not null,
  evaluated_at timestamptz not null default now(),
  run_key text not null,
  changed boolean not null,
  constraint video_editorial_classification_log_run_video_dimension_key
    unique (run_key, video_id, dimension_id),
  constraint video_editorial_classification_log_source_kind_check
    check (source_kind in ('manual', 'title_rule', 'fallback')),
  constraint video_editorial_classification_log_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create index if not exists editorial_terms_dimension_active_sort_idx
  on public.editorial_terms (dimension_id, is_active, sort_order);

create index if not exists video_editorial_overrides_active_dimension_term_idx
  on public.video_editorial_overrides (is_active, dimension_id, term_id);

create index if not exists video_editorial_classification_current_dimension_term_idx
  on public.video_editorial_classification_current (dimension_id, term_id);

create index if not exists video_editorial_classification_current_source_kind_resolved_idx
  on public.video_editorial_classification_current (source_kind, resolved_at desc);

create index if not exists video_editorial_classification_log_video_dimension_evaluated_idx
  on public.video_editorial_classification_log (video_id, dimension_id, evaluated_at desc);

create index if not exists video_editorial_classification_log_run_key_idx
  on public.video_editorial_classification_log (run_key);

drop trigger if exists trg_editorial_terms_updated_at on public.editorial_terms;
create trigger trg_editorial_terms_updated_at
before update on public.editorial_terms
for each row
execute function public.set_updated_at();

insert into public.editorial_dimensions (id, code, name, is_required, sort_order, is_active)
values
  (1, 'content_type', 'Tipo de contenido', true, 10, true),
  (2, 'series_collection', 'Serie o colección', false, 20, true)
on conflict (id) do update
set
  code = excluded.code,
  name = excluded.name,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.editorial_terms (dimension_id, slug, label, description, is_active, sort_order)
select d.id, v.slug, v.label, null, true, v.sort_order
from public.editorial_dimensions d
join (
  values
    ('series_episode', 'Episodio de serie', 10),
    ('live', 'En vivo', 20),
    ('clip', 'Corte', 30),
    ('short', 'Short', 40),
    ('teaching', 'Enseñanza', 50),
    ('book_club', 'Club del Libro', 60),
    ('audiobook', 'Audiolibro', 70),
    ('reflection', 'Reflexión', 80)
) as v(slug, label, sort_order)
  on d.code = 'content_type'
on conflict (dimension_id, slug) do update
set
  label = excluded.label,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.editorial_terms (dimension_id, slug, label, description, is_active, sort_order)
select d.id, v.slug, v.label, null, true, v.sort_order
from public.editorial_dimensions d
join (
  values
    ('desafio_m28', 'Desafío M28', 10),
    ('watchman_nee', 'Watchman Nee', 20),
    ('reflexiones_cortas', 'Reflexiones Cortas', 30),
    ('club_del_libro', 'Club del Libro', 40),
    ('oraciones_apostolicas', 'Oraciones Apostólicas', 50),
    ('cortes_live', 'Cortes LIVE', 60),
    ('lives_espiritu_santo', 'Lives Espíritu Santo', 70),
    ('hechos', 'Hechos', 80),
    ('mateo', 'Mateo', 90)
) as v(slug, label, sort_order)
  on d.code = 'series_collection'
on conflict (dimension_id, slug) do update
set
  label = excluded.label,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();
