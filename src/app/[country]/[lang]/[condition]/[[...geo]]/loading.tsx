export default function ConditionGeoLoading() {
    return (
        <div className="v4-root min-h-[60vh] bg-[--bg] text-[--ink-1] px-6 py-12">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-16 rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-20 rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-24 rounded bg-[--bg-3] animate-pulse" />
                </div>
                <div className="h-12 w-3/4 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                <div className="card p-6 space-y-3">
                    <div className="h-4 w-1/3 rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-[--bg-3] animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card p-5 space-y-3">
                            <div className="h-4 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-3/4 rounded bg-[--bg-3] animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
