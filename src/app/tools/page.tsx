import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Health Tools & Medical Calculators | aihealz',
    description: 'Free health calculators and medical tools. BMI calculator, calorie calculator, heart risk assessment, pregnancy due date, diabetes risk, and more. AI-powered health insights.',
    keywords: 'health calculators, medical tools, BMI calculator, calorie calculator, health assessment, medical calculator, free health tools',
};

// ── Health reference tools (non-calculator) ─────────────────────────
const HEALTH_TOOLS = [
    {
        id: 'drug-interactions',
        abbr: 'DX',
        name: 'Drug interactions',
        desc: 'Check for dangerous interactions between medications.',
        href: '/tools/drug-interactions',
    },
    {
        id: 'lab-tests',
        abbr: 'LB',
        name: 'Lab test directory',
        desc: 'Understand lab tests with normal ranges and country-specific costs.',
        href: '/tools/lab-tests',
    },
    {
        id: 'vaccinations',
        abbr: 'VX',
        name: 'Vaccination schedule',
        desc: 'Country-specific immunization schedules and travel vaccines.',
        href: '/tools/vaccinations',
    },
    {
        id: 'emergency',
        abbr: 'ER',
        name: 'Emergency services',
        desc: 'Emergency numbers, first aid guides, and crisis support by country.',
        href: '/tools/emergency',
    },
    {
        id: 'glossary',
        abbr: 'GL',
        name: 'Medical glossary',
        desc: 'Plain-English dictionary of medical terms with pronunciation.',
        href: '/tools/glossary',
    },
    {
        id: 'surgery-checklist',
        abbr: 'SC',
        name: 'Surgery checklists',
        desc: 'Pre-op and post-op checklists for the most common procedures.',
        href: '/tools/surgery-checklist',
    },
];

// ── Calculators ─────────────────────────────────────────────────────
const CALCULATORS = [
    {
        id: 'bmi',
        abbr: 'BM',
        name: 'BMI calculator',
        desc: 'Body Mass Index from height and weight.',
        category: 'Body metrics',
        href: '/tools/bmi-calculator',
    },
    {
        id: 'bmr',
        abbr: 'BR',
        name: 'BMR & calorie calculator',
        desc: 'Basal metabolic rate and daily calorie needs.',
        category: 'Nutrition',
        href: '/tools/bmr-calculator',
    },
    {
        id: 'heart-risk',
        abbr: 'HR',
        name: 'Heart disease risk',
        desc: '10-year cardiovascular risk estimate.',
        category: 'Cardiovascular',
        href: '/tools/heart-risk-calculator',
    },
    {
        id: 'kidney',
        abbr: 'KD',
        name: 'Kidney function (eGFR)',
        desc: 'CKD-EPI estimated glomerular filtration rate.',
        category: 'Nephrology',
        href: '/tools/kidney-function-calculator',
    },
    {
        id: 'pregnancy',
        abbr: 'PG',
        name: 'Pregnancy due date',
        desc: 'Naegele’s rule from last menstrual period.',
        category: 'Obstetrics',
        href: '/tools/pregnancy-due-date-calculator',
    },
    {
        id: 'diabetes-risk',
        abbr: 'DB',
        name: 'Diabetes risk',
        desc: 'Type 2 diabetes risk assessment.',
        category: 'Endocrinology',
        href: '/tools/diabetes-risk-calculator',
    },
    {
        id: 'water',
        abbr: 'WT',
        name: 'Water intake',
        desc: 'Daily hydration target by weight, activity, climate.',
        category: 'Nutrition',
        href: '/tools/water-intake-calculator',
    },
    {
        id: 'body-fat',
        abbr: 'BF',
        name: 'Body fat percentage',
        desc: 'U.S. Navy method estimate from circumferences.',
        category: 'Body metrics',
        href: '/tools/body-fat-calculator',
    },
];

