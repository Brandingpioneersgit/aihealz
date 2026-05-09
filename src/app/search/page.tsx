import type { Metadata } from 'next';
import Link from 'next/link';
import SearchResults from './SearchResults';

export const metadata: Metadata = {
    title: 'Search aihealz',
    description: 'Search across conditions, treatments, doctors, hospitals, diagnostic tests, and clinical tools on aihealz.',
    robots: { index: false, follow: true },
    alternates: { canonical: '/search' },
};

interface Props {
    searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
    const { q = '', type } = await searchParams;
    const trimmed = q.trim();

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 880, margin: '0 auto', padding: '48px 28px 96px' }}
                className="col gap-6"
            >
                {/* Breadcrumb */}
                <nav
                    aria-label="Breadcrumb"
                    className="row gap-2 ai-center mono"
                    style={{
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    <Link href="/" style={{ color: 'var(--ink-3)' }}>
                        Home
                    </Link>
                    <span aria-hidden="true" style={{ color: 'var(--ink-4)' }}>
                        /
                    </span>
                    <span style={{ color: 'var(--ink)' }}>Search</span>
                </nav>

                {/* Hero */}
                <header className="col gap-3" style={{ maxWidth: 760 }}>
                    <span className="section-mark">I / search</span>
                    <h1
                        className="display"
                        style={{
                            fontSize: 'clamp(36px, 5vw, 64px)',
                            lineHeight: 0.98,
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontWeight: 600,
                        }}
                    >
                        {trimmed ? (
                            <>
                                Results for{' '}
                                <span style={{ color: 'var(--cobalt)' }}>
                                    &ldquo;{trimmed}&rdquo;
                                </span>
                                <span style={{ color: 'var(--orange)' }}>.</span>
                            </>
                        ) : (
                            <>
                                Search<span style={{ color: 'var(--orange)' }}>.</span>
                            </>
                        )}
                    </h1>
                    <p className="lede" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 560 }}>
                        Conditions, treatments, doctors, hospitals, diagnostic tests, and clinical tools.
                    </p>
                </header>

                {/* Search form */}
                <form action="/search" method="GET" className="col gap-3">
                    <label htmlFor="q" className="sr-only">
                        Search query
                    </label>
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        <input
                            id="q"
                            name="q"
                            type="search"
                            defaultValue={trimmed}
                            placeholder='Try "diabetes", "MRI", "knee replacement"…'
                            className="input"
                            style={{ flex: '1 1 320px', minWidth: 0, fontSize: 15, padding: '14px 16px' }}
                            autoFocus
                            minLength={2}
                            maxLength={100}
                        />
                        <button type="submit" className="btn btn-cobalt btn-lg">
                            Search →
                        </button>
                    </div>
                </form>

                <div className="hairline" />

                {/* Results */}
                {trimmed.length >= 2 ? (
                    <SearchResults query={trimmed} type={type} />
                ) : (
                    <div
                        className="card-quiet col gap-2"
                        style={{ padding: 24 }}
                    >
                        <span className="kicker">
                            <span className="dot" />
                            tip
                        </span>
                        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                            Type at least 2 characters to search.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
