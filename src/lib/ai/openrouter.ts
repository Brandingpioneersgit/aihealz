/**
 * Centralized OpenRouter client for aihealz AI tools.
 *
 * All routes go through this helper. Every default points to a free,
 * open-weight model on OpenRouter (`:free` suffix). No paid model is
 * ever requested unless a caller explicitly overrides the model.
 *
 * Free endpoints share global capacity, so each mode has a fallback
 * chain — if the primary returns a 429 or upstream provider error,
 * we automatically try the next free model in the chain.
 */

export type AIMode = 'chat' | 'reasoning' | 'vision' | 'fast';

/**
 * Fallback chains per mode. All entries are confirmed free + open-weight
 * via the live OpenRouter catalog (https://openrouter.ai/api/v1/models).
 * Order = preferred → progressively cheaper / more available. If a primary
 * is rate-limited or briefly removed, the next entry serves the request.
 */
export const FREE_MODEL_CHAINS: Record<AIMode, string[]> = {
    chat: [
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-chat-v3-0324:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'mistralai/mistral-nemo:free',
        'google/gemma-2-9b-it:free',
        'qwen/qwen3-next-80b-a3b-instruct:free',
        'openai/gpt-oss-120b:free',
        'meta-llama/llama-3.2-3b-instruct:free',
    ],
    reasoning: [
        'deepseek/deepseek-r1:free',
        'deepseek/deepseek-chat-v3-0324:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen3-next-80b-a3b-instruct:free',
        'openai/gpt-oss-120b:free',
    ],
    vision: [
        'meta-llama/llama-3.2-11b-vision-instruct:free',
        'qwen/qwen-2-vl-7b-instruct:free',
        'google/gemma-3-27b-it:free',
    ],
    fast: [
        'meta-llama/llama-3.2-3b-instruct:free',
        'meta-llama/llama-3.2-1b-instruct:free',
        'mistralai/mistral-7b-instruct:free',
        'google/gemma-2-9b-it:free',
        'qwen/qwen-2.5-7b-instruct:free',
        'openai/gpt-oss-20b:free',
    ],
};

// A friendly, neutral fallback that NEVER leaks rate-limit / model errors to
// the user. Shown only after exhausting the chain + retries. Phrased as an
// in-character assistant reply so it looks natural in the chat thread.
export const AI_BUSY_REPLY =
    "I'm taking a moment to think on that one — could you try sending again? If it happens twice in a row, please give it 10–20 seconds and retry.";

// Status codes considered "transient" — worth retrying the entire chain for.
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
const CHAIN_RETRY_DELAYS_MS = [900, 2200];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal?.aborted) return resolve();
        const t = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(t);
            resolve();
        }, { once: true });
    });
}

export const FREE_MODEL_DEFAULTS: Record<AIMode, string> = {
    chat: FREE_MODEL_CHAINS.chat[0],
    reasoning: FREE_MODEL_CHAINS.reasoning[0],
    vision: FREE_MODEL_CHAINS.vision[0],
    fast: FREE_MODEL_CHAINS.fast[0],
};

export function pickModel(mode: AIMode): string {
    const envKey = `AI_MODEL_${mode.toUpperCase()}` as const;
    return process.env[envKey] || FREE_MODEL_DEFAULTS[mode];
}

function pickChain(mode: AIMode): string[] {
    const envKey = `AI_MODEL_${mode.toUpperCase()}` as const;
    const override = process.env[envKey];
    const base = FREE_MODEL_CHAINS[mode];
    if (override && !base.includes(override)) {
        return [override, ...base];
    }
    return base;
}

export function aiBase(): string {
    return process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';
}

export function aiKey(): string | undefined {
    return process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY;
}

export function aiHeaders(): Record<string, string> {
    const key = aiKey();
    return {
        'Content-Type': 'application/json',
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
        'HTTP-Referer': process.env.AI_PUBLIC_SITE_URL || 'https://aihealz.com',
        'X-Title': process.env.AI_PUBLIC_APP_NAME || 'aihealz',
    };
}

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: string;[k: string]: unknown }>;
};

export type ChatOptions = {
    mode?: AIMode;
    model?: string;
    fallbacks?: string[];
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' };
    signal?: AbortSignal;
};

export type ChatResult = {
    ok: boolean;
    status: number;
    text?: string;
    model?: string;
    raw?: unknown;
    error?: string;
    triedModels?: string[];
};

