# Repository Map

## Root Directories

- **app/**
  Next.js App Router directory containing all page routes and API endpoints.
  - **(public)/**: Publicly accessible pages like posts, videos, and search results.
  - **api/**: Server-side API routes, including cron jobs (`/api/cron/youtube-sync`), health checks, and webhooks.

- **src/**
  Core application source code organized by features and shared libraries.
  - **features/**: Feature-based modules (e.g., `posts`, `videos`) containing UI components, server-side logic, and data transformers.
  - **lib/**: Shared utility libraries for external integrations (Supabase, YouTube, Telegram), environment handling, and general utilities.

- **supabase/**
  Supabase configuration and database migrations.
  - **migrations/**: SQL migration files for version-controlled database schema changes.

- **docs/**
  Project documentation.
  - **runbooks/**: Step-by-step guides for operational tasks, such as the Supabase cron migration.

- **db/**
  Static database schema definitions and SQL files.

- **scripts/**
  Maintenance and utility scripts for the development environment.

- **stitch/**
  UI/UX design assets, screenshots, and code snippets.
