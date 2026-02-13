import React from 'react';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

const HeroSection = ({ onBookDemo }) => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-re-navy text-white">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-re-navy -z-20" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-re-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-re-accent/20 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-re-accent/10 border border-re-accent/20 text-re-blue text-sm font-medium mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 relative mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-re-blue opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-re-blue"></span>
                            </span>
                            AI-Powered Real Estate Growth System
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-re-blue to-re-accent">200+ Qualified Leads</span> <br />
                            Every Month — On Autopilot
                        </h1>

                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            AI-powered systems that generate daily showings, automate follow-ups, and eliminate admin work so you can focus on closing deals.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-16">
                            <button
                                onClick={onBookDemo}
                                className="px-8 py-4 rounded-full bg-gradient-to-r from-re-accent to-re-blue text-white font-bold text-lg shadow-lg shadow-re-blue/25 hover:shadow-re-blue/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Book a Demo <ArrowRight size={20} />
                            </button>
                            <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-re-blue/50 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                                <Play size={20} className="fill-current" /> Watch How It Works
                            </button>
                        </div>

                        {/* Trust Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/10 pt-8">
                            <div className="text-center lg:text-left">
                                <div className="text-3xl font-bold text-white mb-1">1.2M+</div>
                                <div className="text-sm text-slate-400">Leads Generated</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl font-bold text-white mb-1">75k+</div>
                                <div className="text-sm text-slate-400">Showings Booked</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl font-bold text-white mb-1">25k+</div>
                                <div className="text-sm text-slate-400">Homes Sold</div>
                            </div>
                        </div>
                    </div>

                    {/* Mock Dashboard UI */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-re-blue to-re-accent rounded-2xl blur-2xl opacity-20 transform rotate-3"></div>
                        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Fake Window Header */}
                            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            {/* Dashboard Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-lg font-bold">Pipeline Overview</div>
                                    <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Live Updated</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-re-blue/20 flex items-center justify-center text-re-blue">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold">New Lead: Sarah Jenkins</div>
                                                <div className="text-xs text-slate-400">Looking for 3bd/2ba in Downtown</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">2m ago</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold">Showing Booked</div>
                                                <div className="text-xs text-slate-400">123 Maple Dr - Tomorrow 2pm</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">15m ago</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold">AI Follow-up Sent</div>
                                                <div className="text-xs text-slate-400">Re-engaged cold lead from Oct</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">1h ago</div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-slate-400 mb-1">Total Active Leads</div>
                                        <div className="text-2xl font-bold">1,248</div>
                                    </div>
                                    <div className="h-10 w-24 bg-gradient-to-t from-re-blue/20 to-transparent rounded flex items-end gap-1 px-1 pb-1">
                                        <div className="w-1/4 bg-re-blue h-[40%] rounded-sm"></div>
                                        <div className="w-1/4 bg-re-blue h-[60%] rounded-sm"></div>
                                        <div className="w-1/4 bg-re-blue h-[80%] rounded-sm"></div>
                                        <div className="w-1/4 bg-re-blue h-[100%] rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
