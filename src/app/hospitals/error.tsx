'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function HospitalsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Hospitals error:', error);
    }, [error]);

    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-3"><span className="dot" />Hospitals</div>
                <h1 className="display text-2xl mb-2">Couldn&apos;t load hospitals</h1>
                <p className="muted mb-6 text-sm">
                    {error?.message || 'Something went wrong while fetching hospitals.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => reset()} className="v4-btn v4-btn-cobalt">
                        Try again
                    </button>
                    <Link href="/" className="v4-btn v4-btn-paper">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
