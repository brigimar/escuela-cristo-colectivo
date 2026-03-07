import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { loadClientEnv } from "../env/client"

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = loadClientEnv()

export const supabasePublic = createClient<Database>(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)
