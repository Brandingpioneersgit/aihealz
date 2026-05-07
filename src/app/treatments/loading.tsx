export default function TreatmentsLoading() {
    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] px-6 py-12">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="h-3 w-24 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-10 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="card p-5 space-y-3">
                            <div className="h-4 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-5/6 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-1/3 rounded bg-[--bg-3] animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
