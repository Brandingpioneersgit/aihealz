import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import {
    CHAT_LEAD_COOKIE,
    CHAT_LEAD_COOKIE_MAX_AGE,
    CHAT_LEAD_DAILY_LIMIT,
    getChatLeadStatus,
    hashIp,
    signLeadCookie,
} from '@/lib/chat-gate';

const leadSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().toLowerCase().email('Invalid email').max(160),
    phone: z.string().trim().min(5, 'Phone is required').max(40),
    country: z.string().trim().max(80).optional().or(z.literal('')),
    city: z.string().trim().max(120).optional().or(z.literal('')),
    role: z.enum(['doctor', 'patient', 'other']),
});

function cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: isProd,
        path: '/',
        maxAge: CHAT_LEAD_COOKIE_MAX_AGE,
    };
}

export async function GET(req: NextRequest) {
    const status = await getChatLeadStatus(req);
    return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
    const clientId = getClientIdentifier(req);
    const rl = await checkRateLimit(`chat-lead:${clientId}`, RATE_LIMITS.form);
    if (!rl.success) {
        return NextResponse.json(
            { error: 'Too many sign-ups. Please wait a minute and try again.' },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
            { status: 400 }
        );
    }

    const { name, email, phone, country, city, role } = parsed.data;
    const ipHash = hashIp(clientId);
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null;

    const existing = await prisma.chatLead.findFirst({ where: { email } });
    const lead = existing
        ? await prisma.chatLead.update({
              where: { id: existing.id },
              data: {
                  name,
                  phone,
                  country: country || null,
                  city: city || null,
                  role,
                  ipHash,
                  userAgent,
              },
              select: { id: true, role: true },
          })
        : await prisma.chatLead.create({
              data: {
                  name,
                  email,
                  phone,
                  country: country || null,
                  city: city || null,
                  role,
                  ipHash,
                  userAgent,
              },
              select: { id: true, role: true },
          });

    const status = await getChatLeadStatus(req);

    const res = NextResponse.json({
        leadId: lead.id,
        role: lead.role,
        registered: true,
        remaining: status.remaining,
        limit: CHAT_LEAD_DAILY_LIMIT,
        resetAt: status.resetAt,
    });

    res.cookies.set(CHAT_LEAD_COOKIE, signLeadCookie(lead.id), cookieOptions());
    return res;
}
