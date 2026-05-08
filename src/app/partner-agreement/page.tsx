import Link from 'next/link';

export const metadata = {
    title: 'Partner Agreement',
    description: 'Terms governing the relationship between AIHealz and verified partner providers, hospitals, and diagnostic labs.',
    alternates: { canonical: '/partner-agreement' },
    openGraph: {
        title: 'AIHealz Partner Agreement',
        description: 'Terms for AIHealz partner providers and institutions.',
        url: '/partner-agreement',
        type: 'article',
    },
};

export default function PartnerAgreementPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-white">Partner Agreement</span>
                </nav>

                <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mb-4 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3 prose-p:text-slate-400 prose-p:leading-relaxed prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300 prose-strong:text-white">
                    <h1>AIHealz Partner Agreement</h1>
                    <p className="text-lg text-slate-300">
                        This agreement governs your participation as a verified provider, hospital, diagnostic
                        lab, or medical-tourism partner on AIHealz.
                    </p>

                    <h2>1. Eligibility &amp; verification</h2>
                    <p>
                        Partners must hold valid professional registration in their jurisdiction and pass our
                        verification review (medical licence, business registration, accreditation). We may
                        request supporting documents at any time.
                    </p>

                    <h2>2. Listing &amp; content</h2>
                    <p>
                        You authorise AIHealz to publish your name, specialties, contact details, photos, and
                        pricing to help patients discover your services. You are responsible for keeping
                        this information accurate. AIHealz may edit listings for clarity, safety, and
                        editorial standards.
                    </p>

                    <h2>3. Patient enquiries &amp; bookings</h2>
                    <p>
                        Enquiries forwarded through AIHealz must be acknowledged within a reasonable window
                        (typically 24 hours). You will not solicit AIHealz patients to bypass the platform
                        for transactions that originated through it.
                    </p>

                    <h2>4. Fees</h2>
                    <p>
                        Pricing for listings, leads, and premium placements is described on the{' '}
                        <Link href="/for-doctors/pricing">provider pricing page</Link>. Fees may change with
                        30 days&apos; notice; you may cancel at any time without penalty for the remaining
                        billing period.
                    </p>

                    <h2>5. Patient safety &amp; ethics</h2>
                    <p>
                        Partners agree to follow applicable professional codes, advertise only services they
                        are qualified to deliver, and refrain from making unverified medical claims.
                        AIHealz may suspend listings that breach these standards.
                    </p>

                    <h2>6. Data protection</h2>
                    <p>
                        Each party is responsible for the personal and health data it collects. AIHealz acts
                        as data controller for platform-side records and as processor for data you upload.
                        See our <Link href="/privacy">privacy policy</Link> for details.
                    </p>

                    <h2>7. Termination</h2>
                    <p>
                        Either party may end this agreement with written notice. AIHealz may remove listings
                        immediately for safety, legal, or fraud concerns.
                    </p>

                    <h2>8. Changes</h2>
                    <p>
                        We may update these terms; material changes will be communicated by email and on
                        this page. Continued use of the platform after changes constitutes acceptance.
                    </p>

                    <h2>9. Contact</h2>
                    <p>
                        Questions? Reach our partner team via the{' '}
                        <Link href="/contact">contact page</Link>.
                    </p>

                    <p className="text-sm text-slate-500">
                        This is a plain-language summary, not a substitute for the full master services
                        agreement signed during onboarding.
                    </p>
                </div>
            </div>
        </main>
    );
}
