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
        <main className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-4xl font-semibold tracking-tight">Help Center</h1>
            <p className="mt-3 text-lg text-neutral-600">
                Quick answers and direct links to everything on AIHealz. Can&apos;t find what you need?{' '}
                <Link href="/contact" className="text-emerald-700 underline">
                    Contact our team
                </Link>
                .
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {TOPICS.map(({ heading, items }) => (
                    <section key={heading}>
                        <h2 className="text-lg font-semibold">{heading}</h2>
                        <ul className="mt-3 space-y-2">
                            {items.map(({ label, href }) => (
                                <li key={href}>
                                    <Link href={href} className="text-emerald-700 hover:underline">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </main>
    );
}
