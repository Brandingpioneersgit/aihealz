'use client';

import { useEffect } from 'react';

/**
 * WhatsApp enquiry widget (wacrs.com) — mobile only.
 *
 * The vendor script injects a floating CTA that opens an in-page WhatsApp
 * enquiry form. We only load the bundle on viewports below the `md`
 * breakpoint so the desktop UI stays unchanged.
 *
 * Configure the widget key via NEXT_PUBLIC_WACRS_WIDGET_KEY (falls back to
 * the key the user provided for aihealz.com so this works without env
 * setup, but env override is preferred for staging vs prod).
 */

const WIDGET_KEY =
    process.env.NEXT_PUBLIC_WACRS_WIDGET_KEY ||
    'b1cabdc3-625d-40a3-ae6c-e3591e8facca';

const SCRIPT_ATTR = 'data-wacrs-widget';
const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';

export default function WacrsWidget() {
    useEffect(() => {
        if (typeof window === 'undefined' || !WIDGET_KEY) return;

        const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

        const inject = () => {
            if (document.querySelector(`script[${SCRIPT_ATTR}]`)) return;
            const s = document.createElement('script');
            s.src = `https://app.wacrs.com/install-widget/bundle.js?key=${WIDGET_KEY}`;
            s.defer = true;
            s.setAttribute(SCRIPT_ATTR, '1');
            document.head.appendChild(s);
        };

        if (mql.matches) inject();

        // If the user rotates their phone or resizes (DevTools), inject on
        // first match. We don't tear the widget down on the reverse — once
        // loaded it stays for the session. Keeps things simple and avoids
        // fighting whatever DOM the vendor scripts inserted.
        const onChange = (e: MediaQueryListEvent) => {
            if (e.matches) inject();
        };
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return null;
}
