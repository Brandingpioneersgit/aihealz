/**
 * Chat gate — lead capture + per-IP daily message cap for AI chatbots.
 *
 * Flow:
 *  1. requireChatLead(req)
 *     - Bypass for admin / provider sessions.
 *     - Require signed `chat_lead_id` cookie (issued by /api/chat-lead).
 *     - Check per-IP rolling 24h counter (Redis with in-memory fallback).
 *  2. After a successful AI response, call recordChatMessage(req, leadId)
 *     to increment the counter and bump ChatLead.messageCount.
 *
 * Counter is keyed on hashed IP, NOT lead id — so creating multiple leads
 * from the same network does not farm extra messages.
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { getClientIdentifier } from '@/lib/rate-limit';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { verifyProviderAuth } from '@/lib/provider-auth';

export const CHAT_LEAD_COOKIE = 'chat_lead_id';
export const CHAT_LEAD_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const SECRET =
    process.env.CHAT_LEAD_SECRET ||
    process.env.SESSION_SECRET ||
    'dev-only-chat-lead-secret-do-not-use-in-prod';

if (
    process.env.NODE_ENV === 'production' &&
    !process.env.CHAT_LEAD_SECRET &&
    !process.env.SESSION_SECRET
) {
    console.warn(
        '[chat-gate] CHAT_LEAD_SECRET not set in production — using insecure dev fallback.'
    );
}

export const CHAT_LEAD_DAILY_LIMIT = Math.max(
    1,
    Number(process.env.CHAT_LEAD_DAILY_LIMIT) || 5
);

const COUNTER_WINDOW_MS = 24 * 60 * 60 * 1000;
const COUNTER_KEY_PREFIX = 'chat-gate:ip:';

// ── Cookie signing (HMAC-SHA256) ──────────────────────────────────────────

export function signLeadCookie(leadId: string): string {
    const mac = crypto.createHmac('sha256', SECRET).update(leadId).digest('hex');
    return `${leadId}.${mac}`;
}

export function verifyLeadCookie(value: string | undefined | null): string | null {
    if (!value) return null;
    const dot = value.lastIndexOf('.');
    if (dot < 1) return null;
    const id = value.slice(0, dot);
    const mac = value.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(id).digest('hex');
    if (mac.length !== expected.length) return null;
    try {
        if (!crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(expected, 'hex'))) {
            return null;
        }
    } catch {
        return null;
    }
    return id;
}

export function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(`${ip}|${SECRET}`).digest('hex');
}

// ── IP counter (Redis + in-memory fallback) ───────────────────────────────

interface CounterEntry {
    count: number;
    resetAt: number;
}
const memCounter = new Map<string, CounterEntry>();

if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memCounter.entries()) {
            if (entry.resetAt < now) memCounter.delete(key);
        }
    }, 60_000).unref?.();
}

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
        if (redis.status === 'wait' || redis.status === 'end') {
            await redis.connect().catch(() => undefined);
        }
        redisClient = redis;
        return redis;
    } catch (err) {
        console.warn(
            '[chat-gate] Redis unavailable, falling back to in-memory:',
            (err as Error).message
        );
        redisDisabled = true;
        redisClient = null;
        return null;
    }
}

interface CounterStatus {
    count: number;
    remaining: number;
    resetAt: number;
}

async function readCounter(ipHash: string): Promise<CounterStatus> {
    const now = Date.now();
    const redis = await getRedis();
    const key = `${COUNTER_KEY_PREFIX}${ipHash}`;

    if (redis) {
        try {
            const [countRaw, pttlRaw] = await Promise.all([redis.get(key), redis.pttl(key)]);
            const count = countRaw ? Number(countRaw) : 0;
            const pttl = pttlRaw ?? -1;
            const resetAt = pttl > 0 ? now + pttl : now + COUNTER_WINDOW_MS;
            return {
                count,
                remaining: Math.max(0, CHAT_LEAD_DAILY_LIMIT - count),
                resetAt,
            };
        } catch (err) {
            console.warn('[chat-gate] Redis read failed:', (err as Error).message);
        }
    }

    const entry = memCounter.get(ipHash);
    if (!entry || entry.resetAt < now) {
        return {
            count: 0,
            remaining: CHAT_LEAD_DAILY_LIMIT,
            resetAt: now + COUNTER_WINDOW_MS,
        };
    }
    return {
        count: entry.count,
        remaining: Math.max(0, CHAT_LEAD_DAILY_LIMIT - entry.count),
        resetAt: entry.resetAt,
    };
}

async function incrementCounter(ipHash: string): Promise<CounterStatus> {
    const now = Date.now();
    const redis = await getRedis();
    const key = `${COUNTER_KEY_PREFIX}${ipHash}`;

    if (redis) {
        try {
            const pipeline = redis.multi();
            pipeline.incr(key);
            pipeline.pttl(key);
            const result = await pipeline.exec();
            if (!result) throw new Error('redis pipeline returned null');

            const count = result[0]?.[1] as number;
            let pttl = result[1]?.[1] as number;
            if (pttl < 0) {
                await redis.pexpire(key, COUNTER_WINDOW_MS);
                pttl = COUNTER_WINDOW_MS;
            }
            return {
                count,
                remaining: Math.max(0, CHAT_LEAD_DAILY_LIMIT - count),
                resetAt: now + pttl,
            };
        } catch (err) {
            console.warn('[chat-gate] Redis incr failed:', (err as Error).message);
        }
    }

    let entry = memCounter.get(ipHash);
    if (!entry || entry.resetAt < now) {
        entry = { count: 1, resetAt: now + COUNTER_WINDOW_MS };
        memCounter.set(ipHash, entry);
    } else {
        entry.count += 1;
    }
    return {
        count: entry.count,
        remaining: Math.max(0, CHAT_LEAD_DAILY_LIMIT - entry.count),
        resetAt: entry.resetAt,
    };
}

// ── Gate result types ─────────────────────────────────────────────────────

export type ChatGateResult =
    | { ok: true; bypass: true }
    | {
          ok: true;
          bypass?: false;
          leadId: string;
          ipHash: string;
          remaining: number;
          resetAt: number;
      }
    | {
          ok: false;
          status: 401 | 429;
          reason: 'signup_required' | 'limit_reached';
          resetAt?: number;
      };

async function isBypassed(request: NextRequest): Promise<boolean> {
    try {
        const admin = await verifyAdminAuth(request);
        if (admin?.authenticated) return true;
    } catch {
        // ignore — fall through to provider check
    }
    try {
        const provider = await verifyProviderAuth(request);
        if (provider?.authenticated) return true;
    } catch {
        // ignore
    }
    return false;
}

/**
 * Inspect the request and decide whether the chat request may proceed.
 * Does NOT increment the counter — call recordChatMessage() after a successful
 * AI response.
 */
