export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 7000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Only TypeError means the connection failed before the request reached the server.
// AbortError (timeout) is ambiguous — the server may have already processed the request.
export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 400,
  shouldRetry: (err: unknown) => boolean = isNetworkError
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1 || !shouldRetry(err)) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error("retry: unreachable");
}
