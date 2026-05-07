'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ConditionGeoError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Condition/geo error:', error);
    }, [error]);

    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-3"><span className="dot" />Condition</div>
                <h1 className="display text-2xl mb-2">Couldn&apos;t load this page</h1>
                <p className="muted mb-6 text-sm">
                    {error?.message || 'Something went wrong rendering this condition page.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => reset()} className="v4-btn v4-btn-cobalt">
                        Try again
                    </button>
                    <Link href="/conditions" className="v4-btn v4-btn-paper">
                        Browse conditions
                    </Link>
                </div>
            </div>
        </div>
    );
}
