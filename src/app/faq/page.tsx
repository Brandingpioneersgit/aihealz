import { Metadata } from 'next';
import Link from 'next/link';
import FAQAccordion from './FAQAccordion';

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
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">FAQ</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-4">
          Questions, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">answered.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
          The things people ask us most often, grouped by what you came here for.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{section.title}</h2>
            <FAQAccordion items={section.qa.map(([q, a]) => ({ q, a }))} />
          </section>
        ))}

        <div className="mt-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
          <p className="text-sm text-slate-300">
            Still stuck?{' '}
            <Link href="/contact" className="text-teal-400 hover:text-teal-300 font-medium">
              Talk to our team →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
