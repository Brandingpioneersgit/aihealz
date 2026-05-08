import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Heart Disease Risk Calculator - Cardiovascular Risk Assessment | AIHealz',
    description: 'Calculate your 10-year heart disease risk. Assess cardiovascular risk factors including blood pressure, cholesterol, smoking, and diabetes. Free heart risk calculator.',
    keywords: 'heart risk calculator, cardiovascular risk, heart disease risk, cardiac risk assessment, heart health calculator, CVD risk, blood pressure risk, cholesterol risk',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'Heart Disease Risk Calculator - Check Your Cardiovascular Health',
        description: 'Estimate your 10-year risk of heart disease based on key risk factors. Free cardiovascular risk assessment.',
        url: 'https://aihealz.com/tools/heart-risk-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Heart Disease Risk Calculator - Check Your Cardiovascular Health',
        description: 'Estimate your 10-year risk of heart disease based on key risk factors. Free cardiovascular risk assessment.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/heart-risk-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'MedicalRiskEstimator'],
    name: '10-Year Heart Disease Risk Calculator',
    url: 'https://aihealz.com/tools/heart-risk-calculator',
    description: 'Estimate your 10-year cardiovascular disease risk based on key risk factors.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function HeartRiskCalculatorLayout({ children }: { children: React.ReactNode }) {
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
