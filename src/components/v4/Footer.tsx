import Link from 'next/link';
import { LogoLockup } from './Logo';

type Section = {
    heading: string;
    items: { label: string; href: string }[];
};

/**
 * Source of truth for the global site footer.
 *
 * Keep in sync with:
 *  - scripts/generate-sitemaps.ts — top-level hubs and /tools/* listings should mirror these.
 *  - src/app/admin/footer/page.tsx — currently manages FooterTemplate rows that are NOT consumed
 *    here. If/when admin edits should go live, refactor this component to read from those
 *    templates (or a `nav_items` / `footer_sections` table) instead of this constant.
 *  - src/lib/tools-list.ts — when extending the Tools / Calculators columns, mirror entries from
 *    that file so /tools, the footer, and the sitemap stay aligned.
 */
const SECTIONS: Section[] = [
    {
        heading: 'Care',
        items: [
            { label: 'Conditions', href: '/conditions' },
            { label: 'Treatments', href: '/treatments' },
            { label: 'Find a doctor', href: '/doctors' },
            { label: 'Hospitals', href: '/hospitals' },
            { label: 'Diagnostic labs', href: '/diagnostic-labs' },
            { label: 'Lab tests', href: '/tests' },
            { label: 'Insurance', href: '/insurance' },
            { label: 'Medical travel', href: '/medical-travel' },
            { label: 'Remedies', href: '/remedies' },
            { label: 'Symptoms', href: '/symptoms' },
        ],
    },
    {
        heading: 'Tools',
        items: [
            { label: 'Report analysis', href: '/analyze' },
            { label: 'Symptom checker', href: '/symptoms' },
            { label: 'Ask Healz AI', href: '/healz-ai' },
            { label: 'All tools', href: '/tools' },
            { label: 'Drug interactions', href: '/tools/drug-interactions' },
            { label: 'Medical glossary', href: '/tools/glossary' },
            { label: 'Vaccinations', href: '/tools/vaccinations' },
            { label: 'Surgery checklist', href: '/tools/surgery-checklist' },
            { label: 'Emergency info', href: '/tools/emergency' },
            { label: 'Patient vault', href: '/vault' },
        ],
    },
    {
        heading: 'Calculators',
        items: [
            { label: 'BMI', href: '/tools/bmi-calculator' },
            { label: 'BMR', href: '/tools/bmr-calculator' },
            { label: 'Body fat', href: '/tools/body-fat-calculator' },
            { label: 'Heart risk', href: '/tools/heart-risk-calculator' },
            { label: 'Diabetes risk', href: '/tools/diabetes-risk-calculator' },
            { label: 'Kidney function', href: '/tools/kidney-function-calculator' },
            { label: 'Water intake', href: '/tools/water-intake-calculator' },
            { label: 'Pregnancy due date', href: '/tools/pregnancy-due-date-calculator' },
        ],
    },
    {
        heading: 'For Doctors',
        items: [
            { label: 'Overview', href: '/for-doctors' },
            { label: 'Pricing', href: '/for-doctors/pricing' },
            { label: 'Clinical scores', href: '/for-doctors/clinical-scores' },
            { label: 'Drug dosing', href: '/for-doctors/drug-dosing' },
            { label: 'Quick reference', href: '/for-doctors/quick-reference' },
            { label: 'Surgical checklist', href: '/for-doctors/surgical-checklist' },
            { label: 'Join as doctor', href: '/doctors/join' },
            { label: 'Provider login', href: '/provider/login' },
        ],
    },
    {
        heading: 'Clinical Reference',
        items: [
            { label: 'Overview', href: '/clinical-reference' },
            { label: 'Drugs', href: '/reference/drugs' },
            { label: 'Guidelines', href: '/reference/guidelines' },
            { label: 'Lab medicine', href: '/reference/lab-medicine' },
            { label: 'Anatomy', href: '/reference/anatomy' },
            { label: 'Procedures', href: '/reference/procedures' },
            { label: 'Simulations', href: '/reference/simulations' },
        ],
    },
    {
        heading: 'Company',
        items: [
            { label: 'About', href: '/about' },
            { label: 'Editorial board', href: '/editorial-board' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
            { label: 'Contact', href: '/contact' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Advertise', href: '/advertise' },
            { label: 'Advertise pricing', href: '/advertise/pricing' },
        ],
    },
    {
        heading: 'Help',
        items: [
            { label: 'Help center', href: '/help' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Patient sign-in', href: '/login' },
            { label: 'Create account', href: '/register' },
            { label: 'Provider sign-in', href: '/provider/login' },
        ],
    },
    {
        heading: 'Legal',
        items: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Partner agreement', href: '/partner-agreement' },
            { label: 'Sitemap', href: '/sitemap.xml' },
        ],
    },
];

export default function V4Footer() {
    const year = new Date().getFullYear();
    return (
        <footer
            aria-labelledby="site-footer-heading"
            style={{
                background: 'var(--ink)',
                color: 'var(--paper)',
                padding: '56px clamp(16px, 4vw, 28px) 28px',
                marginTop: 0,
            }}
        >
            <h2 id="site-footer-heading" className="sr-only">Site footer</h2>
            <div style={{ maxWidth: 1280, margin: '0 auto' }} className="col gap-7">
                <div
                    className="row ai-start"
                    style={{ gap: 48, flexWrap: 'wrap' }}
                >
                    <div className="col gap-3" style={{ flex: '1 1 280px' }}>
                        <LogoLockup size={32} scale={1} dark />
                        <div
                            style={{
                                fontSize: 14,
                                color: 'rgba(255,255,255,.7)',
                                maxWidth: 300,
                                lineHeight: 1.55,
                            }}
                        >
                            The medical directory for the people who actually need one.
                        </div>
                        <div className="row gap-2" style={{ marginTop: 6 }}>
                            {['HIPAA', 'GDPR', 'ISO 27001'].map((tag) => (
                                <span
                                    key={tag}
                                    className="pill"
                                    style={{
                                        background: 'rgba(255,255,255,.06)',
                                        color: 'rgba(255,255,255,.75)',
                                        borderColor: 'rgba(255,255,255,.15)',
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div
                            role="note"
                            style={{
                                fontSize: 12,
                                color: 'rgba(255,255,255,.6)',
                                lineHeight: 1.55,
                                maxWidth: 320,
                                marginTop: 8,
                            }}
                        >
                            <strong style={{ color: 'rgba(255,255,255,.85)' }}>Medical disclaimer:</strong>{' '}
                            Information on aihealz is for general education only and is not a substitute
                            for professional medical advice, diagnosis, or treatment. Always consult a
                            qualified clinician before making any health decision.
                        </div>
                    </div>
                    {SECTIONS.map((section) => (
                        <nav
                            key={section.heading}
                            aria-label={section.heading}
                            className="col gap-3"
                            style={{ flex: '1 1 160px' }}
                        >
                            <h3
                                className="mono"
                                style={{
                                    fontSize: 11,
                                    letterSpacing: '.10em',
                                    color: 'var(--cobalt-3)',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    margin: 0,
                                }}
                            >
                                {section.heading}
                            </h3>
                            <ul
                                className="col gap-2"
                                style={{ listStyle: 'none', padding: 0, margin: 0 }}
                            >
                                {section.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            style={{
                                                fontSize: 13,
                                                color: 'rgba(255,255,255,.78)',
                                            }}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
                <div
                    className="row between hairline-t"
                    style={{
                        paddingTop: 18,
                        fontSize: 11,
                        color: 'rgba(255,255,255,.6)',
                        borderTopColor: 'rgba(255,255,255,.12)',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <span className="mono">© {year} aihealz inc</span>
                    <span className="mono">ATZ Medappz Pvt Ltd, Gurgaon, IN</span>
                    <span className="mono">v4.0 / bureau</span>
                </div>
            </div>
        </footer>
    );
}
