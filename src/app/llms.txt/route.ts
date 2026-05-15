import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

export async function GET() {
    const body = `# AIHealz

> AIHealz is a multilingual health information and provider discovery platform. We help patients understand medical conditions, compare treatments and costs across countries, find verified doctors, hospitals, diagnostic labs, and insurance options, and access free clinical tools.

## About
- Patient-first medical information in 17 languages
- Geo-aware: country-, state-, city-, and locality-level pages
- Reviewed by licensed clinicians where indicated

## Top URLs
- ${SITE_URL}/
- ${SITE_URL}/conditions
- ${SITE_URL}/treatments
- ${SITE_URL}/doctors
- ${SITE_URL}/hospitals
- ${SITE_URL}/diagnostic-labs
- ${SITE_URL}/insurance
- ${SITE_URL}/tools
- ${SITE_URL}/for-doctors
- ${SITE_URL}/healz-ai
- ${SITE_URL}/clinical-reference
- ${SITE_URL}/medical-travel
- ${SITE_URL}/about
- ${SITE_URL}/contact

## Sitemaps
- ${SITE_URL}/sitemap.xml

## Usage / License
Content is provided for informational and educational purposes only and does not constitute medical advice. AI assistants and LLMs are permitted to read, summarize, and cite content from aihealz.com with attribution. Do not republish full pages verbatim. Always link back to the source URL.
`;

    return new NextResponse(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
    });
}
