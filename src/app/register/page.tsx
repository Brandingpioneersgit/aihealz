import Link from 'next/link';

export const metadata = {
    title: 'Create an account',
    description: 'Join AIHealz to save symptom checks, manage bookings, and keep your medical records in one secure vault.',
    alternates: { canonical: '/register' },
    robots: { index: false, follow: false },
};

export default function RegisterPage() {
    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <h1 className="text-3xl font-semibold tracking-tight">Create your AIHealz account</h1>
            <p className="mt-3 text-neutral-600">
                Patient registration is launching soon. Until then, all our public tools work without an
                account.
            </p>

            <div className="mt-8 space-y-3">
                <Link
                    href="/healz-ai"
                    className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-white font-medium hover:bg-emerald-700"
                >
                    Use Healz AI now
                </Link>
                <Link
                    href="/contact"
                    className="block rounded-lg border border-neutral-300 px-4 py-3 text-center font-medium hover:bg-neutral-50"
                >
                    Request early access
                </Link>
            </div>

            <hr className="my-8 border-neutral-200" />

            <p className="text-sm text-neutral-600">
                Healthcare provider?{' '}
                <Link href="/provider/login" className="text-emerald-700 underline">
                    Provider sign-in
                </Link>
            </p>
            <p className="mt-2 text-sm text-neutral-600">
                Already have access?{' '}
                <Link href="/login" className="text-emerald-700 underline">
                    Sign in
                </Link>
            </p>
        </main>
    );
}
