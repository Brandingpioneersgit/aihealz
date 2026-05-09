'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type TabType = 'overview' | 'enquiries' | 'doctors' | 'departments' | 'insurance' | 'settings';

interface Enquiry {
    id: string;
    patientName: string;
    condition: string;
    department: string;
    message: string;
    createdAt: string;
    status: 'new' | 'responded' | 'converted';
    phone?: string;
}

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    profileViews: number;
    appointments: number;
    isVerified: boolean;
}

export default function HospitalDashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [hospitalName, setHospitalName] = useState('Apollo Hospitals Chennai');
    const [plan] = useState('professional');
    const [isLoading, setIsLoading] = useState(true);

    const [stats] = useState({
        profileViews: 12450,
        enquiries: 234,
        conversions: 89,
        activeDoctors: 156,
        rating: 4.6,
        reviews: 892,
    });

    const [enquiries] = useState<Enquiry[]>([
        { id: '1', patientName: 'Rajesh Kumar', condition: 'Heart Surgery Consultation', department: 'Cardiology', message: 'Looking for bypass surgery cost estimate and doctor availability', createdAt: '2024-01-15T10:30:00Z', status: 'new', phone: '+91-98765XXXXX' },
        { id: '2', patientName: 'Priya Sharma', condition: 'Knee Replacement', department: 'Orthopedics', message: 'Need quote for bilateral knee replacement with 5-day stay', createdAt: '2024-01-14T14:20:00Z', status: 'responded' },
        { id: '3', patientName: 'Ahmed Khan', condition: 'Cancer Treatment', department: 'Oncology', message: 'Second opinion for stage 2 breast cancer treatment', createdAt: '2024-01-13T09:15:00Z', status: 'converted' },
    ]);

    const [doctors] = useState<Doctor[]>([
        { id: '1', name: 'Dr. Prathap Reddy', specialty: 'Cardiology', profileViews: 3420, appointments: 156, isVerified: true },
        { id: '2', name: 'Dr. Suresh Menon', specialty: 'Orthopedics', profileViews: 2890, appointments: 98, isVerified: true },
        { id: '3', name: 'Dr. Lakshmi Nair', specialty: 'Oncology', profileViews: 2150, appointments: 67, isVerified: true },
        { id: '4', name: 'Dr. Ramesh Iyer', specialty: 'Neurology', profileViews: 1980, appointments: 54, isVerified: false },
    ]);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const statusPill: Record<string, string> = {
        new: 'pill pill-cobalt',
        responded: 'pill pill-lemon',
        converted: 'pill pill-mint',
    };

    const handleLogout = () => {
        localStorage.removeItem('hospital_session');
        window.location.href = '/provider/hospital/login';
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                    aria-hidden="true"
                    style={{ width: 32, height: 32, border: '2px solid var(--rule)', borderTopColor: 'var(--cobalt)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const navItems: { id: TabType; label: string; code: string; badge?: number }[] = [
        { id: 'overview', label: 'Overview', code: 'OV' },
        { id: 'enquiries', label: 'Enquiries', code: 'EN', badge: 12 },
        { id: 'doctors', label: 'Doctors', code: 'DR' },
        { id: 'departments', label: 'Departments', code: 'DP' },
        { id: 'insurance', label: 'Insurance', code: 'IN' },
        { id: 'settings', label: 'Settings', code: 'ST' },
    ];

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', color: 'var(--ink)' }}>
            {/* Sidebar */}
            <aside style={{ width: 260, background: 'var(--paper)', borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column' }}>
                <div className="row ai-center gap-3" style={{ padding: 24, borderBottom: '1px solid var(--rule)' }}>
                    <span className="spec-icon" style={{ background: 'var(--cobalt)' }}>HS</span>
                    <div className="col gap-1" style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hospitalName}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan} plan</span>
                    </div>
                </div>

                <nav className="col gap-1" style={{ padding: 16, flex: 1 }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="row ai-center gap-3"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                background: activeTab === item.id ? 'var(--cobalt-50)' : 'transparent',
                                color: activeTab === item.id ? 'var(--cobalt)' : 'var(--ink-2)',
                                border: 'none',
                                borderRadius: 'var(--r-2)',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            <span className="mono" style={{ fontSize: 10, opacity: 0.7, width: 22 }}>{item.code}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge && <span className="pill pill-cobalt">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: 16, borderTop: '1px solid var(--rule)' }}>
                    <button
                        onClick={handleLogout}
                        className="row ai-center gap-2 btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--orange-2)' }}
                    >
                        ↗ Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                <header
                    className="row between ai-center"
                    style={{
                        background: 'var(--paper)',
                        borderBottom: '1px solid var(--rule)',
                        padding: '16px 32px',
                    }}
                >
                    <div className="col gap-1">
                        <span className="kicker">hospital portal</span>
                        <h1 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="row ai-center gap-3">
                        <Link href={`/hospitals/apollo-hospitals-chennai`} className="btn btn-paper btn-sm">View profile</Link>
                        <Link href="/provider/hospital/edit" className="btn btn-cobalt btn-sm">Edit profile</Link>
                    </div>
                </header>

                <div style={{ padding: 32 }}>
                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <div className="col gap-6">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: 0,
                                    border: '1px solid var(--rule)',
                                    borderRadius: 'var(--r-3)',
                                    background: 'var(--paper)',
                                    overflow: 'hidden',
                                }}
                            >
                                {[
                                    { label: 'Profile views', value: stats.profileViews.toLocaleString(), code: 'PV' },
                                    { label: 'Enquiries', value: stats.enquiries.toLocaleString(), code: 'EN' },
                                    { label: 'Conversions', value: stats.conversions.toLocaleString(), code: 'CN' },
                                    { label: 'Active doctors', value: stats.activeDoctors.toLocaleString(), code: 'DR' },
                                    { label: 'Rating', value: stats.rating.toFixed(1), code: '★' },
                                    { label: 'Reviews', value: stats.reviews.toLocaleString(), code: 'RV' },
                                ].map((s) => (
                                    <div key={s.label} className="col gap-2" style={{ padding: 18, borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                                        <div className="row ai-center gap-3">
                                            <span className="spec-icon" style={{ width: 32, height: 32, fontSize: 12 }}>{s.code}</span>
                                            <span className="kicker">{s.label}</span>
                                        </div>
                                        <span className="num bignum" style={{ fontSize: 24, color: 'var(--ink)' }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Recent enquiries */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div className="row between ai-center hairline-b" style={{ padding: '16px 24px' }}>
                                    <span className="section-mark">recent enquiries</span>
                                    <button onClick={() => setActiveTab('enquiries')} className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                        View all →
                                    </button>
                                </div>
                                <div className="col">
                                    {enquiries.slice(0, 3).map((enquiry, i, arr) => (
                                        <div key={enquiry.id} className="row between ai-start" style={{ padding: '14px 24px', borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none' }}>
                                            <div className="col gap-1" style={{ flex: 1 }}>
                                                <div className="row ai-center gap-2">
                                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{enquiry.patientName}</span>
                                                    <span className={statusPill[enquiry.status]}>{enquiry.status}</span>
                                                </div>
                                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{enquiry.condition}</span>
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                    ⏱ {new Date(enquiry.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button className="btn btn-cobalt btn-sm">Respond</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top doctors */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div className="row between ai-center hairline-b" style={{ padding: '16px 24px' }}>
                                    <span className="section-mark">top performing doctors</span>
                                    <button onClick={() => setActiveTab('doctors')} className="mono" style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                        Manage doctors →
                                    </button>
                                </div>
                                <div className="col">
                                    {doctors.slice(0, 4).map((doctor, i, arr) => (
                                        <div key={doctor.id} className="row between ai-center" style={{ padding: '14px 24px', borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none' }}>
                                            <div className="row ai-center gap-3">
                                                <span className="spec-icon" aria-hidden="true">{doctor.name.charAt(0).toUpperCase()}</span>
                                                <div className="col gap-1">
                                                    <div className="row ai-center gap-2">
                                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{doctor.name}</span>
                                                        {doctor.isVerified && <span className="pill pill-mint">✓</span>}
                                                    </div>
                                                    <span className="muted" style={{ fontSize: 12 }}>{doctor.specialty}</span>
                                                </div>
                                            </div>
                                            <div className="col ai-end gap-1">
                                                <span className="num" style={{ fontSize: 13, fontWeight: 500 }}>{doctor.profileViews.toLocaleString()} views</span>
                                                <span className="muted" style={{ fontSize: 12 }}>{doctor.appointments} appointments</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enquiries */}
                    {activeTab === 'enquiries' && (
                        <div className="col gap-5">
                            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                                {['all', 'new', 'responded', 'converted'].map((filter, i) => (
                                    <button
                                        key={filter}
                                        className={i === 0 ? 'btn btn-cobalt btn-sm' : 'btn btn-paper btn-sm'}
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="card col" style={{ overflow: 'hidden' }}>
                                {enquiries.map((enquiry, i, arr) => (
                                    <div key={enquiry.id} className="col gap-3" style={{ padding: 24, borderBottom: i < arr.length - 1 ? '1px solid var(--rule-2)' : 'none' }}>
                                        <div className="row between ai-start" style={{ flexWrap: 'wrap', gap: 12 }}>
                                            <div className="col gap-1">
                                                <div className="row ai-center gap-2">
                                                    <span style={{ fontWeight: 600 }}>{enquiry.patientName}</span>
                                                    <span className={statusPill[enquiry.status]}>{enquiry.status}</span>
                                                </div>
                                                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                                                    <span style={{ fontWeight: 500 }}>{enquiry.condition}</span> · {enquiry.department}
                                                </span>
                                            </div>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                ⏱ {new Date(enquiry.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>{enquiry.message}</p>
                                        <div className="row gap-3">
                                            {enquiry.phone && (
                                                <a href={`tel:${enquiry.phone}`} className="btn btn-paper btn-sm" style={{ color: 'var(--mint-3)', borderColor: 'rgba(40, 212, 168, .35)' }}>
                                                    ☎ Call patient
                                                </a>
                                            )}
                                            <button className="btn btn-cobalt btn-sm">Send response</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Doctors */}
                    {activeTab === 'doctors' && (
                        <div className="col gap-5">
                            <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                                <p className="muted" style={{ fontSize: 13 }}>{doctors.length} doctors registered</p>
                                <button className="btn btn-cobalt">+ Add doctor</button>
                            </div>

                            <div className="card" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg-2)' }}>
                                        <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                            {['Doctor', 'Specialty', 'Profile views', 'Appointments', 'Status'].map(h => (
                                                <th key={h} scope="col" className="mono" style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                                            ))}
                                            <th scope="col" className="mono" style={{ textAlign: 'right', padding: '14px 24px', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.map((doctor) => (
                                            <tr key={doctor.id} style={{ borderBottom: '1px solid var(--rule-2)' }}>
                                                <td style={{ padding: '14px 24px' }}>
                                                    <div className="row ai-center gap-3">
                                                        <span className="spec-icon">{doctor.name.charAt(0).toUpperCase()}</span>
                                                        <span style={{ fontWeight: 500 }}>{doctor.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 24px', color: 'var(--ink-2)' }}>{doctor.specialty}</td>
                                                <td className="num" style={{ padding: '14px 24px', fontWeight: 500 }}>{doctor.profileViews.toLocaleString()}</td>
                                                <td className="num" style={{ padding: '14px 24px', fontWeight: 500 }}>{doctor.appointments}</td>
                                                <td style={{ padding: '14px 24px' }}>
                                                    {doctor.isVerified ? <span className="pill pill-mint">✓ Verified</span> : <span className="pill pill-lemon">Pending</span>}
                                                </td>
                                                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                    <button className="btn btn-ghost btn-sm">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Departments */}
                    {activeTab === 'departments' && (
                        <div className="col ai-center gap-3" style={{ padding: 64, textAlign: 'center' }}>
                            <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>DP</span>
                            <p className="muted" style={{ fontSize: 14 }}>Department management coming soon.</p>
                            <button className="btn btn-cobalt">+ Add department</button>
                        </div>
                    )}

                    {/* Insurance */}
                    {activeTab === 'insurance' && (
                        <div className="col ai-center gap-3" style={{ padding: 64, textAlign: 'center' }}>
                            <span className="spec-icon" style={{ width: 48, height: 48, fontSize: 18 }}>IN</span>
                            <p className="muted" style={{ fontSize: 14 }}>Insurance partner management coming soon.</p>
                            <button className="btn btn-cobalt">+ Add insurance partner</button>
                        </div>
                    )}

                    {/* Settings */}
                    {activeTab === 'settings' && (
                        <div className="col gap-5" style={{ maxWidth: 640 }}>
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div className="col gap-4" style={{ padding: 24 }}>
                                    <span className="section-mark">account settings</span>
                                    <div className="form-group">
                                        <label className="form-label">Hospital name</label>
                                        <input
                                            type="text"
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                    <button className="btn btn-cobalt" style={{ alignSelf: 'flex-start' }}>Save changes</button>
                                </div>
                                <div className="col gap-4 hairline-t" style={{ padding: 24 }}>
                                    <span className="section-mark">subscription</span>
                                    <div className="card-quiet row between ai-center" style={{ padding: 16 }}>
                                        <div className="col gap-1">
                                            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{plan} plan</span>
                                            <span className="muted" style={{ fontSize: 12 }}>Renews on March 1, 2024</span>
                                        </div>
                                        <Link href="/pricing" className="btn btn-cobalt btn-sm">Manage plan</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
