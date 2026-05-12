import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StockImage } from '@/lib/stock-images';

type IllustratedCardProps = {
    image: StockImage;
    title: React.ReactNode;
    eyebrow?: React.ReactNode;
    /** Body copy under the title */
    blurb?: React.ReactNode;
    /** Right-aligned meta cluster shown on the footer row */
    meta?: React.ReactNode;
    /** If provided, the entire card becomes a link */
    href?: string;
    /** External links open in a new tab */
    external?: boolean;
    /** Image aspect ratio at the top of the card. Default 16:9. */
    aspect?: string;
    /** Override default Bureau card class */
    className?: string;
};

/**
 * A Bureau-style card with a 16:9 image header. Use for content
 * grids: conditions by specialty, treatment categories, blog posts,
 * advertised packages.
 *
 * Renders as a Link if `href` is given (internal), or `a` if
 * `external` is true. Falls back to a plain article otherwise.
 */
export default function IllustratedCard({
    image,
    title,
    eyebrow,
    blurb,
    meta,
    href,
    external,
    aspect = '16 / 9',
    className = 'card',
}: IllustratedCardProps) {
    const body = (
        <>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: aspect,
                    overflow: 'hidden',
                    background: 'var(--bg-2)',
                }}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
                    style={{ objectFit: 'cover' }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(10,26,47,0) 60%, rgba(10,26,47,0.18) 100%)',
                    }}
                />
            </div>
            <div className="col gap-2" style={{ padding: 18 }}>
                {eyebrow && (
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            color: 'var(--cobalt)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.10em',
                            fontWeight: 500,
                        }}
                    >
                        {eyebrow}
                    </span>
                )}
                <div
                    className="display"
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        color: 'var(--ink)',
                    }}
                >
                    {title}
                </div>
                {blurb && (
                    <p
                        className="muted"
                        style={{
                            fontSize: 13.5,
                            lineHeight: 1.55,
                            margin: 0,
                            color: 'var(--ink-2)',
                        }}
                    >
                        {blurb}
                    </p>
                )}
                {meta && (
                    <div
                        className="row between ai-center"
                        style={{ paddingTop: 8, marginTop: 4, borderTop: '1px solid var(--rule)' }}
                    >
                        {meta}
                    </div>
                )}
            </div>
        </>
    );

    const sharedStyle: React.CSSProperties = {
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
    };

    if (href) {
        if (external) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    style={sharedStyle}
                >
                    {body}
                </a>
            );
        }
        return (
            <Link href={href} className={className} style={sharedStyle}>
                {body}
            </Link>
        );
    }

    return (
        <article className={className} style={sharedStyle}>
            {body}
        </article>
    );
}
