import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = ({ onOpenBooking }) => {
    return (
        <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 -z-10" />

            {/* Animated Background Blobs */}
            <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-indigo-400/20 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-400/20 blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 relative mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-bold">
                        AI Agents v2.0 Live
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                    Turn Missed Opportunities Into <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Closed Deals</span> With Your Own AI Agent
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Deploy a 24/7 smart assistant that talks to your leads, answers questions, and books appointments automatically—without hiring extra staff or managing complex tech.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                    <button
                        onClick={onOpenBooking}
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        Book a Live Demo <ArrowRight size={20} />
                    </button>
                    <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-2">
                        <Play size={16} /> Watch 2‑Minute Overview
                    </button>
                </div>

                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    No credit card required · Go live in 48 hours
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
