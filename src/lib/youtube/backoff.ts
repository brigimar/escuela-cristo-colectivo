export type BackoffOptions = {
  retries?: number
  baseDelayMs?: number
}

export class RetryableError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "RetryableError"
    this.status = status
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function withBackoff<T>(fn: () => Promise<T>, opts: BackoffOptions = {}) {
  const retries = opts.retries ?? 4
  const baseDelayMs = opts.baseDelayMs ?? 250

  let attempt = 0
  for (;;) {
    try {
      return await fn()
    } catch (err) {
      attempt += 1
      const retryable = err instanceof RetryableError
      if (!retryable || attempt > retries) throw err
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
}
