# Pipeline Audit Report

Date: 2026-03-04

## Scope
YouTube → cron scheduler → Next.js endpoint → Supabase database → frontend rendering

## Step 1 — Environment Configuration
Status: OK

Required variables found in `.env.local` (values not displayed):
- YOUTUBE_API_KEY
- YOUTUBE_CHANNEL_ID
- YOUTUBE_UPLOADS_PLAYLIST_ID
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- CRON_SECRET

## Step 2 — YouTube Identifiers
Status: OK

- Channel ID format: UC + 22 characters (matches expected format).
- Uploads playlist ID: `UU` + channel_id.slice(2) matches configured value.

## Step 3 — YouTube API Access
Status: NOT RUN

Reason: Executing the API call here would expose the API key in command logs. This audit does not print or transmit secrets.

## Step 4 — Supabase Database
Status: NOT VERIFIED (live DB not accessible in this environment)

Findings from repository schema file (`db/schema.sql`):
- `videos` table expected with `youtube_video_id` unique constraint.
- No `provider` / `provider_video_id` columns or constraints are defined in the schema file.
- `sync_runs` table defined in schema file, but its columns differ from the runtime writes in code.

Live checks not performed:
- Table existence
- Constraint presence in live DB
- `count(*)`
- Latest `published_at`
- Duplicate query results

## Step 5 — Supabase Cron Scheduler
Status: NOT VERIFIED (live DB not accessible in this environment)

Expected from migration (`supabase/migrations/cron_youtube_sync.sql`):
- Extensions: `pg_cron`, `pg_net`
- Job: `youtube-sync-every-30m`

Live checks not performed:
- Installed extensions
- Job presence
- Recent run history

## Step 6 — HTTP Trigger Function
Status: DEFINED IN MIGRATION, NOT VERIFIED IN DB

Expected function: `public.youtube_sync_http()` calling:
- `net.http_get` → `/api/cron/youtube-sync`
- Header: `x-cron-secret`

## Step 7 — Endpoint Test
Status: NOT RUN

Reason: Local server not started here and the secret header would be exposed in command logs.

## Step 8 — Ingestion Verification
Status: NOT RUN

Reason: No live endpoint trigger executed, and Supabase not accessible.

## Step 9 — Frontend Consumption
Status: OK

Frontend queries read from the `videos` table using the public Supabase client:
- `src/features/videos/queries.ts`

## Step 10 — Overall Pipeline Status
Overall Status: DEGRADED

Reason:
- Environment variables are configured.
- Frontend queries are wired to `videos`.
- Live Supabase and YouTube API checks were not executed due to secret handling and missing DB access in this environment.
