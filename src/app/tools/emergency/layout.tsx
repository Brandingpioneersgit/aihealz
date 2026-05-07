import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Emergency services — hotlines, hospitals & first aid',
    description:
        'Emergency hotlines, nearest 24x7 hospitals, ambulance numbers, and quick first-aid steps for cardiac arrest, choking, stroke, burns and more.',
    keywords: ['emergency services', 'ambulance', 'first aid', 'emergency hotlines'],
    openGraph: {
        title: 'Emergency services & first aid',
        description: 'Emergency hotlines, hospitals, and quick first-aid steps.',
        url: 'https://aihealz.com/tools/emergency',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Emergency services & first aid',
        description: 'Hotlines, hospitals, and quick first-aid steps.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/emergency' },
};

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
