import { Metadata } from 'next';
import Link from 'next/link';
import {
    generateWebPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
} from '@/lib/structured-data';

export const revalidate = 604800;

export const metadata: Metadata = {
    title: 'Privacy Policy | aihealz',
    description: 'Privacy Policy for aihealz. Learn how we collect, use, and protect your healthcare data securely.',
    keywords: 'privacy policy aihealz, medical data protection, healthcare privacy, GDPR compliance aihealz',
    alternates: { canonical: '/privacy' },
    openGraph: {
        type: 'website',
        title: 'Privacy Policy | aihealz',
        description: 'How we protect your medical data.',
        url: 'https://aihealz.com/privacy',
        siteName: 'aihealz',
    },
    twitter: {
        card: 'summary',
        title: 'Privacy Policy | aihealz',
        description: 'How we protect your medical data.',
    },
};

const structuredData = [
    generateWebPageSchema(
        'Privacy Policy | AIHealz',
        'Privacy Policy for AIHealz. Learn how we collect, use, and protect your healthcare data securely with GDPR and HIPAA compliance.',
        'https://aihealz.com/privacy',
        { dateModified: '2026-10-01' }
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
    ]),
];

const SECTIONS = [
    {
        id: 'about',
        num: '01',
        title: 'Important information and who we are',
        body: (
            <>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                    aihealz is the controller and responsible for your personal data. We have appointed a data privacy manager who oversees questions in relation to this privacy policy. If you have any questions, including requests to exercise your legal rights, please contact the data privacy manager at the address below.
                </p>
                <ul className="clean" style={{ marginTop: 16 }}>
                    <li className="row gap-3 ai-baseline" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                        <span className="kicker" style={{ minWidth: 80 }}>Email</span>
                        <a href="mailto:privacy@aihealz.com" style={{ color: 'var(--cobalt)', textDecoration: 'underline', textDecorationColor: 'var(--rule)' }}>
                            privacy@aihealz.com
                        </a>
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'data',
        num: '02',
        title: 'The data we collect about you',
        body: (
            <>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                    Personal data, or personal information, means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data). We may collect, use, store, and transfer different kinds of personal data about you, grouped as follows:
                </p>
                <ul className="clean col gap-3" style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                    <li className="row gap-3 ai-baseline">
                        <span className="kicker" style={{ minWidth: 92 }}>Identity</span>
                        <span>First name, last name, username or similar identifier.</span>
                    </li>
                    <li className="row gap-3 ai-baseline">
                        <span className="kicker" style={{ minWidth: 92 }}>Contact</span>
                        <span>Billing address, delivery address, email, and telephone numbers.</span>
                    </li>
                    <li className="row gap-3 ai-baseline">
                        <span className="kicker" style={{ minWidth: 92 }}>Technical</span>
                        <span>IP address, login data, browser type and version, time zone, and location.</span>
                    </li>
                    <li className="row gap-3 ai-baseline">
                        <span className="kicker" style={{ minWidth: 92 }}>Usage</span>
                        <span>Information about how you use our website, products, and services.</span>
                    </li>
                </ul>
                <div className="card-quiet" style={{ padding: 20, marginTop: 20 }}>
                    <div className="row ai-center gap-2" style={{ marginBottom: 8 }}>
                        <span className="pill pill-orange">Health data</span>
                        <span className="kicker">strictly transient</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                        Any data submitted through our AI symptom checker, medical travel bot, or report analysis tools is processed in memory for abstract AI analysis and is never permanently stored in our databases without explicit enterprise consent.
                    </p>
                </div>
            </>
        ),
    },
    {
        id: 'use',
        num: '03',
        title: 'How we use your personal data',
        body: (
            <>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="clean col gap-2" style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                    <li className="row gap-3 ai-baseline">
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                        <span>Where we need to perform the contract we are about to enter into or have entered into with you.</span>
                    </li>
                    <li className="row gap-3 ai-baseline">
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                        <span>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</span>
                    </li>
                    <li className="row gap-3 ai-baseline">
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cobalt)', marginTop: 8, flexShrink: 0 }} />
                        <span>Where we need to comply with a legal obligation globally (GDPR, HIPAA compliance pipelines).</span>
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'security',
        num: '04',
        title: 'Data security',
        body: (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                We have put in place robust, bank-grade encryption and security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered, or disclosed. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a strict business need to know.
            </p>
        ),
    },
    {
        id: 'rights',
        num: '05',
        title: 'Your legal rights',
        body: (
            <>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                    Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', marginTop: 14 }}>
                    If you wish to exercise any of the rights set out above, please{' '}
                    <Link href="/contact" style={{ color: 'var(--cobalt)', textDecoration: 'underline', textDecorationColor: 'var(--cobalt-100)' }}>
                        contact us
                    </Link>
                    .
                </p>
            </>
        ),
    },
];

export default function PrivacyPolicyPage() {
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
                    <span style={{ color: 'var(--ink)' }}>Privacy Policy</span>
                </div>

                {/* Hero */}
                <header className="col gap-4" style={{ marginBottom: 56 }}>
                    <span className="section-mark">legal / privacy</span>
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
                        <span style={{ color: 'var(--cobalt)' }}>Privacy</span> policy
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.55vw, 19px)', maxWidth: 640 }}>
                        We respect your privacy and are committed to protecting your personal data globally. This policy explains how we look after your data when you use aihealz, regardless of where you visit from, and tells you about your privacy rights and how the law protects you.
                    </p>
                    <div className="row gap-3 ai-center" style={{ marginTop: 8 }}>
                        <span className="pill pill-cobalt">last updated · oct 2026</span>
                        <span className="kicker">controller · aihealz</span>
                    </div>
                </header>

                {/* Hairline */}
                <div className="hairline" style={{ marginBottom: 56 }} />

                {/* Sections */}
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

                {/* Contact CTA */}
                <div className="card" style={{ padding: 28, marginTop: 56 }}>
                    <span className="kicker" style={{ marginBottom: 8, display: 'block' }}>
                        <span className="dot" />
                        questions
                    </span>
                    <h3 className="display" style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 600 }}>
                        Reach the privacy team.
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                        We respond to data requests within 30 days. For urgent matters, mark your message as such.
                    </p>
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <Link href="/contact" className="btn btn-cobalt">Contact us</Link>
                        <a href="mailto:privacy@aihealz.com" className="btn btn-paper">privacy@aihealz.com</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
