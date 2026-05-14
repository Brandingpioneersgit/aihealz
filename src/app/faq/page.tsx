import { Metadata } from 'next';
import Link from 'next/link';
import V4Page from '@/components/v4/Shell';
import FAQAccordion from './FAQAccordion';
import MediaTile from '@/components/v4/MediaTile';
import { UTIL_IMAGES } from '@/lib/stock-images';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'FAQ — answers from aihealz',
  description:
    'Common questions about aihealz: patients, doctors, privacy, billing, and how the platform works.',
  alternates: { canonical: 'https://aihealz.com/faq' },
  openGraph: {
    title: 'aihealz FAQ',
    description: 'Common questions from patients, doctors, and partners.',
    url: 'https://aihealz.com/faq',
    siteName: 'aihealz',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aihealz FAQ',
    description: 'Common questions from patients, doctors, and partners.',
  },
};

const SECTIONS = [
  {
    title: 'General',
    qa: [
      ['What is aihealz?', 'aihealz is an AI-powered medical platform that connects patients with verified doctors, hospitals, diagnostic labs, and editorial-grade health information.'],
      ['Is aihealz free to use?', 'Browsing conditions, doctors, and the symptom checker is free. Some specialist services and bookings may carry a fee.'],
      ['Which countries do you cover?', 'We have active coverage in India, the USA, the UK, the UAE, Thailand, Turkey, and Mexico, with more launching every quarter.'],
      ['Are the doctors on aihealz real?', 'Yes — every listed doctor has a verified profile reviewed by our admin team and cross-checked against official medical registries.'],
      ['Is aihealz a substitute for a real doctor?', 'No. aihealz helps you find the right specialist faster, but it is not a substitute for a clinical consultation, diagnosis, or treatment.'],
    ],
  },
  {
    title: 'Patients',
    qa: [
      ['How do I find the right specialist?', 'Use the symptom checker, search by condition, or browse by specialty and location. We rank doctors by relevance, verification, and ratings.'],
      ['How do I book an appointment?', 'Pick a doctor, hit "Book", and complete the form. You will receive a confirmation by email and SMS.'],
      ['Can I get a teleconsult?', 'Yes — many doctors offer teleconsults. Look for the video icon on the doctor profile.'],
      ['What if I need a second opinion?', 'Use our medical-travel concierge to get a structured second opinion, including from international specialists.'],
      ['Can I upload a medical report for analysis?', 'Yes. Use /analyze to upload a report and get a plain-English summary, severity flags, and matched specialists.'],
    ],
  },
  {
    title: 'Doctors',
    qa: [
      ['How do I list my profile?', 'Go to /provider/join, fill out the form, and submit your license and credentials. Listing is free for the basic tier.'],
      ['How are doctors verified?', 'Our team checks your medical registration number against the relevant national registry and reviews your credentials manually.'],
      ['Do I get patient leads?', 'Yes. Verified doctors receive matched leads in the doctor portal, with intent scoring and contact reveal credits.'],
      ['Can I respond to leads from my phone?', 'Yes — the dashboard is mobile-optimized and lead notifications go out by email and SMS.'],
      ['Can I list my clinic and team?', 'Yes. Premium tier supports a clinic profile, team members, and custom availability.'],
    ],
  },
  {
    title: 'Privacy',
    qa: [
      ['Is my health data private?', 'Yes. All data is end-to-end encrypted in transit and at rest. We never sell personal health data.'],
      ['How long do you retain symptom data?', 'Anonymized symptom check inputs are deleted within 24 hours unless you save them to your patient vault.'],
      ['Are you HIPAA compliant?', 'We follow HIPAA-aligned operational controls in the US and equivalent regulations elsewhere (GDPR, India DPDP).'],
      ['Who sees my booking details?', 'Only the doctor or facility you book with, and the team members they explicitly authorize.'],
      ['How do I delete my account?', 'Email privacy@aihealz.com or use the in-product account deletion option. Data is purged within 30 days of confirmation.'],
    ],
  },
  {
    title: 'Billing',
    qa: [
      ['How do payments work?', 'We use Stripe for international payments and local PSPs (Razorpay) for India. You only pay when you book or subscribe.'],
      ['Can I get a refund?', 'Yes — refunds are honored if the appointment did not happen, per our refund policy.'],
      ['Do you accept insurance?', 'Selected hospitals and labs accept cashless insurance. We surface this on the listing.'],
      ['Are doctor consultation fees fixed?', 'Each doctor sets their own fee. Fees are shown before you book.'],
      ['Where do I get an invoice?', 'Invoices are emailed automatically and also available in your booking history.'],
    ],
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SECTIONS.flatMap((s) =>
    s.qa.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  ),
};

export default function FAQPage() {
  return (
    <V4Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div
        className="v4-root"
        style={{ background: 'var(--bg)', color: 'var(--ink-1)', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <nav
            className="row gap-2 mono"
            style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 24 }}
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>FAQ</span>
          </nav>

          <div className="row gap-7 ai-end" style={{ flexWrap: 'wrap', marginBottom: 48 }}>
            <div className="col gap-3" style={{ flex: '1 1 420px', minWidth: 0 }}>
              <span className="section-mark">help / answers</span>
              <h1
                className="display"
                style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.04em', margin: 0, fontWeight: 600 }}
              >
                Questions, answered<span style={{ color: 'var(--orange)' }}>.</span>
              </h1>
              <p className="lede" style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, margin: 0 }}>
                The things people ask us most often, grouped by what you came here for.
              </p>
            </div>
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <MediaTile
                alt={UTIL_IMAGES.library.alt}
                icon={UTIL_IMAGES.library.icon}
                tone={UTIL_IMAGES.library.tone}
                aspect="4 / 3"
                iconSize={64}
                priority
                style={{
                  borderRadius: 'var(--r-3, 8px)',
                  border: '1px solid var(--rule)',
                }}
              />
            </div>
          </div>

          <div style={{ maxWidth: 880 }}>

          {SECTIONS.map((section) => (
            <section key={section.title} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>{section.title}</h2>
              <FAQAccordion items={section.qa.map(([q, a]) => ({ q, a }))} />
            </section>
          ))}

          <div
            className="card-flat"
            style={{ padding: 24, marginTop: 32, borderRadius: 16 }}
          >
            <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              Still stuck?{' '}
              <Link href="/contact" style={{ color: 'var(--cobalt)', fontWeight: 500 }}>
                Talk to our team →
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </V4Page>
  );
}
