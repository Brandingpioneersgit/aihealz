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
        <main className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
                    <Link href="/" className="hover:text-slate-700">Home</Link>
                    <span className="mx-2" aria-hidden="true">›</span>
                    <span className="text-slate-700">Search</span>
                </nav>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    {trimmed ? <>Results for <span className="text-teal-600">&ldquo;{trimmed}&rdquo;</span></> : 'Search'}
                </h1>
                <p className="text-slate-500 mb-8">
                    Conditions, treatments, doctors, hospitals, diagnostic tests, and clinical tools.
                </p>

                <form action="/search" method="GET" className="mb-10">
                    <label htmlFor="q" className="sr-only">Search query</label>
                    <div className="flex gap-2">
                        <input
                            id="q"
                            name="q"
                            type="search"
                            defaultValue={trimmed}
                            placeholder="Try “diabetes”, “MRI”, “knee replacement”…"
                            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
                            autoFocus
                            minLength={2}
                            maxLength={100}
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {trimmed.length >= 2 ? (
                    <SearchResults query={trimmed} type={type} />
                ) : (
                    <p className="text-slate-500">Type at least 2 characters to search.</p>
                )}
            </div>
        </main>
    );
}
