import { z } from "zod"

function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => {
    if (typeof val === "string" && val.trim() === "") return undefined
    return val
  }, schema)
}

const optionalNonEmptyString = emptyToUndefined(z.string().min(1).optional())
const optionalString = emptyToUndefined(z.string().optional())

const schema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  YOUTUBE_API_KEY: optionalNonEmptyString,
  YOUTUBE_CHANNEL_ID: optionalNonEmptyString,
  YOUTUBE_UPLOADS_PLAYLIST_ID: optionalNonEmptyString,
  TELEGRAM_BOT_TOKEN: optionalNonEmptyString,
  TELEGRAM_SECRET_TOKEN: optionalNonEmptyString,
  TELEGRAM_ALLOWED_CHAT_IDS: optionalString,
  TELEGRAM_OWNER_USER_ID: optionalString,
  CRON_SECRET: optionalNonEmptyString,
  NODE_ENV: optionalString,
  LOG_LEVEL: optionalString
})

export function loadServerEnv() {
  return schema.parse(process.env)
}
