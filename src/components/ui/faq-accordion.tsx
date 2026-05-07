'use client';

interface FaqItem {
    question: string;
    answer: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
    return (
        <div className="space-y-3">
            {faqs.map((faq, i) => (
                <details
                    key={i}
                    open={i === 0}
                    className="group rounded-2xl border bg-slate-900/40 border-white/5 hover:border-white/10 open:bg-slate-800/60 open:border-teal-500/30 open:shadow-lg open:shadow-teal-500/5 transition-all duration-300 overflow-hidden"
                >
                    <summary className="cursor-pointer list-none w-full text-left px-6 py-5 flex items-center justify-between gap-4">
                        <span className="font-semibold text-base text-slate-300 group-open:text-white transition-colors">
                            {faq.question}
                        </span>
                        <svg
                            className="w-5 h-5 shrink-0 text-teal-400 transition-transform duration-300 group-open:rotate-180"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="px-6 pb-5">
                        <p className="text-slate-400 leading-relaxed text-[15px]">
                            {faq.answer}
                        </p>
                    </div>
                </details>
            ))}
        </div>
    );
}
