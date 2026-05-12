'use client';

import type { ReactNode, CSSProperties } from 'react';

type RevealProps = {
    children: ReactNode;
    delay?: number;
    distance?: number;
    direction?: 'up' | 'right';
    as?: 'div' | 'section' | 'span';
    className?: string;
    style?: CSSProperties;
};

// Previous version gated content visibility on IntersectionObserver firing
// post-hydration, which left whole sections at opacity:0 if HTML landed
// before JS — the homepage looked empty during slow loads. CSS-only now:
// SSR ships visible content; the entrance is purely decorative.
export default function Reveal({
    children,
    delay = 0,
    distance = 14,
    direction = 'up',
    as: Tag = 'div',
    className,
    style,
}: RevealProps) {
    const animName = direction === 'right' ? 'reveal-in-right' : 'reveal-in-up';
    return (
        <Tag
            className={className}
            style={{
                ...style,
                ['--reveal-distance' as string]: `${distance}px`,
                animation: `${animName} 600ms cubic-bezier(.22,.61,.36,1) ${delay}ms both`,
            }}
        >
            {children}
        </Tag>
    );
}
