import * as React from 'react';

type LogoMarkProps = {
    size?: number;
    fg?: string;
    bg?: string;
    accent?: string;
};

export function LogoMark({
    size = 28,
    fg = 'var(--paper)',
    bg = 'var(--ink)',
    accent = 'var(--cobalt)',
}: LogoMarkProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', borderRadius: 4 * (size / 32) }}
            aria-hidden="true"
        >
            <rect width="32" height="32" rx="4" fill={bg} />
            <rect x="8" y="6" width="3.6" height="20" fill={fg} />
            <rect x="20.4" y="14" width="3.6" height="12" fill={fg} />
            <rect x="11.6" y="14" width="8.8" height="3.6" fill={fg} />
            <rect x="14.2" y="9" width="3.6" height="3.6" fill={accent} />
        </svg>
    );
}

type WordmarkProps = {
    scale?: number;
    dark?: boolean;
};

export function Wordmark({ scale = 1, dark = false }: WordmarkProps) {
    const ink = dark ? 'var(--paper)' : 'var(--ink)';
    return (
        <span
            style={{
                fontFamily: 'var(--display)',
                fontSize: 28 * scale,
                lineHeight: 1,
                letterSpacing: '-0.045em',
                fontWeight: 600,
                color: ink,
                display: 'inline-flex',
                alignItems: 'baseline',
            }}
        >
            <span>aihealz</span>
            <span style={{ color: 'var(--cobalt)' }}>/</span>
        </span>
    );
}

type LogoLockupProps = {
    size?: number;
    scale?: number;
    dark?: boolean;
};

export function LogoLockup({ size = 28, scale = 1, dark = false }: LogoLockupProps) {
    return (
        <span className="row ai-center" style={{ gap: 10 }}>
            <LogoMark
                size={size}
                fg={dark ? 'var(--ink)' : 'var(--paper)'}
                bg={dark ? 'var(--paper)' : 'var(--ink)'}
            />
            <Wordmark scale={scale} dark={dark} />
        </span>
    );
}

export default LogoLockup;
