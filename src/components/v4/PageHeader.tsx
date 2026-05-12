import * as React from 'react';
import Image from 'next/image';
import type { StockImage } from '@/lib/stock-images';

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
    /** Optional editorial side-image (Bureau style) */
    image?: StockImage;
    /** How the optional image is laid out. Default: `side` */
    imageVariant?: 'side' | 'banner';
};

/**
 * V4 editorial page header. Use at the top of any page that needs a
 * standard section-mark + display headline + lede block.
 *
 * Pass an `image` to add an editorial side-image (Bureau style). The
 * image sits to the right of the text on wide viewports, fading
 * subtly under a navy → transparent gradient at the inner edge so it
 * always reads as a complement to the typography, not a competitor.
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
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '21 / 7',
                        overflow: 'hidden',
                        borderRadius: 'var(--r-3, 8px)',
                        background: 'var(--bg-2)',
                    }}
                >
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        priority
                        style={{ objectFit: 'cover' }}
                    />
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(180deg, rgba(10,26,47,0.05) 0%, rgba(10,26,47,0.25) 80%, rgba(10,26,47,0.45) 100%)',
                        }}
                    />
                </div>
                {TextBlock}
            </header>
        );
    }

    // Default: side-image editorial layout
    return (
        <header
            className="row gap-7 ai-end"
            style={{ flexWrap: 'wrap', paddingBottom: 8 }}
        >
            {TextBlock}
            <div
                style={{
                    position: 'relative',
                    flex: '1 1 420px',
                    minWidth: 0,
                    aspectRatio: '4 / 3',
                    overflow: 'hidden',
                    borderRadius: 'var(--r-3, 8px)',
                    background: 'var(--bg-2)',
                }}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 580px"
                    priority
                    style={{ objectFit: 'cover' }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(90deg, rgba(244,246,250,0.20) 0%, rgba(244,246,250,0) 35%), linear-gradient(180deg, rgba(28,91,255,0.06) 0%, rgba(10,26,47,0.18) 100%)',
                    }}
                />
            </div>
        </header>
    );
}
