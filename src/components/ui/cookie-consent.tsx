'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'aihealz_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
    const [status, setStatus] = useState<ConsentStatus>('pending');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (saved === 'accepted' || saved === 'rejected') {
                setStatus(saved as ConsentStatus);
            }
        }
    }, []);

    const handleAccept = () => {
        setStatus('accepted');
        if (typeof window !== 'undefined') {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        }
    };

    const handleReject = () => {
        setStatus('rejected');
        if (typeof window !== 'undefined') {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        }
    };

    if (!mounted || status !== 'pending') {
        return null;
    }

    return (
        <div
            className="print:hidden"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: 16,
            }}
        >
            <div
                className="card"
                style={{
                    maxWidth: 960,
                    margin: '0 auto',
                    padding: 22,
                }}
            >
                <div className="row ai-start gap-4 between" style={{ flexWrap: 'wrap' }}>
                    <div className="row ai-start gap-3" style={{ flex: 1, minWidth: 280 }}>
                        <span className="spec-icon" aria-hidden="true">
                            ⌗
                        </span>
                        <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                            <h3
                                className="display"
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    margin: 0,
                                    color: 'var(--ink)',
                                    letterSpacing: '-0.015em',
                                }}
                            >
                                We value your privacy
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                                We use cookies to enhance browsing, analyze traffic, and personalize content.
                                By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                                <Link
                                    href="/privacy"
                                    style={{
                                        color: 'var(--cobalt)',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: 2,
                                    }}
                                >
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="row gap-2" style={{ flexShrink: 0 }}>
                        <button
                            onClick={handleReject}
                            className="btn btn-paper btn-sm"
                        >
                            Reject all
                        </button>
                        <button
                            onClick={handleAccept}
                            className="btn btn-cobalt btn-sm"
                        >
                            Accept all
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
