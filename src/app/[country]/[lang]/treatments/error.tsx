'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function LocalizedTreatmentsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Localized treatments error:', error);
    }, [error]);

    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-3"><span className="dot" />Treatments</div>
                <h1 className="display text-2xl mb-2">Couldn&apos;t load treatments</h1>
                <p className="muted mb-6 text-sm">
                    {error?.message || 'Something went wrong while fetching treatments for this region.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => reset()} className="v4-btn v4-btn-cobalt">
                        Try again
                    </button>
                    <Link href="/treatments" className="v4-btn v4-btn-paper">
                        All treatments
                    </Link>
                </div>
            </div>
        </div>
    );
}
