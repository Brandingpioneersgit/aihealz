'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Admin error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] bg-[--bg] text-[--ink-1] flex items-center justify-center px-6 py-16">
            <div className="max-w-md w-full rounded-lg border border-[--rule] bg-[--paper] p-6 text-center">
                <h2 className="text-lg font-semibold mb-2">Admin error</h2>
                <p className="text-sm text-[--ink-3] mb-4">
                    {error?.message || 'An unexpected error occurred in the admin panel.'}
                </p>
                {error?.digest ? (
                    <p className="font-mono text-xs text-[--ink-4] mb-4">ref: {error.digest}</p>
                ) : null}
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded bg-[--ink] text-[--paper] hover:opacity-90"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
