/**
 * Rate limiter for API routes.
 *
 * Backed by Redis (`REDIS_URL`) when available so counters survive across
 * pm2 cluster workers and process restarts. Falls back to a per-process
 * in-memory Map when Redis is unreachable — this keeps local dev working
 * but means production WITHOUT a Redis host gets per-worker counters
 * (i.e. `instances * maxRequests` actual throughput in cluster mode).
 *
 * Configure `REDIS_URL` in production. The shared client lives in
 * `src/lib/redis.ts`; we lazy-import it so tests / scripts that don't
 * touch rate limiting don't pay the connection cost.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Per-process fallback store. Cleaned every minute to avoid unbounded growth.
const memStore = new Map<string, RateLimitEntry>();

if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memStore.entries()) {
            if (entry.resetAt < now) memStore.delete(key);
        }
    }, 60_000).unref?.();
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
}

// Module-level so we only attempt to load ioredis once per process. Failures
// are sticky — if Redis is unreachable we stay on in-memory for the lifetime
// of the worker rather than retry on every request.
let redisClient: import('ioredis').Redis | null | undefined;
let redisDisabled = false;

async function getRedis(): Promise<import('ioredis').Redis | null> {
    if (redisDisabled) return null;
    if (redisClient !== undefined) return redisClient;

    if (!process.env.REDIS_URL) {
        redisDisabled = true;
        redisClient = null;
        return null;
    }

    try {
        const { redis } = await import('./redis');
        // ioredis lazy-connects; trigger the connection so we surface failure here.
        if (redis.status === 'wait' || redis.status === 'end') {
            await redis.connect().catch(() => undefined);
        }
        redisClient = redis;
        return redis;
    } catch (err) {
        console.warn(
            '[rate-limit] Redis unavailable, falling back to in-memory store:',
            (err as Error).message
        );
        redisDisabled = true;
        redisClient = null;
        return null;
    }
}

export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60_000 }
): Promise<RateLimitResult> {
    const now = Date.now();
    const redis = await getRedis();

    if (redis) {
        try {
            const key = `rl:${identifier}`;
            const pipeline = redis.multi();
            pipeline.incr(key);
            pipeline.pttl(key);
            const result = await pipeline.exec();

            if (!result) throw new Error('redis pipeline returned null');

            const count = result[0]?.[1] as number;
            let pttl = result[1]?.[1] as number;

            // First hit in window — set TTL atomically (pttl will be -1 here).
            if (pttl < 0) {
                await redis.pexpire(key, config.windowMs);
                pttl = config.windowMs;
            }

            const resetAt = now + pttl;

            if (count > config.maxRequests) {
                return {
                    success: false,
                    remaining: 0,
                    resetAt,
                    retryAfter: Math.ceil(pttl / 1000),
                };
            }

            return {
                success: true,
                remaining: Math.max(0, config.maxRequests - count),
                resetAt,
            };
        } catch (err) {
            // Redis hiccup — degrade to in-memory rather than reject.
            console.warn(
                '[rate-limit] Redis check failed, falling back to in-memory:',
                (err as Error).message
            );
        }
    }

    // ── In-memory fallback ────────────────────────────────────
    let entry = memStore.get(identifier);

    if (!entry || entry.resetAt < now) {
        entry = { count: 1, resetAt: now + config.windowMs };
        memStore.set(identifier, entry);
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt,
        };
    }

    entry.count++;

    if (entry.count > config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    public: { maxRequests: 100, windowMs: 60_000 },
    search: { maxRequests: 30, windowMs: 60_000 },
    ai: { maxRequests: 10, windowMs: 60_000 },
    analyze: { maxRequests: 5, windowMs: 60_000 },
    form: { maxRequests: 5, windowMs: 60_000 },
    contact: { maxRequests: 3, windowMs: 300_000 },
    auth: { maxRequests: 5, windowMs: 900_000 },
    adClick: { maxRequests: 30, windowMs: 60_000 },
    adImpression: { maxRequests: 100, windowMs: 60_000 },
    checkout: { maxRequests: 10, windowMs: 60_000 },
    admin: { maxRequests: 200, windowMs: 60_000 },
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp;

    const ua = request.headers.get('user-agent') || 'unknown';
    const accept = request.headers.get('accept') || '';
    return `anon-${hashCode(ua + accept)}`;
}

function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    };

    if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
}
