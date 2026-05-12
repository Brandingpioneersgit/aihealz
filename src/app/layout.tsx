import type { Metadata, Viewport } from 'next';
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

// Per-locale lang/dir is set by the [country]/[lang] segment layout, which
// reads URL params (static-friendly). Root stays static so ISR works
// site-wide; calling headers()/cookies() here would opt every route into
// dynamic rendering.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Tag Manager — fires GA4 via the GTM container */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MDDCZV9X');`}
        </Script>
        {/* GA4 (gtag.js) — direct install in addition to GTM */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-0QLXXSNGDS"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0QLXXSNGDS');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MDDCZV9X"
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
