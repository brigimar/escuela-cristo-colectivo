## YouTube Sync (Supabase Cron -> HTTP)

Trigger
- Scheduled SQL job in `supabase/migrations/cron_youtube_sync.sql`:
  - `cron.schedule('youtube-sync-every-30m', '*/30 * * * *', $$select public.youtube_sync_http();$$)`

Endpoint
- `GET|POST /api/cron/youtube-sync` (`app/api/cron/youtube-sync/route.ts`)

Dependencies
- Supabase extensions: `pg_cron`, `pg_net` (`supabase/migrations/cron_youtube_sync.sql`)
- DB function: `public.youtube_sync_http()` calling `net.http_get(...)`
- Server env used by sync path:
  - `CRON_SECRET`
  - `YOUTUBE_API_KEY`
  - `YOUTUBE_UPLOADS_PLAYLIST_ID` or `YOUTUBE_CHANNEL_ID`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- External API calls used by sync:
  - `https://www.googleapis.com/youtube/v3/playlistItems`
  - `https://www.googleapis.com/youtube/v3/channels`

Database tables affected
- `sync_runs`:
  - `insert` at start of run (`started_at`)
  - `update` with final status/summary (`finished_at`, `status`, `summary`)
- `videos`:
  - `select` existing IDs
  - `upsert` by `youtube_video_id`

Failure modes
- SQL migration placeholders remain literal (`<VERCEL_DOMAIN>`, `<CRON_SECRET>`) if not replaced in `supabase/migrations/cron_youtube_sync.sql`.
- `/api/cron/youtube-sync` returns:
  - `500` when `CRON_SECRET` is missing
  - `401` when `x-cron-secret` is missing or mismatched
  - `500` when `refreshVideos()` reports `status: "error"` or throws
- `refreshVideos()` returns error status when:
  - required env is missing
  - YouTube API request fails
  - uploads playlist cannot be resolved
  - Supabase operations return errors

## YouTube Sync (Direct HTTP Invocation)

Trigger
- Any direct `GET` or `POST` call to `/api/cron/youtube-sync`.

Endpoint
- `GET|POST /api/cron/youtube-sync` (`app/api/cron/youtube-sync/route.ts`)

Dependencies
- Same code path and dependencies as cron-driven sync.

Database tables affected
- Same as cron-driven sync:
  - `sync_runs`
  - `videos`

Failure modes
- Same as cron-driven sync endpoint path:
  - `500` missing `CRON_SECRET`
  - `401` invalid/missing `x-cron-secret`
  - `500` on sync error

## Telegram Webhook Intake

Trigger
- Incoming HTTP `POST` to `/api/webhook/telegram`.

Endpoint
- `POST /api/webhook/telegram` (`app/api/webhook/telegram/route.ts`)

Dependencies
- None in current route implementation.

Database tables affected
- None in current route implementation.

Failure modes
- No explicit failure branch in current route implementation; handler returns `Response("ok")`.

## Health Check

Trigger
- Incoming HTTP `GET` to `/api/health`.

Endpoint
- `GET /api/health` (`app/api/health/route.ts`)

Dependencies
- None in current route implementation.

Database tables affected
- None in current route implementation.

Failure modes
- No explicit failure branch in current route implementation; handler returns `Response("ok")`.
