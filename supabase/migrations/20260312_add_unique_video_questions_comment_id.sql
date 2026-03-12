create unique index if not exists video_questions_comment_id_unique
  on public.video_questions (comment_id)
  where comment_id is not null;
