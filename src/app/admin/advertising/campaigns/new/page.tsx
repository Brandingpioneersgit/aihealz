'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        advertiserId: '',
        objective: 'awareness',
        billingModel: 'cpm',
        totalBudget: '',
        dailyBudget: '',
        startDate: '',
        endDate: '',
        targetConditions: '',
        targetCities: '',
        targetSpecialties: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/advertising/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    totalBudget: parseFloat(formData.totalBudget) || 0,
                    dailyBudget: parseFloat(formData.dailyBudget) || 0,
                    advertiserId: parseInt(formData.advertiserId) || 0,
                    targetConditions: formData.targetConditions.split(',').map((s) => s.trim()).filter(Boolean),
                    targetCities: formData.targetCities.split(',').map((s) => s.trim()).filter(Boolean),
                    targetSpecialties: formData.targetSpecialties.split(',').map((s) => s.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                router.push('/admin/advertising/campaigns');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create campaign');
            }
        } catch {
            setError('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    const update = (field: keyof typeof formData, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="col gap-5" style={{ maxWidth: 800, color: 'var(--ink)' }}>
            <Link
                href="/admin/advertising/campaigns"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to campaigns
            </Link>

            <div className="col gap-2">
                <span className="section-mark">admin / advertising / campaigns / new</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    New campaign<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Set up a new advertising campaign.
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
                        <label className="form-label">Campaign Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => update('name', e.target.value)}
                            className="input"
                            placeholder="e.g., Q1 2026 Cardiology Campaign"
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
                        <label className="form-label">Objective</label>
                        <select
                            value={formData.objective}
                            onChange={(e) => update('objective', e.target.value)}
                            className="select"
                        >
                            <option value="awareness">Brand Awareness</option>
                            <option value="traffic">Website Traffic</option>
                            <option value="leads">Lead Generation</option>
                            <option value="conversions">Conversions</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Billing Model</label>
                        <select
                            value={formData.billingModel}
                            onChange={(e) => update('billingModel', e.target.value)}
                            className="select"
                        >
                            <option value="cpm">CPM (Cost per 1000 impressions)</option>
                            <option value="cpc">CPC (Cost per click)</option>
                            <option value="cpa">CPA (Cost per acquisition)</option>
                            <option value="flat">Flat Rate</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Total Budget ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.totalBudget}
                            onChange={(e) => update('totalBudget', e.target.value)}
                            className="input"
                            placeholder="1000.00"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Daily Budget ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.dailyBudget}
                            onChange={(e) => update('dailyBudget', e.target.value)}
                            className="input"
                            placeholder="50.00"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => update('startDate', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => update('endDate', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Target Conditions (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetConditions}
                            onChange={(e) => update('targetConditions', e.target.value)}
                            className="input"
                            placeholder="diabetes, hypertension, heart-disease"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Target Locations (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetCities}
                            onChange={(e) => update('targetCities', e.target.value)}
                            className="input"
                            placeholder="mumbai, delhi, bangalore"
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="form-label">Target Specialties (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetSpecialties}
                            onChange={(e) => update('targetSpecialties', e.target.value)}
                            className="input"
                            placeholder="cardiology, endocrinology"
                        />
                    </div>
                </div>

                <div className="row gap-3 hairline-t" style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={loading} className="btn btn-cobalt">
                        {loading ? 'Creating…' : 'Create campaign →'}
                    </button>
                    <Link href="/admin/advertising/campaigns" className="btn btn-paper">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
