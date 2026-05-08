import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kidney Function Calculator (eGFR) - Check Kidney Health | AIHealz',
    description: 'Calculate your eGFR (estimated Glomerular Filtration Rate) to assess kidney function. Understand CKD stages and kidney health. Free eGFR calculator.',
    keywords: 'eGFR calculator, kidney function calculator, GFR calculator, kidney health, chronic kidney disease, CKD stages, creatinine calculator, nephrology calculator',
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'eGFR Calculator - Check Your Kidney Function',
        description: 'Calculate your estimated GFR to assess kidney health and function. Understand chronic kidney disease stages.',
        url: 'https://aihealz.com/tools/kidney-function-calculator',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'eGFR Calculator - Check Your Kidney Function',
        description: 'Calculate your estimated GFR to assess kidney health and function. Understand chronic kidney disease stages.',
    },
    alternates: {
        canonical: 'https://aihealz.com/tools/kidney-function-calculator',
    },
};

const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kidney Function (eGFR) Calculator',
    url: 'https://aihealz.com/tools/kidney-function-calculator',
    description: 'Estimate your Glomerular Filtration Rate to assess kidney health and CKD stage.',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'aihealz', url: 'https://aihealz.com' },
};

export default function KidneyCalculatorLayout({ children }: { children: React.ReactNode }) {
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
