import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback: in-memory sliding window (single-instance only, not shared across Vercel lambdas)
const memoryStore = new Map<string, number[]>();
let lastPruned = Date.now();

function memoryRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastPruned > 5 * 60 * 1000) {
    const cutoff = now - windowMs;
    for (const [key, timestamps] of memoryStore) {
      const fresh = timestamps.filter((t) => t > cutoff);
      fresh.length === 0 ? memoryStore.delete(key) : memoryStore.set(key, fresh);
    }
    lastPruned = now;
  }
  const windowStart = now - windowMs;
  const timestamps = (memoryStore.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= maxRequests) {
    memoryStore.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  memoryStore.set(ip, timestamps);
  return true;
}

let ratelimiter: Ratelimit | null = null;

function getRatelimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  if (!ratelimiter) {
    ratelimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs / 1000} s`),
      prefix: "tmp-mail:rl",
    });
  }
  return ratelimiter;
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Uses Upstash Redis when KV_REST_API_URL + KV_REST_API_TOKEN are set,
 * otherwise falls back to an in-memory store (per-instance only — not reliable on serverless).
 */
export async function rateLimit(ip: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const limiter = getRatelimiter(maxRequests, windowMs);
  if (limiter) {
    const { success } = await limiter.limit(ip);
    return success;
  }
  return memoryRateLimit(ip, maxRequests, windowMs);
}
