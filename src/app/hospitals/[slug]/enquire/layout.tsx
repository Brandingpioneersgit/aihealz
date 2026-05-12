import type { Metadata } from 'next';

// Hospital lead-capture funnel — the hospital profile (/hospitals/[slug])
// is the SEO surface; this enquire step is per-user and not crawlable.
export const metadata: Metadata = {
    title: 'Hospital enquiry | aihealz',
    robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
