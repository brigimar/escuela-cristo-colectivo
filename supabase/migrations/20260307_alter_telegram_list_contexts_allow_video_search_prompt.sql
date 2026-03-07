alter table public.telegram_list_contexts
  drop constraint if exists telegram_list_contexts_context_type_check;

alter table public.telegram_list_contexts
  add constraint telegram_list_contexts_context_type_check
  check (context_type in ('editorial_video_list', 'video_search_prompt'));
