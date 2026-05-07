'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('Global error boundary:', error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F4F6FA',
                    color: '#0A1A2F',
                    fontFamily:
                        "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    padding: '24px',
                }}
            >
                <div
                    style={{
                        maxWidth: 520,
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #D6DDE9',
                        borderRadius: 14,
                        padding: 32,
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Geist Mono', ui-monospace, monospace",
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#4D6486',
                            marginBottom: 16,
                        }}
                    >
                        Critical Error
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 12px' }}>
                        The application crashed
                    </h1>
                    <p style={{ color: '#4D6486', margin: '0 0 24px', lineHeight: 1.5 }}>
                        A fatal error occurred while rendering. Please try reloading the page.
                    </p>
                    {error?.digest ? (
                        <p
                            style={{
                                fontFamily: "'Geist Mono', ui-monospace, monospace",
                                fontSize: 12,
                                color: '#7A8DA8',
                                marginBottom: 20,
                            }}
                        >
                            ref: {error.digest}
                        </p>
                    ) : null}
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '12px 22px',
                            fontSize: 15,
                            fontWeight: 500,
                            color: '#FFFFFF',
                            background: '#1C5BFF',
                            border: '1px solid #1C5BFF',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        Reload
                    </button>
                </div>
            </body>
        </html>
    );
}
