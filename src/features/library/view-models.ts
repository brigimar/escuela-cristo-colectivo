import type { LibraryPdf } from "@/features/library/queries"
import { supabasePublic } from "@/lib/supabase/client-public"

export type LibraryCardModel = {
  id: string
  title: string
  author: string | null
  description: string | null
  createdAt: string
  fileLabel: string
  sizeLabel: string | null
  downloadUrl: string
}

function formatBytes(bytes: number | null): string | null {
  if (typeof bytes !== "number" || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resolveDownloadUrl(item: LibraryPdf): string {
  if (item.public_url) return item.public_url
  const data = supabasePublic.storage.from(item.storage_bucket).getPublicUrl(item.storage_path)
  return data.data.publicUrl
}

export function toLibraryCardModel(item: LibraryPdf): LibraryCardModel {
  return {
    id: item.id,
    title: item.title,
    author: item.author,
    description: item.description,
    createdAt: item.created_at,
    fileLabel: "PDF",
    sizeLabel: formatBytes(item.size_bytes),
    downloadUrl: resolveDownloadUrl(item),
  }
}
