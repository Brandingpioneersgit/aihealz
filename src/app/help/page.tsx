import Link from 'next/link';

export const metadata = {
    title: 'Help Center',
    description: 'Find answers, reach support, and get the most out of AIHealz — symptom checking, vault, bookings, and provider tools.',
    alternates: { canonical: '/help' },
    openGraph: {
        title: 'AIHealz Help Center',
        description: 'Help articles and support for AIHealz patients and providers.',
        url: '/help',
        type: 'website',
    },
};

const TOPICS = [
    {
        heading: 'Getting started',
        items: [
            { label: 'How AIHealz works', href: '/about' },
            { label: 'Try the symptom checker', href: '/healz-ai' },
            { label: 'Browse conditions', href: '/conditions' },
        ],
    },
    {
        heading: 'For patients',
        items: [
            { label: 'Patient vault & records', href: '/vault' },
            { label: 'Find a doctor', href: '/doctors' },
            { label: 'Book a diagnostic test', href: '/tests' },
            { label: 'Compare hospitals', href: '/hospitals' },
        ],
    },
    {
        heading: 'For providers',
        items: [
            { label: 'Join as a doctor', href: '/for-doctors' },
            { label: 'Provider sign-in', href: '/provider/login' },
            { label: 'Pricing for providers', href: '/for-doctors/pricing' },
        ],
    },
    {
        heading: 'Account & policies',
        items: [
            { label: 'Frequently asked questions', href: '/faq' },
            { label: 'Privacy policy', href: '/privacy' },
            { label: 'Terms of service', href: '/terms' },
            { label: 'Contact support', href: '/contact' },
        ],
    },
];

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-white">Help</span>
                </nav>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Help Center</h1>
                <p className="text-lg text-slate-400 leading-relaxed mb-12">
                    Quick answers and direct links to everything on aihealz. Can&apos;t find what you need?{' '}
                    <Link href="/contact" className="text-teal-400 hover:text-teal-300 font-medium">
                        Contact our team
                    </Link>
                    .
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                    {TOPICS.map(({ heading, items }) => (
                        <section key={heading} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">{heading}</h2>
                            <ul className="space-y-2">
                                {items.map(({ label, href }) => (
                                    <li key={href}>
                                        <Link href={href} className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5">
                                            <span>→</span>
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
