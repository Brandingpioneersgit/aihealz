import * as React from 'react';
import type { StockImage } from '@/lib/stock-images';
import MediaTile from './MediaTile';

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
 * A captioned editorial tile rendered inline within long-form
 * sections (About, Blog, Careers). The visual is a semantic Lucide
 * icon tile so each figure remains on-topic without leaning on stock
 * photography.
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
            <MediaTile
                alt={image.alt}
                icon={image.icon}
                tone={image.tone}
                aspect={aspect}
                iconSize={56}
                priority={priority}
                style={{
                    borderRadius: 'var(--r-3, 8px)',
                    border: '1px solid var(--rule)',
                }}
            />
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
