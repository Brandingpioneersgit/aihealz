import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReferenceChat from '@/components/ui/reference-chat';

type CategorySlug =
    | 'drugs'
    | 'guidelines'
    | 'lab-medicine'
    | 'anatomy'
    | 'procedures'
    | 'slideshows'
    | 'simulations'
    | 'drug-interaction'
    | 'pill-identifier';

const CATEGORY_MAP: Record<CategorySlug, { title: string; desc: string; placeholder: string; example: string }> = {
    'drugs': {
        title: 'Drugs, OTCs, & Herbals',
        desc: 'Advanced pharmacology insights, dosage guidelines, side effects, and off-label usages powered by clinical AI.',
        placeholder: 'Enter drug name (e.g., Atorvastatin, Ashwagandha)...',
        example: 'What is the standard pediatric dosing for Amoxicillin in acute otitis media?'
    },
    'guidelines': {
        title: 'Latest Clinical Guidelines',
        desc: 'Ask our AI to parse thousands of updated clinical guidelines from ACC, AHA, ADA, AAP, and more.',
        placeholder: 'Search guidelines (e.g., AHA Heart Failure 2023)...',
        example: 'Summarize the 2023 ACC/AHA guidelines for the management of patients with chronic coronary disease.'
    },
    'lab-medicine': {
        title: 'Laboratory Medicine',
        desc: 'Interpret complex lab results, reference ranges, and diagnostic algorithms instantly.',
        placeholder: 'Enter lab test or result...',
        example: 'Explain elevated ALT and AST with a ratio greater than 2:1.'
    },
    'anatomy': {
        title: 'Clinical Anatomy',
        desc: 'Explore detailed anatomical structures, innervation, blood supply, and surgical relevance.',
        placeholder: 'Enter anatomical structure...',
        example: 'Detail the arterial supply and venous drainage of the thyroid gland.'
    },
    'procedures': {
        title: 'Medical Procedures',
        desc: 'Step-by-step clinical procedure guides, contraindications, and complication management.',
        placeholder: 'Enter procedure name...',
        example: 'What are the absolute contraindications for a lumbar puncture?'
    },
    'slideshows': {
        title: 'Clinical Slideshows',
        desc: 'Visual diagnostic guides and clinical presentation breakdowns.',
        placeholder: 'Search visual presentations...',
        example: 'Show me classic ECG findings in hyperkalemia.'
    },
    'simulations': {
        title: 'Cases & Quizzes',
        desc: 'Test your clinical acumen against AI-generated patient scenarios and board-style quizzes.',
        placeholder: 'Start a simulation (e.g., ER Trauma case)...',
        example: 'Present a 55-year-old male with crushing chest pain and diaphoresis.'
    },
    'drug-interaction': {
        title: 'Drug Interaction Checker',
        desc: 'Analyze complex polypharmacy for adverse interactions and metabolic pathway conflicts.',
        placeholder: 'Enter multiple drugs (comma separated)...',
        example: 'Check interactions between Warfarin, Amiodarone, and Grapefruit juice.'
    },
    'pill-identifier': {
        title: 'Pill Identifier',
        desc: 'Identify unknown medications by imprint, shape, and color using AI vision and database cross-referencing.',
        placeholder: 'Describe pill (e.g., Round, White, Imprint 54 411)...',
        example: 'Identify a capsule shaped, blue pill with "V 3202" imprinted.'
    }
};

export function generateStaticParams() {
    return (Object.keys(CATEGORY_MAP) as CategorySlug[]).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const categoryKey = category as CategorySlug;
    if (!CATEGORY_MAP[categoryKey]) return { title: 'Not Found' };

    return {
        title: `${CATEGORY_MAP[categoryKey].title} — AI Reference | aihealz`,
        description: CATEGORY_MAP[categoryKey].desc,
    };
}

export default async function ReferencePage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const categoryKey = category as CategorySlug;
    const data = CATEGORY_MAP[categoryKey];

    if (!data) {
        notFound();
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 28px' }} className="col gap-6">
                {/* Breadcrumb */}
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        flexWrap: 'wrap',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/for-doctors" style={{ color: 'var(--ink-3)' }}>For Doctors</Link>
                    <span aria-hidden="true">/</span>
                    <span style={{ color: 'var(--ink)' }}>{data.title}</span>
                </nav>

                {/* Hero */}
                <div className="col gap-3">
                    <span className="section-mark">ai clinical reference</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 56px)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                            maxWidth: 760,
                        }}
                    >
                        {data.title}
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 18, margin: 0, maxWidth: 720 }}>
                        {data.desc}
                    </p>
                </div>

                {/* Chat interface */}
                <div className="col gap-3">
                    <ReferenceChat
                        category={category}
                        placeholder={data.placeholder}
                        example={data.example}
                        title={data.title}
                    />
                </div>

                {/* Contextual link */}
                <div className="card col gap-2 ai-center" style={{ padding: 24, textAlign: 'center' }}>
                    <span className="kicker"><span className="dot" />need a human?</span>
                    <Link
                        href="/doctors"
                        className="mono"
                        style={{ fontSize: 13, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}
                    >
                        Search our verified directory →
                    </Link>
                </div>
            </div>
        </main>
    );
}
