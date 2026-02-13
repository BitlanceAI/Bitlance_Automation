import React from 'react';

const ResultsSection = () => {
    return (
        <section className="py-24 bg-re-navy text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-5xl md:text-6xl font-extrabold text-re-blue mb-4">
                            200-300
                        </div>
                        <div className="text-xl font-bold mb-2">Leads Monthly</div>
                        <p className="text-slate-400">Consistent flow of qualified buyers and sellers.</p>
                    </div>

                    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors scale-105 shadow-2xl shadow-re-blue/10 z-10">
                        <div className="text-5xl md:text-6xl font-extrabold text-re-accent mb-4">
                            10-15
                        </div>
                        <div className="text-xl font-bold mb-2">Daily Showings</div>
                        <p className="text-slate-400">Your calendar filled with serious prospects.</p>
                    </div>

                    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-5xl md:text-6xl font-extrabold text-green-400 mb-4">
                            1-2
                        </div>
                        <div className="text-xl font-bold mb-2">Extra Closings/Mo</div>
                        <p className="text-slate-400">Directly impact your bottom line revenue.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResultsSection;
