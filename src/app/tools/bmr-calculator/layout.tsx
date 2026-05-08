import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'BMR Calculator - Basal Metabolic Rate & Daily Calorie Needs | AIHealz',
    description: 'Calculate your Basal Metabolic Rate (BMR) and daily calorie needs. Find calories for weight loss, maintenance, or muscle gain. Free BMR calculator.',
    keywords: 'BMR calculator, basal metabolic rate, calorie calculator, daily calories, TDEE calculator, calorie needs, weight loss calories, metabolism calculator',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'BMR & Calorie Calculator - Find Your Daily Calorie Needs',
        description: 'Calculate your BMR and daily calorie requirements for weight loss, maintenance, or gain. Free online calculator.',
        url: 'https://aihealz.com/tools/bmr-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BMR & Calorie Calculator - Find Your Daily Calorie Needs',
        description: 'Calculate your BMR and daily calorie requirements for weight loss, maintenance, or gain. Free online calculator.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/bmr-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BMR & Daily Calorie Calculator',
    url: 'https://aihealz.com/tools/bmr-calculator',
    description: 'Calculate your Basal Metabolic Rate and daily calorie needs.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function BMRCalculatorLayout({ children }: { children: React.ReactNode }) {
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