export default function ToolsPage() {
    const categories = [...new Set(CALCULATORS.map(c => c.category))];

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px 80px' }}
                className="col gap-7"
            >
                {/* ── Breadcrumb ───────────────────────────── */}
                <nav
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
                    <span style={{ color: 'var(--ink)' }}>Tools</span>
                </nav>

                {/* ── Hero ─────────────────────────────────── */}
                <header className="col gap-4">
                    <span className="section-mark">tools / index</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 72px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ color: 'var(--cobalt)' }}>Health</span>{' '}
                        calculators &amp; reference tools
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Free, evidence-based calculators and reference tools. Compute, look up, plan — every result paired with plain-English context and a route to the right specialist.
                    </p>
                </header>

                {/* ── Stats strip ──────────────────────────── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 0,
                        border: '1px solid var(--rule)',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--paper)',
                        overflow: 'hidden',
                    }}
                >
                    {[
                        { v: CALCULATORS.length.toString(), l: 'calculators' },
                        { v: HEALTH_TOOLS.length.toString(), l: 'reference tools' },
                        { v: '7', l: 'countries · cost mapped' },
                        { v: 'free', l: 'no signup required' },
                    ].map((s, i, arr) => (
                        <div
                            key={s.l}
                            className="col gap-1"
                            style={{
                                padding: '20px 24px',
                                borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                            }}
                        >
                            <div
                                className="display num"
                                style={{
                                    fontSize: 32,
                                    fontWeight: 500,
                                    letterSpacing: '-0.025em',
                                    lineHeight: 1,
                                    color: 'var(--ink)',
                                }}
                            >
                                {s.v}
                            </div>
                            <div
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Reference tools ──────────────────────── */}
                <section className="col gap-4" aria-labelledby="reference-heading">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h2
                            id="reference-heading"
                            className="display"
                            style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                        >
                            Reference tools
                        </h2>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            {HEALTH_TOOLS.length} tools
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {HEALTH_TOOLS.map((tool, i) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= HEALTH_TOOLS.length - cols;
                            return (
                                <Link
                                    key={tool.id}
                                    href={tool.href}
                                    className="col gap-3"
                                    style={{
                                        padding: '20px 22px',
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <div className="spec-icon">{tool.abbr}</div>
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: 'var(--cobalt)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            Open →
                                        </span>
                                    </div>
                                    <div>
                                        <div
                                            className="display"
                                            style={{
                                                fontSize: 18,
                                                letterSpacing: '-0.02em',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {tool.name}
                                        </div>
                                        <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                                            {tool.desc}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* ── Calculators by category ──────────────── */}
                <section className="col gap-5" aria-labelledby="calculators-heading">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <h2
                            id="calculators-heading"
                            className="display"
                            style={{ fontSize: 28, margin: 0, letterSpacing: '-0.025em', fontWeight: 600 }}
                        >
                            Calculators
                        </h2>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            {CALCULATORS.length} calculators
                        </span>
                    </div>

                    {categories.map(cat => {
                        const list = CALCULATORS.filter(c => c.category === cat);
                        return (
                            <div key={cat} className="col gap-3">
                                <div
                                    className="kicker"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                                >
                                    <span className="dot" />
                                    {cat}
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                        gap: 0,
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-3)',
                                        background: 'var(--paper)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {list.map((calc, i) => {
                                        const cols = Math.min(list.length, 4);
                                        const isLastCol = (i + 1) % cols === 0;
                                        const isLastRow = i >= list.length - (list.length % cols || cols);
                                        return (
                                            <Link
                                                key={calc.id}
                                                href={calc.href}
                                                className="col gap-3"
                                                style={{
                                                    padding: '20px 22px',
                                                    borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                                }}
                                            >
                                                <div className="row between ai-center">
                                                    <div className="spec-icon">{calc.abbr}</div>
                                                    <span
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--cobalt)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.08em',
                                                        }}
                                                    >
                                                        Calc →
                                                    </span>
                                                </div>
                                                <div>
                                                    <div
                                                        className="display"
                                                        style={{
                                                            fontSize: 17,
                                                            letterSpacing: '-0.02em',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {calc.name}
                                                    </div>
                                                    <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                                                        {calc.desc}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* ── AI CTA ──────────────────────────────── */}
                <section className="card-ink" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
                    <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 24 }}>
                        <div className="col gap-3" style={{ flex: '1 1 480px', minWidth: 0 }}>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.10em',
                                    fontWeight: 500,
                                }}
                            >
                                need personalized advice?
                            </span>
                            <h3
                                className="display"
                                style={{
                                    fontSize: 'clamp(28px, 3.5vw, 40px)',
                                    lineHeight: 1.1,
                                    margin: 0,
                                    fontWeight: 600,
                                    color: 'var(--paper)',
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                Numbers are a start. <span style={{ color: 'var(--cobalt-3)' }}>Ask Healz AI what they mean</span>
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </h3>
                            <p
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(255,255,255,.7)',
                                    lineHeight: 1.55,
                                    maxWidth: 540,
                                    margin: 0,
                                }}
                            >
                                Plain-language interpretation, OTC options where appropriate, and the four specialists most likely to help.
                            </p>
                        </div>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            <Link href="/healz-ai" className="btn btn-cobalt btn-lg">
                                Talk to Healz AI →
                            </Link>
                            <Link
                                href="/doctors"
                                className="btn btn-lg"
                                style={{
                                    background: 'rgba(255,255,255,.08)',
                                    color: 'var(--paper)',
                                    borderColor: 'rgba(255,255,255,.15)',
                                }}
                            >
                                Find a specialist
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Disclaimer ──────────────────────────── */}
                <div
                    className="card-quiet"
                    style={{ padding: 16 }}
                >
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Disclaimer.</strong> These tools provide estimates for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for personalized guidance.
                    </p>
                </div>
            </div>
        </main>
    );
}
