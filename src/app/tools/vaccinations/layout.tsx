import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vaccinations schedule — children, adults & travel',
    description:
        'Recommended vaccination schedules for infants, children, adults, pregnancy, and international travel. Side effects, timing, and catch-up doses.',
    keywords: ['vaccinations', 'immunization schedule', 'travel vaccines'],
    openGraph: {
        title: 'Vaccinations schedule',
        description: 'Recommended schedules for children, adults, pregnancy, and travel.',
        url: 'https://aihealz.com/tools/vaccinations',
        siteName: 'aihealz',
        type: 'website',
        images: [{ url: '/og-tools.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Vaccinations schedule',
        description: 'Schedules for children, adults, pregnancy, and travel.',
    },
    alternates: { canonical: 'https://aihealz.com/tools/vaccinations' },
};

export default function VaccinationsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
