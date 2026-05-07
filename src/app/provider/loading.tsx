export default function ProviderLoading() {
    return (
        <div className="min-h-[60vh] bg-[--bg] text-[--ink-1] px-6 py-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-9 w-1/2 rounded bg-[--bg-3] animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-[--bg-3] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg border border-[--rule] bg-[--paper] p-5 space-y-3">
                            <div className="h-4 w-1/3 rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-full rounded bg-[--bg-3] animate-pulse" />
                            <div className="h-3 w-4/5 rounded bg-[--bg-3] animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
