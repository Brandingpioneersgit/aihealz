import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getChatLeads(page: number, pageSize: number) {
    const [rows, total, stats] = await Promise.all([
        prisma.chatLead.findMany({
            orderBy: { createdAt: 'desc' },
            skip: page * pageSize,
            take: pageSize,
        }),
        prisma.chatLead.count(),
        prisma.chatLead.groupBy({
            by: ['role'],
            _count: { _all: true },
        }),
    ]);
    return { rows, total, stats };
}

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ChatLeadsAdminPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Math.max(0, Number(params.page) || 0);
    const pageSize = 50;

    const { rows, total, stats } = await getChatLeads(page, pageSize);
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    const byRole = stats.reduce<Record<string, number>>((acc, s) => {
        acc[s.role] = s._count._all;
        return acc;
    }, {});

    return (
        <main style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
            <div
                style={{ maxWidth: 1280, margin: '0 auto', padding: '32px clamp(16px, 4vw, 28px) 80px' }}
                className="col gap-5"
            >
                <div className="row ai-center jc-between">
                    <div>
                        <p className="kicker"><span className="dot" /> AI Chatbot Leads</p>
                        <h1 className="display" style={{ fontSize: 28, marginTop: 4 }}>
                            Chat lead capture
                        </h1>
                        <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                            Visitors who registered to use any AI chatbot. 5-message daily cap per IP.
                        </p>
                    </div>
                    <Link href="/admin" className="pill pill-cobalt" style={{ textDecoration: 'none' }}>
                        ← Admin home
                    </Link>
                </div>

                <div className="row gap-3 wrap">
                    <StatCard label="Total leads" value={total} code="TL" />
                    <StatCard label="Patients" value={byRole.patient ?? 0} code="PT" pill="pill-mint" />
                    <StatCard label="Doctors" value={byRole.doctor ?? 0} code="DR" pill="pill-cobalt" />
                    <StatCard label="Other" value={byRole.other ?? 0} code="OT" pill="pill-lemon" />
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Phone</Th>
                                    <Th>Role</Th>
                                    <Th>Location</Th>
                                    <Th align="right">Msgs</Th>
                                    <Th>Last activity</Th>
                                    <Th>Joined</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: 32, textAlign: 'center' }} className="muted">
                                            No chat leads yet.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((lead) => (
                                        <tr key={lead.id} style={{ borderBottom: '1px solid var(--rule-soft)' }}>
                                            <Td>{lead.name}</Td>
                                            <Td>
                                                <a href={`mailto:${lead.email}`} style={{ color: 'var(--cobalt)' }}>
                                                    {lead.email}
                                                </a>
                                            </Td>
                                            <Td>
                                                <a href={`tel:${lead.phone}`} style={{ color: 'var(--cobalt)' }}>
                                                    {lead.phone}
                                                </a>
                                            </Td>
                                            <Td>
                                                <span className={`pill pill-${rolePill(lead.role)}`}>{lead.role}</span>
                                            </Td>
                                            <Td>
                                                {[lead.city, lead.country].filter(Boolean).join(', ') || '—'}
                                            </Td>
                                            <Td align="right">{lead.messageCount}</Td>
                                            <Td>
                                                {lead.lastMessageAt
                                                    ? new Date(lead.lastMessageAt).toLocaleString()
                                                    : '—'}
                                            </Td>
                                            <Td>{new Date(lead.createdAt).toLocaleDateString()}</Td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pageCount > 1 && (
                    <div className="row gap-2 ai-center jc-center">
                        {page > 0 && (
                            <Link href={`/admin/chat-leads?page=${page - 1}`} className="pill">
                                ← Previous
                            </Link>
                        )}
                        <span className="muted" style={{ fontSize: 12 }}>
                            Page {page + 1} of {pageCount}
                        </span>
                        {page + 1 < pageCount && (
                            <Link href={`/admin/chat-leads?page=${page + 1}`} className="pill">
                                Next →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

function rolePill(role: string): string {
    if (role === 'doctor') return 'cobalt';
    if (role === 'patient') return 'mint';
    return 'lemon';
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
    return (
        <th
            style={{
                textAlign: align ?? 'left',
                padding: '12px 14px',
                fontWeight: 500,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                color: 'var(--ink-3)',
            }}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align,
}: {
    children: React.ReactNode;
    align?: 'left' | 'right';
}) {
    return (
        <td style={{ textAlign: align ?? 'left', padding: '12px 14px', verticalAlign: 'middle' }}>
            {children}
        </td>
    );
}

function StatCard({
    label,
    value,
    code,
    pill,
}: {
    label: string;
    value: number;
    code: string;
    pill?: string;
}) {
    return (
        <div className="card row gap-3 ai-center" style={{ padding: '16px 20px', minWidth: 180 }}>
            <div className="spec-icon" style={{ width: 40, height: 40, fontSize: 12 }}>
                {code}
            </div>
            <div className="col">
                <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {label}
                </span>
                <div className="row gap-2 ai-center">
                    <span className="display" style={{ fontSize: 22 }}>
                        {value.toLocaleString()}
                    </span>
                    {pill && <span className={`pill ${pill}`}>live</span>}
                </div>
            </div>
        </div>
    );
}
