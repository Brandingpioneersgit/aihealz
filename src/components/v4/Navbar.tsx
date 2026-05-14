import Link from 'next/link';
import { LogoLockup } from './Logo';
import { getGeoContext } from '@/lib/geo-context';
import MobileMenu from './MobileMenu';
import NavLinks, { type NavItem } from './NavLinks';

const CONDITION_SPECIALTIES: { label: string; href: string; desc: string }[] = [
    { label: 'Cardiology', href: '/conditions/cardiology', desc: 'Heart & cardiovascular' },
    { label: 'Neurology', href: '/conditions/neurology', desc: 'Brain & nervous system' },
    { label: 'Orthopedics', href: '/conditions/orthopedics', desc: 'Bone, joint, muscle' },
    { label: 'Dermatology', href: '/conditions/dermatology', desc: 'Skin, hair, nails' },
    { label: 'Gastroenterology', href: '/conditions/gastroenterology', desc: 'Digestive system' },
    { label: 'Oncology', href: '/conditions/oncology', desc: 'Cancer & tumors' },
    { label: 'Pulmonology', href: '/conditions/pulmonology', desc: 'Lung & respiratory' },
    { label: 'Endocrinology', href: '/conditions/endocrinology', desc: 'Hormones & metabolism' },
];

const TREATMENT_CATEGORIES: { label: string; href: string; desc: string }[] = [
    { label: 'Prescription drugs', href: '/treatments?type=prescription', desc: 'Prescription-only medications' },
    { label: 'Surgical procedures', href: '/treatments?type=surgical', desc: 'Operative & minimally invasive' },
    { label: 'Injectable therapies', href: '/treatments?type=injection', desc: 'Biologics, vaccines, injectables' },
    { label: 'Therapy & rehab', href: '/treatments?type=therapy', desc: 'Physical & occupational therapy' },
    { label: 'OTC medications', href: '/treatments?type=otc', desc: 'Over-the-counter drugs' },
    { label: 'Home remedies', href: '/treatments?type=home_remedy', desc: 'Natural & traditional remedies' },
];

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Conditions',
        href: '/conditions',
        mega: {
            items: CONDITION_SPECIALTIES,
            footerLabel: 'Browse all conditions A–Z',
            footerHref: '/conditions',
        },
    },
    {
        label: 'Treatments',
        href: '/treatments',
        mega: {
            items: TREATMENT_CATEGORIES,
            footerLabel: 'Browse all treatments',
            footerHref: '/treatments',
        },
    },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Hospitals', href: '/hospitals' },
    { label: 'Tests', href: '/tests' },
    { label: 'Tools', href: '/tools' },
    { label: 'For Doctors', href: '/for-doctors' },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
    ...NAV_ITEMS,
    { label: 'Symptoms', href: '/symptoms' },
    { label: 'Insurance', href: '/insurance' },
    { label: 'Medical Travel', href: '/medical-travel' },
    { label: 'Healz AI', href: '/healz-ai' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const COUNTRY_DISPLAY: Record<string, string> = {
    india: 'India',
    usa: 'USA',
    uk: 'UK',
    nigeria: 'Nigeria',
    germany: 'Germany',
    france: 'France',
    brazil: 'Brazil',
    spain: 'Spain',
    kenya: 'Kenya',
    'south-africa': 'South Africa',
    australia: 'Australia',
    canada: 'Canada',
    mexico: 'Mexico',
    uae: 'UAE',
    'saudi-arabia': 'KSA',
};

export type V4NavbarProps = {
    active?: string;
};

export default async function V4Navbar(_props: V4NavbarProps) {
    const geo = await getGeoContext();
    const countryLabel =
        (geo.countrySlug && COUNTRY_DISPLAY[geo.countrySlug]) || 'Global';
    const cityLabel = geo.citySlug
        ? geo.citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : null;
    const locationLabel = cityLabel ? `${cityLabel} · ${countryLabel}` : countryLabel;

    return (
        <header
            style={{
                borderBottom: '1px solid var(--rule)',
                background: 'var(--bg)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                paddingTop: 'env(safe-area-inset-top, 0px)',
            }}
        >
            <div
                className="row ai-center between v4-nav-inner"
                style={{ padding: '14px clamp(16px, 4vw, 28px)', maxWidth: 1280, margin: '0 auto', gap: 16 }}
            >
                <div className="row ai-center gap-6">
                    <Link
                        href="/"
                        aria-label="aihealz home"
                        style={{ display: 'inline-flex' }}
                    >
                        <LogoLockup size={28} scale={0.85} />
                    </Link>
                    <NavLinks items={NAV_ITEMS} />
                </div>
                <div className="row ai-center gap-3 v4-nav-actions" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <Link
                        href="/settings/location"
                        className="row ai-center gap-2 mono v4-geo-pill"
                        aria-label={`Location: ${locationLabel}. Change location.`}
                        style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 6,
                                height: 6,
                                background: 'var(--mint)',
                                borderRadius: 99,
                                display: 'inline-block',
                            }}
                        />
                        {locationLabel}
                    </Link>
                    <Link
                        href="/tools/emergency"
                        className="v4-btn v4-btn-sm v4-emergency-cta"
                        aria-label="Emergency information"
                        style={{
                            background: '#dc2626',
                            color: '#fff',
                            borderColor: '#b91c1c',
                            minHeight: 44,
                        }}
                    >
                        SOS
                    </Link>
                    <Link
                        href="/login"
                        className="v4-btn v4-btn-ghost v4-btn-sm v4-nav-desktop-only"
                        style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/analyze"
                        className="v4-btn v4-btn-cobalt v4-btn-sm"
                        aria-label="Analyze a medical report"
                        style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                    >
                        <span className="v4-analyze-cta-label">Analyze report</span>
                        <span aria-hidden="true">→</span>
                    </Link>
                    <MobileMenu items={MOBILE_NAV_ITEMS} />
                </div>
            </div>
        </header>
    );
}
