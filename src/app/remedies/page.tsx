import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Remedies & OTC Guides | aihealz',
    description: 'Evidence-based home remedies, OTC guidelines, and natural treatments for common health conditions, powered by AI analysis.',
    alternates: { canonical: '/remedies' },
};

const OTC_GUIDES = [
    {
        condition: 'Mild fever / body ache',
        code: 'FV',
        safeToTreat: true,
        tips: [
            'Stay extremely well hydrated (water, broths, electrolyte solutions).',
            'Rest in a cool room and wear light clothing.',
            'Use a lukewarm sponge bath if fever is uncomfortable.'
        ],
        medicines: [
            { name: 'Paracetamol (Acetaminophen)', dosage: '500mg – 650mg every 6–8 hours as needed.', warning: 'Max 4000mg/day. Avoid alcohol.' },
            { name: 'Ibuprofen', dosage: '400mg every 6–8 hours with food.', warning: 'Avoid if you have a history of stomach ulcers.' }
        ],
        whenToSeeDoctor: 'Fever above 103°F (39.4°C), lasts more than 3 days, accompanied by severe headache, stiff neck, or chest pain.'
    },
    {
        condition: 'Common cold & congestion',
        code: 'CC',
        safeToTreat: true,
        tips: [
            'Inhale steam from a bowl of hot water or use a humidifier.',
            'Gargle with warm salt water 3–4 times a day for a sore throat.',
            'Use saline nasal drops/spray to clear blockages naturally.'
        ],
        medicines: [
            { name: 'Cetirizine / Loratadine', dosage: '10mg once daily.', warning: 'May cause mild drowsiness (Cetirizine).' },
            { name: 'Xylometazoline Nasal Drops', dosage: '1–2 drops per nostril, twice daily.', warning: 'Do not use for more than 5–7 consecutive days (rebound congestion).' }
        ],
        whenToSeeDoctor: 'Symptoms last >10 days, green/yellow phlegm with high fever, or severe shortness of breath.'
    },
    {
        condition: 'Acid reflux / mild heartburn',
        code: 'AR',
        safeToTreat: true,
        tips: [
            'Avoid lying down for at least 2–3 hours after eating.',
            'Elevate the head of your bed by 6–8 inches.',
            'Avoid trigger foods: spicy, fried, citrus, caffeine, and alcohol.'
        ],
        medicines: [
            { name: 'Calcium Carbonate Antacids', dosage: '1–2 tablets chewed as symptoms occur.', warning: 'Do not exceed maximum daily dose on label.' },
            { name: 'Pantoprazole / Omeprazole', dosage: '20mg – 40mg once daily before breakfast.', warning: 'For short-term use (up to 14 days) unless prescribed.' }
        ],
        whenToSeeDoctor: 'Difficulty swallowing, black/tarry stools, unexplained weight loss, or severe chest pain (which could mimic a heart attack).'
    },
    {
        condition: 'Mild acute diarrhea',
        code: 'DR',
        safeToTreat: true,
        tips: [
            'Focus completely on fluid replacement (ORS — Oral Rehydration Salts).',
            'Eat a bland BRAT diet: Bananas, Rice, Applesauce, Toast.',
            'Avoid dairy, caffeine, and very greasy or sweet foods.'
        ],
        medicines: [
            { name: 'Loperamide', dosage: '4mg initially, then 2mg after each loose stool.', warning: 'Max 8mg/day (OTC). Do not use if fever or bloody stools are present.' },
            { name: 'Probiotic Supplements', dosage: 'Saccharomyces boulardii or Lactobacillus capsules daily.', warning: 'Safe for general gut health support.' }
        ],
        whenToSeeDoctor: 'Lasts more than 2 days in adults, severe dehydration (dry mouth, no urination), high fever, or bloody/black stools.'
    }
];

const REMEDY_CATEGORIES = [
    {
        name: 'Digestive health',
        code: 'DG',
        items: [
            { name: 'Bloating & gas', remedies: 'Peppermint oil, Chamomile tea, Probiotics, Fennel seeds' },
            { name: 'Constipation', remedies: 'Psyllium husk, Prune juice, Magnesium citrate, Hydration' },
            { name: 'Nausea', remedies: 'Ginger root, Vitamin B6, Acupressure wristbands' }
        ]
    },
    {
        name: 'Skin & dermatology',
        code: 'SK',
        items: [
            { name: 'Acne & blemishes', remedies: 'Tea tree oil, Salicylic acid (Willow bark), Green tea extract' },
            { name: 'Dry skin / eczema', remedies: 'Colloidal oatmeal bath, Coconut oil, Ceramide creams' },
            { name: 'Minor burns', remedies: 'Cool water running, Honey dressing, Calendula ointment' }
        ]
    },
    {
        name: 'Pain & stress',
        code: 'PS',
        items: [
            { name: 'Headaches (tension)', remedies: 'Peppermint oil on temples, Magnesium, Hydration' },
            { name: 'Muscle aches', remedies: 'Epsom salt baths, Arnica gel, Heat/Ice therapy' },
            { name: 'Insomnia', remedies: 'Melatonin, Valerian root, Tart cherry juice, Sleep hygiene' }
        ]
    }
];

const remediesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'MedicalWebPage',
            '@id': 'https://aihealz.com/remedies#page',
            url: 'https://aihealz.com/remedies',
            name: 'AI Remedies & OTC Guides',
            description:
                'Evidence-based home remedies, OTC guidelines, and natural treatments for common health conditions.',
            inLanguage: 'en',
            audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
            isPartOf: { '@id': 'https://aihealz.com/#website' },
        },
        ...OTC_GUIDES.map((g, i) => ({
            '@type': 'HowTo',
            '@id': `https://aihealz.com/remedies#howto-${i}`,
            name: `${g.condition} — home care & OTC steps`,
            description: g.whenToSeeDoctor,
            totalTime: 'PT15M',
            step: [
                ...g.tips.map((tip, idx) => ({
                    '@type': 'HowToStep',
                    position: idx + 1,
                    name: `Self-care step ${idx + 1}`,
                    text: tip,
                })),
                ...g.medicines.map((m, idx) => ({
                    '@type': 'HowToStep',
                    position: g.tips.length + idx + 1,
                    name: `OTC option: ${m.name}`,
                    text: `${m.dosage} — ${m.warning}`,
                })),
            ],
        })),
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
                { '@type': 'ListItem', position: 2, name: 'Remedies', item: 'https://aihealz.com/remedies' },
            ],
        },
    ],
};

