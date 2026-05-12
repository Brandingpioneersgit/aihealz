import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { HERO_IMAGES } from '@/lib/stock-images';

export const revalidate = 604800;

export const metadata: Metadata = {
    title: 'Clinical Reference & Tools | AIHealz',
    description: 'Access comprehensive medical references, drug databases, clinical guidelines, health calculators, and diagnostic tools for healthcare professionals and patients.',
    alternates: { canonical: '/clinical-reference' },
    openGraph: {
        type: 'website',
        siteName: 'aihealz',
        title: 'Clinical Reference & Tools | AIHealz',
        description: 'Drug databases, guidelines, calculators, and diagnostic tools for clinicians and patients.',
        url: 'https://aihealz.com/clinical-reference',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Clinical Reference & Tools | AIHealz',
        description: 'Drug databases, guidelines, calculators, and diagnostic tools for clinicians and patients.',
    },
};

const REFERENCE_CATEGORIES = [
    {
        slug: 'drugs',
        code: 'DR',
        title: 'Drugs, OTCs, & herbals',
        description: 'Pharmacology insights, dosages, side effects, and interactions',
    },
    {
        slug: 'guidelines',
        code: 'GL',
        title: 'Latest guidelines',
        description: 'Updated clinical guidelines from ACC, AHA, ADA, and more',
    },
    {
        slug: 'lab-medicine',
        code: 'LB',
        title: 'Laboratory medicine',
        description: 'Lab result interpretation and reference ranges',
    },
    {
        slug: 'anatomy',
        code: 'AN',
        title: 'Clinical anatomy',
        description: 'Detailed anatomical structures and surgical relevance',
    },
    {
        slug: 'procedures',
        code: 'PR',
        title: 'Medical procedures',
        description: 'Step-by-step guides and complication management',
    },
    {
        slug: 'slideshows',
        code: 'SL',
        title: 'Clinical slideshows',
        description: 'Visual diagnostic guides and presentations',
    },
    {
        slug: 'simulations',
        code: 'SM',
        title: 'Cases & quizzes',
        description: 'AI-generated patient scenarios and board-style questions',
    },
    {
        slug: 'drug-interaction',
        code: 'IX',
        title: 'Interaction checker',
        description: 'Analyze polypharmacy for adverse drug interactions',
    },
    {
        slug: 'pill-identifier',
        code: 'PI',
        title: 'Pill identifier',
        description: 'Identify unknown medications by imprint, shape, color',
    },
];

const CALCULATOR_CATEGORIES = [
    { name: 'Body metrics', code: 'BM', calculators: ['BMI Calculator', 'Body Fat Percentage'] },
    { name: 'Cardiovascular', code: 'CV', calculators: ['Heart Disease Risk Score'] },
    { name: 'Nephrology', code: 'NP', calculators: ['Kidney Function (eGFR)'] },
    { name: 'Nutrition', code: 'NT', calculators: ['BMR & Calorie Calculator', 'Daily Water Intake'] },
    { name: 'Endocrinology', code: 'EN', calculators: ['Diabetes Risk Assessment'] },
    { name: 'Obstetrics', code: 'OB', calculators: ['Due Date Calculator'] },
];

const QUICK_TOOLS = [
    {
        href: '/symptoms',
        code: 'SX',
        kicker: 'symptom intelligence',
        title: 'Symptom checker',
        description: 'AI-powered symptom analysis to help identify potential conditions and specialist recommendations.',
    },
    {
        href: '/analyze',
        code: 'RX',
        kicker: 'report analysis',
        title: 'Report analyzer',
        description: 'Upload medical reports for AI analysis with plain-English explanations and recommendations.',
    },
    {
        href: '/doctors',
        code: 'DC',
        kicker: 'directory',
        title: 'Find a specialist',
        description: 'Search our verified directory of healthcare specialists by location and specialty.',
    },
];

