import type { Metadata } from 'next';

// Test-booking funnel — diagnostic-test pages (/diagnostic-labs/[slug]) are
// the SEO surface. The booking step is private to the user's session.
export const metadata: Metadata = {
    title: 'Book a test | aihealz',
    robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
