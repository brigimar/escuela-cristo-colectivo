create table if not exists public.telegram_list_contexts (
  id uuid primary key default gen_random_uuid(),
  chat_id bigint not null,
  from_id bigint not null,
  context_type text not null,
  category_slug text not null,
  list_offset integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_active boolean not null default true,
  constraint telegram_list_contexts_context_type_check
    check (context_type in ('editorial_video_list')),
  constraint telegram_list_contexts_list_offset_check
    check (list_offset >= 0),
  constraint telegram_list_contexts_items_array_check
    check (jsonb_typeof(items) = 'array')
);

create index if not exists telegram_list_contexts_lookup_idx
  on public.telegram_list_contexts (chat_id, from_id, context_type, is_active, created_at desc);

create index if not exists telegram_list_contexts_expires_idx
  on public.telegram_list_contexts (expires_at);
