import type { Metadata } from 'next';

// Booking flow — pre-filled lead form. Not an SEO surface; doctor profiles
// (/doctors/[slug]) are. Keep this out of the index.
export const metadata: Metadata = {
    title: 'Book a consult | aihealz',
    robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
