import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clinical reference for clinicians',
    description:
        'AI-powered clinical reference — drugs, guidelines, lab medicine, anatomy, procedures, and pill identification, in one place.',
    openGraph: {
        title: 'Clinical reference for clinicians',
        description:
            'AI-powered drug, guideline, lab, and procedure reference for clinicians.',
        url: 'https://aihealz.com/clinical-reference',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Clinical reference for clinicians',
        description:
            'AI-powered drug, guideline, lab, and procedure reference.',
    },
    alternates: { canonical: '/clinical-reference' },
};

export default function ClinicalReferenceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
