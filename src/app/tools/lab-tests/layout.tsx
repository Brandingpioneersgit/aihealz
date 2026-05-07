import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lab tests reference — interpret blood, urine & imaging results',
    description:
        'Understand common lab tests: reference ranges, what abnormal results mean, prep instructions, and follow-up steps. CBC, lipid panel, LFT, KFT and more.',
    keywords: ['lab tests', 'blood test', 'reference ranges', 'lab interpretation'],
    openGraph: {
        title: 'Lab tests reference',
        description: 'Reference ranges and interpretation for common lab tests.',
        url: 'https://aihealz.com/tools/lab-tests',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lab tests reference',
        description: 'Reference ranges and interpretation for common lab tests.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/lab-tests' },
};

export default function LabTestsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
