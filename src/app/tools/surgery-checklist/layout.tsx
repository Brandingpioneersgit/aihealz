import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Surgery checklists — pre-op, intra-op & post-op',
    description:
        'WHO-aligned surgery checklists for patients and clinicians. Pre-op preparation, intra-operative safety steps, and post-op recovery checks.',
    keywords: ['surgery checklist', 'pre-op', 'post-op', 'WHO surgical safety'],
    openGraph: {
        title: 'Surgery checklists',
        description: 'WHO-aligned surgical safety checklists for patients and clinicians.',
        url: 'https://aihealz.com/tools/surgery-checklist',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Surgery checklists',
        description: 'WHO-aligned surgical safety checklists.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/surgery-checklist' },
};

export default function SurgeryChecklistLayout({ children }: { children: React.ReactNode }) {
    return children;
}
