import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Medical glossary — terms, abbreviations & jargon explained',
    description:
        'Plain-English explanations of medical terms, abbreviations, and jargon. From "ABG" to "Zoonosis" — searchable and patient-friendly.',
    keywords: ['medical glossary', 'medical terms', 'medical abbreviations'],
    openGraph: {
        title: 'Medical glossary',
        description: 'Plain-English explanations of medical terms and abbreviations.',
        url: 'https://aihealz.com/tools/glossary',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Medical glossary',
        description: 'Plain-English medical terms and abbreviations.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/glossary' },
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