/**
 * Cache of recently rate-limited models with a two-tier strategy:
 *   - in-memory Map for sync, fast reads inside a single Node process
 *   - Redis write-through (best-effort) so other instances and the
 *     post-restart instance benefit from the same intel
 *
 * Free OpenRouter endpoints often 429 for tens of seconds at a time — the
 * cache means a single user gets fast follow-ups (the first request
 * discovers which models are constrained, subsequent requests skip them)
 * and a multi-instance deploy can share that intel.
 */
const rateLimitedUntil = new Map<string, number>();
const DEFAULT_COOLDOWN_MS = 60_000;
const MAX_COOLDOWN_MS = 5 * 60_000;
const REDIS_RL_PREFIX = 'ai:openrouter:rl:';

// Lazy import so this file stays usable in environments that don't ship
// ioredis (tests, edge runtime). The first marker write triggers the load.
let redisModule: Promise<typeof import('@/lib/redis').default | null> | null = null;
function getRedis() {
    if (!redisModule) {
        redisModule = import('@/lib/redis')
            .then(m => m.default)
            .catch(() => null);
    }
    return redisModule;
}

let hydrated = false;
async function hydrateFromRedis() {
    if (hydrated) return;
    hydrated = true;
    try {
        const redis = await getRedis();
        if (!redis) return;
        const keys = await redis.keys(`${REDIS_RL_PREFIX}*`);
        if (!keys.length) return;
        const ttls = await Promise.all(keys.map(k => redis.pttl(k)));
        keys.forEach((k, i) => {
            const model = k.slice(REDIS_RL_PREFIX.length);
            const ms = ttls[i];
            if (ms && ms > 0) rateLimitedUntil.set(model, Date.now() + ms);
        });
    } catch {
        // Redis unreachable — operate on in-memory only.
    }
}
// Fire-and-forget hydration on first import; reads stay sync.
void hydrateFromRedis();

function isRateLimited(model: string): boolean {
    const until = rateLimitedUntil.get(model);
    if (!until) return false;
    if (Date.now() > until) {
        rateLimitedUntil.delete(model);
        return false;
    }
    return true;
}

function markRateLimited(model: string, retryAfterSec?: number) {
    const ttlMs = Math.min(
        Math.max((retryAfterSec || 60) * 1000, DEFAULT_COOLDOWN_MS),
        MAX_COOLDOWN_MS,
    );
    rateLimitedUntil.set(model, Date.now() + ttlMs);
    // Fire-and-forget — never block the request path on Redis.
    void getRedis().then(redis => {
        if (!redis) return;
        return redis
            .set(`${REDIS_RL_PREFIX}${model}`, '1', 'PX', ttlMs)
            .catch(() => undefined);
    });
}

function extractRetryAfter(raw: unknown): number | undefined {
    const data = raw as {
        error?: { metadata?: { retry_after_seconds?: number; headers?: Record<string, string> } };
    };
    const meta = data?.error?.metadata;
    if (!meta) return undefined;
    if (typeof meta.retry_after_seconds === 'number') return meta.retry_after_seconds;
    const ra = meta.headers?.['Retry-After'] || meta.headers?.['retry-after'];
    if (ra && !Number.isNaN(Number(ra))) return Number(ra);
    return undefined;
}

/**
 * One attempt against a single model. Returns a structured outcome instead
 * of throwing, so the caller can decide whether to fall back.
 */
async function attemptOne(
    model: string,
    messages: ChatMessage[],
    opts: ChatOptions,
): Promise<ChatResult> {
    const body: Record<string, unknown> = {
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.maxTokens ?? (Number(process.env.AI_MAX_TOKENS) || 1500),
    };
    if (opts.responseFormat) body.response_format = opts.responseFormat;

    let res: Response;
    try {
        res = await fetch(`${aiBase()}/chat/completions`, {
            method: 'POST',
            headers: aiHeaders(),
            body: JSON.stringify(body),
            signal: opts.signal,
        });
    } catch (err) {
        return {
            ok: false,
            status: 0,
            error: err instanceof Error ? err.message : 'fetch failed',
            model,
        };
    }

    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        return { ok: false, status: res.status, error: 'invalid JSON from OpenRouter', model };
    }

    if (!res.ok) {
        const errObj = (data as { error?: { message?: string; code?: number } }).error;
        const errMsg = errObj?.message || `OpenRouter ${res.status}`;
        const upstreamCode = errObj?.code ?? res.status;
        if (upstreamCode === 429) {
            markRateLimited(model, extractRetryAfter(data));
        }
        return {
            ok: false,
            status: upstreamCode,
            error: errMsg,
            raw: data,
            model,
        };
    }

    const text =
        (data as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]
            ?.message?.content || '';

    if (!text.trim()) {
        return {
            ok: false,
            status: 502,
            error: 'empty response from model',
            raw: data,
            model,
        };
    }

    return { ok: true, status: res.status, text, model, raw: data };
}

