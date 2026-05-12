import type { Metadata } from 'next';

// Lead-capture funnel — never index. The advertise marketing page (/advertise) is the SEO surface.
export const metadata: Metadata = {
    title: 'Advertise enquiry | aihealz',
    robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
