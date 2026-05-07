'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Root error boundary:', error);
    }, [error]);

    return (
        <div className="v4-root min-h-[70vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-24">
            <div className="card max-w-lg w-full p-8 text-center">
                <div className="kicker mb-4"><span className="dot" />Error</div>
                <h1 className="display text-3xl mb-3">Something went wrong</h1>
                <p className="muted mb-8">
                    We hit an unexpected error rendering this page. You can try again, or head back to the homepage.
                </p>
                {error?.digest ? (
                    <p className="mono text-xs muted-2 mb-6">ref: {error.digest}</p>
                ) : null}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={() => reset()} className="v4-btn v4-btn-cobalt v4-btn-lg">
                        Try again
                    </button>
                    <Link href="/" className="v4-btn v4-btn-paper v4-btn-lg">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
