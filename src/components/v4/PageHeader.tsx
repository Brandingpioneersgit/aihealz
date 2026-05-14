import * as React from 'react';
import type { StockImage } from '@/lib/stock-images';
import MediaTile from './MediaTile';

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
    /** Optional editorial side-image (Bureau style) — now rendered as
     *  a semantic icon tile via MediaTile. */
    image?: StockImage;
    /** How the optional image is laid out. Default: `side` */
    imageVariant?: 'side' | 'banner';
};

/**
 * V4 editorial page header. Use at the top of any page that needs a
 * standard section-mark + display headline + lede block.
 *
 * Pass an `image` to add an editorial side-illustration. It renders
 * as a Bureau-style icon tile (no stock photo) so each section is
 * unambiguously meaningful instead of decorative.
 */
export default function PageHeader({
    eyebrow,
    title,
    lede,
    actions,
    titleSize = 'clamp(48px, 7vw, 88px)',
    image,
    imageVariant = 'side',
}: PageHeaderProps) {
    const TextBlock = (
        <div className="col gap-3" style={{ paddingBottom: 8, flex: '1 1 480px', minWidth: 0 }}>
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
                        flex: '1 1 360px',
                    }}
                >
                    {title}
                </h1>
                {actions && !image && (
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
            {actions && image && (
                <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                    {actions}
                </div>
            )}
        </div>
    );

    if (!image) {
        return <header>{TextBlock}</header>;
    }

    if (imageVariant === 'banner') {
        return (
            <header className="col gap-5">
                <MediaTile
                    alt={image.alt}
                    icon={image.icon}
                    tone={image.tone}
                    aspect="21 / 7"
                    iconSize={88}
                    priority
                    style={{
                        borderRadius: 'var(--r-3, 8px)',
                        border: '1px solid var(--rule)',
                    }}
                />
                {TextBlock}
            </header>
        );
    }

    return (
        <header
            className="row gap-7 ai-end"
            style={{ flexWrap: 'wrap', paddingBottom: 8 }}
        >
            {TextBlock}
            <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                <MediaTile
                    alt={image.alt}
                    icon={image.icon}
                    tone={image.tone}
                    aspect="4 / 3"
                    iconSize={72}
                    priority
                    style={{
                        borderRadius: 'var(--r-3, 8px)',
                        border: '1px solid var(--rule)',
                    }}
                />
            </div>
        </header>
    );
}
