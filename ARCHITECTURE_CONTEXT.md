# Project Architecture Context

## Stack

Framework: Next.js (`next` `^14.1.0`) with React (`^18.3.1`) and TypeScript (`^5.9.3`) (`package.json`).
Database: Supabase (via `@supabase/supabase-js`) with PostgreSQL schema/migrations in `db/schema.sql` and `supabase/migrations/*.sql`.
Hosting: `vercel.json` exists; Vercel is explicitly referenced in `docs/runbooks/supabase-cron-youtube-sync.md` and in `supabase/migrations/cron_youtube_sync.sql` (`<VERCEL_DOMAIN>` placeholder).
Scheduler: Supabase `pg_cron` + `pg_net` in `supabase/migrations/cron_youtube_sync.sql`, scheduled with `*/30 * * * *` for `public.youtube_sync_http()`.

## External APIs

- YouTube Data API v3:
  - `https://www.googleapis.com/youtube/v3/playlistItems` (`src/lib/youtube/client.ts`)
  - `https://www.googleapis.com/youtube/v3/channels` (`src/lib/youtube/client.ts`)
- Supabase project API (URL from env):
  - `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` used by Supabase clients (`src/lib/supabase/client-public.ts`, `src/lib/supabase/client-service.ts`)
- Telegram webhook integration:
  - Endpoint exists at `/api/webhook/telegram` (`app/api/webhook/telegram/route.ts`)

## Critical Endpoints

- `GET|POST /api/cron/youtube-sync` (`app/api/cron/youtube-sync/route.ts`)
  - Requires header `x-cron-secret` matching `CRON_SECRET`.
  - Triggers `refreshVideos()`.
- `POST /api/webhook/telegram` (`app/api/webhook/telegram/route.ts`)
  - Returns `ok`.
- `GET /api/health` (`app/api/health/route.ts`)
  - Returns `ok`.
- `GET /sitemap.xml` (`app/sitemap.xml/route.ts`)
  - Builds sitemap from video entries in Supabase.
- `GET /rss.xml` (`app/rss.xml/route.ts`)
  - Builds RSS from videos in Supabase.
- `GET /robots.txt` (`app/robots.txt/route.ts`)
  - Publishes robots policy and sitemap location.

## Data Flow

- Scheduled flow (`supabase/migrations/cron_youtube_sync.sql`):
  - `cron.schedule` runs every 30 minutes.
  - Calls `public.youtube_sync_http()`.
  - `public.youtube_sync_http()` executes `net.http_get` to `/api/cron/youtube-sync` with `x-cron-secret`.
- Sync flow (`app/api/cron/youtube-sync/route.ts`, `src/features/videos/server.ts`):
  - Endpoint validates `CRON_SECRET`.
  - `refreshVideos()` reads server env and inserts a `sync_runs` row.
  - Fetches YouTube uploads via `listUploads()` / YouTube client.
  - Maps items and upserts into `videos` table.
  - Updates `sync_runs` summary/status.
- Read flow (`src/features/videos/queries.ts`, feed routes):
  - Public Supabase client reads `videos` for pages, RSS, and sitemap.

## Environment Variables

- Client/Public (`src/lib/env/client.ts`, `src/lib/site/url.ts`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_YOUTUBE_URL`
  - `NEXT_PUBLIC_TELEGRAM_URL`
  - `NEXT_PUBLIC_WHATSAPP_URL`
  - `NEXT_PUBLIC_COMMUNITY_URL`
- Server (`src/lib/env/server.ts`, `src/lib/supabase/client-service.ts`):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL`
  - `YOUTUBE_API_KEY`
  - `YOUTUBE_CHANNEL_ID`
  - `YOUTUBE_UPLOADS_PLAYLIST_ID`
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_SECRET_TOKEN`
  - `TELEGRAM_ALLOWED_CHAT_IDS`
  - `CRON_SECRET`
  - `NODE_ENV`
  - `LOG_LEVEL`

## Critical Files

- `package.json`
- `vercel.json`
- `app/api/cron/youtube-sync/route.ts`
- `app/api/webhook/telegram/route.ts`
- `app/api/health/route.ts`
- `src/features/videos/server.ts`
- `src/features/videos/queries.ts`
- `src/lib/youtube/client.ts`
- `src/lib/supabase/client-public.ts`
- `src/lib/supabase/client-service.ts`
- `src/lib/env/client.ts`
- `src/lib/env/server.ts`
- `db/schema.sql`
- `supabase/migrations/cron_youtube_sync.sql`
- `docs/runbooks/supabase-cron-youtube-sync.md`