'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCreativePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        advertiserId: '',
        name: '',
        adType: 'banner',
        headline: '',
        description: '',
        ctaText: 'Learn More',
        destinationUrl: '',
        imageUrl: '',
        width: '',
        height: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/advertising/creatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    advertiserId: parseInt(formData.advertiserId) || 0,
                    width: formData.width ? parseInt(formData.width) : null,
                    height: formData.height ? parseInt(formData.height) : null,
                }),
            });

            if (res.ok) {
                router.push('/admin/advertising/creatives');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create creative');
            }
        } catch {
            setError('Failed to create creative');
        } finally {
            setLoading(false);
        }
    };

    const update = (field: keyof typeof formData, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="col gap-5" style={{ maxWidth: 800, color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising/creatives"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to creatives
            </Link>

            <div className="col gap-2">
                <span className="section-mark">admin / advertising / creatives / new</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    New creative<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Create a new ad creative.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="card-flat"
                    style={{
                        padding: '12px 16px',
                        borderColor: 'rgba(255, 90, 46, .35)',
                        background: 'var(--orange-50)',
                        color: 'var(--orange-2)',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card col gap-4" style={{ padding: 24 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Creative Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => update('name', e.target.value)}
                            className="input"
                            placeholder="e.g., Banner Ad - Diabetes Awareness"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Advertiser ID</label>
                        <input
                            type="number"
                            required
                            value={formData.advertiserId}
                            onChange={(e) => update('advertiserId', e.target.value)}
                            className="input"
                            placeholder="Enter advertiser ID"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ad Type</label>
                        <select
                            value={formData.adType}
                            onChange={(e) => update('adType', e.target.value)}
                            className="select"
                        >
                            <option value="banner">Banner</option>
                            <option value="native">Native Ad</option>
                            <option value="text">Text Ad</option>
                            <option value="sponsored">Sponsored</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Width (px)</label>
                        <input
                            type="number"
                            value={formData.width}
                            onChange={(e) => update('width', e.target.value)}
                            className="input"
                            placeholder="300"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Height (px)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => update('height', e.target.value)}
                            className="input"
                            placeholder="250"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Headline</label>
                        <input
                            type="text"
                            value={formData.headline}
                            onChange={(e) => update('headline', e.target.value)}
                            className="input"
                            placeholder="Your attention-grabbing headline"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => update('description', e.target.value)}
                            className="textarea"
                            placeholder="Brief description of the ad"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">CTA Button Text</label>
                        <input
                            type="text"
                            value={formData.ctaText}
                            onChange={(e) => update('ctaText', e.target.value)}
                            className="input"
                            placeholder="Learn More"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Destination URL</label>
                        <input
                            type="url"
                            required
                            value={formData.destinationUrl}
                            onChange={(e) => update('destinationUrl', e.target.value)}
                            className="input"
                            placeholder="https://example.com/landing-page"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Image URL</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => update('imageUrl', e.target.value)}
                            className="input"
                            placeholder="https://example.com/ad-image.jpg"
                        />
                        <span className="form-hint">Direct URL to the creative image</span>
                    </div>
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={loading} className="btn btn-cobalt">
                        {loading ? 'Creating…' : 'Create creative →'}
                    </button>
                    <Link href="/admin/advertising/creatives" className="btn btn-paper">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
