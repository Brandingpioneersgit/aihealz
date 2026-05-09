"use client";

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface FooterTemplate {
    id: string;
    ruleName: string;
    matchType: 'city' | 'country' | 'default';
    matchValue: string;
    templateData: Record<string, unknown>;
    priority: number;
    isActive: boolean;
    createdAt: string;
    geography?: {
        name: string;
        slug: string;
    };
}

interface FooterData {
    templates: FooterTemplate[];
}

export default function FooterPage() {
    const [data, setData] = useState<FooterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        ruleName: '',
        matchType: 'city' as 'city' | 'country' | 'default',
        matchValue: '',
        priority: 0,
    });
    const [saving, setSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<FooterTemplate | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; templateId: string | null; templateName: string }>({
        isOpen: false,
        templateId: null,
        templateName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/footer-manager?action=list');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch footer templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/footer-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    templateData: {
                        columns: [
                            { title: 'Company', links: ['About Us', 'Careers', 'Contact'] },
                            { title: 'Resources', links: ['For Doctors', 'Blog', 'FAQ'] },
                            { title: 'Legal', links: ['Privacy', 'Terms'] },
                        ],
                    },
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to create template:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (template: FooterTemplate) => {
        setEditingTemplate(template);
        setFormData({
            ruleName: template.ruleName,
            matchType: template.matchType,
            matchValue: template.matchValue,
            priority: template.priority,
        });
        setShowModal(true);
    };

    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, templateId: id, templateName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.templateId) return;
        const id = deleteModal.templateId;
        setDeleteModal({ isOpen: false, templateId: null, templateName: '' });

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/footer-manager?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchData();
            } else {
                setErrorMessage('Failed to delete template');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
            setErrorMessage('Failed to delete template');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/footer-manager', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTemplate.id,
                    ...formData,
                    templateData: editingTemplate.templateData,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingTemplate(null);
                setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update template:', error);
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTemplate(null);
        setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
    };

    const staticFooterColumns = [
        { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
        { title: 'Information', links: ['For Doctors', 'Pricing', 'Verified Specialists', 'Medical Glossary'] },
        { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Editorial Guidelines'] },
    ];

    const matchTypePill = (t: 'city' | 'country' | 'default') =>
        t === 'city' ? 'pill pill-cobalt' : t === 'country' ? 'pill pill-magenta' : 'pill';

    if (loading) {
        return (
            <div className="row center ai-center" style={{ minHeight: 400 }}>
                <div className="col ai-center gap-3">
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
                    <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Loading footer templates…
                    </p>
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Footer Template"
                message={`Are you sure you want to delete "${deleteModal.templateName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, templateId: null, templateName: '' })}
            />
            <div className="col gap-6" style={{ maxWidth: 1100, color: 'var(--ink)' }}>
                {/* Footnote */}
                <div
                    className="card-flat"
                    style={{
                        padding: 14,
                        borderColor: 'rgba(230, 185, 40, .40)',
                        background: 'var(--lemon-50)',
                        fontSize: 13,
                        color: '#8C6A00',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Footer templates are not yet wired to the v4 footer.</div>
                    <div>
                        The public site footer is rendered from a hardcoded <code className="mono" style={{ background: 'rgba(255,210,63,.30)', padding: '1px 4px', borderRadius: 2 }}>SECTIONS</code> constant in
                        {' '}<code className="mono" style={{ background: 'rgba(255,210,63,.30)', padding: '1px 4px', borderRadius: 2 }}>src/components/v4/Footer.tsx</code>. Templates created on this screen are stored as
                        {' '}<code className="mono" style={{ background: 'rgba(255,210,63,.30)', padding: '1px 4px', borderRadius: 2 }}>FooterTemplate</code> rows but not consumed by the v4 footer yet.
                    </div>
                </div>

                {errorMessage && (
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
                        {errorMessage}
                    </div>
                )}

                {/* Header */}
                <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                    <div className="col gap-2">
                        <span className="section-mark">admin / footer</span>
                        <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                            Footer manager<span style={{ color: 'var(--orange)' }}>.</span>
                        </h1>
                        <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                            Manage global footer columns and contextual dynamic links.
                        </p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn btn-cobalt">
                        + Add template
                    </button>
                </div>

                {/* Static footer columns */}
                <section className="card col gap-4" style={{ padding: 24 }}>
                    <span className="section-mark">default footer columns</span>
                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                        {staticFooterColumns.map((col, i) => (
                            <div key={i} className="card-quiet col gap-3" style={{ padding: 16 }}>
                                <div className="row between ai-center">
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{col.title}</span>
                                    <button
                                        type="button"
                                        aria-label={`Edit ${col.title}`}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="col gap-1">
                                    {col.links.map((link) => (
                                        <span key={link} style={{ fontSize: 13, color: 'var(--ink-2)' }}>{link}</span>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    style={{
                                        marginTop: 8,
                                        padding: '8px 12px',
                                        border: '1px dashed var(--rule)',
                                        borderRadius: 'var(--r-2)',
                                        background: 'transparent',
                                        color: 'var(--ink-3)',
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                >
                                    + Add link
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Dynamic footer templates */}
                <section className="card" style={{ overflow: 'hidden' }}>
                    <div className="row between ai-center hairline-b" style={{ padding: '16px 24px', flexWrap: 'wrap', gap: 12 }}>
                        <div className="col gap-1">
                            <span className="section-mark">dynamic footer templates</span>
                            <span className="muted" style={{ fontSize: 13 }}>Location-specific footer variations</span>
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {data?.templates?.length || 0} template{(data?.templates?.length || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {!data?.templates || data.templates.length === 0 ? (
                        <div className="col ai-center gap-3" style={{ padding: 48, textAlign: 'center' }}>
                            <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>FT</span>
                            <h3 className="display" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>No custom templates</h3>
                            <p className="muted" style={{ fontSize: 13, margin: 0, maxWidth: 360 }}>
                                Create location-specific footer templates to show relevant content.
                            </p>
                            <button onClick={() => setShowModal(true)} className="btn btn-cobalt">
                                Create template
                            </button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-2)' }}>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    {['Rule name', 'Match type', 'Match value', 'Priority', 'Status'].map(h => (
                                        <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                    ))}
                                    <th scope="col" className="mono" style={{ textAlign: 'right', padding: 14, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.templates.map((template) => (
                                    <tr key={template.id} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                        <td style={{ padding: 14, fontWeight: 500 }}>{template.ruleName}</td>
                                        <td style={{ padding: 14 }}>
                                            <span className={matchTypePill(template.matchType)}>{template.matchType}</span>
                                        </td>
                                        <td className="mono" style={{ padding: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                                            {template.matchValue}
                                            {template.geography && (
                                                <span style={{ marginLeft: 8, color: 'var(--ink-4)' }}>({template.geography.name})</span>
                                            )}
                                        </td>
                                        <td className="num" style={{ padding: 14, color: 'var(--ink-2)' }}>{template.priority}</td>
                                        <td style={{ padding: 14 }}>
                                            <span className={template.isActive ? 'pill pill-mint' : 'pill'}>
                                                {template.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 14, textAlign: 'right' }}>
                                            <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEdit(template)} className="btn btn-ghost btn-sm">Edit</button>
                                                <button
                                                    onClick={() => openDeleteModal(template.id, template.ruleName)}
                                                    disabled={deletingId === template.id}
                                                    className="btn btn-orange btn-sm"
                                                >
                                                    {deletingId === template.id ? 'Deleting…' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Contextual footer info */}
                <section
                    className="card-flat col gap-4"
                    style={{
                        padding: 24,
                        borderColor: 'rgba(28, 91, 255, .25)',
                        background: 'var(--cobalt-50)',
                    }}
                >
                    <div className="row gap-4 ai-start">
                        <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>⚡</span>
                        <div className="col gap-2" style={{ flex: 1 }}>
                            <span className="section-mark" style={{ color: 'var(--cobalt)' }}>dynamic contextual footer</span>
                            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
                                The footer component automatically injects up to 60 targeted dynamic links based on the user&apos;s current city and viewed specialty. Templates are matched in order of priority: city → country → default.
                            </p>
                            <div className="row gap-3" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                                <button className="btn btn-cobalt btn-sm">View documentation</button>
                                <button className="btn btn-paper btn-sm">Preview footer</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal */}
                {showModal && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(10, 26, 47, .55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 500,
                            padding: 16,
                        }}
                    >
                        <div className="card col gap-4" style={{ padding: 24, maxWidth: 460, width: '100%' }}>
                            <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                                {editingTemplate ? 'Edit footer template' : 'Create footer template'}
                            </h3>

                            <form onSubmit={editingTemplate ? handleUpdate : handleSubmit} className="col gap-3">
                                <div className="form-group">
                                    <label className="form-label">Rule name *</label>
                                    <input
                                        type="text"
                                        value={formData.ruleName}
                                        onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                                        className="input"
                                        placeholder="e.g., Mumbai Footer"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Match type *</label>
                                    <select
                                        value={formData.matchType}
                                        onChange={(e) => setFormData({ ...formData, matchType: e.target.value as 'city' | 'country' | 'default' })}
                                        className="select"
                                    >
                                        <option value="city">City</option>
                                        <option value="country">Country</option>
                                        <option value="default">Default</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Match value</label>
                                    <input
                                        type="text"
                                        value={formData.matchValue}
                                        onChange={(e) => setFormData({ ...formData, matchValue: e.target.value })}
                                        className="input"
                                        placeholder="e.g., mumbai or in"
                                    />
                                    <span className="form-hint">Use city slug or country code. Leave empty for default template.</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="0"
                                    />
                                    <span className="form-hint">Higher priority templates are matched first.</span>
                                </div>

                                <div className="row gap-3 hairline-t" style={{ paddingTop: 16, justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={closeModal} className="btn btn-paper">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={saving || !formData.ruleName}
                                        className="btn btn-cobalt"
                                    >
                                        {saving ? (editingTemplate ? 'Updating…' : 'Creating…') : (editingTemplate ? 'Update template' : 'Create template')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
