import prisma from '@/lib/db';
import Link from 'next/link';
import { SystemHealthClient } from './SystemHealthClient';

async function getDashboardStats() {
    const [
        conditionsCount,
        doctorsCount,
        locationsCount,
        languagesCount,
        leadsCount,
        contentCount,
        pendingVerifications,
        pendingContent,
        premiumDoctors,
        recentLeads,
        recentDoctors,
        highIntentLeads,
        hospitalsCount,
        insuranceCount,
        tpaCount,
        diagnosticTestsCount,
    ] = await Promise.all([
        prisma.medicalCondition.count({ where: { isActive: true } }),
        prisma.doctorProvider.count(),
        prisma.geography.count(),
        prisma.language.count({ where: { isActive: true } }),
        prisma.leadLog.count(),
        prisma.localizedContent.count(),
        // Count pending license verifications (not just unverified doctors)
        // This syncs with the verification queue page
        prisma.licenseVerification.count({ where: { status: 'pending' } }),
        prisma.localizedContent.count({ where: { status: 'under_review' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: { in: ['premium', 'enterprise'] } } }),
        prisma.leadLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                intentLevel: true,
                isContacted: true,
                isViewed: true,
                conditionSlug: true,
                createdAt: true,
                doctor: { select: { name: true } },
                geography: { select: { name: true } },
            },
        }),
        prisma.doctorProvider.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                isVerified: true,
                subscriptionTier: true,
                createdAt: true,
            },
        }),
        prisma.leadLog.count({ where: { intentLevel: 'high', isContacted: false } }),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.insuranceProvider.count({ where: { isActive: true } }),
        prisma.tpa.count({ where: { isActive: true } }),
        prisma.diagnosticTest.count({ where: { isActive: true } }),
    ]);

    return {
        conditionsCount,
        doctorsCount,
        locationsCount,
        languagesCount,
        leadsCount,
        contentCount,
        pendingVerifications,
        pendingContent,
        premiumDoctors,
        recentLeads,
        recentDoctors,
        highIntentLeads,
        hospitalsCount,
        insuranceCount,
        tpaCount,
        diagnosticTestsCount,
    };
}

type StatCard = {
    label: string;
    value: number;
    href: string;
    code: string;
};

