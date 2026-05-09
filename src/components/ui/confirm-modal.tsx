'use client';

import { useState, useEffect, useRef } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    // Variant styling using Bureau palette
    const variantConfig = {
        danger: {
            iconBg: 'var(--orange-50)',
            iconColor: 'var(--orange-2)',
            iconBorder: 'rgba(255, 90, 46, .28)',
            confirmBtnClass: 'btn btn-orange',
            glyph: '!',
        },
        primary: {
            iconBg: 'var(--cobalt-50)',
            iconColor: 'var(--cobalt)',
            iconBorder: 'rgba(28, 91, 255, .22)',
            confirmBtnClass: 'btn btn-cobalt',
            glyph: '?',
        },
        warning: {
            iconBg: 'var(--lemon-50)',
            iconColor: '#8C6A00',
            iconBorder: 'rgba(230, 185, 40, .40)',
            confirmBtnClass: 'btn btn-primary',
            glyph: '!',
        },
    }[confirmVariant];

    return (
        <div
            className="row ai-center center"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 500,
                padding: 16,
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            {/* Backdrop — solid ink, no blur */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(10, 26, 47, .55)',
                    animation: 'fade-in 200ms ease-out',
                }}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="card"
                style={{
                    position: 'relative',
                    maxWidth: 420,
                    width: '100%',
                    padding: 28,
                    animation: 'scale-in 200ms ease-out',
                }}
            >
                {/* Icon */}
                <div
                    className="row ai-center center mono"
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--r-2)',
                        background: variantConfig.iconBg,
                        color: variantConfig.iconColor,
                        border: `1px solid ${variantConfig.iconBorder}`,
                        margin: '0 auto 16px',
                        fontSize: 22,
                        fontWeight: 700,
                    }}
                    aria-hidden="true"
                >
                    {variantConfig.glyph}
                </div>

                {/* Title */}
                <h3
                    id="modal-title"
                    className="display"
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        textAlign: 'center',
                        color: 'var(--ink)',
                        margin: '0 0 8px',
                    }}
                >
                    {title}
                </h3>

                {/* Message */}
                <p
                    style={{
                        fontSize: 14,
                        color: 'var(--ink-3)',
                        textAlign: 'center',
                        margin: '0 0 24px',
                        lineHeight: 1.55,
                    }}
                >
                    {message}
                </p>

                {/* Actions */}
                <div className="row gap-3">
                    <button
                        onClick={onCancel}
                        className="btn btn-paper"
                        style={{ flex: 1 }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={variantConfig.confirmBtnClass}
                        style={{ flex: 1 }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for managing confirm modal state
export function useConfirmModal() {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: 'danger' | 'primary' | 'warning';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    const openConfirm = (options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: 'danger' | 'primary' | 'warning';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                ...options,
                isOpen: true,
                onConfirm: () => {
                    setState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
        });
    };

    const closeConfirm = () => {
        setState(prev => ({ ...prev, isOpen: false }));
    };

    return {
        ...state,
        openConfirm,
        closeConfirm,
        onCancel: closeConfirm,
    };
}
