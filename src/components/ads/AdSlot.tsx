'use client';

import { useState, useEffect, useRef } from 'react';
import type { AdPlacement } from '@prisma/client';

interface AdData {
    campaignId: number;
    creativeId: number;
    advertiserId: number;
    headline: string | null;
    description: string | null;
    ctaText: string | null;
    destinationUrl: string;
    imageUrl: string | null;
    imageAlt: string | null;
    logoUrl: string | null;
    width: number | null;
    height: number | null;
    adType: string;
    companyName: string;
}

interface AdSlotProps {
    placement: AdPlacement;
    conditionSlug?: string;
    specialtyType?: string;
    countryCode?: string | null;
    citySlug?: string | null;
    languageCode?: string;
    className?: string;
    fallback?: React.ReactNode;
}

export default function AdSlot({
    placement,
    conditionSlug,
    specialtyType,
    countryCode,
    citySlug,
    languageCode = 'en',
    className = '',
    fallback = null,
}: AdSlotProps) {
    const [ad, setAd] = useState<AdData | null>(null);
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [impressionId, setImpressionId] = useState<string | null>(null);
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const params = new URLSearchParams({
                    placement,
                    ...(countryCode && { country: countryCode }),
                    ...(citySlug && { city: citySlug }),
                    ...(conditionSlug && { condition: conditionSlug }),
                    ...(specialtyType && { specialty: specialtyType }),
                    lang: languageCode,
                });

                const res = await fetch(`/api/ads/serve?${params.toString()}`);
                const data = await res.json();

                if (data.ad) {
                    setAd(data.ad);
                }
                if (data.sessionHash) {
                    setSessionHash(data.sessionHash);
                }
            } catch (error) {
                console.error('Failed to fetch ad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [placement, conditionSlug, specialtyType, countryCode, citySlug, languageCode]);

    useEffect(() => {
        if (!ad || !sessionHash || hasTrackedImpression.current) return;

        const trackImpression = async () => {
            try {
                const res = await fetch('/api/ads/track/impression', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        campaignId: ad.campaignId,
                        sessionHash,
                        placement,
                        pageUrl: window.location.href,
                        countryCode,
                        citySlug,
                        conditionSlug,
                        languageCode,
                    }),
                });
                const data = await res.json();
                if (data.impressionId) {
                    setImpressionId(data.impressionId);
                }
                hasTrackedImpression.current = true;
            } catch (error) {
                console.error('Failed to track impression:', error);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTrackedImpression.current) {
                        trackImpression();
                    }
                });
            },
            { threshold: 0.5 }
        );

        const adElement = document.getElementById(`ad-slot-${placement}-${ad.campaignId}`);
        if (adElement) {
            observer.observe(adElement);
        }

        return () => observer.disconnect();
    }, [ad, sessionHash, placement, countryCode, citySlug, conditionSlug, languageCode]);

    const handleClick = async () => {
        if (!ad || !sessionHash) return;

        try {
            await fetch('/api/ads/track/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: ad.campaignId,
                    impressionId,
                    sessionHash,
                    placement,
                    pageUrl: window.location.href,
                    destinationUrl: ad.destinationUrl,
                    countryCode,
                    citySlug,
                }),
            });
        } catch (error) {
            console.error('Failed to track click:', error);
        }

        window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div
                className={`placeholder ${className}`}
                style={{ minHeight: 100 }}
                aria-busy="true"
            >
                Sponsored
            </div>
        );
    }

    if (!ad) {
        return fallback ? <>{fallback}</> : null;
    }

    return (
        <div
            id={`ad-slot-${placement}-${ad.campaignId}`}
            className={className}
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleClick}
        >
            {/* Ad label — mono kicker */}
            <span
                className="mono"
                style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    padding: '2px 8px',
                    background: 'var(--paper)',
                    color: 'var(--ink-3)',
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-1)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                Sponsored
            </span>

            {/* Ad content */}
            {ad.imageUrl ? (
                <div
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 'var(--r-3)',
                        background: 'var(--bg-2)',
                        border: '1px solid var(--rule)',
                        transition: 'border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cobalt)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--rule)';
                    }}
                >
                    <img
                        src={ad.imageUrl}
                        alt={ad.imageAlt || ad.headline || 'Advertisement'}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            objectFit: 'cover',
                            maxWidth: ad.width ? `${ad.width}px` : undefined,
                            maxHeight: ad.height ? `${ad.height}px` : undefined,
                        }}
                    />
                </div>
            ) : (
                <div
                    className="card-flat"
                    style={{
                        padding: 16,
                        background: 'var(--paper)',
                        transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cobalt)';
                        e.currentTarget.style.background = 'var(--paper-2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--rule)';
                        e.currentTarget.style.background = 'var(--paper)';
                    }}
                >
                    {ad.logoUrl && (
                        <img
                            src={ad.logoUrl}
                            alt={ad.companyName}
                            style={{
                                width: 36,
                                height: 36,
                                objectFit: 'contain',
                                borderRadius: 'var(--r-1)',
                                marginBottom: 12,
                            }}
                        />
                    )}
                    {ad.headline && (
                        <h4
                            className="display"
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: 'var(--ink)',
                                margin: '0 0 6px',
                                letterSpacing: '-0.015em',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {ad.headline}
                        </h4>
                    )}
                    {ad.description && (
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--ink-3)',
                                margin: '0 0 14px',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {ad.description}
                        </p>
                    )}
                    <div className="row between ai-center">
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-4)',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {ad.companyName}
                        </span>
                        {ad.ctaText && (
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--cobalt)',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {ad.ctaText} →
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
