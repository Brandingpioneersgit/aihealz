'use client';

import { useState, useEffect } from 'react';

interface NavItem {
    id: string;
    label: string;
    path: string;
    isMega: boolean;
    isActive: boolean;
    order: number;
}

const AVAILABLE_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Conditions', path: '/conditions' },
    { label: 'Treatments', path: '/treatments' },
    { label: 'Find Doctors', path: '/doctors' },
    { label: 'AI Remedies', path: '/remedies' },
    { label: 'Symptom Checker', path: '/symptoms' },
    { label: 'Health Tools', path: '/tools' },
];

export default function NavigationPage() {
    const [menuItems, setMenuItems] = useState<NavItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchNavigation();
    }, []);

    async function fetchNavigation() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/navigation');
            if (res.ok) {
                const data = await res.json();
                setMenuItems(data.items || []);
            } else {
                setMenuItems([
                    { id: '1', label: 'Conditions', path: '/conditions', isMega: true, isActive: true, order: 1 },
                    { id: '2', label: 'Treatments', path: '/treatments', isMega: true, isActive: true, order: 2 },
                    { id: '3', label: 'Find Doctors', path: '/doctors', isMega: false, isActive: true, order: 3 },
                    { id: '4', label: 'AI Remedies', path: '/remedies', isMega: false, isActive: true, order: 4 },
                    { id: '5', label: 'Health Tools', path: '/tools', isMega: true, isActive: true, order: 5 },
                    { id: '6', label: 'Symptom Checker', path: '/symptoms', isMega: false, isActive: true, order: 6 },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch navigation:', error);
            setMenuItems([
                { id: '1', label: 'Conditions', path: '/conditions', isMega: true, isActive: true, order: 1 },
                { id: '2', label: 'Treatments', path: '/treatments', isMega: true, isActive: true, order: 2 },
                { id: '3', label: 'Find Doctors', path: '/doctors', isMega: false, isActive: true, order: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/navigation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: menuItems }),
            });
            if (res.ok) {
                setHasChanges(false);
            } else {
                const data = await res.json();
                console.error('Failed to save navigation:', data.error);
            }
        } catch (error) {
            console.error('Failed to save navigation:', error);
        } finally {
            setSaving(false);
        }
    }

    function handleAddItem(link: { label: string; path: string }) {
        const exists = menuItems.some(item => item.path === link.path);
        if (exists) return;

        const newItem: NavItem = {
            id: `new-${Date.now()}`,
            label: link.label,
            path: link.path,
            isMega: false,
            isActive: true,
            order: menuItems.length + 1,
        };
        setMenuItems([...menuItems, newItem]);
        setHasChanges(true);
    }

    function handleRemoveItem(id: string) {
        setMenuItems(menuItems.filter(item => item.id !== id));
        setHasChanges(true);
    }

    function handleToggleMega(id: string) {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, isMega: !item.isMega } : item
        ));
        setHasChanges(true);
    }

    function handleMoveUp(index: number) {
        if (index === 0) return;
        const newItems = [...menuItems];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        newItems.forEach((item, i) => item.order = i + 1);
        setMenuItems(newItems);
        setHasChanges(true);
    }

    function handleMoveDown(index: number) {
        if (index === menuItems.length - 1) return;
        const newItems = [...menuItems];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        newItems.forEach((item, i) => item.order = i + 1);
        setMenuItems(newItems);
        setHasChanges(true);
    }

    const availableToAdd = AVAILABLE_LINKS.filter(
        link => !menuItems.some(item => item.path === link.path)
    );

    if (loading) {
        return (
            <div className="row center ai-center" style={{ minHeight: 400 }}>
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
        );
    }

    return (
        <div className="col gap-6" style={{ maxWidth: 1100, color: 'var(--ink)' }}>
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
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Edits here are not yet live.</div>
                <div>
                    The public site navigation is currently rendered from a hardcoded <code className="mono" style={{ background: 'rgba(255,210,63,.30)', padding: '1px 4px', borderRadius: 2 }}>NAV_ITEMS</code> array in
                    {' '}<code className="mono" style={{ background: 'rgba(255,210,63,.30)', padding: '1px 4px', borderRadius: 2 }}>src/components/v4/Navbar.tsx</code>. Changes saved on this screen are stored but not consumed by the v4 Navbar.
                </div>
            </div>

            <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div className="col gap-2">
                    <span className="section-mark">admin / navigation</span>
                    <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}>
                        Navigation builder<span style={{ color: 'var(--orange)' }}>.</span>
                    </h1>
                    <p className="lede" style={{ fontSize: 15, margin: 0, maxWidth: 560 }}>
                        Configure main menu links, dropdowns, and mega-menus.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="btn btn-cobalt"
                >
                    {saving ? 'Saving…' : 'Save changes →'}
                </button>
            </div>

            {hasChanges && (
                <div
                    className="card-flat row ai-center gap-2"
                    style={{
                        padding: '10px 14px',
                        borderColor: 'rgba(230, 185, 40, .40)',
                        background: 'var(--lemon-50)',
                        fontSize: 13,
                        color: '#8C6A00',
                    }}
                >
                    <span>You have unsaved changes</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
                {/* Available links */}
                <div className="card col gap-3" style={{ padding: 20, height: 'fit-content' }}>
                    <div className="hairline-b" style={{ paddingBottom: 12 }}>
                        <span className="section-mark">available links</span>
                    </div>
                    <div className="col gap-2">
                        {availableToAdd.length === 0 ? (
                            <p className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>All links added</p>
                        ) : (
                            availableToAdd.map(link => (
                                <div key={link.path} className="row between ai-center card-quiet" style={{ padding: '10px 12px' }}>
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{link.label}</span>
                                    <button
                                        onClick={() => handleAddItem(link)}
                                        className="btn btn-cobalt btn-sm"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Menu structure */}
                <div className="card col gap-3 lg:col-span-2" style={{ padding: 24, minHeight: 500 }}>
                    <div className="row between ai-center hairline-b" style={{ paddingBottom: 12 }}>
                        <span className="section-mark">main menu structure</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {menuItems.length} items
                        </span>
                    </div>

                    {menuItems.length === 0 ? (
                        <div className="col ai-center" style={{ padding: '48px 0' }}>
                            <p className="muted" style={{ fontSize: 13 }}>No menu items. Add links from the left panel.</p>
                        </div>
                    ) : (
                        <div className="col gap-2">
                            {menuItems.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="row ai-center gap-3"
                                    style={{
                                        padding: 12,
                                        border: '1px solid var(--rule)',
                                        borderRadius: 'var(--r-3)',
                                        background: 'var(--paper)',
                                    }}
                                >
                                    <div className="col gap-1">
                                        <button
                                            onClick={() => handleMoveUp(i)}
                                            disabled={i === 0}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: 4 }}
                                            aria-label="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(i)}
                                            disabled={i === menuItems.length - 1}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: 4 }}
                                            aria-label="Move down"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                    <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                                        <div className="row ai-center gap-2">
                                            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                                            {item.isMega && <span className="pill pill-cobalt">Mega menu</span>}
                                        </div>
                                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{item.path}</span>
                                    </div>
                                    <div className="row gap-2">
                                        <button
                                            onClick={() => handleToggleMega(item.id)}
                                            className={`btn btn-sm ${item.isMega ? 'btn-cobalt' : 'btn-paper'}`}
                                            title={item.isMega ? 'Remove mega menu' : 'Make mega menu'}
                                        >
                                            Mega
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="btn btn-orange btn-sm"
                                            aria-label={`Remove ${item.label}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