export default function RemediesPage() {
    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <Script
                id="remedies-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(remediesSchema) }}
            />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }} className="col gap-7">

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
                    <span style={{ color: 'var(--ink)' }}>Remedies</span>
                </div>

                {/* Hero */}
                <header className="col gap-4">
                    <span className="section-mark">the desk / safe self-care</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 7vw, 84px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                            maxWidth: 920,
                        }}
                    >
                        Safe <span style={{ color: 'var(--cobalt)' }}>OTC medicines</span> & home care
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.55vw, 19px)', maxWidth: 680 }}>
                        Evidence-based over-the-counter (OTC) medication guides and natural home remedies for minor, safe-to-treat conditions. Reviewed against authoritative sources before publication.
                    </p>
                    <div className="row gap-3 ai-center" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="pill pill-mint">{OTC_GUIDES.length} OTC guides</span>
                        <span className="pill pill-cobalt">{REMEDY_CATEGORIES.length} natural-remedy categories</span>
                        <span className="kicker">verified · updated continuously</span>
                    </div>

                    {/* Search */}
                    <div className="row ai-center" style={{ position: 'relative', maxWidth: 640, marginTop: 12 }}>
                        <span
                            className="mono"
                            style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--ink-4)',
                                fontSize: 13,
                                pointerEvents: 'none',
                            }}
                            aria-hidden="true"
                        >
                            ⌕
                        </span>
                        <input
                            className="input"
                            placeholder="Search a symptom, remedy, or OTC medicine"
                            style={{ paddingLeft: 36 }}
                            aria-label="Search remedies"
                        />
                    </div>
                </header>

                {/* Critical disclaimer */}
                <section style={{ marginTop: 16 }}>
                    <div className="card-quiet" style={{ padding: 24, borderLeft: '3px solid var(--orange)' }}>
                        <div className="row gap-3 ai-start">
                            <span className="pill pill-orange" style={{ flexShrink: 0 }}>important medical disclaimer</span>
                            <div>
                                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                                    The information provided here is strictly for <strong style={{ color: 'var(--ink)' }}>educational and informational purposes</strong> regarding minor health issues. It is <strong style={{ color: 'var(--ink)' }}>not</strong> a substitute for professional medical advice, diagnosis, or treatment. Always read medication labels carefully, check for allergies, and consult a qualified healthcare provider if your symptoms are severe, persistent, or worsening. Always consult a pediatrician before giving OTC medications to children.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* OTC Guides */}
                <section className="col gap-5" style={{ marginTop: 32 }}>
                    <div className="row between ai-end">
                        <div className="col gap-2">
                            <span className="section-mark">I / OTC guides</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                Safe to treat at home.
                            </h2>
                        </div>
                        <span className="kicker">{OTC_GUIDES.length} conditions</span>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {OTC_GUIDES.map((guide, idx) => (
                            <article key={idx} className="card col" style={{ overflow: 'hidden' }}>
                                {/* Header */}
                                <div className="row between ai-center hairline-b" style={{ padding: '18px 22px' }}>
                                    <div className="row gap-3 ai-center">
                                        <span className="spec-icon" aria-hidden="true">{guide.code}</span>
                                        <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600, letterSpacing: '-0.015em' }}>
                                            {guide.condition}
                                        </h3>
                                    </div>
                                    <span className="pill pill-mint">safe · self-treat</span>
                                </div>

                                <div className="col gap-5" style={{ padding: 22 }}>
                                    {/* General Tips */}
                                    <div className="col gap-3">
                                        <span className="kicker">general tips</span>
                                        <ul className="clean col gap-2">
                                            {guide.tips.map((tip, i) => (
                                                <li key={i} className="row gap-3 ai-baseline" style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--mint-2)', marginTop: 8, flexShrink: 0 }} />
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Medicines */}
                                    <div className="col gap-3">
                                        <span className="kicker">suggested OTC medicines</span>
                                        <div className="col gap-3">
                                            {guide.medicines.map((med, i) => (
                                                <div key={i} className="card-flat" style={{ padding: 14, background: 'var(--paper-2)' }}>
                                                    <div className="row between ai-baseline" style={{ marginBottom: 6 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{med.name}</div>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
                                                        <span className="kicker" style={{ marginRight: 8 }}>dosage</span>
                                                        {med.dosage}
                                                    </div>
                                                    <div className="row gap-2 ai-baseline" style={{ fontSize: 12, color: 'var(--ink-2)', borderTop: '1px solid var(--rule-2)', paddingTop: 8 }}>
                                                        <span className="pill pill-lemon" style={{ flexShrink: 0 }}>warning</span>
                                                        <span style={{ lineHeight: 1.5 }}>{med.warning}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* When to see doctor */}
                                    <div className="col gap-3 hairline-t" style={{ paddingTop: 16 }}>
                                        <div className="row gap-2 ai-center">
                                            <span className="pill pill-orange">when to see a doctor</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                                            {guide.whenToSeeDoctor}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Natural Remedies */}
                <section className="col gap-5" style={{ marginTop: 32 }}>
                    <div className="row between ai-end">
                        <div className="col gap-2">
                            <span className="section-mark">II / natural relief</span>
                            <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                                Lifestyle interventions.
                            </h2>
                        </div>
                        <span className="kicker">{REMEDY_CATEGORIES.length} categories</span>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 0,
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-3)',
                            background: 'var(--paper)',
                            overflow: 'hidden',
                        }}
                    >
                        {REMEDY_CATEGORIES.map((category, ci) => {
                            const isLastCol = ci === REMEDY_CATEGORIES.length - 1;
                            return (
                                <div
                                    key={category.name}
                                    className="col gap-4"
                                    style={{
                                        padding: 22,
                                        borderRight: !isLastCol ? '1px solid var(--rule)' : 'none',
                                    }}
                                >
                                    <div className="row between ai-center">
                                        <span className="spec-icon" aria-hidden="true">{category.code}</span>
                                        <span className="kicker">{category.items.length} entries</span>
                                    </div>
                                    <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>
                                        {category.name}
                                    </h3>
                                    <div className="col gap-3">
                                        {category.items.map((item, idx) => (
                                            <div key={idx} className="col gap-2 hairline-t" style={{ paddingTop: 12 }}>
                                                <div className="row between ai-center">
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</span>
                                                    <Link
                                                        href="/symptoms"
                                                        aria-label={`Find specialists for ${item.name}`}
                                                        className="kicker"
                                                        style={{ color: 'var(--cobalt)' }}
                                                    >
                                                        →
                                                    </Link>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                                                    {item.remedies}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ marginTop: 32 }}>
                    <div className="card" style={{ padding: 28 }}>
                        <span className="kicker" style={{ display: 'block', marginBottom: 8 }}>
                            <span className="dot" />
                            symptoms not improving?
                        </span>
                        <h3 className="display" style={{ fontSize: 22, margin: '0 0 8px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                            Talk to a verified specialist.
                        </h3>
                        <p className="muted" style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.6 }}>
                            If self-care isn&apos;t working or your symptoms are escalating, escalate to a board-certified clinician — don&apos;t wait it out.
                        </p>
                        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                            <Link href="/symptoms" className="btn btn-cobalt">Run symptom check</Link>
                            <Link href="/doctors" className="btn btn-paper">Find a specialist</Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
