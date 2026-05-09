'use client';

import { useState, useEffect } from 'react';

interface KeywordGap {
    id: number;
    keyword: string;
    searchVolume: number;
    keywordDifficulty: number;
    opportunityScore: number;
    targetPage: string;
    language: string;
    status: 'pending' | 'content_generated' | 'published';
}

export default function KeywordGapsPage() {
    const [keywords, setKeywords] = useState<KeywordGap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [generating, setGenerating] = useState<number | null>(null);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchKeywords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage]);

    async function fetchKeywords() {
        setLoading(true);
        setMessage(null);
        try {
            const params = new URLSearchParams();
            if (selectedLanguage !== 'all') params.set('language', selectedLanguage);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(`/api/admin/condition-gaps?${params}`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setKeywords(data.gaps || []);
            } else {
                throw new Error('API returned error');
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                setMessage({ type: 'error', text: 'Request timed out. Showing demo data.' });
            } else {
                console.error('Failed to fetch keywords:', error);
                setMessage({ type: 'error', text: 'Failed to load keywords. Showing demo data.' });
            }
            setKeywords([
                { id: 1, keyword: 'best neurologist in navi mumbai', searchVolume: 1200, keywordDifficulty: 12, opportunityScore: 98, targetPage: '/in/en/navi-mumbai/neurology', language: 'en', status: 'pending' },
                { id: 2, keyword: 'ivf ka kharcha kitna hai', searchVolume: 3400, keywordDifficulty: 18, opportunityScore: 94, targetPage: '/in/hi/cost/ivf', language: 'hi', status: 'pending' },
                { id: 3, keyword: 'robotic knee replacement cost pune', searchVolume: 850, keywordDifficulty: 15, opportunityScore: 88, targetPage: '/in/en/pune/cost/robotic-knee-surgery', language: 'en', status: 'pending' },
                { id: 4, keyword: 'बाल रोग विशेषज्ञ near me', searchVolume: 5600, keywordDifficulty: 24, opportunityScore: 82, targetPage: '/in/hi/pediatrics', language: 'hi', status: 'pending' },
            ]);
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateContent(keywordId: number) {
        setGenerating(keywordId);
        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywordId, action: 'generate' }),
            });
            if (res.ok) {
                await fetchKeywords();
                setMessage({ type: 'success', text: 'Content generated successfully' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to generate content' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            setMessage({ type: 'error', text: 'Failed to generate content' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setGenerating(null);
        }
    }

    async function handleImportCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImporting(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/condition-gaps/import', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    setMessage({ type: 'success', text: `Imported ${data.imported} keywords` });
                    setTimeout(() => setMessage(null), 3000);
                    await fetchKeywords();
                } else {
                    setMessage({ type: 'error', text: 'Failed to import CSV' });
                    setTimeout(() => setMessage(null), 3000);
                }
            } catch (error) {
                console.error('Import failed:', error);
                setMessage({ type: 'error', text: 'Failed to import CSV' });
                setTimeout(() => setMessage(null), 3000);
            } finally {
                setImporting(false);
            }
        };
        input.click();
    }

    const thStyle: React.CSSProperties = {
        padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--mono)',
        fontSize: 10, fontWeight: 600, color: 'var(--ink-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
    };
    const tdStyle: React.CSSProperties = {
        padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', verticalAlign: 'middle',
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {message && (
                <div
                    role="alert"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: message.type === 'success' ? 'rgba(40, 212, 168, .30)' : 'rgba(255, 90, 46, .28)',
                        background: message.type === 'success' ? 'var(--mint-50)' : 'var(--orange-50)',
                        color: message.type === 'success' ? 'var(--mint-3)' : 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {message.text}
                </div>
            )}

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / keyword gaps</span>
                    <h1
                        className="display"
                        style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                    >
                        Keyword Gaps<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 14, margin: 0, maxWidth: 640 }}>
                        Discover missing localized keywords and high-opportunity searches.
                    </p>
                </div>
                <button
                    onClick={handleImportCSV}
                    disabled={importing}
                    className="btn btn-cobalt"
                >
                    {importing ? 'Importing…' : '+ Import Ahrefs CSV'}
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="hairline-b row between ai-center" style={{ padding: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div className="row ai-center gap-3">
                        <span className="section-mark">highest opportunity gaps</span>
                        {!loading && (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                ({keywords.length} keywords)
                            </span>
                        )}
                    </div>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="select"
                        style={{ width: 'auto', minWidth: 180 }}
                    >
                        <option value="all">All Languages</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi (hi-IN)</option>
                        <option value="mr">Marathi (mr-IN)</option>
                        <option value="ta">Tamil (ta-IN)</option>
                    </select>
                </div>

                {loading ? (
                    <div className="row ai-center center" style={{ padding: 48 }}>
                        <span
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                border: '3px solid var(--rule)',
                                borderTopColor: 'var(--cobalt)',
                                animation: 'spin 0.8s linear infinite',
                                display: 'inline-block',
                            }}
                        />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : keywords.length === 0 ? (
                    <div className="col ai-center gap-2" style={{ padding: 48 }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            No keyword gaps found
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>Import an Ahrefs CSV to discover opportunities</span>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead className="hairline-b" style={{ background: 'var(--bg-2)' }}>
                                <tr>
                                    <th scope="col" style={thStyle}>Keyword</th>
                                    <th scope="col" style={thStyle}>Volume</th>
                                    <th scope="col" style={thStyle}>KD</th>
                                    <th scope="col" style={thStyle}>Opp. Score</th>
                                    <th scope="col" style={thStyle}>Target Page</th>
                                    <th scope="col" style={thStyle}>Status</th>
                                    <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keywords.map((kw) => (
                                    <tr key={kw.id} style={{ borderTop: '1px solid var(--rule-2)' }}>
                                        <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--ink)' }}>
                                            {kw.keyword}
                                            {kw.language !== 'en' && (
                                                <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)' }}>
                                                    ({kw.language})
                                                </span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>{kw.searchVolume.toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span
                                                className={
                                                    kw.keywordDifficulty <= 20
                                                        ? 'pill pill-mint'
                                                        : kw.keywordDifficulty <= 40
                                                            ? 'pill pill-lemon'
                                                            : 'pill pill-orange'
                                                }
                                            >
                                                {kw.keywordDifficulty}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, color: 'var(--cobalt)', fontWeight: 600 }}>{kw.opportunityScore}</td>
                                        <td className="mono" style={{ ...tdStyle, fontSize: 11, color: 'var(--ink-3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {kw.targetPage}
                                        </td>
                                        <td style={tdStyle}>
                                            <span
                                                className={
                                                    kw.status === 'published'
                                                        ? 'pill pill-mint'
                                                        : kw.status === 'content_generated'
                                                            ? 'pill pill-cobalt'
                                                            : 'pill'
                                                }
                                            >
                                                {kw.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            {kw.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleGenerateContent(kw.id)}
                                                    disabled={generating === kw.id}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--cobalt)' }}
                                                >
                                                    {generating === kw.id ? 'Generating…' : 'Generate Content'}
                                                </button>
                                            ) : (
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--cobalt)' }}>
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
