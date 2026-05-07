import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createAdminSession } from '@/lib/admin-auth';
import { checkRateLimit as sharedCheckRateLimit } from '@/lib/rate-limit';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aihealz.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Rate limiting: 5 attempts / 15 min / IP. Backed by Redis when REDIS_URL
// is set (durable across processes); otherwise in-memory.
const ADMIN_AUTH_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };

function sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function timingSafeStringEqual(a: string, b: string): boolean {
    const len = Math.max(a.length, b.length);
    const bufA = Buffer.from(a.padEnd(len, '\0'));
    const bufB = Buffer.from(b.padEnd(len, '\0'));
    return crypto.timingSafeEqual(bufA, bufB);
}

// Detect bcrypt-format hashes ($2a$, $2b$, $2y$, $2x$).
function isBcryptHash(hash: string): boolean {
    return /^\$2[abxy]\$\d{1,2}\$/.test(hash);
}

let warnedLegacyHash = false;
async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
    if (isBcryptHash(storedHash)) {
        return bcrypt.compare(plain, storedHash);
    }
    if (!warnedLegacyHash) {
        console.warn('[Admin Auth] ADMIN_PASSWORD_HASH is in legacy SHA-256 format. Rotate to bcrypt: bcrypt.hashSync(password, 12)');
        warnedLegacyHash = true;
    }
    return timingSafeStringEqual(sha256Hex(plain), storedHash);
}

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export async function POST(req: NextRequest) {
    const clientIP = getClientIP(req);

    if (!ADMIN_PASSWORD_HASH) {
        console.error('[Admin Auth] ADMIN_PASSWORD_HASH is not configured — refusing login.');
        return NextResponse.json(
            { error: 'Admin login is not configured.' },
            { status: 503 }
        );
    }

    const rateCheck = await sharedCheckRateLimit(`admin-auth:${clientIP}`, ADMIN_AUTH_LIMIT);
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please try again in 15 minutes.' },
            { status: 429 }
        );
    }

    try {
        const { email, password } = await req.json();

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Always run a password comparison (even when email is wrong) so the
        // response time doesn't reveal whether the email exists.
        const emailMatches = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const passwordMatches = await verifyPassword(password, ADMIN_PASSWORD_HASH);

        if (!emailMatches || !passwordMatches) {
            // Rate limiter above already counted this attempt against the budget.
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Issue a real signed session token (HMAC, 8h expiry).
        const token = createAdminSession(ADMIN_EMAIL.toLowerCase(), 8 * 60 * 60 * 1000);

        console.log(`[ADMIN AUTH] Successful login from ${clientIP} at ${new Date().toISOString()}`);

        const res = NextResponse.json({
            success: true,
            email: ADMIN_EMAIL,
            token,
        });

        // Also set the signed token as an httpOnly cookie so server-side
        // middleware (checkAdminAuth) can verify subsequent requests without
        // requiring the client to attach an Authorization header.
        res.cookies.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 8 * 60 * 60,
        });

        return res;
    } catch (error) {
        console.error('[ADMIN AUTH] Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Logout endpoint - clear session cookie
export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
    return res;
}
