import process from "node:process"

const url = process.argv[2]
const n = Number(process.argv[3] ?? "20")
const json = process.argv.includes("--json")

if (!url) {
  console.error("Usage: node scripts/fetch-head.mjs <url> [lines]")
  process.exit(1)
}

const res = await fetch(url)
const text = await res.text()
const lines = text.split(/\r?\n/)
const max = Math.max(0, Math.min(n, lines.length))
if (json) {
  process.stdout.write(JSON.stringify(lines.slice(0, max), null, 2))
  process.stdout.write("\n")
} else {
  process.stdout.write(lines.slice(0, max).join("\n"))
  process.stdout.write("\n")
}
