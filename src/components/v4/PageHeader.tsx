import * as React from 'react';

type PageHeaderProps = {
    /** Mono kicker eyebrow */
    eyebrow?: string;
    /** Display headline as text or rich nodes */
    title: React.ReactNode;
    /** Lede paragraph */
    lede?: React.ReactNode;
    /** Right-side CTA cluster */
    actions?: React.ReactNode;
    /** Override the headline font-size clamp */
    titleSize?: string;
};

/**
 * V4 editorial page header. Use at the top of any page that needs a
 * standard section-mark + display headline + lede block.
 */
export default function PageHeader({
    eyebrow,
    title,
    lede,
    actions,
    titleSize = 'clamp(48px, 7vw, 88px)',
}: PageHeaderProps) {
    return (
        <header className="col gap-3" style={{ paddingBottom: 8 }}>
            {eyebrow && <span className="section-mark">{eyebrow}</span>}
            <div
                className="row between ai-end"
                style={{ flexWrap: 'wrap', gap: 16 }}
            >
                <h1
                    className="display"
                    style={{
                        fontSize: titleSize,
                        lineHeight: 0.95,
                        letterSpacing: '-0.045em',
                        margin: 0,
                        fontWeight: 600,
                        flex: '1 1 480px',
                    }}
                >
                    {title}
                </h1>
                {actions && (
                    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {actions}
                    </div>
                )}
            </div>
            {lede && (
                <p
                    className="lede"
                    style={{ fontSize: 20, maxWidth: 720, marginTop: 4 }}
                >
                    {lede}
                </p>
            )}
        </header>
    );
}