type AlertEntry = {
    type: 'urgent' | 'warning' | 'info';
    message: string;
    href: string;
    action: string;
};

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    const statCards: StatCard[] = [
        { label: 'Conditions', value: stats.conditionsCount, href: '/admin/conditions', code: 'CO' },
        { label: 'Doctors', value: stats.doctorsCount, href: '/admin/doctors', code: 'DR' },
        { label: 'Hospitals', value: stats.hospitalsCount, href: '/admin/hospitals', code: 'HO' },
        { label: 'Locations', value: stats.locationsCount, href: '/admin/locations', code: 'LO' },
        { label: 'Leads', value: stats.leadsCount, href: '/admin/leads', code: 'LE' },
        { label: 'Content Pages', value: stats.contentCount, href: '/admin/content', code: 'CT' },
    ];

    const networkCards: { label: string; value: number; href: string; code: string; cta: string }[] = [
        { label: 'Insurance Providers', value: stats.insuranceCount, href: '/admin/insurance', code: 'IN', cta: 'Manage providers' },
        { label: 'TPAs', value: stats.tpaCount, href: '/admin/tpas', code: 'TP', cta: 'Manage TPAs' },
        { label: 'Diagnostic Tests', value: stats.diagnosticTestsCount, href: '/admin/diagnostics/tests', code: 'DG', cta: 'Manage tests' },
        { label: 'Languages', value: stats.languagesCount, href: '/admin/geography', code: 'LG', cta: 'View coverage' },
    ];

    // Determine alerts
    const alerts: AlertEntry[] = [];
    if (stats.pendingVerifications > 0) {
        alerts.push({
            type: 'warning',
            message: `${stats.pendingVerifications} doctors pending verification`,
            href: '/admin/verification',
            action: 'Review',
        });
    }
    if (stats.pendingContent > 0) {
        alerts.push({
            type: 'info',
            message: `${stats.pendingContent} content pages under review`,
            href: '/admin/content',
            action: 'Review',
        });
    }
    if (stats.highIntentLeads > 0) {
        alerts.push({
            type: 'urgent',
            message: `${stats.highIntentLeads} high-intent leads not contacted`,
            href: '/admin/leads',
            action: 'Contact Now',
        });
    }

    const alertPalette = (type: AlertEntry['type']) => {
        if (type === 'urgent') {
            return { pillClass: 'pill pill-orange', dotColor: 'var(--orange)', label: 'Urgent', btnClass: 'btn btn-orange btn-sm' };
        }
        if (type === 'warning') {
            return { pillClass: 'pill pill-lemon', dotColor: 'var(--lemon-2)', label: 'Warning', btnClass: 'btn btn-primary btn-sm' };
        }
        return { pillClass: 'pill pill-cobalt', dotColor: 'var(--cobalt)', label: 'Info', btnClass: 'btn btn-cobalt btn-sm' };
    };

    return (
        <div className="col gap-6" style={{ color: 'var(--ink)' }}>
            {/* ── Header ────────────────────────────────────────── */}
            <div className="col gap-2">
                <span className="section-mark">overview / admin console</span>
                <h1
                    className="display"
                    style={{
                        fontSize: 'clamp(36px, 5vw, 56px)',
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        margin: 0,
                        fontWeight: 600,
                    }}
                >
                    Dashboard<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 640, margin: 0 }}>
                    Welcome to AIHealz CMS. Manage <span style={{ color: 'var(--cobalt)' }}>content, doctors, leads</span> and the editorial pipeline from one place.
                </p>
            </div>

            {/* ── Alerts ────────────────────────────────────────── */}
            {alerts.length > 0 && (
                <div className="col gap-2">
                    {alerts.map((alert, i) => {
                        const pal = alertPalette(alert.type);
                        return (
                            <div
                                key={i}
                                className="card row ai-center between"
                                style={{ padding: '14px 18px', flexWrap: 'wrap', gap: 12 }}
                            >
                                <div className="row ai-center gap-3" style={{ minWidth: 0 }}>
                                    <span className={pal.pillClass}>
                                        <span
                                            className="pill-dot"
                                            style={{ background: pal.dotColor }}
                                            aria-hidden="true"
                                        />
                                        {pal.label}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                                        {alert.message}
                                    </span>
                                </div>
                                <Link href={alert.href} className={pal.btnClass}>
                                    {alert.action} →
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Stats grid ───────────────────────────────────── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 0,
                    border: '1px solid var(--rule)',
                    borderRadius: 'var(--r-3)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                }}
            >
                {statCards.map((stat, idx) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="col gap-2"
                        style={{
                            padding: 20,
                            borderRight: '1px solid var(--rule)',
                            borderBottom: '1px solid var(--rule)',
                            background: 'var(--paper)',
                            transition: 'background 120ms ease',
                            position: 'relative',
                        }}
                    >
                        <div className="row ai-center gap-3">
                            <span className="spec-icon" aria-hidden="true">{stat.code}</span>
                            <span className="kicker">{stat.label}</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 32, color: 'var(--ink)' }}>
                            {stat.value.toLocaleString()}
                        </div>
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Open →
                        </span>
                        {idx === statCards.length - 1 && (
                            <span style={{ display: 'none' }} aria-hidden="true" />
                        )}
                    </Link>
                ))}
            </div>

            {/* ── Network grid ─────────────────────────────────── */}
            <div className="col gap-3">
                <span className="section-mark">network / coverage</span>
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    style={{ gap: 12 }}
                >
                    {networkCards.map((c) => (
                        <Link
                            key={c.label}
                            href={c.href}
                            className="card col gap-3"
                            style={{ padding: 20 }}
                        >
                            <div className="row between ai-start">
                                <div className="col gap-1">
                                    <span className="kicker">{c.label}</span>
                                    <span className="num bignum" style={{ fontSize: 28, color: 'var(--ink)' }}>
                                        {c.value.toLocaleString()}
                                    </span>
                                </div>
                                <span className="spec-icon" aria-hidden="true">{c.code}</span>
                            </div>
                            <span
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cobalt)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {c.cta} →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Key metrics ──────────────────────────────────── */}
            <div className="col gap-3">
                <span className="section-mark">III / pipeline status</span>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
                    <div className="card col gap-3" style={{ padding: 20 }}>
                        <div className="row between ai-center">
                            <span className="kicker">
                                <span className="pill-dot" style={{ background: 'var(--mint)', display: 'inline-block', width: 6, height: 6, borderRadius: 999, marginRight: 6 }} />
                                Premium Doctors
                            </span>
                            <span className="pill pill-mint">★ tier</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 36, color: 'var(--ink)' }}>
                            {stats.premiumDoctors.toLocaleString()}
                        </div>
                        <Link
                            href="/admin/subscriptions"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            View Subscriptions →
                        </Link>
                    </div>

                    <div className="card col gap-3" style={{ padding: 20 }}>
                        <div className="row between ai-center">
                            <span className="kicker">
                                <span className="pill-dot" style={{ background: 'var(--lemon-2)', display: 'inline-block', width: 6, height: 6, borderRadius: 999, marginRight: 6 }} />
                                Pending Verification
                            </span>
                            <span className="pill pill-lemon">queue</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 36, color: 'var(--ink)' }}>
                            {stats.pendingVerifications.toLocaleString()}
                        </div>
                        <Link
                            href="/admin/verification"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Review Queue →
                        </Link>
                    </div>

                    <div className="card col gap-3" style={{ padding: 20 }}>
                        <div className="row between ai-center">
                            <span className="kicker">
                                <span className="pill-dot" style={{ background: 'var(--cobalt)', display: 'inline-block', width: 6, height: 6, borderRadius: 999, marginRight: 6 }} />
                                Content Under Review
                            </span>
                            <span className="pill pill-cobalt">editorial</span>
                        </div>
                        <div className="num bignum" style={{ fontSize: 36, color: 'var(--ink)' }}>
                            {stats.pendingContent.toLocaleString()}
                        </div>
                        <Link
                            href="/admin/content"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Review Content →
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ────────────────────────────────── */}
            <div className="card col gap-4" style={{ padding: 24 }}>
                <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <span className="section-mark">IV / quick actions</span>
                    <span className="kicker">create new entity</span>
                </div>
                <div
                    className="grid grid-cols-2 md:grid-cols-4"
                    style={{ gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--r-3)', overflow: 'hidden', background: 'var(--paper)' }}
                >
                    {[
                        { href: '/admin/conditions/new', label: 'Add Condition', code: '+CO' },
                        { href: '/admin/doctors/new', label: 'Add Doctor', code: '+DR' },
                        { href: '/admin/hospitals/new', label: 'Add Hospital', code: '+HO' },
                        { href: '/admin/trigger-batch', label: 'Generate Content', code: '↻' },
                    ].map((a) => (
                        <Link
                            key={a.href}
                            href={a.href}
                            className="row ai-center gap-3"
                            style={{
                                padding: 16,
                                borderRight: '1px solid var(--rule)',
                                borderBottom: '1px solid var(--rule)',
                                color: 'var(--ink)',
                                background: 'var(--paper)',
                            }}
                        >
                            <span className="spec-icon" aria-hidden="true">{a.code}</span>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Recent Activity ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                {/* Recent Leads */}
                <div className="card col gap-3" style={{ padding: 24 }}>
                    <div className="row between ai-center">
                        <span className="section-mark">recent / leads</span>
                        <Link
                            href="/admin/leads"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            View All →
                        </Link>
                    </div>
                    {stats.recentLeads.length > 0 ? (
                        <div className="col">
                            {stats.recentLeads.map((lead, i, arr) => {
                                const intentPill =
                                    lead.intentLevel === 'high'
                                        ? 'pill pill-orange'
                                        : lead.intentLevel === 'medium'
                                            ? 'pill pill-lemon'
                                            : 'pill';
                                return (
                                    <div
                                        key={lead.id}
                                        className="row between ai-center"
                                        style={{
                                            padding: '12px 0',
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                            gap: 12,
                                        }}
                                    >
                                        <div className="col" style={{ minWidth: 0, flex: 1 }}>
                                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                                                {lead.doctor?.name || 'Unknown Doctor'}
                                            </span>
                                            <span className="muted" style={{ fontSize: 12 }}>
                                                {lead.geography?.name || 'Unknown Location'} · {lead.conditionSlug?.replace(/-/g, ' ') || 'General'}
                                            </span>
                                        </div>
                                        <div className="col ai-end gap-1">
                                            <span className={intentPill}>{lead.intentLevel}</span>
                                            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
                            No leads yet
                        </p>
                    )}
                </div>

                {/* Recent Doctors */}
                <div className="card col gap-3" style={{ padding: 24 }}>
                    <div className="row between ai-center">
                        <span className="section-mark">recent / doctors</span>
                        <Link
                            href="/admin/doctors"
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--cobalt)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            View All →
                        </Link>
                    </div>
                    {stats.recentDoctors.length > 0 ? (
                        <div className="col">
                            {stats.recentDoctors.map((doctor, i, arr) => {
                                const tierPill =
                                    doctor.subscriptionTier === 'enterprise'
                                        ? 'pill pill-magenta'
                                        : doctor.subscriptionTier === 'premium'
                                            ? 'pill pill-cobalt'
                                            : 'pill';
                                return (
                                    <div
                                        key={doctor.id}
                                        className="row between ai-center"
                                        style={{
                                            padding: '12px 0',
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none',
                                            gap: 12,
                                        }}
                                    >
                                        <div className="row ai-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                                            <span className="spec-icon" aria-hidden="true">
                                                {doctor.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="col" style={{ minWidth: 0 }}>
                                                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                                                    {doctor.name}
                                                </span>
                                                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                                    /{doctor.slug}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row ai-center gap-2">
                                            {doctor.isVerified && (
                                                <span className="pill pill-mint" aria-label="Verified">
                                                    ✓
                                                </span>
                                            )}
                                            <span className={tierPill}>{doctor.subscriptionTier}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
                            No doctors yet
                        </p>
                    )}
                </div>
            </div>

            {/* ── System Status — real health checks ───────────── */}
            <SystemHealthClient />
        </div>
    );
}