export async function requireChatLead(request: NextRequest): Promise<ChatGateResult> {
    if (await isBypassed(request)) {
        return { ok: true, bypass: true };
    }

    const rawCookie = request.cookies.get(CHAT_LEAD_COOKIE)?.value;
    const leadId = verifyLeadCookie(rawCookie);
    if (!leadId) {
        return { ok: false, status: 401, reason: 'signup_required' };
    }

    const ipHash = hashIp(getClientIdentifier(request));
    const status = await readCounter(ipHash);

    if (status.remaining <= 0) {
        return { ok: false, status: 429, reason: 'limit_reached', resetAt: status.resetAt };
    }

    return {
        ok: true,
        leadId,
        ipHash,
        remaining: status.remaining,
        resetAt: status.resetAt,
    };
}

/**
 * Atomically increment the per-IP counter and bump ChatLead.messageCount.
 * Call only after the AI response succeeded.
 */
export async function recordChatMessage(
    request: NextRequest,
    leadId: string,
    ipHashHint?: string
): Promise<CounterStatus> {
    const ipHash = ipHashHint ?? hashIp(getClientIdentifier(request));
    const status = await incrementCounter(ipHash);

    // Best-effort DB update. We don't want a slow DB to stall the chat response.
    void prisma.chatLead
        .update({
            where: { id: leadId },
            data: {
                messageCount: { increment: 1 },
                lastMessageAt: new Date(),
            },
        })
        .catch((err) => {
            console.warn('[chat-gate] failed to bump ChatLead.messageCount:', err);
        });

    return status;
}

/**
 * Read counter status without incrementing — used by GET /api/chat-lead.
 */
export async function getChatLeadStatus(request: NextRequest): Promise<{
    registered: boolean;
    bypass: boolean;
    leadId?: string;
    role?: string;
    remaining: number;
    limit: number;
    resetAt: number;
}> {
    const bypass = await isBypassed(request);
    const ipHash = hashIp(getClientIdentifier(request));
    const counter = await readCounter(ipHash);

    if (bypass) {
        return {
            registered: true,
            bypass: true,
            remaining: CHAT_LEAD_DAILY_LIMIT,
            limit: CHAT_LEAD_DAILY_LIMIT,
            resetAt: counter.resetAt,
        };
    }

    const rawCookie = request.cookies.get(CHAT_LEAD_COOKIE)?.value;
    const leadId = verifyLeadCookie(rawCookie);

    if (!leadId) {
        return {
            registered: false,
            bypass: false,
            remaining: counter.remaining,
            limit: CHAT_LEAD_DAILY_LIMIT,
            resetAt: counter.resetAt,
        };
    }

    let role: string | undefined;
    try {
        const lead = await prisma.chatLead.findUnique({
            where: { id: leadId },
            select: { role: true },
        });
        role = lead?.role;
    } catch {
        // ignore — stale or schema not yet pushed
    }

    return {
        registered: true,
        bypass: false,
        leadId,
        role,
        remaining: counter.remaining,
        limit: CHAT_LEAD_DAILY_LIMIT,
        resetAt: counter.resetAt,
    };
}
