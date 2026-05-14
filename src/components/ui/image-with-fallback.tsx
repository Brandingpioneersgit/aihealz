'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';

interface ImageWithFallbackProps {
    src: string | null | undefined;
    alt: string;
    fallback?: string;
    className?: string;
}

const DEFAULT_IMAGE = '/images/default-placeholder.svg';

export function ImageWithFallback({
    src,
    alt,
    fallback,
    className = '',
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src || fallback || DEFAULT_IMAGE);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallback || DEFAULT_IMAGE);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}

/**
 * Doctor avatar. Renders the photo when present, otherwise a Lucide
 * UserRound icon tile in the Bureau style. Prevents the generic gray
 * silhouette placeholder from appearing in directory cards.
 */
export function AvatarWithFallback({
    src,
    alt,
    className = '',
}: Omit<ImageWithFallbackProps, 'fallback'>) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <span
                role="img"
                aria-label={alt}
                className={className}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background:
                        'linear-gradient(135deg, rgba(28,91,255,0.10) 0%, rgba(28,91,255,0.04) 60%, rgba(244,246,250,1) 100%)',
                    color: 'var(--cobalt, #1C5BFF)',
                }}
            >
                <UserRound
                    aria-hidden="true"
                    strokeWidth={1.25}
                    style={{ width: '55%', height: '55%' }}
                />
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
