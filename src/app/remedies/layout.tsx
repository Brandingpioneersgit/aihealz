import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Home remedies & natural treatments',
    description:
        'Evidence-informed home remedies and natural treatments for common conditions — what works, what does not, and when to see a doctor.',
    openGraph: {
        title: 'Home remedies & natural treatments',
        description:
            'Evidence-informed home remedies for common conditions — what works and what does not.',
        url: 'https://aihealz.com/remedies',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Home remedies & natural treatments',
        description: 'Evidence-informed home remedies for common conditions.',
    },
    alternates: { canonical: '/remedies' },
};

export default function RemediesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
