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
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(5, 11, 20, 0.85)',
                backdropFilter: 'blur(12px) saturate(140%)',
                WebkitBackdropFilter: 'blur(12px) saturate(140%)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                paddingTop: 'env(safe-area-inset-top, 0px)',
            }}
        >
            <div
                className="row ai-center between v4-nav-inner"
                style={{ padding: '14px 28px', maxWidth: 1280, margin: '0 auto', gap: 16 }}
            >
                <div className="row ai-center gap-6">
                    <Link
                        href="/"
                        aria-label="aihealz home"
                        style={{ display: 'inline-flex', color: '#fff' }}
                    >
                        <LogoLockup size={28} scale={0.85} dark />
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
                                        borderRadius: 8,
                                        color: isActive ? '#fff' : 'rgba(226,232,240,0.78)',
                                        background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
                                        fontWeight: isActive ? 600 : 500,
                                        transition: 'color 120ms, background 120ms',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="row ai-center gap-3 v4-nav-actions">
                    <div
                        className="row ai-center gap-2 mono v4-geo-pill"
                        role="status"
                        aria-label={`Location: ${locationLabel}`}
                        style={{
                            fontSize: 11,
                            color: 'rgba(226,232,240,0.6)',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 6,
                                height: 6,
                                background: '#2dd4bf',
                                borderRadius: 99,
                                display: 'inline-block',
                                boxShadow: '0 0 8px rgba(45,212,191,0.6)',
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
                        className="v4-nav-desktop-only"
                        style={{
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            color: 'rgba(226,232,240,0.85)',
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 8,
                        }}
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/analyze"
                        style={{
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            background: '#2dd4bf',
                            color: '#0f172a',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(45,212,191,0.25)',
                        }}
                    >
                        Analyze report{' '}
                        <span aria-hidden="true" style={{ marginLeft: 6 }}>→</span>
                    </Link>
                    <MobileMenu items={MOBILE_NAV_ITEMS} />
                </div>
            </div>
        </header>
    );
}
