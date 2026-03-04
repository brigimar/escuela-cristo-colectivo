import fs from "node:fs"
import { createClient } from "@supabase/supabase-js"

function loadEnvFile(path) {
  const text = fs.readFileSync(path, "utf8")
  const out = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1)
    out[key] = value
  }
  return out
}

const env = loadEnvFile(".env.local")
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url) {
  console.log("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL in .env.local")
  process.exit(1)
}
if (!key) {
  console.log("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(url, key)

console.log("select source,status,started_at,summary from public.sync_runs order by started_at desc limit 1;")
{
  const { data, error } = await supabase
    .from("sync_runs")
    .select("source,status,started_at,summary")
    .order("started_at", { ascending: false })
    .limit(1)

  if (error) {
    console.log(`error=${error.message}`)
  } else {
    const row = data?.[0]
    if (!row) {
      console.log("row=<null>")
    } else {
      console.log(`source=${row.source} status=${row.status} started_at=${row.started_at}`)
      const summary = row.summary && typeof row.summary === "object" ? row.summary : {}
      const runId = typeof summary.runId === "string" ? summary.runId : ""
      const fetchedCount = typeof summary.fetchedCount === "number" ? summary.fetchedCount : 0
      const insertedCount = typeof summary.insertedCount === "number" ? summary.insertedCount : 0
      const updatedCount = typeof summary.updatedCount === "number" ? summary.updatedCount : 0
      const errorMsg = typeof summary.error === "string" ? summary.error : ""
      const missingEnv = Array.isArray(summary.missingEnv) ? summary.missingEnv : null
      console.log(`summary.runId=${runId}`)
      console.log(`summary.counts fetched=${fetchedCount} inserted=${insertedCount} updated=${updatedCount}`)
      if (errorMsg) console.log(`summary.errorLen=${errorMsg.length}`)
      if (missingEnv) console.log(`summary.missingEnv=${JSON.stringify(missingEnv)}`)
    }
  }
}

console.log("select count(*) from public.videos;")
{
  const { count, error } = await supabase.from("videos").select("*", { count: "exact", head: true })
  console.log(JSON.stringify({ count, error }, null, 2))
}
