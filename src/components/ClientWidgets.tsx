'use client';

import dynamic from 'next/dynamic';

// These widgets touch the DOM/window and don't need to render server-side.
// Lazy-loaded to keep them out of the initial client JS bundle.
const AIGuide = dynamic(() => import('@/components/ui/ai-guide'), { ssr: false });
const WhatsAppCTA = dynamic(() => import('@/components/ui/whatsapp-cta'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/ui/cookie-consent'), { ssr: false });
const GeoAutoDetect = dynamic(() => import('@/components/geo-auto-detect'), { ssr: false });

export default function ClientWidgets() {
    return (
        <>
            <GeoAutoDetect />
            <AIGuide />
            <WhatsAppCTA />
            <CookieConsent />
        </>
    );
}
