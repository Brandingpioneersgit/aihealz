import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Diagnostic chat',
    description:
        'Private AI diagnostic chat — discuss symptoms, lab values, and possible conditions with an evidence-based assistant.',
    robots: { index: false, follow: false },
    alternates: { canonical: '/chat/diagnostic' },
};

export default function DiagnosticChatLayout({ children }: { children: React.ReactNode }) {
    return children;
}
