export default function RootLoading() {
    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] px-6 py-16">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-3 w-24 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-10 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="card p-5 space-y-3"
                            style={{ background: 'var(--paper)' }}
                        >
                            <div className="h-4 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-4/5 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
