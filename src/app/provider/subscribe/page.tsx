'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { ProviderAuthGate } from '@/components/provider/AuthGate';

/**
 * Subscription Upgrade Page
 *
 * Shows plan details and handles payment flow.
 * Currently a placeholder - will integrate with Razorpay.
 */

const PLANS = {
    premium: {
        name: 'Premium',
        price: 4999,
        currency: 'INR',
        period: 'month',
        features: [
            'Priority profile listing',
            '15 condition specialties',
            '50 lead credits per month',
            'Website URL on profile',
            'Full contact display',
            'Complete analytics dashboard',
            'Tele-Link video consultations',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        price: 19999,
        currency: 'INR',
        period: 'month',
        features: [
            'Featured "Top Doctor" badge',
            'Unlimited condition specialties',
            '500 lead credits per month',
            'Guaranteed top 3 in search',
            'Custom branding options',
            'Dedicated account manager',
        ],
    },
};

function SubscribeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planKey = searchParams.get('plan') || 'premium';
    const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.premium;

    const [loading, setLoading] = useState(false);
    const [doctorId, setDoctorId] = useState<string>('');

    useEffect(() => {
        const storedId = localStorage.getItem('provider_doctor_id');
        if (storedId) setDoctorId(storedId);
    }, []);

    async function handlePayment() {
        setLoading(true);

        try {
            const res = await fetch('/api/provider/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: parseInt(doctorId, 10),
                    planId: planKey,
                }),
            });

            if (res.ok) {
                router.push('/provider/dashboard?upgraded=true');
            } else {
                const error = await res.json();
                alert(error.message || 'Payment failed. Please try again.');
            }
        } catch {
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            style={{
                background: 'var(--bg)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
            }}
        >
            <div style={{ width: '100%', maxWidth: 520 }} className="col gap-4">
                <button
                    onClick={() => router.back()}
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                >
                    ← Back to dashboard
                </button>

                <div className="card col gap-5" style={{ padding: 32 }}>
                    <div className="col ai-center gap-3 text-center">
                        <span className="spec-icon" style={{ background: 'var(--cobalt)', width: 56, height: 56, fontSize: 22 }}>★</span>
                        <span className="section-mark">provider / subscribe</span>
                        <h1 className="display" style={{ fontSize: 26, margin: 0, fontWeight: 600, letterSpacing: '-0.025em' }}>
                            Upgrade to {plan.name}<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            Unlock premium features for your practice.
                        </p>
                    </div>

                    {/* Price */}
                    <div className="col ai-center gap-1 hairline-t hairline-b" style={{ padding: '20px 0' }}>
                        <span className="num bignum" style={{ fontSize: 40, color: 'var(--ink)' }}>
                            ₹{plan.price.toLocaleString()}
                            <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink-3)', letterSpacing: 'normal' }}>/{plan.period}</span>
                        </span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Billed monthly · cancel anytime
                        </span>
                    </div>

                    {/* Features */}
                    <ul className="clean col gap-2">
                        {plan.features.map((feature) => (
                            <li key={feature} className="row ai-center gap-3" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 'var(--r-2)',
                                        background: 'var(--mint-50)',
                                        color: 'var(--mint-3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}
                                >
                                    ✓
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Payment button */}
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="btn btn-cobalt btn-lg"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {loading ? 'Processing…' : `Pay ₹${plan.price.toLocaleString()}/month →`}
                    </button>

                    {/* Trust */}
                    <div className="row center gap-4" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                        <span className="mono" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔒 Secure payment</span>
                        <span className="mono" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Razorpay protected</span>
                    </div>

                    <p className="muted" style={{ fontSize: 12, textAlign: 'center', margin: 0 }}>
                        By subscribing, you agree to our{' '}
                        <a href="/terms" style={{ color: 'var(--cobalt)' }}>Terms of Service</a>{' '}and{' '}
                        <a href="/privacy" style={{ color: 'var(--cobalt)' }}>Privacy Policy</a>.
                    </p>
                </div>

                <p className="muted" style={{ fontSize: 13, textAlign: 'center', margin: 0 }}>
                    Need help choosing a plan?{' '}
                    <a href="/contact" style={{ color: 'var(--cobalt)' }}>Contact our team</a>
                </p>
            </div>
        </main>
    );
}

export default function SubscribePage() {
    return (
        <ProviderAuthGate>
            <Suspense
                fallback={
                    <div
                        style={{
                            background: 'var(--bg)',
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                width: 32,
                                height: 32,
                                border: '2px solid var(--rule)',
                                borderTopColor: 'var(--cobalt)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                }
            >
                <SubscribeContent />
            </Suspense>
        </ProviderAuthGate>
    );
}
