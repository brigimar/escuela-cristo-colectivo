import { supabasePublic } from "@/lib/supabase/client-public"
import { supabaseService } from "@/lib/supabase/client-service"

export type LibraryPdf = {
  id: string
  title: string
  description: string | null
  author: string | null
  category: string | null
  cover_url: string | null
  storage_bucket: string
  storage_path: string
  public_url: string | null
  mime_type: string | null
  size_bytes: number | null
  is_published: boolean
  is_hidden: boolean
  is_recommended: boolean
  is_featured: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}

export type LibraryPdfEditField = "title" | "description" | "author" | "category" | "cover_url" | "sort_order"

export type PdfEditorContextPayload = {
  pdf_id: string
  list_type: "p" | "h" | "a"
  list_offset: number
  field: LibraryPdfEditField | null
}

const LIBRARY_PDF_SELECT = [
  "id",
  "title",
  "description",
  "author",
  "category",
  "cover_url",
  "storage_bucket",
  "storage_path",
  "public_url",
  "mime_type",
  "size_bytes",
  "is_published",
  "is_hidden",
  "is_recommended",
  "is_featured",
  "sort_order",
  "created_by",
  "created_at",
  "updated_by",
  "updated_at",
].join(", ")

function mapLibraryPdf(row: any): LibraryPdf | null {
  if (typeof row?.id !== "string" || typeof row?.title !== "string" || typeof row?.storage_bucket !== "string" || typeof row?.storage_path !== "string") {
    return null
  }

  return {
    id: row.id,
    title: row.title,
    description: typeof row?.description === "string" ? row.description : null,
    author: typeof row?.author === "string" ? row.author : null,
    category: typeof row?.category === "string" ? row.category : null,
    cover_url: typeof row?.cover_url === "string" ? row.cover_url : null,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    public_url: typeof row?.public_url === "string" ? row.public_url : null,
    mime_type: typeof row?.mime_type === "string" ? row.mime_type : null,
    size_bytes: typeof row?.size_bytes === "number" ? row.size_bytes : null,
    is_published: typeof row?.is_published === "boolean" ? row.is_published : false,
    is_hidden: typeof row?.is_hidden === "boolean" ? row.is_hidden : false,
    is_recommended: typeof row?.is_recommended === "boolean" ? row.is_recommended : false,
    is_featured: typeof row?.is_featured === "boolean" ? row.is_featured : typeof row?.is_recommended === "boolean" ? row.is_recommended : false,
    sort_order: typeof row?.sort_order === "number" ? row.sort_order : 9999,
    created_by: typeof row?.created_by === "string" ? row.created_by : null,
    created_at: typeof row?.created_at === "string" ? row.created_at : "",
    updated_by: typeof row?.updated_by === "string" ? row.updated_by : null,
    updated_at: typeof row?.updated_at === "string" ? row.updated_at : "",
  }
}

export async function listPublishedLibraryPdfs(limit = 20): Promise<LibraryPdf[]> {
  const res = await supabasePublic
    .from("library_pdfs")
    .select(LIBRARY_PDF_SELECT)
    .eq("is_published", true)
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map(mapLibraryPdf).filter((row): row is LibraryPdf => Boolean(row))
}

export type ListPublishedLibraryPdfsPageInput = {
  page: number
  pageSize: number
  query?: string
}

export type ListPublishedLibraryPdfsPageResult = {
  items: LibraryPdf[]
  total: number
}

export async function listPublishedLibraryPdfsPage(
  input: ListPublishedLibraryPdfsPageInput
): Promise<ListPublishedLibraryPdfsPageResult> {
  const safePage = Number.isFinite(input.page) && input.page > 0 ? Math.floor(input.page) : 1
  const safePageSize = Number.isFinite(input.pageSize) && input.pageSize > 0 ? Math.floor(input.pageSize) : 12
  const start = (safePage - 1) * safePageSize
  const end = start + safePageSize - 1
  const q = (input.query || "").trim()

  let request = supabasePublic
    .from("library_pdfs")
    .select(LIBRARY_PDF_SELECT, { count: "exact" })
    .eq("is_published", true)
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false, nullsFirst: false })

  if (q) {
    request = request.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
  }

  const res = await request.range(start, end)
  if (res.error || !Array.isArray(res.data)) {
    return { items: [], total: 0 }
  }

  return {
    items: res.data.map(mapLibraryPdf).filter((row): row is LibraryPdf => Boolean(row)),
    total: res.count ?? 0,
  }
}

export type LibraryListType = "published" | "hidden" | "all"