export default function ClinicalReferencePage() {
    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }} className="col gap-7">

                {/* Hero banner */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '32 / 9',
                        maxHeight: 320,
                        overflow: 'hidden',
                        borderRadius: 'var(--r-3, 8px)',
                        border: '1px solid var(--rule)',
                    }}
                >
                    <Image
                        src={HERO_IMAGES.tools.src}
                        alt={HERO_IMAGES.tools.alt}
                        fill
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        priority
                        style={{ objectFit: 'cover' }}
                    />
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(90deg, rgba(10,26,47,0.55) 0%, rgba(10,26,47,0.20) 50%, rgba(10,26,47,0) 90%)',
                        }}
                    />
                    <span
                        className="mono"
                        style={{
                            position: 'absolute',
                            left: 'clamp(16px, 3vw, 28px)',
                            bottom: 18,
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            fontWeight: 500,
                        }}
                    >
                        ● the desk / clinical reference
                    </span>
                </div>

                {/* Breadcrumb */}
                <div
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Clinical Reference</span>
                </div>

                {/* Hero */}
                <header className="col gap-4">
                    <span className="section-mark">the desk / clinical reference</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 7vw, 84px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                            maxWidth: 880,
                        }}
                    >
                        Clinical reference{' '}
                        <span style={{ color: 'var(--cobalt)' }}>& tools</span>
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.55vw, 19px)', maxWidth: 680 }}>
                        Drug databases, evidence-based guidelines, anatomical references, and calculators — assembled in one place. Powered by AI for instant lookup, but always cross-checked against authoritative sources.
                    </p>
                    <div className="row gap-3 ai-center" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="pill pill-cobalt">{REFERENCE_CATEGORIES.length} reference modules</span>
                        <span className="pill pill-mint">{CALCULATOR_CATEGORIES.length} calculator categories</span>
                        <span className="kicker">evidence-based · updated continuously</span>
                    </div>
                </header>

                {/* Reference Library */}
                <section className="col gap-5" style={{ marginTop: 32 }}>
                    <div className="row between ai-end">
                        <div className="col gap-2">
                            <span className="section-mark">I / reference library</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                Medical reference modules.
                            </h2>
                        </div>
                        <span className="kicker">{REFERENCE_CATEGORIES.length} modules</span>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {REFERENCE_CATEGORIES.map((category, i) => {
                            const cols = 3;
                            const isLastRow = i >= REFERENCE_CATEGORIES.length - (REFERENCE_CATEGORIES.length % cols || cols);
                            const isLastCol = (i + 1) % cols === 0;
                            return (
                                <Link
                                    key={category.slug}
                                    href={`/reference/${category.slug}`}
                                    className="col gap-3"
                                    style={{
                                        padding: 22,
                                        borderRight: !isLastCol ? '1px solid var(--rule)' : 'none',
                                        borderBottom: !isLastRow ? '1px solid var(--rule)' : 'none',
                                        transition: 'background var(--transition-fast)',
                                    }}
                                >
                                    <div className="row between ai-start">
                                        <span className="spec-icon" aria-hidden="true">{category.code}</span>
                                        <span className="kicker">module · {String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
                                        {category.title}
                                    </h3>
                                    <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>
                                        {category.description}
                                    </p>
                                    <div className="row ai-center gap-2" style={{ marginTop: 4 }}>
                                        <span className="kicker" style={{ color: 'var(--cobalt)' }}>open module</span>
                                        <span style={{ color: 'var(--cobalt)', fontSize: 13 }}>→</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Calculators */}
                <section className="col gap-5" style={{ marginTop: 32 }}>
                    <div className="row between ai-end">
                        <div className="col gap-2">
                            <span className="section-mark">II / calculators</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                Health calculators.
                            </h2>
                        </div>
                        <Link href="/tools" className="btn btn-paper btn-sm">
                            View all →
                        </Link>
                    </div>

                    <p className="muted" style={{ margin: 0, fontSize: 14, maxWidth: 640 }}>
                        Evidence-based calculators for clinical assessments, screening, and lifestyle metrics.
                    </p>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {CALCULATOR_CATEGORIES.map((cat, i) => {
                            const cols = 3;
                            const isLastRow = i >= CALCULATOR_CATEGORIES.length - (CALCULATOR_CATEGORIES.length % cols || cols);
                            const isLastCol = (i + 1) % cols === 0;
                            return (
                                <Link
                                    key={cat.name}
                                    href="/tools"
                                    className="col gap-3"
                                    style={{
                                        padding: 22,
                                        borderRight: !isLastCol ? '1px solid var(--rule)' : 'none',
                                        borderBottom: !isLastRow ? '1px solid var(--rule)' : 'none',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <span className="spec-icon" aria-hidden="true">{cat.code}</span>
                                        <span className="kicker">{cat.calculators.length} tool{cat.calculators.length === 1 ? '' : 's'}</span>
                                    </div>
                                    <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>
                                        {cat.name}
                                    </h3>
                                    <ul className="clean col gap-1">
                                        {cat.calculators.map((calc) => (
                                            <li key={calc} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                                                · {calc}
                                            </li>
                                        ))}
                                    </ul>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Quick Access Tools */}
                <section className="col gap-5" style={{ marginTop: 32 }}>
                    <div className="row between ai-end">
                        <div className="col gap-2">
                            <span className="section-mark">III / quick access</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                AI-powered tools.
                            </h2>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {QUICK_TOOLS.map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="card col gap-4"
                                style={{ padding: 24, transition: 'border-color var(--transition-fast)' }}
                            >
                                <div className="row between ai-start">
                                    <span className="spec-icon" aria-hidden="true">{tool.code}</span>
                                    <span className="pill pill-cobalt">live</span>
                                </div>
                                <div className="col gap-2">
                                    <span className="kicker">{tool.kicker}</span>
                                    <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
                                        {tool.title}
                                    </h3>
                                </div>
                                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                                    {tool.description}
                                </p>
                                <div className="hairline" />
                                <div className="row between ai-center">
                                    <span className="kicker" style={{ color: 'var(--cobalt)' }}>open tool</span>
                                    <span style={{ color: 'var(--cobalt)', fontSize: 13 }}>→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Disclaimer */}
                <section style={{ marginTop: 32 }}>
                    <div className="card-quiet" style={{ padding: 24, borderLeft: '3px solid var(--lemon-2)' }}>
                        <div className="row gap-3 ai-start">
                            <span className="pill pill-lemon" style={{ flexShrink: 0 }}>medical disclaimer</span>
                            <div>
                                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                                    The information provided by these tools is for educational and informational purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
