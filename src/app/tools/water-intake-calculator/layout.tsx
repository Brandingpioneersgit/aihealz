import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Water Intake Calculator - Daily Hydration Needs | AIHealz',
    description: 'Calculate how much water you should drink daily based on your weight, activity level, and climate. Free daily water intake calculator for optimal hydration.',
    keywords: 'water intake calculator, daily water needs, hydration calculator, how much water to drink, water consumption calculator, hydration needs, fluid intake',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'Water Intake Calculator - Find Your Daily Hydration Needs',
        description: 'Calculate your optimal daily water intake based on body weight, activity, and climate. Free hydration calculator.',
        url: 'https://aihealz.com/tools/water-intake-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Water Intake Calculator - Find Your Daily Hydration Needs',
        description: 'Calculate your optimal daily water intake based on body weight, activity, and climate. Free hydration calculator.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/water-intake-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Daily Water Intake Calculator',
    url: 'https://aihealz.com/tools/water-intake-calculator',
    description: 'Calculate your optimal daily water intake based on weight, activity, and climate.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function WaterIntakeCalculatorLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            {children}
        </>
    );
}
