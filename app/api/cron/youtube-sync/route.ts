import { NextRequest, NextResponse } from "next/server"
import { loadServerEnv } from "@/lib/env/server"
import { refreshVideos } from "@/features/videos/server"

async function handle(req: NextRequest) {
  const env = loadServerEnv()
  const expected = env.CRON_SECRET
  if (!expected) return NextResponse.json({ ok: false, error: "Missing CRON_SECRET" }, { status: 500 })

  const got = req.headers.get("x-cron-secret")
  if (!got || got !== expected) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

  try {
    const result = await refreshVideos()
    const status = result.status === "ok" ? 200 : 500
    return NextResponse.json({ ok: result.status === "ok", ...result }, { status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
