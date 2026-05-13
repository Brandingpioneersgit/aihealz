'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Bureau-styled markdown renderer for AI assistant replies.
 * Headings, lists, tables, code, and inline emphasis all map onto our
 * design tokens so the chat feels native to v4 instead of a Discord paste.
 */
export default function MarkdownReply({ children }: { children: string }) {
    return (
        <div className="md-reply">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: props => (
                        <h2
                            {...props}
                            style={{
                                fontSize: 22,
                                fontWeight: 600,
                                letterSpacing: '-0.025em',
                                margin: '14px 0 6px',
                                color: 'var(--ink)',
                            }}
                        />
                    ),
                    h2: props => (
                        <h3
                            {...props}
                            style={{
                                fontSize: 17,
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                                margin: '12px 0 4px',
                                color: 'var(--ink)',
                            }}
                        />
                    ),
                    h3: props => (
                        <h4
                            {...props}
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: '-0.015em',
                                margin: '10px 0 2px',
                                color: 'var(--ink-2)',
                                textTransform: 'uppercase',
                            }}
                        />
                    ),
                    p: props => (
                        <p
                            {...props}
                            style={{
                                margin: '6px 0',
                                fontSize: 15,
                                lineHeight: 1.6,
                                color: 'var(--ink-2)',
                            }}
                        />
                    ),
                    strong: props => (
                        <strong {...props} style={{ color: 'var(--ink)', fontWeight: 600 }} />
                    ),
                    em: props => (
                        <em
                            {...props}
                            style={{
                                color: 'var(--cobalt)',
                                fontStyle: 'normal',
                                fontWeight: 500,
                            }}
                        />
                    ),
                    a: ({ href, ...rest }) => {
                        const isInternal = !!href && (href.startsWith('/') || href.startsWith('#'));
                        return (
                            <a
                                href={href}
                                {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                                {...rest}
                                style={{
                                    color: 'var(--cobalt)',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 2,
                                }}
                            />
                        );
                    },
                    ul: props => (
                        <ul
                            {...props}
                            style={{
                                margin: '6px 0 10px',
                                paddingLeft: 22,
                                fontSize: 14.5,
                                lineHeight: 1.55,
                                color: 'var(--ink-2)',
                            }}
                        />
                    ),
                    ol: props => (
                        <ol
                            {...props}
                            style={{
                                margin: '6px 0 10px',
                                paddingLeft: 24,
                                fontSize: 14.5,
                                lineHeight: 1.55,
                                color: 'var(--ink-2)',
                            }}
                        />
                    ),
                    li: props => <li {...props} style={{ margin: '3px 0' }} />,
                    blockquote: props => (
                        <blockquote
                            {...props}
                            style={{
                                margin: '10px 0',
                                paddingLeft: 14,
                                borderLeft: '3px solid var(--cobalt)',
                                color: 'var(--ink-3)',
                                fontStyle: 'italic',
                            }}
                        />
                    ),
                    code: props => (
                        <code
                            {...props}
                            style={{
                                fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
                                fontSize: 12.5,
                                background: 'var(--bg-2)',
                                padding: '1px 6px',
                                borderRadius: 4,
                                color: 'var(--ink)',
                            }}
                        />
                    ),
                    table: props => (
                        <div style={{ margin: '10px 0', overflowX: 'auto' }}>
                            <table
                                {...props}
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: 13.5,
                                    background: 'var(--paper)',
                                    border: '1px solid var(--rule)',
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                }}
                            />
                        </div>
                    ),
                    thead: props => (
                        <thead {...props} style={{ background: 'var(--bg-2)' }} />
                    ),
                    th: props => (
                        <th
                            {...props}
                            style={{
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderBottom: '1px solid var(--rule)',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}
                        />
                    ),
                    td: props => (
                        <td
                            {...props}
                            style={{
                                padding: '8px 12px',
                                borderTop: '1px solid var(--rule)',
                                verticalAlign: 'top',
                                color: 'var(--ink-2)',
                                lineHeight: 1.5,
                            }}
                        />
                    ),
                    hr: () => (
                        <hr
                            style={{
                                margin: '14px 0',
                                border: 0,
                                borderTop: '1px solid var(--rule)',
                            }}
                        />
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
