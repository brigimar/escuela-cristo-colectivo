import { supabasePublic } from "@/lib/supabase/client-public"
import { supabaseService } from "@/lib/supabase/client-service"

export type LibraryPdf = {
  id: string
  title: string
  description: string | null
  author: string | null
  storage_bucket: string
  storage_path: string
  public_url: string | null
  mime_type: string | null
  size_bytes: number | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}

export type LibraryPdfEditField = "title" | "description" | "author"

export type PdfEditorContextPayload = {
  pdf_id: string
  back_callback: "owner:pdfs:published" | "owner:pdfs:hidden" | "owner:pdfs"
  field: LibraryPdfEditField | null
}

function mapLibraryPdf(row: any): LibraryPdf | null {
  if (typeof row?.id !== "string" || typeof row?.title !== "string" || typeof row?.storage_bucket !== "string" || typeof row?.storage_path !== "string") {
    return null
  }

  return {
    id: row.id,
    title: row.title,
    description: typeof row?.description === "string" ? row.description : null,
    author: typeof row?.author === "string" ? row.author : null,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    public_url: typeof row?.public_url === "string" ? row.public_url : null,
    mime_type: typeof row?.mime_type === "string" ? row.mime_type : null,
    size_bytes: typeof row?.size_bytes === "number" ? row.size_bytes : null,
    is_published: typeof row?.is_published === "boolean" ? row.is_published : false,
    created_by: typeof row?.created_by === "string" ? row.created_by : null,
    created_at: typeof row?.created_at === "string" ? row.created_at : "",
    updated_by: typeof row?.updated_by === "string" ? row.updated_by : null,
    updated_at: typeof row?.updated_at === "string" ? row.updated_at : "",
  }
}

export async function listPublishedLibraryPdfs(limit = 20): Promise<LibraryPdf[]> {
  const res = await supabasePublic
    .from("library_pdfs")
    .select("id, title, description, author, storage_bucket, storage_path, public_url, mime_type, size_bytes, is_published, created_by, created_at, updated_by, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map(mapLibraryPdf).filter((row): row is LibraryPdf => Boolean(row))
}

export async function listLibraryPdfsByVisibility(isPublished: boolean, limit = 20): Promise<LibraryPdf[]> {
  const res = await supabaseService
    .from("library_pdfs")
    .select("id, title, description, author, storage_bucket, storage_path, public_url, mime_type, size_bytes, is_published, created_by, created_at, updated_by, updated_at")
    .eq("is_published", isPublished)
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map(mapLibraryPdf).filter((row): row is LibraryPdf => Boolean(row))
}

export async function getLibraryPdfById(id: string): Promise<LibraryPdf | null> {
  const res = await supabaseService
    .from("library_pdfs")
    .select("id, title, description, author, storage_bucket, storage_path, public_url, mime_type, size_bytes, is_published, created_by, created_at, updated_by, updated_at")
    .eq("id", id)
    .maybeSingle()

  if (res.error || !res.data) return null
  return mapLibraryPdf(res.data)
}

export async function createLibraryPdf(input: {
  title: string
  description?: string
  author?: string
  storage_path: string
  public_url?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  actor: string
}): Promise<boolean> {
  const now = new Date().toISOString()
  const res = await supabaseService
    .from("library_pdfs")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      author: input.author?.trim() || null,
      storage_bucket: "libros-pdf",
      storage_path: input.storage_path,
      public_url: input.public_url ?? null,
      mime_type: input.mime_type ?? null,
      size_bytes: input.size_bytes ?? null,
      is_published: true,
      created_by: input.actor,
      updated_by: input.actor,
      updated_at: now,
    })

  return !res.error
}

export async function setLibraryPdfPublished(id: string, isPublished: boolean, actor: string): Promise<boolean> {
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_published: isPublished,
      updated_by: actor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  return !res.error
}

export async function updateLibraryPdfMetadata(
  id: string,
  field: LibraryPdfEditField,
  value: string,
  actor: string
): Promise<boolean> {
  const normalized = value.trim()
  if (field === "title" && !normalized) return false

  const patch: Record<string, unknown> = {
    updated_by: actor,
    updated_at: new Date().toISOString(),
  }
  patch[field] = field === "title" ? normalized : normalized || null

  const res = await supabaseService
    .from("library_pdfs")
    .update(patch)
    .eq("id", id)

  return !res.error
}

function parsePdfEditorContext(row: any): PdfEditorContextPayload | null {
  if (!row || !Array.isArray(row.items) || row.items.length === 0) return null
  const first = row.items[0] as Record<string, unknown>
  const pdfId = typeof first?.pdf_id === "string" ? first.pdf_id : ""
  if (!pdfId) return null

  const backCallback =
    first?.back_callback === "owner:pdfs:published" ||
    first?.back_callback === "owner:pdfs:hidden" ||
    first?.back_callback === "owner:pdfs"
      ? first.back_callback
      : "owner:pdfs"

  const field =
    first?.field === "title" || first?.field === "description" || first?.field === "author"
      ? first.field
      : null

  return {
    pdf_id: pdfId,
    back_callback: backCallback,
    field,
  }
}

export async function savePdfEditorContext(chatId: number, fromId: number, payload: PdfEditorContextPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

  await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "pdf_editor")
    .eq("is_active", true)

  const insertRes = await supabaseService
    .from("telegram_list_contexts")
    .insert({
      chat_id: chatId,
      from_id: fromId,
      context_type: "pdf_editor",
      category_slug: "library_pdfs",
      list_offset: 0,
      items: [payload],
      expires_at: expiresAt,
      is_active: true,
    })

  if (insertRes.error) throw new Error(insertRes.error.message)
}

export async function getPdfEditorContext(chatId: number, fromId: number): Promise<PdfEditorContextPayload | null> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .select("items")
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "pdf_editor")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (res.error || !res.data) return null
  return parsePdfEditorContext(res.data)
}

export async function clearPdfEditorContext(chatId: number, fromId: number): Promise<void> {
  const res = await supabaseService
    .from("telegram_list_contexts")
    .update({ is_active: false })
    .eq("chat_id", chatId)
    .eq("from_id", fromId)
    .eq("context_type", "pdf_editor")
    .eq("is_active", true)

  if (res.error) throw new Error(res.error.message)
}
