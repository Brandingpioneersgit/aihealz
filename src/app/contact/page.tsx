import ContactForm from './ContactForm';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                        Contact Us
                    </h1>
                    <p className="text-slate-400">
                        Have questions? We&apos;re here to help with patient support, doctor verification, and partnership inquiries.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-5">
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Email</h2>
                                    <p className="text-sm text-slate-500 mb-3">For support and inquiries</p>
                                    <a href="mailto:support@aihealz.com" className="text-teal-400 font-medium hover:text-teal-300">support@aihealz.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Office</h2>
                                    <address className="not-italic text-sm text-slate-400 leading-relaxed">
                                        ATZ Medappz Pvt Ltd.<br />
                                        84, Supreme Coworks, Sector 32<br />
                                        Gurgaon, Haryana, India
                                    </address>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form (client island) */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-white mb-6">Send a Message</h2>
                        <ContactForm />
                    </div>
                </div>
            </div>
        </main>
    );
}
