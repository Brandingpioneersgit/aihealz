import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pregnancy Due Date Calculator - Calculate Your Due Date | AIHealz',
    description: 'Calculate your estimated due date and current pregnancy week. Track your pregnancy trimester with our free due date calculator based on your last menstrual period.',
    keywords: 'due date calculator, pregnancy calculator, estimated due date, EDD calculator, pregnancy week calculator, trimester calculator, LMP calculator, pregnancy tracker',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'Pregnancy Due Date Calculator - When Is Your Baby Due?',
        description: 'Calculate your estimated due date, pregnancy week, and trimester. Free pregnancy calculator based on LMP.',
        url: 'https://aihealz.com/tools/pregnancy-due-date-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pregnancy Due Date Calculator - When Is Your Baby Due?',
        description: 'Calculate your estimated due date, pregnancy week, and trimester. Free pregnancy calculator based on LMP.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/pregnancy-due-date-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pregnancy Due Date Calculator',
    url: 'https://aihealz.com/tools/pregnancy-due-date-calculator',
    description: 'Calculate your estimated due date, current pregnancy week, and trimester from your last menstrual period.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function PregnancyCalculatorLayout({ children }: { children: React.ReactNode }) {
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
