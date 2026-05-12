import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing — Provider Plans for Doctors, Hospitals & Labs | aihealz',
    description:
        'Transparent provider pricing on aihealz. Doctor profiles, hospital listings, and lab plans — pick the tier that matches your reach. Free claim, paid visibility.',
    keywords: [
        'aihealz pricing',
        'doctor listing price',
        'hospital directory plans',
        'lab listing fee',
        'medical directory subscription',
        'provider pricing healthcare',
    ],
    alternates: { canonical: '/pricing' },
    openGraph: {
        title: 'Pricing — Provider Plans | aihealz',
        description:
            'Transparent provider pricing for doctors, hospitals, and labs on aihealz. Free claim, paid visibility.',
        url: 'https://aihealz.com/pricing',
        siteName: 'aihealz',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pricing — Provider Plans | aihealz',
        description: 'Doctor, hospital, and lab plans on aihealz.',
    },
    robots: { index: true, follow: true },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
