import React from 'react';
import { CalendarDays, Gift, Star, Clock } from 'lucide-react';

const SpecialDaysAIView = () => {
    const upcomingDays = [
        { date: 'Apr 22', name: 'Earth Day', type: 'Global', relevance: 'High' },
        { date: 'May 1', name: 'May Day', type: 'Holiday', relevance: 'Medium' },
        { date: 'May 4', name: 'Star Wars Day', type: 'Fun', relevance: 'Trending' },
        { date: 'May 12', name: 'Mother\'s Day', type: 'Holiday', relevance: 'High' },
    ];

    return (
        <div className="flex-1 p-8 bg-[#070707] overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-[#26cece]" /> Special Days Posts (AI)
                    </h2>
                    <p className="text-sm font-mono text-gray-500 mt-1 uppercase tracking-widest">Never miss a trending holiday or awareness day</p>
                </div>

                <div className="bg-[#26cece]/10 border border-[#26cece] rounded-[2px] p-6 flex items-start gap-4 shadow-[4px_4px_0_0_#26cece]">
                    <div className="w-12 h-12 bg-[#26cece]/20 rounded-[2px] flex items-center justify-center shrink-0 border border-[#26cece]/50">
                        <Star className="w-6 h-6 text-[#26cece]" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-white font-['Space_Grotesk'] uppercase tracking-tight mb-1">Stay Relevant</h3>
                        <p className="text-[13px] font-sans text-gray-300 mb-3">
                            Let AI automatically suggest and generate content tailored to upcoming cultural events, holidays, and trending global days based on your brand identity.
                        </p>
                        <button className="text-[11px] font-mono tracking-widest uppercase bg-[#26cece] text-[#070707] px-4 py-2 rounded-[2px] font-bold hover:bg-white transition-colors">
                            Configure Brand Preferences
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-[14px] font-bold text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1E1E1E] pb-3">
                        <Clock className="w-4 h-4 text-[#26cece]" /> Upcoming Dates
                    </h3>
                    
                    <div className="space-y-3">
                        {upcomingDays.map((day, i) => (
                            <div key={i} className="bg-[#111111] border border-[#333] hover:border-[#1E1E1E] rounded-[2px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#070707] border border-[#333] rounded-[2px]">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{day.date.split(' ')[0]}</span>
                                        <span className="text-[16px] font-bold font-['Space_Grotesk'] text-white">{day.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-white font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-2">
                                            {day.name} {day.type === 'Fun' && <Gift className="w-4 h-4 text-[#FFCA4A]" />}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 hidden md:flex">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-[#070707] border border-[#333] px-2 py-0.5 rounded-[2px]">{day.type}</span>
                                            <span className="text-[10px] font-mono text-[#26cece] uppercase tracking-widest bg-[#26cece]/10 border border-[#26cece]/30 px-2 py-0.5 rounded-[2px]">{day.relevance} Match</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="border border-[#26cece] text-[#26cece] hover:bg-[#26cece] hover:text-[#070707] px-4 py-2 rounded-[2px] text-[11px] font-mono font-bold uppercase tracking-widest transition-colors w-full md:w-auto">
                                    Generate Draft
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialDaysAIView;
