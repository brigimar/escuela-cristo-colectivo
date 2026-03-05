import { NextResponse } from "next/server"
import { listVideos } from "@/features/videos/queries"

export async function GET() {
  const hasEnv = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  try {
    const rows = await listVideos()
    const sample = rows.slice(0, 5).map((v) => ({
      slug: v.slug,
      title: v.title,
      published_at: v.published_at ?? null,
      thumbnail_url: v.thumbnail_url ?? null
    }))

    return NextResponse.json({
      has_env: hasEnv,
      count: rows.length,
      sample,
      error: null
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({
      has_env: hasEnv,
      count: 0,
      sample: [],
      error: message
    })
  }
}
