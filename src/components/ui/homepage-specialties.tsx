'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Condition = {
    slug: string;
    commonName: string;
    specialistType: string | null;
    description: string | null;
};

interface HomepageSpecialtiesProps {
    specialties: string[];
    grouped: Record<string, Condition[]>;
    rawTypesBySpecialty: Record<string, string[]>;
    counts?: Record<string, number>;
    icons?: Record<string, string>;
    country?: string;
    lang?: string;
}

/**
 * Bureau-style specialty browser. Two-column on desktop:
 *   left   — vertical list of specialties (rule-divided, no fills)
 *   right  — paper card showing the active specialty's top conditions
 *
 * On mobile the left column collapses to a horizontal scroll of mono pills.
 *
 * Only the initial specialty arrives pre-loaded from the server; others
 * fetch lazily on click so the homepage doesn't block on 37 parallel
 * Prisma queries to populate tabs nobody clicks.
 */
export default function HomepageSpecialties({
    specialties,
    grouped: initialGrouped,
    rawTypesBySpecialty,
    counts,
    icons,
    country = 'india',
    lang = 'en',
}: HomepageSpecialtiesProps) {
    const [activeSpecialty, setActiveSpecialty] = useState<string>(specialties[0] || '');
    const [grouped, setGrouped] = useState<Record<string, Condition[]>>(initialGrouped);
    const [loadingSpec, setLoadingSpec] = useState<string | null>(null);

    const ensureLoaded = useCallback(
        async (spec: string) => {
            if (!spec || grouped[spec] !== undefined) return;
            const rawTypes = rawTypesBySpecialty[spec] || [];
            if (rawTypes.length === 0) {
                setGrouped((g) => ({ ...g, [spec]: [] }));
                return;
            }
            setLoadingSpec(spec);
            try {
                const params = new URLSearchParams({ types: rawTypes.join(',') });
                const res = await fetch(`/api/specialty-conditions?${params}`);
                const data = await res.json();
                setGrouped((g) => ({ ...g, [spec]: data.conditions || [] }));
            } catch {
                setGrouped((g) => ({ ...g, [spec]: [] }));
            } finally {
                setLoadingSpec((s) => (s === spec ? null : s));
            }
        },
        [grouped, rawTypesBySpecialty],
    );

    useEffect(() => {
        ensureLoaded(activeSpecialty);
    }, [activeSpecialty, ensureLoaded]);

    if (!specialties.length) return null;

    const currentConditions = grouped[activeSpecialty];
    const isLoadingCurrent = loadingSpec === activeSpecialty && !currentConditions;
    const currentCount = counts?.[activeSpecialty];

    return (
        <div className="row gap-7 ai-start" style={{ flexWrap: 'wrap' }}>
            {/* Specialty list */}
            <div
                className="col gap-2"
                style={{ flex: '1 1 520px', minWidth: 0, position: 'relative' }}
            >
                {/* Mobile horizontal scroll */}
                <div
                    className="row gap-2 hide-scrollbar v4-spec-mobile"
                    style={{ overflowX: 'auto', paddingBottom: 4 }}
                >
                    {specialties.map((s) => {
                        const isActive = activeSpecialty === s;
                        return (
                            <button
                                key={s}
                                onClick={() => setActiveSpecialty(s)}
                                className={isActive ? 'pill pill-cobalt' : 'pill'}
                                style={{ flexShrink: 0, cursor: 'pointer', textTransform: 'none' }}
                            >
                                {icons?.[s] && <span aria-hidden="true">{icons[s]}</span>}
                                {s}
                                {counts?.[s] != null && (
                                    <span style={{ opacity: 0.7 }}>· {counts[s].toLocaleString()}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Desktop compact 2-col grid */}
                <div className="v4-spec-desktop" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                        className="kicker"
                        style={{ marginBottom: 8, padding: '0 4px' }}
                    >
                        <span className="dot" />{specialties.length} specialties
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 2,
                        }}
                    >
                        {specialties.map((s) => {
                            const isActive = activeSpecialty === s;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setActiveSpecialty(s)}
                                    className="row ai-center between"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid',
                                        borderColor: isActive ? 'var(--ink)' : 'transparent',
                                        background: isActive ? 'var(--paper)' : 'transparent',
                                        borderRadius: 'var(--r-2)',
                                        color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                                        fontWeight: isActive ? 500 : 400,
                                        fontSize: 13,
                                        lineHeight: 1.2,
                                        transition: 'background 120ms, border-color 120ms',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        minWidth: 0,
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        className="truncate"
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            minWidth: 0,
                                        }}
                                    >
                                        {s}
                                    </span>
                                    {counts?.[s] != null && (
                                        <span
                                            className="mono"
                                            style={{
                                                fontSize: 10,
                                                color: isActive ? 'var(--ink-3)' : 'var(--ink-4)',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {counts[s].toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <Link
                        href="/conditions"
                        className="row ai-center between"
                        style={{
                            marginTop: 10,
                            padding: '10px 14px',
                            background: 'var(--ink)',
                            color: 'var(--paper)',
                            borderRadius: 'var(--r-2)',
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        <span>Browse all conditions</span>
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>

            {/* Active specialty card */}
            <div
                className="card"
                style={{ flex: '1 1 480px', padding: 0, overflow: 'hidden', minWidth: 0 }}
            >
                <div
                    className="row between ai-baseline hairline-b"
                    style={{ padding: '20px 24px', flexWrap: 'wrap', gap: 12 }}
                >
                    <div className="col gap-1">
                        <span className="kicker">
                            <span className="dot" />specialty
                        </span>
                        <h3
                            className="display"
                            style={{
                                fontSize: 28,
                                margin: 0,
                                fontWeight: 600,
                                letterSpacing: '-0.025em',
                            }}
                        >
                            {activeSpecialty}
                        </h3>
                    </div>
                    {currentCount != null && (
                        <span className="pill">
                            {currentCount.toLocaleString()} conditions indexed
                        </span>
                    )}
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 0,
                        minHeight: 220,
                    }}
                >
                    {isLoadingCurrent
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <div
                                  key={`skeleton-${i}`}
                                  className="col gap-2"
                                  style={{
                                      padding: '16px 22px',
                                      borderRight: '1px solid var(--rule)',
                                      borderBottom:
                                          i < 4 ? '1px solid var(--rule)' : 'none',
                                  }}
                                  aria-hidden="true"
                              >
                                  <div
                                      style={{
                                          height: 14,
                                          width: '70%',
                                          background: 'var(--rule)',
                                          borderRadius: 4,
                                      }}
                                  />
                                  <div
                                      style={{
                                          height: 10,
                                          width: '90%',
                                          background: 'var(--rule)',
                                          borderRadius: 4,
                                          opacity: 0.6,
                                      }}
                                  />
                              </div>
                          ))
                        : (currentConditions || []).slice(0, 12).map((cond, i) => {
                              const list = currentConditions || [];
                              const colCount = list.length >= 6 ? 2 : 1;
                              const isLastRow =
                                  i >= list.slice(0, 12).length - colCount;
                        return (
                            <Link
                                key={cond.slug}
                                href={`/${country}/${lang}/${cond.slug}`}
                                className="col gap-1"
                                style={{
                                    padding: '16px 22px',
                                    borderRight: '1px solid var(--rule)',
                                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                                    transition: 'background 120ms',
                                }}
                            >
                                <span
                                    className="display"
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: 'var(--ink)',
                                        letterSpacing: '-0.015em',
                                    }}
                                >
                                    {cond.commonName}
                                </span>
                                {cond.description && (
                                    <span
                                        className="muted truncate-2"
                                        style={{ fontSize: 12 }}
                                    >
                                        {cond.description}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {currentCount && currentCount > 12 && (
                    <div className="hairline-t row" style={{ padding: '14px 24px' }}>
                        <Link
                            href={`/conditions?specialty=${encodeURIComponent(activeSpecialty)}`}
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 500,
                            }}
                        >
                            View all {currentCount.toLocaleString()} {activeSpecialty} conditions →
                        </Link>
                    </div>
                )}
            </div>

            <style>{`
                .v4-spec-mobile { display: none; }
                .v4-spec-desktop { display: flex; flex-direction: column; }
                @media (max-width: 900px) {
                    .v4-spec-mobile { display: flex; }
                    .v4-spec-desktop { display: none; }
                }
            `}</style>
        </div>
    );
}
