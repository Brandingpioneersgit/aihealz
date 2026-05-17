import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().default('blog'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = newsletterSchema.parse(body);

    // Check for duplicate
    const existing = await prisma.contactSubmission.findFirst({
      where: { email: data.email, source: 'newsletter' }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Store subscription
    await prisma.contactSubmission.create({
      data: {
        name: '',
        email: data.email,
        message: `Newsletter subscription from: ${data.source}`,
        source: 'newsletter',
        status: 'pending',
      }
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}