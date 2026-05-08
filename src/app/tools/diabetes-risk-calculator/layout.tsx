import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Diabetes Risk Calculator - Type 2 Diabetes Risk Assessment | AIHealz',
    description: 'Assess your risk of developing Type 2 diabetes. Calculate diabetes risk based on age, BMI, family history, and lifestyle factors. Free diabetes risk calculator.',
    keywords: 'diabetes risk calculator, type 2 diabetes risk, diabetes assessment, prediabetes risk, blood sugar risk, diabetes prevention, metabolic risk calculator',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'Diabetes Risk Calculator - Check Your Type 2 Diabetes Risk',
        description: 'Assess your risk of developing Type 2 diabetes based on key risk factors. Free diabetes risk assessment tool.',
        url: 'https://aihealz.com/tools/diabetes-risk-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Diabetes Risk Calculator - Check Your Type 2 Diabetes Risk',
        description: 'Assess your risk of developing Type 2 diabetes based on key risk factors. Free diabetes risk assessment tool.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/diabetes-risk-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'MedicalRiskEstimator'],
    name: 'Type 2 Diabetes Risk Calculator',
    url: 'https://aihealz.com/tools/diabetes-risk-calculator',
    description: 'Assess your risk of developing Type 2 diabetes based on age, BMI, family history and lifestyle.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function DiabetesRiskCalculatorLayout({ children }: { children: React.ReactNode }) {
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
