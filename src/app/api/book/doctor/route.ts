import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Rate limit: 5 booking requests per minute
const BOOK_RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 };

export async function POST(req: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(`book-doctor:${clientId}`, BOOK_RATE_LIMIT);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    try {
        const body = await req.json();
        const {
            patientName,
            phone,
            email,
            preferredDate,
            preferredTime,
            reason,
            isNewPatient,
            doctorSlug,
            doctorName,
        } = body as Record<string, string | undefined>;

        // Validate required fields
        if (!patientName || !phone || !preferredDate) {
            return NextResponse.json(
                { error: 'Name, phone, and preferred date are required' },
                { status: 400 }
            );
        }

        // Basic phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return NextResponse.json(
                { error: 'Please enter a valid phone number' },
                { status: 400 }
            );
        }

        // Persist to ContactSubmission so the admin team has a queryable
        // record. We don't have a dedicated DoctorBooking model yet, so the
        // booking details are serialized into the message payload with a
        // distinct `source` so the admin UI can filter for them later.
        const message = JSON.stringify({
            doctor: { slug: doctorSlug || null, name: doctorName || null },
            patient: { name: patientName, phone: cleanPhone, isNewPatient: isNewPatient || null },
            requested: { date: preferredDate, time: preferredTime || null },
            reason: reason || null,
            clientId,
            timestamp: new Date().toISOString(),
        }, null, 2);

        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || null;

        const submission = await prisma.contactSubmission.create({
            data: {
                name: patientName.slice(0, 100),
                email: (email || `${cleanPhone}@no-email.aihealz.local`).slice(0, 200),
                message,
                source: 'book_doctor',
                ipAddress: ipAddress?.slice(0, 45) || null,
                userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
            },
            select: { id: true },
        });

        return NextResponse.json({ success: true, id: submission.id });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json(
            { error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}
