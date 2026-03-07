type Level = "debug" | "info" | "warn" | "error"

export function log(level: Level, message: string, context?: Record<string, unknown>) {
  const payload = { level, message, ...(context || {}) }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
}