/**
 * Status codes that signal "try the next model" — capacity / availability
 * issues that aren't going to resolve on retry of the same model.
 */
function shouldFallback(status: number): boolean {
    return (
        status === 0 || // network failure
        status === 404 || // model not found (catalog drift)
        status === 408 || // timeout
        status === 410 || // gone (deprecated model)
        status === 429 || // rate limit
        status === 500 || // upstream returned generic error
        status === 502 || // bad gateway / upstream
        status === 503 || // service unavailable
        status === 504 // gateway timeout
    );
}

function buildChain(opts: ChatOptions): string[] {
    let chain: string[];
    if (opts.model) {
        chain = [opts.model, ...(opts.fallbacks ?? [])];
    } else {
        chain = pickChain(opts.mode || 'chat');
        if (opts.fallbacks?.length) chain = [...chain, ...opts.fallbacks];
    }
    return chain.filter((m, i) => chain.indexOf(m) === i);
}

async function walkChainOnce(
    chain: string[],
    messages: ChatMessage[],
    opts: ChatOptions,
): Promise<{ result: ChatResult | null; tried: string[]; fatal: boolean }> {
    const fresh = chain.filter(m => !isRateLimited(m));
    const ordered = fresh.length ? fresh : chain;

    const tried: string[] = [];
    let last: ChatResult | null = null;

    for (const model of ordered) {
        tried.push(model);
        const result = await attemptOne(model, messages, opts);
        if (result.ok) return { result, tried, fatal: false };
        last = result;
        // Non-transient failure (e.g. 400 bad request) — abort the walk.
        if (!shouldFallback(result.status)) {
            return { result: last, tried, fatal: true };
        }
        if (opts.signal?.aborted) return { result: last, tried, fatal: true };
    }
    return { result: last, tried, fatal: false };
}

/**
 * Call OpenRouter chat-completions, walking the free-model fallback chain
 * for the requested mode. On transient failures (429 / 5xx across the whole
 * chain) we sleep briefly and retry the chain — this absorbs the short
 * "all free models 429 at once" bursts that would otherwise leak a user-
 * visible rate-limit message. Returns the first successful response, or a
 * structured failure if every retry exhausted.
 */
export async function aiChat(
    messages: ChatMessage[],
    opts: ChatOptions = {},
): Promise<ChatResult> {
    if (!aiKey()) {
        return { ok: false, status: 500, error: 'Missing AI_API_KEY / OPENROUTER_API_KEY' };
    }

    const chain = buildChain(opts);
    const allTried: string[] = [];
    let last: ChatResult | null = null;

    for (let attempt = 0; attempt <= CHAIN_RETRY_DELAYS_MS.length; attempt++) {
        if (attempt > 0) {
            // Brief backoff between full chain attempts. Free models often
            // recover within a couple of seconds.
            await sleep(CHAIN_RETRY_DELAYS_MS[attempt - 1], opts.signal);
            if (opts.signal?.aborted) break;
        }

        const { result, tried, fatal } = await walkChainOnce(chain, messages, opts);
        allTried.push(...tried);

        if (result?.ok) return { ...result, triedModels: allTried };
        if (result) last = result;
        if (fatal) break;
        // Only keep retrying if we exhausted on a transient class of error.
        if (last && !TRANSIENT_STATUSES.has(last.status)) break;
    }

    return {
        ok: false,
        status: last?.status ?? 500,
        error: last?.error ?? 'all free models failed',
        raw: last?.raw,
        model: last?.model,
        triedModels: allTried,
    };
}

/**
 * Streaming chat completion. Returns a Response whose body is a
 * server-sent-event stream of plain text deltas — frontend reads
 * `response.body` with a stream reader and appends as chunks arrive.
 *
 * Frame format (per chunk, separated by \n\n):
 *   event: meta\ndata: {"model":"..."}
 *   event: delta\ndata: {"text":"..."}
 *   event: done\ndata: {}
 *   event: error\ndata: {"error":"..."}
 *
 * Walks the same fallback chain + cooldown cache as `aiChat`. If no model
 * in the chain accepts a streaming connection, the final `error` event
 * carries the last failure.
 */
