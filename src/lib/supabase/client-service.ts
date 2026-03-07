import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { loadServerEnv } from "../env/server"

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const { SUPABASE_SERVICE_ROLE_KEY } = loadServerEnv()

export const supabaseService = createClient<Database>(
  url,
  SUPABASE_SERVICE_ROLE_KEY
)
