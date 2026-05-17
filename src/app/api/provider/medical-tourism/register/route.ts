import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const medicalTourismRegisterSchema = z.object({
    providerType: z.enum(['hcf', 'agency']),
    companyName: z.string().min(2, 'Company name is required').max(300).trim(),
    legalName: z.string().max(300).optional(),
    registrationNumber: z.string().max(100).optional(),
    establishedYear: z.string().max(4).optional(),
    website: z.string().url().max(500).optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required').max(500).trim(),
    city: z.string().min(2, 'City is required').max(100).trim(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).default('India'),
    phone: z.string().min(10, 'Phone number is required').max(20).trim(),
    email: z.string().email('Invalid email address').max(200).toLowerCase().trim(),
    whatsapp: z.string().max(20).optional(),
    servicesOffered: z.array(z.string()).default([]),
    specializations: z.array(z.string()).default([]),
    destinationCountries: z.array(z.string()).default([]),
    sourceCountries: z.array(z.string()).default([]),
    languagesSupported: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
    hospitalPartners: z.string().max(500).optional(),
    insurancePartners: z.string().max(500).optional(),
    adminName: z.string().min(2, 'Admin name is required').max(100).trim(),
    adminDesignation: z.string().max(100).optional(),
    adminPhone: z.string().max(20).optional(),
    adminEmail: z.string().email('Invalid admin email').max(200).toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(`medicalTourismRegister:${clientId}`, RATE_LIMITS.form);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many submissions. Please wait before trying again.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    try {
        const body = await req.json();
        const validation = medicalTourismRegisterSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Check if admin email already exists
        const existingAuth = await prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM provider_auth WHERE email = ${data.adminEmail} LIMIT 1
        `;
        if (existingAuth.length > 0) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login instead.' },
                { status: 400 }
            );
        }

        // Generate unique slug
        const baseSlug = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${randomStr}`;

        // Find geography
        let geographyId: number | null = null;
        const geoMatch = await prisma.geography.findFirst({
            where: {
                name: { contains: data.city, mode: 'insensitive' },
                isActive: true,
            },
        });
        if (geoMatch) {
            geographyId = geoMatch.id;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create medical tourism provider (storing in DiagnosticProvider as it's the only provider table)
        const provider = await prisma.diagnosticProvider.create({
            data: {
                slug,
                name: data.companyName,
                // DiagnosticProvider table is the only provider storage available; its enum doesn't
                // include 'agency', so map both inputs to 'hospital'. The agency/hospital
                // distinction stays in description + operatingHours.providerType below.
                providerType: 'hospital',
                description: `Medical Tourism Provider - ${data.providerType}. Services: ${data.servicesOffered.join(', ')}`,
                geographyId,
                address: `${data.address}${data.state ? `, ${data.state}` : ''}`,
                phone: data.phone,
                email: data.email,
                website: data.website || null,
                operatingHours: {
                    displayText: '',
                    adminName: data.adminName,
                    adminDesignation: data.adminDesignation || null,
                    adminPhone: data.adminPhone || null,
                    adminEmail: data.adminEmail,
                    whatsapp: data.whatsapp || null,
                    servicesOffered: data.servicesOffered,
                    specializations: data.specializations,
                    destinationCountries: data.destinationCountries,
                    sourceCountries: data.sourceCountries,
                    languagesSupported: data.languagesSupported,
                    certifications: data.certifications,
                    hospitalPartners: data.hospitalPartners || null,
                    insurancePartners: data.insurancePartners || null,
                    establishedYear: data.establishedYear || null,
                    registrationNumber: data.registrationNumber || null,
                    country: data.country,
                    signupDate: new Date().toISOString(),
                } as any,
                isVerified: true,
                subscriptionTier: 'free',
                isActive: true,
                isPartner: true,
            }
        });

        // Create provider_auth
        await prisma.$executeRaw`
            INSERT INTO provider_auth (agency_id, email, password_hash, provider_type, created_at)
            VALUES (${provider.id}, ${data.adminEmail}, ${passwordHash}, 'agency', NOW())
            ON CONFLICT (email) DO NOTHING
        `;

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.$executeRaw`
            INSERT INTO provider_sessions (agency_id, session_hash, expires_at, created_at)
            VALUES (${provider.id}, ${sessionHash}, ${expiresAt}, NOW())
        `;

        return NextResponse.json({
            success: true,
            message: 'Medical tourism provider registered successfully!',
            provider: {
                id: provider.id,
                name: provider.name,
                slug: provider.slug,
                email: data.adminEmail,
            },
            session: {
                token: sessionToken,
                expiresAt: expiresAt.toISOString(),
            },
            redirectTo: '/provider/dashboard?welcome=true',
        });

    } catch (error) {
        console.error('Medical tourism registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register. Please try again later.' },
            { status: 500 }
        );
    }
}