import * as React from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';

type MediaTileProps = {
    /** Optional real photo. If omitted, an icon tile is rendered. */
    src?: string;
    /** Alt text for the image, OR a11y label for the icon tile. */
    alt: string;
    /** Lucide icon component used when no src is provided. */
    icon?: LucideIcon;
    /** Aspect ratio expressed as a CSS string (e.g. '16 / 9'). */
    aspect?: string;
    /** next/image sizes attribute when rendering a photo. */
    sizes?: string;
    /** next/image priority flag. */
    priority?: boolean;
    /** Override the tile background tint. Defaults to var(--bg-2). */
    tone?: 'cobalt' | 'fog' | 'paper';
    /** Show a darkening gradient overlay (only when rendering a photo). */
    overlay?: boolean;
    /** Override the icon size in px. */
    iconSize?: number;
    className?: string;
    style?: React.CSSProperties;
};

const TONE_BG: Record<NonNullable<MediaTileProps['tone']>, string> = {
    cobalt: 'linear-gradient(135deg, rgba(28,91,255,0.10) 0%, rgba(28,91,255,0.04) 60%, rgba(244,246,250,1) 100%)',
    fog: 'var(--bg-2, #ECEFF5)',
    paper: 'var(--paper, #FFFFFF)',
};

const TONE_ICON_COLOR: Record<NonNullable<MediaTileProps['tone']>, string> = {
    cobalt: 'var(--cobalt, #1C5BFF)',
    fog: 'var(--ink-2, #2B3A55)',
    paper: 'var(--ink, #0A1A2F)',
};

export default function MediaTile({
    src,
    alt,
    icon: Icon,
    aspect = '16 / 9',
    sizes = '(max-width: 768px) 100vw, 50vw',
    priority = false,
    tone = 'fog',
    overlay = false,
    iconSize,
    className,
    style,
}: MediaTileProps) {
    const wrapperStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        aspectRatio: aspect,
        overflow: 'hidden',
        background: TONE_BG[tone],
        ...style,
    };

    if (src) {
        return (
            <div className={className} style={wrapperStyle}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    style={{ objectFit: 'cover' }}
                />
                {overlay && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(180deg, rgba(10,26,47,0) 60%, rgba(10,26,47,0.20) 100%)',
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            className={className}
            style={wrapperStyle}
            role="img"
            aria-label={alt}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: TONE_ICON_COLOR[tone],
                }}
            >
                {Icon ? (
                    <Icon
                        size={iconSize ?? 64}
                        strokeWidth={1.25}
                        aria-hidden="true"
                    />
                ) : (
                    <span
                        className="mono"
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: 'var(--ink-3)',
                        }}
                    >
                        {alt}
                    </span>
                )}
            </div>
            {/* Subtle corner tick marks for editorial framing */}
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 12,
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.10em',
                    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                }}
            >
                ●
            </span>
        </div>
    );
}
