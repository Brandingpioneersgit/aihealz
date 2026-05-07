import Link from 'next/link';

export default function TreatmentNotFound() {
    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-3"><span className="dot" />404</div>
                <h1 className="display text-3xl mb-2">Treatment not found</h1>
                <p className="muted mb-6 text-sm">
                    We couldn&apos;t find that treatment. It may have been renamed or removed.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/treatments" className="v4-btn v4-btn-cobalt">
                        Browse all treatments
                    </Link>
                    <Link href="/" className="v4-btn v4-btn-paper">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