export async function listLibraryPdfsForOwner(listType: LibraryListType, limit = 20, offset = 0): Promise<LibraryPdf[]> {
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0
  let request = supabaseService
    .from("library_pdfs")
    .select(LIBRARY_PDF_SELECT)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .range(safeOffset, safeOffset + limit - 1)

  if (listType === "published") {
    request = request.eq("is_published", true).eq("is_hidden", false)
  } else if (listType === "hidden") {
    request = request.eq("is_hidden", true)
  }

  const res = await request

  if (res.error || !Array.isArray(res.data)) return []
  return res.data.map(mapLibraryPdf).filter((row): row is LibraryPdf => Boolean(row))
}

export async function getLibraryPdfById(id: string): Promise<LibraryPdf | null> {
  const res = await supabaseService
    .from("library_pdfs")
    .select(LIBRARY_PDF_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (res.error || !res.data) return null
  return mapLibraryPdf(res.data)
}

export async function createLibraryPdf(input: {
  title: string
  description?: string
  author?: string
  category?: string
  cover_url?: string | null
  storage_path: string
  public_url?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  is_featured?: boolean
  sort_order?: number
  actor: string
}): Promise<boolean> {
  const now = new Date().toISOString()
  const normalizedSortOrder =
    typeof input.sort_order === "number" && Number.isFinite(input.sort_order) ? Math.floor(input.sort_order) : 9999
  const isFeatured = Boolean(input.is_featured)
  const res = await supabaseService
    .from("library_pdfs")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      author: input.author?.trim() || null,
      category: input.category?.trim() || "General",
      cover_url: input.cover_url?.trim() || "/images/library/library-default-cover.svg",
      storage_bucket: "libros-pdf",
      storage_path: input.storage_path,
      public_url: input.public_url ?? null,
      mime_type: input.mime_type ?? null,
      size_bytes: input.size_bytes ?? null,
      is_published: true,
      is_hidden: false,
      is_recommended: isFeatured,
      is_featured: isFeatured,
      sort_order: normalizedSortOrder,
      created_by: input.actor,
      updated_by: input.actor,
      updated_at: now,
    })

  return !res.error
}

export async function publishLibraryPdf(id: string, actor: string): Promise<boolean> {
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_published: true,
      is_hidden: false,
      updated_by: actor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  return !res.error
}

export async function hideLibraryPdf(id: string, actor: string): Promise<boolean> {
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_hidden: true,
      updated_by: actor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  return !res.error
}

export async function setLibraryPdfRecommended(id: string, actor: string): Promise<boolean> {
  const now = new Date().toISOString()
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_recommended: true,
      is_featured: true,
      is_published: true,
      is_hidden: false,
      updated_by: actor,
      updated_at: now,
    })
    .eq("id", id)

  return !res.error
}

export async function clearLibraryPdfRecommended(id: string, actor: string): Promise<boolean> {
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_recommended: false,
      is_featured: false,
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

  if (field === "sort_order") {
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed) || parsed < 0) return false

    const res = await supabaseService
      .from("library_pdfs")
      .update({
        sort_order: Math.floor(parsed),
        updated_by: actor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    return !res.error
  }

  const patch: Record<string, unknown> = {
    updated_by: actor,
    updated_at: new Date().toISOString(),
  }
  if (field === "category") {
    patch[field] = normalized || "General"
  } else if (field === "cover_url") {
    patch[field] = normalized || "/images/library/library-default-cover.svg"
  } else {
    patch[field] = field === "title" ? normalized : normalized || null
  }

  const res = await supabaseService
    .from("library_pdfs")
    .update(patch)
    .eq("id", id)

  return !res.error
}

export async function setLibraryPdfFeatured(id: string, isFeatured: boolean, actor: string): Promise<boolean> {
  const now = new Date().toISOString()
  const res = await supabaseService
    .from("library_pdfs")
    .update({
      is_featured: isFeatured,
      is_recommended: isFeatured,
      updated_by: actor,
      updated_at: now,
    })
    .eq("id", id)

  return !res.error
}

function parsePdfEditorContext(row: any): PdfEditorContextPayload | null {
  if (!row || !Array.isArray(row.items) || row.items.length === 0) return null
  const first = row.items[0] as Record<string, unknown>
  const pdfId = typeof first?.pdf_id === "string" ? first.pdf_id : ""
  if (!pdfId) return null

  const listType = first?.list_type === "p" || first?.list_type === "h" || first?.list_type === "a" ? first.list_type : "a"
  const listOffset = typeof first?.list_offset === "number" && Number.isFinite(first.list_offset) ? first.list_offset : 0
  const field =
    first?.field === "title" ||
    first?.field === "description" ||
    first?.field === "author" ||
    first?.field === "category" ||
    first?.field === "cover_url" ||
    first?.field === "sort_order"
      ? first.field
      : null

  return {
    pdf_id: pdfId,
    list_type: listType,
    list_offset: listOffset,
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
