import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
    title: 'Ask Healz — AI medical assistant',
    description:
        'Ask Healz, the AI medical assistant. Get instant, evidence-based answers about symptoms, conditions, treatments, and medications worldwide.',
    openGraph: {
        title: 'Ask Healz — AI medical assistant',
        description:
            'Ask Healz, the AI medical assistant. Instant, evidence-based answers about symptoms, conditions, and treatments.',
        url: 'https://aihealz.com/healz-ai',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ask Healz — AI medical assistant',
        description:
            'Instant, evidence-based answers about symptoms, conditions, and treatments.',
    },
    alternates: { canonical: '/healz-ai' },
};

const healzAiSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebApplication',
            '@id': 'https://aihealz.com/healz-ai#app',
            name: 'Healz AI Medical Assistant',
            url: 'https://aihealz.com/healz-ai',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            browserRequirements: 'Requires JavaScript',
            description: 'Ask Healz, the AI medical assistant. Instant, evidence-based answers about symptoms, conditions, treatments, and medications.',
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
            publisher: { '@id': 'https://aihealz.com/#organization' },
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
                { '@type': 'ListItem', position: 2, name: 'Healz AI', item: 'https://aihealz.com/healz-ai' },
            ],
        },
    ],
};

export default function HealzAiLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Script
                id="healz-ai-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(healzAiSchema) }}
            />
            {children}
        </>
    );
}
