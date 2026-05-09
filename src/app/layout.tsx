import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import V4Navbar from '@/components/v4/Navbar';
import V4Footer from '@/components/v4/Footer';
import { DefaultSiteSchemas } from '@/lib/structured-data';
import ClientWidgets from '@/components/ClientWidgets';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | aihealz',
    default: 'aihealz — AI-Powered Medical Directory',
  },
  description:
    'Find verified doctors, understand medical conditions, and get AI-powered report analysis. Trusted by millions across the globe.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com'),
  verification: {
    google: 't79pGq0m5lWEyNC3b8Vto1z6YVgRTDAt9AV55i1ez1g',
  },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#F4F6FA',
  width: 'device-width',
  initialScale: 1,
};

const SUPPORTED_LANGS = new Set([
  'en', 'hi', 'ar', 'bn', 'de', 'es', 'fr', 'gu', 'kn',
  'ml', 'mr', 'or', 'pa', 'pt', 'ta', 'te', 'ur',
]);
const RTL_LANGS = new Set(['ar', 'ur', 'he']);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware sets x-aihealz-lang per request; assistive tech needs the real
  // <html lang>/<html dir>, not just meta tags.
  const h = await headers();
  const rawLang = (h.get('x-aihealz-lang') || 'en').toLowerCase();
  const lang = SUPPORTED_LANGS.has(rawLang) ? rawLang : 'en';
  const dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Tag Manager (also injects GA4 via container) */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-N698KG2Z');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N698KG2Z"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <DefaultSiteSchemas />
        <div className="v4-root">
          <V4Navbar />
        </div>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <div className="v4-root">
          <V4Footer />
        </div>
        <ClientWidgets />
      </body>
    </html>
  );
}
