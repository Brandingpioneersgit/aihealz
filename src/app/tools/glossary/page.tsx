'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface Term {
    term: string;
    pronunciation: string;
    category: string;
    definition: string;
    related: string[];
}

interface GlossaryData {
    categories: Category[];
    terms: Term[];
}

export default function GlossaryPage() {
    const [data, setData] = useState<GlossaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLetter, setSelectedLetter] = useState<string>('all');
    const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/medical-glossary.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const filteredTerms = useMemo(() => {
        if (!data) return [];
        return data.terms.filter(term => {
            const matchesSearch = !searchQuery ||
                term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
            const matchesLetter = selectedLetter === 'all' ||
                term.term.toUpperCase().startsWith(selectedLetter);
            return matchesSearch && matchesCategory && matchesLetter;
        });
    }, [data, searchQuery, selectedCategory, selectedLetter]);

    const termsByLetter = useMemo(() => {
        const grouped: Record<string, Term[]> = {};
        filteredTerms.forEach(term => {
            const letter = term.term[0].toUpperCase();
            if (!grouped[letter]) grouped[letter] = [];
            grouped[letter].push(term);
        });
        return grouped;
    }, [filteredTerms]);

    const getCategoryInfo = (categoryId: string) => {
        return data?.categories.find(c => c.id === categoryId);
    };

    if (loading) {
        return (
            <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '60vh' }}>
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        padding: '64px clamp(16px, 4vw, 28px)',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Loading glossary…
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <div
                style={{ maxWidth: 1100, margin: '0 auto', padding: '48px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-6"
            >
                <nav
                    className="row gap-2 mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    }}
                    aria-label="Breadcrumb"
                >
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/tools">Tools</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>Medical Glossary</span>
                </nav>

                <header className="col gap-4">
                    <span className="section-mark">tools / medical glossary</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 72px)',
                            lineHeight: 0.95,
                            letterSpacing: '-0.045em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ color: 'var(--cobalt)' }}>Medical</span> glossary
                        <span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p
                        className="lede"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', maxWidth: 600 }}
                    >
                        Plain-English definitions of medical terms{data && `, ${data.terms.length} terms across ${data.categories.length} categories`}. Pronunciation included.
                    </p>
                </header>

                {/* Search */}
                <div className="card col gap-4" style={{ padding: 24 }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search a medical term…"
                        className="input"
                        style={{ fontSize: 15 }}
                    />

                    {/* Category filters */}
                    <div className="col gap-2">
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--ink-3)',
                            }}
                        >
                            Filter by category
                        </span>
                        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={selectedCategory === 'all' ? 'pill pill-cobalt' : 'pill'}
                                style={{ cursor: 'pointer' }}
                            >
                                All
                            </button>
                            {data?.categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={selectedCategory === cat.id ? 'pill pill-cobalt' : 'pill'}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alphabet */}
                    <div className="col gap-2">
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--ink-3)',
                            }}
                        >
                            Jump to letter
                        </span>
                        <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedLetter('all')}
                                className={selectedLetter === 'all' ? 'pill pill-cobalt' : 'pill'}
                                style={{ cursor: 'pointer' }}
                            >
                                All
                            </button>
                            {alphabet.map(letter => (
                                <button
                                    key={letter}
                                    onClick={() => setSelectedLetter(letter)}
                                    className={selectedLetter === letter ? 'pill pill-cobalt' : 'pill'}
                                    style={{ cursor: 'pointer', minWidth: 28, justifyContent: 'center' }}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching “${searchQuery}”`}
                </div>

                {/* Terms */}
                <div className="col gap-6">
                    {Object.keys(termsByLetter).sort().map(letter => (
                        <section key={letter} id={`letter-${letter}`} className="col gap-3">
                            <div className="row ai-center gap-3">
                                <span
                                    className="display"
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 600,
                                        color: 'var(--cobalt)',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                        minWidth: 36,
                                    }}
                                >
                                    {letter}
                                </span>
                                <div className="hairline" style={{ flex: 1 }} />
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-3)',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {termsByLetter[letter].length} terms
                                </span>
                            </div>
                            <div
                                style={{
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--paper)',
                                    overflow: 'hidden',
                                }}
                            >
                                {termsByLetter[letter].map((term, i, arr) => {
                                    const category = getCategoryInfo(term.category);
                                    const isExpanded = expandedTerm === term.term;
                                    return (
                                        <div
                                            key={term.term}
                                            style={{
                                                borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                            }}
                                        >
                                            <button
                                                onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                                                style={{
                                                    width: '100%',
                                                    padding: '18px 22px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div className="col gap-1">
                                                    <div className="row between ai-start" style={{ gap: 12 }}>
                                                        <div className="col gap-1" style={{ minWidth: 0 }}>
                                                            <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap' }}>
                                                                <span
                                                                    className="display"
                                                                    style={{
                                                                        fontSize: 17,
                                                                        fontWeight: 600,
                                                                        letterSpacing: '-0.015em',
                                                                    }}
                                                                >
                                                                    {term.term}
                                                                </span>
                                                                {category && (
                                                                    <span className="pill">{category.name}</span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className="mono"
                                                                style={{ fontSize: 12, color: 'var(--cobalt)' }}
                                                            >
                                                                {term.pronunciation}
                                                            </span>
                                                            <p
                                                                style={{
                                                                    fontSize: 14,
                                                                    color: 'var(--ink-2)',
                                                                    margin: '4px 0 0',
                                                                    lineHeight: 1.6,
                                                                }}
                                                                className={isExpanded ? '' : 'truncate-2'}
                                                            >
                                                                {term.definition}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className="mono"
                                                            style={{
                                                                fontSize: 11,
                                                                color: 'var(--ink-3)',
                                                                letterSpacing: '0.08em',
                                                                whiteSpace: 'nowrap',
                                                                marginTop: 4,
                                                            }}
                                                        >
                                                            {isExpanded ? '▴' : '▾'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                            {isExpanded && term.related.length > 0 && (
                                                <div
                                                    className="col gap-2"
                                                    style={{
                                                        padding: '0 22px 18px',
                                                    }}
                                                >
                                                    <div className="hairline" />
                                                    <span
                                                        className="mono"
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--ink-3)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.08em',
                                                        }}
                                                    >
                                                        Related terms
                                                    </span>
                                                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                                        {term.related.map(r => (
                                                            <button
                                                                key={r}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSearchQuery(r);
                                                                    setSelectedCategory('all');
                                                                    setSelectedLetter('all');
                                                                }}
                                                                className="pill pill-cobalt"
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {filteredTerms.length === 0 && (
                    <div
                        className="card-flat col gap-2 ai-center"
                        style={{ padding: 48, textAlign: 'center' }}
                    >
                        <span
                            className="display"
                            style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}
                        >
                            No terms found
                        </span>
                        <span className="muted" style={{ fontSize: 14 }}>
                            Try adjusting your search or filters.
                        </span>
                    </div>
                )}

                <div className="card-quiet" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.55 }}>
                        <strong style={{ color: 'var(--ink-2)' }}>Educational only.</strong> This glossary is for understanding terminology — not for self-diagnosis. Always consult a healthcare professional for medical advice.
                    </p>
                </div>
            </div>
        </main>
    );
}
