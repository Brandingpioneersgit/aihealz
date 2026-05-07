import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Drug interactions checker — safety & contraindications',
    description:
        'Check drug-drug interactions, contraindications, and food-drug interactions for prescription and OTC medications. Severity-rated, evidence-backed.',
    keywords: ['drug interactions', 'medication safety', 'contraindications'],
    openGraph: {
        title: 'Drug interactions checker',
        description: 'Severity-rated drug interaction checker.',
        url: 'https://aihealz.com/tools/drug-interactions',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Drug interactions checker',
        description: 'Severity-rated drug-drug and food-drug interactions.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/drug-interactions' },
};

export default function DrugInteractionsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
