export default function AdminLoading() {
    return (
        <div className="min-h-[60vh] bg-[--bg] text-[--ink-1] px-6 py-10">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="h-8 w-48 rounded bg-[--bg-3] animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg border border-[--rule] bg-[--paper] p-4 space-y-2">
                            <div className="h-3 w-16 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-7 w-20 rounded bg-[--bg-3] animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="rounded-lg border border-[--rule] bg-[--paper] p-4 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-4 w-full rounded bg-[--bg-3] animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
