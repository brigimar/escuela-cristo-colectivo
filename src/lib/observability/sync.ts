export type SyncSource = "youtube" | "telegram"

export type SyncRun = {
  id: string
  source: SyncSource
}

export async function startRun(_source: SyncSource): Promise<SyncRun> {
  return { id: "run_" + Date.now().toString(36), source: _source }
}

export async function finishRun(_run: SyncRun, _status: "success" | "failed", _counts?: Record<string, number>) {
  return
}

export async function recordError(_run: SyncRun, _message: string, _context?: Record<string, unknown>) {
  return
}
