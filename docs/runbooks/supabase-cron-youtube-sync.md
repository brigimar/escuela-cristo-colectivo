# Supabase Cron: YouTube Sync

## Summary
- Vercel Cron has been removed due to Hobby plan restrictions (runs >1/day break deploys).
- Scheduling is now handled by Supabase using pg_cron + pg_net.
- The pipeline:
  Supabase pg_cron → pg_net HTTP request → `/api/cron/youtube-sync` → YouTube API → Supabase `videos` table.

## Why Vercel Cron Was Removed
- Vercel Hobby plan allows at most one scheduled run per day.
- Our sync requires more frequent execution; attempting this caused deployment failures.
- Moving scheduling to Supabase provides reliable, database-native scheduling without impacting Vercel deploys.

## How Supabase Cron Works
- `pg_cron` runs SQL on a schedule defined by a standard cron expression.
- `pg_net` performs HTTP requests directly from Postgres.
- We created a function `public.youtube_sync_http()` that calls the Next.js endpoint with a secret header.
- We scheduled it to run every 30 minutes.

## Files
- SQL migration: `supabase/migrations/cron_youtube_sync.sql`
- API endpoint: `app/api/cron/youtube-sync/route.ts`

## Prerequisites
- Set a strong `CRON_SECRET` in your deployment environment.
- Replace placeholders in the SQL migration before applying:
  - `<VERCEL_DOMAIN>` → your deployed domain, e.g. `your-app.vercel.app`
  - `<CRON_SECRET>` → the same value as `CRON_SECRET` in Vercel env

## Update the Schedule
- Edit the cron expression in the migration (or via SQL after apply):

```sql
select cron.schedule(
  'youtube-sync-every-30m',
  '*/30 * * * *',
  $$select public.youtube_sync_http();$$
);
```
- Common examples:
  - Every hour: `0 * * * *`
  - Every 15 minutes: `*/15 * * * *`

## Inspect Job Runs
- List jobs:

```sql
select * from cron.job;
```

- Recent job run details:

```sql
select * from cron.job_run_details order by start_time desc;
```

## Security
- Endpoint requires header `x-cron-secret` matching `process.env.CRON_SECRET`.
- Unauthorized calls receive HTTP 401.
- Confirmed in `app/api/cron/youtube-sync/route.ts`.

## Rollout Steps
1. Set `CRON_SECRET` in Vercel project env and redeploy.
2. Replace `<VERCEL_DOMAIN>` and `<CRON_SECRET>` in the SQL migration.
3. Apply the migration to Supabase.
4. Verify the job exists with `select * from cron.job;`.
5. Manually trigger once (optional) by calling the endpoint with the header to validate.
