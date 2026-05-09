'use client';

interface FaqItem {
    question: string;
    answer: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
    return (
        <div className="card-flat" style={{ overflow: 'hidden' }}>
            {faqs.map((faq, i) => (
                <details
                    key={i}
                    open={i === 0}
                    className="group"
                    style={{
                        borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
                    }}
                >
                    <summary
                        className="row between ai-center gap-4"
                        style={{
                            cursor: 'pointer',
                            listStyle: 'none',
                            padding: '18px 22px',
                            color: 'var(--ink)',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--display)',
                                fontWeight: 600,
                                fontSize: 16,
                                letterSpacing: '-0.015em',
                                color: 'var(--ink)',
                                flex: 1,
                            }}
                        >
                            {faq.question}
                        </span>
                        <span
                            aria-hidden="true"
                            className="mono"
                            style={{
                                fontSize: 16,
                                color: 'var(--cobalt)',
                                fontWeight: 600,
                                flexShrink: 0,
                                transition: 'transform var(--transition-normal)',
                            }}
                        >
                            <span className="group-open:hidden">▾</span>
                            <span className="hidden group-open:inline">▴</span>
                        </span>
                    </summary>
                    <div style={{ padding: '0 22px 20px' }}>
                        <p
                            style={{
                                color: 'var(--ink-3)',
                                lineHeight: 1.6,
                                fontSize: 15,
                                margin: 0,
                            }}
                        >
                            {faq.answer}
                        </p>
                    </div>
                </details>
            ))}
        </div>
    );
}
