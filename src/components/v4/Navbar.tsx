import Link from 'next/link';
import { LogoLockup } from './Logo';
import { getGeoContext } from '@/lib/geo-context';
import MobileMenu from './MobileMenu';

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
    { label: 'Conditions', href: '/conditions' },
    { label: 'Treatments', href: '/treatments' },
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

export default async function V4Navbar({ active }: V4NavbarProps) {
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
                background: 'rgba(244,246,250,.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
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
                    <nav
                        aria-label="Primary"
                        className="row gap-1 v4-nav-desktop"
                        style={{ fontSize: 13 }}
                    >
                        {NAV_ITEMS.map((item) => {
                            const isActive = active === item.label;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    style={{
                                        padding: '10px 12px',
                                        minHeight: 44,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: 'var(--r-2)',
                                        color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                                        background: isActive ? 'var(--bg-2)' : 'transparent',
                                        fontWeight: isActive ? 500 : 400,
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="row ai-center gap-3 v4-nav-actions" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                    <div
                        className="row ai-center gap-2 mono v4-geo-pill"
                        role="status"
                        aria-label={`Location: ${locationLabel}`}
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
                    </div>
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
                        href="/provider/login"
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
