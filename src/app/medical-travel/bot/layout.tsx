import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Medical travel concierge bot',
    description:
        'Plan medical travel with our concierge bot — surgeon match, cost negotiation, visa, flights, recovery stay and translator support, end to end.',
    openGraph: {
        title: 'Medical travel concierge bot',
        description:
            'Plan medical travel end to end — surgeon match, costs, visa, flights, recovery, translator.',
        url: 'https://aihealz.com/medical-travel/bot',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Medical travel concierge bot',
        description:
            'Surgeon match, cost negotiation, visa, flights, recovery — handled.',
    },
    alternates: { canonical: '/medical-travel/bot' },
};

export default function MedicalTravelBotLayout({ children }: { children: React.ReactNode }) {
    return children;
}
