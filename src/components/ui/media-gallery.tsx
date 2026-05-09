'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface MediaItem {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    alt?: string;
    caption?: string;
}

interface MediaGalleryProps {
    /** Main cover image URL */
    coverImage?: string | null;
    /** Array of image URLs */
    images?: string[];
    /** Video URL (YouTube, Vimeo, or direct video) */
    videoUrl?: string | null;
    /** Video thumbnail */
    videoThumbnail?: string | null;
    /** Alt text for images */
    alt?: string;
    /** Show image count badge */
    showCount?: boolean;
    /** Compact mode for smaller displays */
    compact?: boolean;
    /** Maximum images to show in grid before "See all" */
    maxVisible?: number;
}

/**
 * Extract video ID and platform from URL
 */
function parseVideoUrl(url: string): { platform: 'youtube' | 'vimeo' | 'direct'; id: string } | null {
    if (!url) return null;

    const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (ytMatch) {
        return { platform: 'youtube', id: ytMatch[1] };
    }

    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch) {
        return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return { platform: 'direct', id: url };
    }

    return null;
}

function getVideoEmbedUrl(url: string): string | null {
    const parsed = parseVideoUrl(url);
    if (!parsed) return null;

    switch (parsed.platform) {
        case 'youtube':
            return `https://www.youtube.com/embed/${parsed.id}?autoplay=1&rel=0`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${parsed.id}?autoplay=1`;
        case 'direct':
            return parsed.id;
        default:
            return null;
    }
}

function getYouTubeThumbnail(url: string): string | null {
    const parsed = parseVideoUrl(url);
    if (parsed?.platform === 'youtube') {
        return `https://img.youtube.com/vi/${parsed.id}/maxresdefault.jpg`;
    }
    return null;
}

function PlayGlyph({ size = 18 }: { size?: number }) {
    return (
        <span
            aria-hidden="true"
            className="row ai-center center"
            style={{
                width: size + 16,
                height: size + 16,
                borderRadius: 999,
                background: 'var(--cobalt)',
                color: '#fff',
                fontFamily: 'var(--mono)',
                fontSize: size,
                lineHeight: 1,
                paddingLeft: 3,
                fontWeight: 600,
                border: '2px solid #fff',
            }}
        >
            ▶
        </span>
    );
}

