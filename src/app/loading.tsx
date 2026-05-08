export default function RootLoading() {
    return (
        <div className="min-h-[60vh] bg-[#050B14] text-slate-300 px-6 py-16 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />
            <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-10 w-2/3 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-5 space-y-3 bg-slate-900/40 border border-white/5 backdrop-blur-md"
                        >
                            <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                            <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                            <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
                            <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
