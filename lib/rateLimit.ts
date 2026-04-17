const store = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Uses a sliding-window counter keyed by IP.
 */
export function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    store.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  return true;
}
