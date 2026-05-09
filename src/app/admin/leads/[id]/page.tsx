import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LeadDetails from './LeadDetails';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLead(id: string) {
    const lead = await prisma.leadLog.findUnique({
        where: { id },
        include: {
            doctor: {
                include: {
                    geography: true,
                }
            },
            geography: true,
            analysis: true,
            leadCredits: {
                orderBy: { createdAt: 'desc' }
            },
            teleconsultations: {
                orderBy: { scheduledAt: 'desc' }
            },
        }
    });

    return lead;
}

export default async function LeadDetailPage({ params }: PageProps) {
    const { id } = await params;
    const lead = await getLead(id);

    if (!lead) {
        notFound();
    }

    return (
        <div className="col gap-5" style={{ maxWidth: 1024, color: 'var(--ink)' }}>
            <Link
                href="/admin/leads"
                className="mono"
                style={{ fontSize: 11, color: 'var(--cobalt)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                ← Back to leads
            </Link>

            <div className="col gap-2">
                <span className="section-mark">admin / leads / {lead.id.slice(0, 8)}</span>
                <h1
                    className="display"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 600 }}
                >
                    Lead details<span style={{ color: 'var(--orange)' }}>.</span>
                </h1>
                <p className="lede" style={{ fontSize: 14, margin: 0 }}>
                    Track patient enquiry activity, credits and teleconsultations.
                </p>
            </div>

            <LeadDetails lead={lead} />
        </div>
    );
}
