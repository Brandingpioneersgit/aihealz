import Link from 'next/link';

export const metadata = {
    title: 'Sign in',
    description: 'Sign in to AIHealz to access your patient vault, bookings, and personalised health tools.',
    alternates: { canonical: '/login' },
    robots: { index: false, follow: false },
};

export default function PatientLoginPage() {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <h1 className="text-3xl font-semibold tracking-tight">Sign in to AIHealz</h1>
            <p className="mt-3 text-neutral-600">
                Patient sign-in is coming soon. In the meantime, you can use the AI symptom checker and
                vault without an account, or contact us for early access.
            </p>

            <div className="mt-8 space-y-3">
                <Link
                    href="/healz-ai"
                    className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-white font-medium hover:bg-emerald-700"
                >
                    Try Healz AI (no account)
                </Link>
                <Link
                    href="/vault"
                    className="block rounded-lg border border-neutral-300 px-4 py-3 text-center font-medium hover:bg-neutral-50"
                >
                    Open Patient Vault
                </Link>
            </div>

            <hr className="my-8 border-neutral-200" />

            <p className="text-sm text-neutral-600">
                Are you a healthcare provider?{' '}
                <Link href="/provider/login" className="text-emerald-700 underline">
                    Provider sign-in
                </Link>
            </p>
            <p className="mt-2 text-sm text-neutral-600">
                New here?{' '}
                <Link href="/register" className="text-emerald-700 underline">
                    Create an account
                </Link>
            </p>
        </main>
    );
}
