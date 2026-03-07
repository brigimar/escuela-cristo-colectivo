import { z } from "zod"

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_YOUTUBE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_TELEGRAM_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_WHATSAPP_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_COMMUNITY_URL: z.string().min(1).optional()
})

export function loadClientEnv() {
  return schema.parse(process.env)
}
