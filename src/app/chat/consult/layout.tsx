import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Consult chat',
    description:
        'Private AI consult chat — get triage, next steps, and specialist recommendations from an evidence-based assistant.',
    robots: { index: false, follow: false },
    alternates: { canonical: '/chat/consult' },
};

export default function ConsultChatLayout({ children }: { children: React.ReactNode }) {
    return children;
}
