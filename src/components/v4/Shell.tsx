import * as React from 'react';

type V4PageProps = {
    children: React.ReactNode;
    /** Set the page background. Defaults to var(--bg). */
    background?: string;
};

/**
 * V4Page is the root wrapper for any page rebuilt against the v4 'bureau'
 * design language. It applies the `.v4-root` scope so all v4 utility classes
 * (display, kicker, card, pill, v4-btn-cobalt, etc.) resolve correctly.
 *
 * The site-wide navbar + footer are rendered by the root layout, so pages do
 * not need to render them themselves.
 */
export default function V4Page({ children, background }: V4PageProps) {
    return (
        <div
            className="v4-root"
            style={{
                background: background ?? 'var(--bg)',
                minHeight: '100%',
                color: 'var(--ink)',
            }}
        >
            {children}
        </div>
    );
}
