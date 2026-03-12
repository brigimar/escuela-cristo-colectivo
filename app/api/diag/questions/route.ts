import { NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase/client-service"

export async function GET() {
  const { data, error } = await supabaseService
    .from("video_questions")
    .select("id, author_name, text_display, published_at")
    .eq("is_hidden", false)
    .eq("is_selected", false)
    .order("published_at", { ascending: false })
    .limit(20)

  console.log("DIAG QUESTIONS COUNT", data?.length ?? 0)

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, pending_count: 0, items: [] },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    pending_count: data?.length ?? 0,
    items: data ?? [],
  })
}
