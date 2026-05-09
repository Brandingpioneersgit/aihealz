'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!mounted || !open) {
        return null;
    }

    return createPortal(
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>,
        document.body
    );
}

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within a Dialog provider');
    }
    return context;
}

interface DialogOverlayProps {
    className?: string;
}

export function DialogOverlay({ className = '' }: DialogOverlayProps) {
    const { onOpenChange } = useDialogContext();

    return (
        <div
            className={`animate-fade-in ${className}`}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 500,
                background: 'rgba(10, 26, 47, .55)',
            }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
        />
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
};

export function DialogContent({ children, className = '', size = 'md' }: DialogContentProps) {
    const { onOpenChange } = useDialogContext();
    const contentRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        },
        [onOpenChange]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        contentRef.current?.focus();
    }, []);

    return (
        <>
            <DialogOverlay />
            <div
                className="row ai-center center"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 500,
                    padding: 16,
                    pointerEvents: 'none',
                }}
            >
                <div
                    ref={contentRef}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    className={`card animate-scale-in ${sizeClasses[size]} ${className}`}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        outline: 'none',
                        pointerEvents: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
    return (
        <div
            className={`hairline-b ${className}`}
            style={{ padding: '20px 24px' }}
        >
            {children}
        </div>
    );
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
    return (
        <h2
            className={`display ${className}`}
            style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                margin: 0,
            }}
        >
            {children}
        </h2>
    );
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
    return (
        <p
            className={className}
            style={{
                marginTop: 6,
                fontSize: 14,
                color: 'var(--ink-3)',
                marginBottom: 0,
                lineHeight: 1.5,
            }}
        >
            {children}
        </p>
    );
}

interface DialogBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogBody({ children, className = '' }: DialogBodyProps) {
    return (
        <div className={className} style={{ padding: '20px 24px' }}>
            {children}
        </div>
    );
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
    return (
        <div
            className={`hairline-t row ai-center gap-3 ${className}`}
            style={{ padding: '16px 24px', justifyContent: 'flex-end' }}
        >
            {children}
        </div>
    );
}

interface DialogCloseProps {
    children?: React.ReactNode;
    className?: string;
    asChild?: boolean;
}

export function DialogClose({ children, className = '', asChild = false }: DialogCloseProps) {
    const { onOpenChange } = useDialogContext();

    if (asChild && React.isValidElement(children)) {
        const childProps = children.props as Record<string, unknown>;
        return React.cloneElement(children, {
            ...childProps,
            onClick: (e: React.MouseEvent) => {
                (childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
                onOpenChange(false);
            },
        } as React.Attributes);
    }

    return (
        <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className={`row ai-center center ${className}`}
            style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: 'var(--r-2)',
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--ink-3)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-2)';
                e.currentTarget.style.color = 'var(--ink)';
                e.currentTarget.style.borderColor = 'var(--rule)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--ink-3)';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            {children || (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
        </button>
    );
}

// Alert Dialog variant for confirmations
interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger';
    loading?: boolean;
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'default',
    loading = false,
}: AlertDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        if (!loading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="sm">
                <DialogClose />
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="btn btn-paper"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={variant === 'danger' ? 'btn btn-orange' : 'btn btn-cobalt'}
                    >
                        {loading ? (
                            <span className="row ai-center gap-2">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    style={{ animation: 'spin 0.8s linear infinite' }}
                                >
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="4" />
                                    <path
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Processing…
                                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
