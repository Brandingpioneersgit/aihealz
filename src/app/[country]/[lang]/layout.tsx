import { notFound } from 'next/navigation';

// Languages this app explicitly supports for the [lang] segment.
const SUPPORTED_LANGS = new Set([
    'en', 'hi', 'ar', 'bn', 'de', 'es', 'fr', 'gu', 'kn',
    'ml', 'mr', 'or', 'pa', 'pt', 'ta', 'te', 'ur',
]);
const RTL_LANGS = new Set(['ar', 'ur', 'he']);

/**
 * Per-locale layout for /[country]/[lang]/*
 *
 * Note: <html lang> / <html dir> can only be set in the root app/layout.tsx in
 * Next.js. The root layout reads the `x-aihealz-lang` header (set by
 * middleware.ts) to set the document-level lang/dir. Here we provide a scoped
 * wrapper <div> as defense-in-depth so any RTL CSS keyed off `[dir="rtl"]`
 * still works for this subtree, and so screen readers get the correct lang
 * even if header propagation lags.
 */
export default async function CountryLangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ country: string; lang: string }>;
}) {
    const { lang } = await params;
    const normalized = (lang || '').toLowerCase();

    if (!SUPPORTED_LANGS.has(normalized)) {
        notFound();
    }

    const dir = RTL_LANGS.has(normalized) ? 'rtl' : 'ltr';

    return (
        <div lang={normalized} dir={dir}>
            {children}
        </div>
    );
}
