import Link from 'next/link';

export const revalidate = 604800;

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
        <main className="mx-auto max-w-3xl px-6 py-12 prose prose-neutral">
            <h1>AIHealz Partner Agreement</h1>
            <p className="lead">
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

            <p className="text-sm text-neutral-500">
                This is a plain-language summary, not a substitute for the full master services
                agreement signed during onboarding.
            </p>
        </main>
    );
}
