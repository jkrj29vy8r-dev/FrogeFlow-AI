/**
 * Token-bucket rate limiter.
 * Uses an in-memory Map for development / single-instance deployments.
 * Replace the store with Upstash Redis for multi-region production use.
 *
 * Usage:
 *   const { success, remaining } = await rateLimit("user:123", { limit: 10, windowMs: 60_000 });
 *   if (!success) return new Response("Too Many Requests", { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Max requests allowed per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// In-memory store — replace with Redis client for production
const store = new Map<string, RateLimitEntry>();

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, limit: options.limit, remaining: options.limit - 1, resetAt };
  }

  if (entry.count >= options.limit) {
    return { success: false, limit: options.limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Pre-configured limiters for common use cases
export const apiRateLimit = (identifier: string) =>
  rateLimit(identifier, { limit: 60, windowMs: 60_000 });

export const authRateLimit = (identifier: string) =>
  rateLimit(identifier, { limit: 10, windowMs: 60_000 });

export const generationRateLimit = (identifier: string) =>
  rateLimit(identifier, { limit: 5, windowMs: 60_000 });

// Section generation fires one request per section, back-to-back, for a whole
// document at once — an 8–12 section eBook is a burst of 8–12 requests in a
// couple of minutes. The old 5/min limit meant a fast eBook tripped its own
// limit partway through and a section came back 429 ("1 of 8 failed"). Credits
// (deducted per section) are the real abuse guard, so this limit only needs to
// stay high enough to never punish a legitimate single-document generation.
export const sectionGenerationRateLimit = (identifier: string) =>
  rateLimit(identifier, { limit: 40, windowMs: 60_000 });

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.success ? {} : { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}
