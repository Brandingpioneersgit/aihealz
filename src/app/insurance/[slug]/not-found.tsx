import Link from 'next/link';

export default function InsuranceNotFound() {
    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-3"><span className="dot" />404</div>
                <h1 className="display text-3xl mb-2">Insurance provider not found</h1>
                <p className="muted mb-6 text-sm">
                    We couldn&apos;t find that insurance provider page.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/insurance" className="v4-btn v4-btn-cobalt">
                        Browse providers
                    </Link>
                    <Link href="/" className="v4-btn v4-btn-paper">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