export async function aiChatStream(
    messages: ChatMessage[],
    opts: ChatOptions = {},
): Promise<Response> {
    const encoder = new TextEncoder();
    const writeFrame = (
        controller: ReadableStreamDefaultController<Uint8Array>,
        event: string,
        data: unknown,
    ) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
    };

    if (!aiKey()) {
        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                writeFrame(controller, 'error', { error: 'Missing AI_API_KEY' });
                controller.close();
            },
        });
        return new Response(stream, {
            status: 500,
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        });
    }

    const chain = buildChain(opts);

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const allTried: string[] = [];
            let lastStatus = 0;

            // Try the entire chain up to N attempts, sleeping briefly between
            // attempts. This absorbs transient "all-free-busy" bursts before
            // we ever surface anything to the user. As soon as ONE model
            // streams real text, we relay that and finish.
            for (let attempt = 0; attempt <= CHAIN_RETRY_DELAYS_MS.length; attempt++) {
                if (attempt > 0) {
                    await sleep(CHAIN_RETRY_DELAYS_MS[attempt - 1], opts.signal);
                    if (opts.signal?.aborted) break;
                }

                const fresh = chain.filter(m => !isRateLimited(m));
                const ordered = fresh.length ? fresh : chain;
                let fatal = false;

                for (const model of ordered) {
                    allTried.push(model);
                    const body: Record<string, unknown> = {
                        model,
                        messages,
                        temperature: opts.temperature ?? 0.3,
                        max_tokens: opts.maxTokens ?? (Number(process.env.AI_MAX_TOKENS) || 1500),
                        stream: true,
                    };
                    if (opts.responseFormat) body.response_format = opts.responseFormat;

                    let upstream: Response;
                    try {
                        upstream = await fetch(`${aiBase()}/chat/completions`, {
                            method: 'POST',
                            headers: aiHeaders(),
                            body: JSON.stringify(body),
                            signal: opts.signal,
                        });
                    } catch {
                        lastStatus = 0;
                        continue;
                    }

                    if (!upstream.ok) {
                        let raw: unknown = null;
                        try { raw = await upstream.json(); } catch { /* ignore */ }
                        const code = (raw as { error?: { code?: number } })?.error?.code ?? upstream.status;
                        if (code === 429) markRateLimited(model, extractRetryAfter(raw));
                        lastStatus = code;
                        if (shouldFallback(code)) continue;
                        // Non-transient — stop everything.
                        fatal = true;
                        break;
                    }

                    if (!upstream.body) {
                        lastStatus = 502;
                        continue;
                    }

                    writeFrame(controller, 'meta', { model, tried: allTried });

                    const reader = upstream.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    let gotAnyText = false;
                    try {
                        for (;;) {
                            const { value, done } = await reader.read();
                            if (done) break;
                            buffer += decoder.decode(value, { stream: true });
                            let nl: number;
                            while ((nl = buffer.indexOf('\n')) !== -1) {
                                const line = buffer.slice(0, nl).trim();
                                buffer = buffer.slice(nl + 1);
                                if (!line || line.startsWith(':')) continue;
                                if (!line.startsWith('data:')) continue;
                                const payload = line.slice(5).trim();
                                if (payload === '[DONE]') break;
                                try {
                                    const json = JSON.parse(payload);
                                    const delta = json?.choices?.[0]?.delta?.content;
                                    if (typeof delta === 'string' && delta.length) {
                                        gotAnyText = true;
                                        writeFrame(controller, 'delta', { text: delta });
                                    }
                                } catch {
                                    /* ignore parse errors on heartbeat lines */
                                }
                            }
                        }
                    } catch {
                        /* stream read failed — fall through to next model */
                    }

                    if (gotAnyText) {
                        writeFrame(controller, 'done', { model });
                        controller.close();
                        return;
                    }
                    // empty stream — try the next model
                    lastStatus = 502;
                }

                if (fatal) break;
                // If we exhausted the chain on a non-transient class, don't retry.
                if (!TRANSIENT_STATUSES.has(lastStatus)) break;
            }

            // All retries exhausted. Emit a friendly assistant-style delta
            // (NOT an error frame) so the client renders this naturally as
            // a chat reply. The frontend treats `done` as a successful turn.
            writeFrame(controller, 'delta', { text: AI_BUSY_REPLY });
            writeFrame(controller, 'done', { model: 'fallback' });
            controller.close();
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            Connection: 'keep-alive',
        },
    });
}
