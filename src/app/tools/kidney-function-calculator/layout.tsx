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

export default function KidneyCalculatorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
