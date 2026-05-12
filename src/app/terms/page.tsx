import { Metadata } from 'next';
import Link from 'next/link';
import {
    generateWebPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
} from '@/lib/structured-data';

export const revalidate = 604800;

export const metadata: Metadata = {
    title: 'Terms of Service | aihealz',
    description: 'Terms of Service for using aihealz directories, AI tools, and medical concierge platform.',
    keywords: 'terms of service aihealz, terms and conditions, medical disclaimer, aihealz rules',
    alternates: { canonical: '/terms' },
    openGraph: {
        type: 'website',
        title: 'Terms of Service | aihealz',
        description: 'Read the Terms of Service for using aihealz.',
        url: 'https://aihealz.com/terms',
        siteName: 'aihealz',
    },
    twitter: {
        card: 'summary',
        title: 'Terms of Service | aihealz',
        description: 'Read the Terms of Service for using aihealz.',
    },
};

const structuredData = [
    generateWebPageSchema(
        'Terms of Service | AIHealz',
        'Terms of Service for using AIHealz directories, AI medical tools, symptom checker, and medical travel concierge platform.',
        'https://aihealz.com/terms',
        { dateModified: '2026-10-01' }
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
    ]),
];

const SECTIONS = [
    {
        id: 'acceptance',
        num: '01',
        title: 'Acceptance of terms',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                By accessing or using aihealz (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service. The Service includes our global directory, Medical Travel Concierge, AI Diagnosis Bots, and B2B SaaS portals.
            </p>
        ),
    },
    {
        id: 'medical',
        num: '02',
        title: 'Medical disclaimer (not medical advice)',
        body: (
            <div className="card-quiet" style={{ padding: 24, borderLeft: '3px solid var(--orange)' }}>
                <div className="row ai-center gap-2" style={{ marginBottom: 12 }}>
                    <span className="pill pill-orange">critical legal notice</span>
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                    The content provided by aihealz, including text, graphics, images, symptom checkers, and AI-generated analyses, is for informational and educational purposes only. It is <strong style={{ color: 'var(--ink)' }}>not</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                    Never disregard professional medical advice or delay seeking it because of something you have read on this website. If you think you may have a medical emergency, call your doctor or 911 immediately.
                </p>
            </div>
        ),
    },
    {
        id: 'use',
        num: '03',
        title: 'Use of the service',
        body: (
            <ul className="clean col gap-2" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                <li className="row gap-3 ai-baseline">
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                    <span>You must be at least 18 years old to use this Service.</span>
                </li>
                <li className="row gap-3 ai-baseline">
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                    <span>You are responsible for any activity that occurs through your use of the Service.</span>
                </li>
                <li className="row gap-3 ai-baseline">
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                    <span>You must not use the Service for any illegal or unauthorized purpose.</span>
                </li>
                <li className="row gap-3 ai-baseline">
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                    <span>You must not transmit any worms, viruses, or any code of a destructive nature.</span>
                </li>
            </ul>
        ),
    },
    {
        id: 'ai',
        num: '04',
        title: 'AI tools and accuracy',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                aihealz utilizes advanced Artificial Intelligence (AI), including Large Language Models, to organize medical data and provide general insights. While we strive for extreme accuracy, AI is not perfect and can make mistakes (hallucinations or algorithmic bias). You agree that aihealz and its parent company, ATZ Medappz Pvt Ltd, are not liable for any inaccuracies, errors, or omissions in the AI-generated content. You must independently verify critical information with a licensed board-certified medical professional.
            </p>
        ),
    },
    {
        id: 'directory',
        num: '05',
        title: 'Doctor profiles and directory',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                We list medical professionals based on public data, user submissions, and partnerships. We attempt to verify credentials where indicated (designated by a &ldquo;Verified&rdquo; badge), but we do not endorse or guarantee the quality of care of any specific provider. It is your ultimate responsibility to verify a doctor&apos;s qualifications before seeking surgical or medical treatment.
            </p>
        ),
    },
    {
        id: 'ip',
        num: '06',
        title: 'Intellectual property',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                The Service and its original content, features, proprietary search indexes, and functionality are and will remain the exclusive property of aihealz and its licensors. The Service is protected by copyright, trademark, and other laws of both the country of operation and foreign countries. Scraping our directory is strictly prohibited without explicit written enterprise API access.
            </p>
        ),
    },
    {
        id: 'changes',
        num: '07',
        title: 'Changes',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
        ),
    },
    {
        id: 'contact',
        num: '08',
        title: 'Contact us',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                If you have any questions about these Terms, please{' '}
                <Link href="/contact" style={{ color: 'var(--cobalt)', textDecoration: 'underline', textDecorationColor: 'var(--cobalt-100)' }}>
                    contact us
                </Link>
                .
            </p>
        ),
    },
];

export default function TermsOfServicePage() {
    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96, paddingBottom: 96 }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)' }}>
                {/* Breadcrumb */}
                <div
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 24,
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Terms of Service</span>
                </div>

                {/* Hero */}
                <header className="col gap-4" style={{ marginBottom: 56 }}>
                    <span className="section-mark">legal / terms</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(40px, 6vw, 72px)',
                            lineHeight: 0.98,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ color: 'var(--cobalt)' }}>Terms</span> of service
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.55vw, 19px)', maxWidth: 640 }}>
                        The rules for using aihealz directories, AI tools, and the medical concierge platform. Read these in full — by using the Service you agree to them.
                    </p>
                    <div className="row gap-3 ai-center" style={{ marginTop: 8 }}>
                        <span className="pill pill-cobalt">last updated · oct 2026</span>
                        <span className="kicker">jurisdiction · global</span>
                    </div>
                </header>

                <div className="hairline" style={{ marginBottom: 56 }} />

                <div className="col gap-8">
                    {SECTIONS.map((s) => (
                        <section key={s.id} id={s.id} className="col gap-4">
                            <div className="row gap-3 ai-baseline">
                                <span className="num" style={{ color: 'var(--cobalt)', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em' }}>
                                    {s.num}
                                </span>
                                <h2
                                    className="display"
                                    style={{
                                        fontSize: 24,
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.025em',
                                        margin: 0,
                                        fontWeight: 600,
                                    }}
                                >
                                    {s.title}
                                </h2>
                            </div>
                            <div>{s.body}</div>
                            <div className="hairline" style={{ marginTop: 16 }} />
                        </section>
                    ))}
                </div>

                <div className="card" style={{ padding: 28, marginTop: 56 }}>
                    <span className="kicker" style={{ marginBottom: 8, display: 'block' }}>
                        <span className="dot" />
                        questions
                    </span>
                    <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 600 }}>
                        Reach the legal team.
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                        Specific clauses unclear? Need an enterprise data agreement? We respond within 5 business days.
                    </p>
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <Link href="/contact" className="btn btn-cobalt">Contact us</Link>
                        <Link href="/privacy" className="btn btn-paper">Privacy policy</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