export default function MediaGallery({
    coverImage,
    images = [],
    videoUrl,
    videoThumbnail,
    alt = 'Gallery image',
    showCount = true,
    compact = false,
    maxVisible = 4,
}: MediaGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);

    const mediaItems = useMemo(() => {
        const items: MediaItem[] = [];

        if (videoUrl) {
            const thumbnail = videoThumbnail || getYouTubeThumbnail(videoUrl);
            items.push({
                type: 'video',
                url: videoUrl,
                thumbnail: thumbnail || undefined,
                alt: `${alt} video`,
            });
        }

        if (coverImage) {
            items.push({
                type: 'image',
                url: coverImage,
                alt: `${alt} cover`,
            });
        }

        images.forEach((img, i) => {
            if (img && img !== coverImage) {
                items.push({
                    type: 'image',
                    url: img,
                    alt: `${alt} ${i + 1}`,
                });
            }
        });

        return items;
    }, [videoUrl, videoThumbnail, coverImage, images, alt]);

    const hasMedia = mediaItems.length > 0;
    const visibleItems = mediaItems.slice(0, maxVisible);
    const remainingCount = mediaItems.length - maxVisible;
    const mediaItemsLength = mediaItems.length;

    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxOpen(false);
                setShowVideo(false);
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItemsLength - 1));
                setShowVideo(false);
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex((prev) => (prev < mediaItemsLength - 1 ? prev + 1 : 0));
                setShowVideo(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, mediaItemsLength]);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        setShowVideo(mediaItems[index]?.type === 'video');
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setShowVideo(false);
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev < mediaItemsLength - 1 ? prev + 1 : 0));
        setShowVideo(false);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItemsLength - 1));
        setShowVideo(false);
    };

    if (!hasMedia) {
        return null;
    }

    const currentItem = mediaItems[currentIndex];

    return (
        <>
            {/* Gallery Grid */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: compact ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                    gap: 8,
                }}
            >
                {visibleItems.map((item, index) => {
                    const isHero = index === 0 && !compact;
                    return (
                        <button
                            key={index}
                            onClick={() => openLightbox(index)}
                            className="group"
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 'var(--r-3)',
                                background: 'var(--bg-2)',
                                border: '1px solid var(--rule)',
                                cursor: 'pointer',
                                gridColumn: isHero ? 'span 2' : 'span 1',
                                gridRow: isHero ? 'span 2' : 'span 1',
                                aspectRatio: isHero ? '4 / 3' : '1 / 1',
                                padding: 0,
                                transition: 'border-color var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--cobalt)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--rule)';
                            }}
                        >
                            {item.type === 'video' ? (
                                <>
                                    {item.thumbnail ? (
                                        <Image
                                            src={item.thumbnail}
                                            alt={item.alt || 'Video thumbnail'}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="row ai-center center placeholder-ink"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: 0,
                                                border: 'none',
                                            }}
                                        >
                                            <PlayGlyph />
                                        </div>
                                    )}
                                    {/* Play overlay */}
                                    <div
                                        className="row ai-center center"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(10, 26, 47, .35)',
                                        }}
                                    >
                                        <PlayGlyph />
                                    </div>
                                </>
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={item.alt || 'Gallery image'}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            )}

                            {/* Remaining count overlay */}
                            {index === maxVisible - 1 && remainingCount > 0 && (
                                <div
                                    className="row ai-center center"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(10, 26, 47, .72)',
                                    }}
                                >
                                    <span
                                        className="display"
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 600,
                                            color: '#fff',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        +{remainingCount}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* "View all" link */}
            {showCount && mediaItems.length > 1 && (
                <button
                    onClick={() => openLightbox(0)}
                    className="row ai-center gap-2 mono"
                    style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: 'var(--cobalt)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}
                >
                    <span aria-hidden="true">⌗</span>
                    View all {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                </button>
            )}

            {/* Lightbox */}
            {lightboxOpen && currentItem && (
                <div
                    className="row ai-center center"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 500,
                        background: 'rgba(10, 26, 47, .92)',
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                        className="row ai-center center"
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 10,
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--r-2)',
                            background: 'var(--paper)',
                            color: 'var(--ink)',
                            border: '1px solid var(--rule)',
                            cursor: 'pointer',
                            fontSize: 18,
                            transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--paper)';
                        }}
                    >
                        ×
                    </button>

                    {/* Nav arrows */}
                    {mediaItems.length > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                aria-label="Previous image"
                                className="row ai-center center mono"
                                style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--r-2)',
                                    background: 'var(--paper)',
                                    color: 'var(--ink)',
                                    border: '1px solid var(--rule)',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                }}
                            >
                                ‹
                            </button>
                            <button
                                onClick={goNext}
                                aria-label="Next image"
                                className="row ai-center center mono"
                                style={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--r-2)',
                                    background: 'var(--paper)',
                                    color: 'var(--ink)',
                                    border: '1px solid var(--rule)',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                }}
                            >
                                ›
                            </button>
                        </>
                    )}

                    {/* Counter */}
                    <div
                        className="mono"
                        style={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            padding: '6px 12px',
                            background: 'var(--paper)',
                            color: 'var(--ink)',
                            border: '1px solid var(--rule)',
                            borderRadius: 'var(--r-2)',
                            fontSize: 12,
                            letterSpacing: '0.04em',
                            fontWeight: 500,
                        }}
                    >
                        {currentIndex + 1} / {mediaItems.length}
                    </div>

                    {/* Main content */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 1024,
                            maxHeight: '85vh',
                            margin: '0 16px',
                        }}
                    >
                        {currentItem.type === 'video' ? (
                            showVideo ? (
                                <div
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        background: '#000',
                                        borderRadius: 'var(--r-3)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--rule)',
                                    }}
                                >
                                    {parseVideoUrl(currentItem.url)?.platform === 'direct' ? (
                                        <video
                                            src={currentItem.url}
                                            controls
                                            autoPlay
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <iframe
                                            src={getVideoEmbedUrl(currentItem.url) || ''}
                                            title="Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ width: '100%', height: '100%', border: 0 }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowVideo(true)}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '16 / 9',
                                        background: '#000',
                                        borderRadius: 'var(--r-3)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--rule)',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    {currentItem.thumbnail && (
                                        <Image
                                            src={currentItem.thumbnail}
                                            alt={currentItem.alt || 'Video'}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    <div
                                        className="row ai-center center"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(10, 26, 47, .35)',
                                        }}
                                    >
                                        <PlayGlyph size={28} />
                                    </div>
                                </button>
                            )
                        ) : (
                            <div style={{ position: 'relative', width: '100%', height: '85vh' }}>
                                <Image
                                    src={currentItem.url}
                                    alt={currentItem.alt || 'Gallery image'}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    priority
                                />
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {mediaItems.length > 1 && (
                        <div
                            className="row gap-2"
                            style={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                maxWidth: '100%',
                                overflowX: 'auto',
                                padding: '8px 16px',
                            }}
                        >
                            {mediaItems.map((item, index) => {
                                const isCurrent = index === currentIndex;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentIndex(index);
                                            setShowVideo(false);
                                        }}
                                        style={{
                                            position: 'relative',
                                            width: 60,
                                            height: 60,
                                            borderRadius: 'var(--r-2)',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            border: isCurrent
                                                ? '2px solid var(--cobalt)'
                                                : '1px solid var(--rule)',
                                            opacity: isCurrent ? 1 : 0.55,
                                            background: 'var(--bg-2)',
                                            padding: 0,
                                            transition: 'opacity var(--transition-fast), border-color var(--transition-fast)',
                                        }}
                                    >
                                        {item.type === 'video' && item.thumbnail ? (
                                            <Image
                                                src={item.thumbnail}
                                                alt="Video thumbnail"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : item.type === 'video' ? (
                                            <div
                                                className="row ai-center center mono"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: 'var(--ink)',
                                                    color: '#fff',
                                                    fontSize: 16,
                                                }}
                                            >
                                                ▶
                                            </div>
                                        ) : (
                                            <Image
                                                src={item.url}
                                                alt={item.alt || 'Thumbnail'}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        )}
                                        {item.type === 'video' && item.thumbnail && (
                                            <div
                                                className="row ai-center center mono"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(10, 26, 47, .35)',
                                                    color: '#fff',
                                                    fontSize: 14,
                                                }}
                                            >
                                                ▶
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Click outside to close */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: -1,
                        }}
                        onClick={closeLightbox}
                    />
                </div>
            )}
        </>
    );
}
