import { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 604800;

export const metadata: Metadata = {
    title: 'Medical travel concierge — end-to-end | aihealz',
    description:
        'Surgeon match-making. Pre-negotiated package pricing. Visa, flight, recovery suite, native-speaking translator. Twelve cities, one number to call.',
    keywords: ['medical travel concierge', 'health tourism', 'hospitals in india', 'surgery travel abroad', 'cost of surgery abroad', 'medical travel agency'],
    alternates: { canonical: '/medical-travel' },
    openGraph: {
        title: 'Medical travel concierge — end-to-end | aihealz',
        description: 'World-class care, end-to-end handled.',
        url: 'https://aihealz.com/medical-travel',
        siteName: 'aihealz',
    },
};

export default function MedicalTravelPage() {
    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            {/* ── Hero ────────────────────────────────────────── */}
            <section
                style={{ padding: '56px clamp(16px, 4vw, 28px) 48px', maxWidth: 1280, margin: '0 auto' }}
                className="row gap-8 ai-start"
            >
                <div className="col gap-5" style={{ flex: '1 1 580px', minWidth: 0 }}>
                    <span className="section-mark">the concierge</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(48px, 7.5vw, 104px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        World-class care.
                        <br />
                        <span style={{ color: 'var(--cobalt)' }}>End-to-end</span>,
                        <br />
                        handled
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 560 }}>
                        Surgeon match-making. Cost negotiation. Visa, flight, hotel, translator, recovery suite. Twelve cities, one number to call.
                    </p>
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                            Build my estimate →
                        </Link>
                        <Link href="#how-it-works" className="btn btn-paper btn-lg">
                            How it works
                        </Link>
                    </div>
                    <div
                        className="row gap-6 mono"
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--ink-3)',
                            marginTop: 4,
                            flexWrap: 'wrap',
                        }}
                    >
                        <span>◆ 1,240 patients in 2025</span>
                        <span>◆ 96% would refer a friend</span>
                        <span>◆ 24/7 concierge desk</span>
                    </div>
                </div>
                <div className="col gap-3" style={{ flex: '1 1 380px', minWidth: 0 }}>
                    <div
                        className="placeholder"
                        style={{ height: 240, fontSize: 11 }}
                        aria-label="Hospital exterior placeholder"
                    >
                        HOSPITAL · DELHI / BANGKOK / ISTANBUL
                    </div>
                    <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
                        <div
                            className="placeholder"
                            style={{ flex: '1 1 160px', minHeight: 140, fontSize: 11 }}
                        >
                            RECOVERY SUITE
                        </div>
                        <div
                            className="placeholder"
                            style={{ flex: '1 1 160px', minHeight: 140, fontSize: 11 }}
                        >
                            OR · TRANSLATOR
                        </div>
                    </div>
                </div>
            </section>

            {/* ── II / what we handle ──────────────────────────── */}
            <section style={{ padding: '64px clamp(16px, 4vw, 28px)', background: 'var(--bg-2)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-6">
                    <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div className="col gap-2">
                            <span className="section-mark">II / what we handle</span>
                            <h2
                                className="display"
                                style={{
                                    fontSize: 'clamp(32px, 4.5vw, 56px)',
                                    margin: 0,
                                    letterSpacing: '-0.04em',
                                    fontWeight: 600,
                                    lineHeight: 1.05,
                                }}
                            >
                                Everything,
                                <br />
                                except the surgery itself.
                            </h2>
                        </div>
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
                        {[
                            ['01', 'Surgeon match', "We compare 240+ accredited surgeons by outcome data, not marketing budgets."],
                            ['02', 'Cost negotiation', 'Pre-negotiated all-in package. No surprise hospital bills.'],
                            ['03', 'Visa & flight', 'Medical visa letter, flight booking, fast-track airport clearance.'],
                            ['04', 'Recovery stay', 'Partner luxury or serviced apartments — chosen for proximity to your hospital.'],
                            ['05', 'Translator', 'Native-speaking medical translators in every consult and ward round.'],
                            ['06', 'Post-op care', 'Video consults with your surgeon for 90 days after you return home.'],
                        ].map(([n, t, b], i, arr) => {
                            const cols = 3;
                            const isLastCol = (i + 1) % cols === 0;
                            const isLastRow = i >= arr.length - cols;
                            return (
                                <div
                                    key={n}
                                    className="col gap-3"
                                    style={{
                                        padding: '28px 24px',
                                        borderRight: isLastCol ? 'none' : '1px solid var(--rule)',
                                        borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    }}
                                >
                                    <span
                                        className="num"
                                        style={{
                                            fontSize: 13,
                                            color: 'var(--cobalt)',
                                            fontWeight: 500,
                                            letterSpacing: '0.06em',
                                        }}
                                    >
                                        § {n}
                                    </span>
                                    <div
                                        className="display"
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 600,
                                            letterSpacing: '-0.025em',
                                        }}
                                    >
                                        {t}
                                    </div>
                                    <div className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>
                                        {b}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── III / a worked example ───────────────────────── */}
            <section style={{ padding: '72px clamp(16px, 4vw, 28px)' }}>
                <div
                    className="row gap-7 ai-start"
                    style={{ maxWidth: 1180, margin: '0 auto', flexWrap: 'wrap' }}
                >
                    <div className="col gap-3" style={{ flex: '1 1 380px', minWidth: 0 }}>
                        <span className="section-mark">III / a worked example</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(32px, 4.5vw, 56px)',
                                lineHeight: 1.05,
                                letterSpacing: '-0.04em',
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            Knee replacement,
                            <br />
                            <span style={{ color: 'var(--cobalt)' }}>real numbers</span>
                            <span style={{ color: 'var(--orange)' }}>.</span>
                        </h2>
                        <p className="lede" style={{ fontSize: 18 }}>
                            One of our most common procedures. Identical surgery, identical implant, vastly different bills.
                        </p>
                        <Link href="/medical-travel/bot" className="btn btn-paper" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                            Get this estimate for my procedure →
                        </Link>
                    </div>
                    <div
                        className="card"
                        style={{ flex: '1 1 480px', padding: 0, overflow: 'hidden', minWidth: 0 }}
                    >
                        {[
                            { country: 'United States', cost: '$ 38,000', note: 'Boston General · standard' },
                            { country: 'United Kingdom', cost: '£ 14,200', note: 'BUPA private · 6-week wait' },
                            { country: 'UAE', cost: 'AED 36,000', note: 'Cleveland Clinic Abu Dhabi' },
                            { country: 'Thailand', cost: '$ 8,500', note: 'Bumrungrad · Bangkok' },
                            { country: 'Mexico', cost: '$ 6,200', note: 'Hospital Angeles · CDMX' },
                            { country: 'India', cost: '$ 3,400', note: 'Apollo · Delhi · all-inclusive', best: true },
                        ].map((row, i, arr) => (
                            <div
                                key={row.country}
                                className="row ai-center"
                                style={{
                                    padding: '18px 22px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    background: row.best ? 'var(--cobalt-50)' : 'transparent',
                                }}
                            >
                                <span
                                    className="display"
                                    style={{
                                        flex: '1.2 1 140px',
                                        fontSize: 17,
                                        color: row.best ? 'var(--cobalt)' : 'var(--ink)',
                                        fontWeight: row.best ? 600 : 500,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {row.country}
                                    {row.best ? ' ★' : ''}
                                </span>
                                <span
                                    className="num"
                                    style={{
                                        flex: '1 1 100px',
                                        fontSize: 15,
                                        color: row.best ? 'var(--cobalt)' : 'var(--ink)',
                                        fontWeight: row.best ? 500 : 400,
                                    }}
                                >
                                    {row.cost}
                                </span>
                                <span
                                    className="muted"
                                    style={{
                                        flex: '1.6 1 160px',
                                        fontSize: 13,
                                        textAlign: 'right',
                                    }}
                                >
                                    {row.note}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── IV / your medical journey (how it works) ─────── */}
            <section
                id="how-it-works"
                style={{ padding: '72px clamp(16px, 4vw, 28px)', borderTop: '1px solid var(--rule)' }}
            >
                <div style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-6">
                    <div className="col gap-2">
                        <span className="section-mark">IV / your medical journey</span>
                        <h2
                            className="display"
                            style={{
                                fontSize: 'clamp(32px, 4.5vw, 56px)',
                                margin: 0,
                                letterSpacing: '-0.04em',
                                fontWeight: 600,
                            }}
                        >
                            Four steps. No surprises.
                        </h2>
                    </div>

                    <div
                        className="row"
                        style={{
                            borderTop: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                            flexWrap: 'wrap',
                        }}
                    >
                        {[
                            { n: '01', t: 'Free review', d: 'Share your reports over secure chat for a free preliminary evaluation by top doctors.' },
                            { n: '02', t: 'Travel plan', d: 'Receive a structured plan with exact hospital quotes, visa letters, and hotel options.' },
                            { n: '03', t: 'Treatment', d: 'Arrive via VIP airport pickup. Complete your procedure at a gold-standard facility.' },
                            { n: '04', t: 'Recovery', d: 'Rest at a partner hotel and receive a "fit to fly" clearance before heading safely home.' },
                        ].map((s, i, arr) => (
                            <div
                                key={s.n}
                                className="col gap-2"
                                style={{
                                    flex: '1 1 240px',
                                    padding: '24px 22px',
                                    borderRight: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                    minWidth: 0,
                                }}
                            >
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--cobalt)',
                                        letterSpacing: '0.10em',
                                        fontWeight: 500,
                                    }}
                                >
                                    {s.n}
                                </span>
                                <div
                                    className="display"
                                    style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}
                                >
                                    {s.t}
                                </div>
                                <div className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
                                    {s.d}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── V / from our patients (ink) ──────────────────── */}
            <section style={{ padding: '80px clamp(16px, 4vw, 28px)', background: 'var(--ink)', color: 'var(--paper)' }}>
                <div style={{ maxWidth: 980, margin: '0 auto' }} className="col gap-6">
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
                        V / from our patients
                    </span>
                    <blockquote
                        className="display"
                        style={{
                            fontSize: 'clamp(24px, 3vw, 44px)',
                            lineHeight: 1.25,
                            letterSpacing: '-0.025em',
                            fontWeight: 500,
                            color: 'var(--paper)',
                            margin: 0,
                        }}
                    >
                        <span style={{ color: 'var(--cobalt-3)', fontSize: '1.2em', verticalAlign: '-0.05em' }}>&ldquo;</span>
                        I flew in on a Tuesday. New knee on Thursday. Walking on Saturday. Home the next week — and the bill was a fifth of what Boston quoted me. The translator stayed in the room with my mum for the whole consult.
                        <span style={{ color: 'var(--cobalt-3)' }}>&rdquo;</span>
                    </blockquote>
                    <div className="row gap-3 ai-center">
                        <div
                            className="placeholder placeholder-ink"
                            style={{ width: 48, height: 48, borderRadius: 'var(--r-2)', fontSize: 10 }}
                        >
                            MW
                        </div>
                        <div className="col">
                            <div style={{ fontWeight: 500, color: 'var(--paper)' }}>Margaret W.</div>
                            <div
                                className="mono"
                                style={{
                                    color: 'rgba(255,255,255,.55)',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                Boston → Delhi · Knee replacement · Mar 2026
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VI / final CTA ───────────────────────────────── */}
            <section style={{ padding: '72px clamp(16px, 4vw, 28px)' }}>
                <div
                    className="card"
                    style={{
                        maxWidth: 980,
                        margin: '0 auto',
                        padding: 'clamp(28px, 4vw, 48px)',
                        textAlign: 'center',
                    }}
                >
                    <span className="section-mark" style={{ justifyContent: 'center' }}>
                        VI / ready to plan?
                    </span>
                    <h2
                        className="display"
                        style={{
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            margin: '14px 0 12px',
                            letterSpacing: '-0.035em',
                            fontWeight: 600,
                            lineHeight: 1.1,
                        }}
                    >
                        Speak with our patient care team<span style={{ color: 'var(--orange)' }}>.</span>
                    </h2>
                    <p
                        className="lede"
                        style={{ fontSize: 17, maxWidth: 560, margin: '0 auto 18px' }}
                    >
                        We&rsquo;ll review your case and send a complete treatment roadmap within 24 hours.
                    </p>
                    <Link href="/medical-travel/bot" className="btn btn-cobalt btn-lg">
                        Get my free PDF estimate →
                    </Link>
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.10em',
                            marginTop: 18,
                        }}
                    >
                        100% confidential · no obligation
                    </div>
                </div>
            </section>
        </main>
    );
}
