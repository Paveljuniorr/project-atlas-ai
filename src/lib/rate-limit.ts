interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter.
 * @param identifier Unique key (e.g. userId, IP, or endpoint)
 * @param maxHits Maximum allowed requests in window
 * @param windowMs Window duration in milliseconds (default: 60s)
 */
export function checkRateLimit(identifier: string, maxHits: number = 30, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitMap.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter(ts => ts > windowStart);

  if (validTimestamps.length >= maxHits) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: maxHits - validTimestamps.length
  };
}
