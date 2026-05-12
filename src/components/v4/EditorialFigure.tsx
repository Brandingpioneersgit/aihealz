import * as React from 'react';
import Image from 'next/image';
import type { StockImage } from '@/lib/stock-images';

type EditorialFigureProps = {
    image: StockImage;
    /** Italic caption rendered below the image */
    caption?: React.ReactNode;
    /** Small mono eyebrow (e.g., FIG. 01, AT THE BUREAU) */
    eyebrow?: string;
    /** Override the aspect ratio. Default 3:2. */
    aspect?: string;
    /** Disable next/image priority loading (default: lazy) */
    priority?: boolean;
};

/**
 * A captioned image with Bureau borders and a small italic caption.
 * Use inline within long-form sections (About, Blog, Careers) to give
 * the page rhythm and human texture.
 */
export default function EditorialFigure({
    image,
    caption,
    eyebrow,
    aspect = '3 / 2',
    priority = false,
}: EditorialFigureProps) {
    return (
        <figure
            className="col gap-2"
            style={{ margin: '24px 0' }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: aspect,
                    overflow: 'hidden',
                    borderRadius: 'var(--r-3, 8px)',
                    border: '1px solid var(--rule)',
                    background: 'var(--bg-2)',
                }}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 760px"
                    priority={priority}
                    style={{ objectFit: 'cover' }}
                />
            </div>
            {(caption || eyebrow) && (
                <figcaption
                    className="col gap-1"
                    style={{ paddingTop: 4 }}
                >
                    {eyebrow && (
                        <span
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: 'var(--ink-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.10em',
                                fontWeight: 500,
                            }}
                        >
                            {eyebrow}
                        </span>
                    )}
                    {caption && (
                        <span
                            style={{
                                fontSize: 13,
                                color: 'var(--ink-3)',
                                fontStyle: 'italic',
                                lineHeight: 1.55,
                            }}
                        >
                            {caption}
                        </span>
                    )}
                </figcaption>
            )}
        </figure>
    );
}
