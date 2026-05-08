import Link from 'next/link';

export const metadata = {
    title: 'Sign in',
    description: 'Sign in to AIHealz to access your patient vault, bookings, and personalised health tools.',
    alternates: { canonical: '/login' },
    robots: { index: false, follow: false },
};

export default function PatientLoginPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden flex items-center">
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="max-w-md mx-auto px-6 w-full relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/5 p-8 md:p-10 shadow-2xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Sign in to aihealz</h1>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        Patient sign-in is coming soon. In the meantime, you can use the AI symptom checker and
                        vault without an account, or contact us for early access.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/healz-ai"
                            className="block rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-3 text-center text-slate-900 font-bold transition-colors shadow-lg shadow-teal-500/20"
                        >
                            Try Healz AI (no account)
                        </Link>
                        <Link
                            href="/vault"
                            className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-center text-white font-medium transition-colors"
                        >
                            Open Patient Vault
                        </Link>
                    </div>

                    <hr className="my-8 border-white/5" />

                    <p className="text-sm text-slate-400">
                        Are you a healthcare provider?{' '}
                        <Link href="/provider/login" className="text-teal-400 hover:text-teal-300 font-medium">
                            Provider sign-in
                        </Link>
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        New here?{' '}
                        <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
