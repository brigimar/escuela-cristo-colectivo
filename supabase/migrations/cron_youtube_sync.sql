-- Enable required extensions (idempotent)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Function to call the Next.js YouTube sync endpoint
create or replace function public.youtube_sync_http()
returns void
language plpgsql
security definer
as $$
declare
  res jsonb;
begin
  select net.http_get(
    url := 'https://<VERCEL_DOMAIN>/api/cron/youtube-sync',
    headers := jsonb_build_object(
      'x-cron-secret','<CRON_SECRET>'
    )
  )
  into res;
  -- Optionally: you can log res into a table if desired
end;
$$;

-- Schedule the job to run every 30 minutes
select cron.schedule(
  'youtube-sync-every-30m',
  '*/30 * * * *',
  $$select public.youtube_sync_http();$$
);
