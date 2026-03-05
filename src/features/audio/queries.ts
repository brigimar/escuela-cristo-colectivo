import { supabaseService } from "@/lib/supabase/client-service"

export type RespuestaAudio = {
  id: string
  title: string
  public_url: string | null
  created_at: string
  created_by: string | null
  mime_type: string | null
  size_bytes: number | null
}

export async function listRespuestasAudio(limit = 50): Promise<RespuestaAudio[]> {
  try {
    const res = await supabaseService
      .from("respuestas_audio")
      .select("id, title, public_url, created_at, created_by, mime_type, size_bytes")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(limit)

    if (res.error || !Array.isArray(res.data)) return []

    return res.data
      .map((row: any) => ({
        id: typeof row?.id === "string" ? row.id : "",
        title: typeof row?.title === "string" ? row.title : "",
        public_url: typeof row?.public_url === "string" ? row.public_url : null,
        created_at: typeof row?.created_at === "string" ? row.created_at : "",
        created_by: typeof row?.created_by === "string" ? row.created_by : null,
        mime_type: typeof row?.mime_type === "string" ? row.mime_type : null,
        size_bytes: typeof row?.size_bytes === "number" ? row.size_bytes : null,
      }))
      .filter((row) => row.id && row.title && row.created_at)
  } catch {
    return []
  }
}

