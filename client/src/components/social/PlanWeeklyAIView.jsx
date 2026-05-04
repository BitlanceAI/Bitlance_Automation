import React from 'react';
import { CalendarCheck, Calendar, Zap, List } from 'lucide-react';

const PlanWeeklyAIView = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    return (
        <div className="flex-1 p-8 bg-[#f5f5f5] overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <CalendarCheck className="w-6 h-6 text-[#26cece]" /> Plan Weekly Posts with AI
                        </h2>
                        <p className="text-sm font-mono text-gray-400 mt-1 uppercase tracking-widest">Generate an entire week of content aligned with your goals</p>
                    </div>
                    <button className="bg-[#26cece] text-white px-6 py-2.5 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-[#1fb8b8] hover:-translate-y-1 transition-all flex items-center gap-2 shrink-0">
                        <Zap className="w-4 h-4" /> Generate Week
                    </button>
                </div>

                <div className="bg-white border border-[#e0e0e0] rounded-[2px] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-mono tracking-widest text-gray-400 uppercase mb-2">Weekly Goal / Theme</label>
                            <input 
                                type="text" 
                                placeholder="E.g., Promote our new product launch" 
                                className="w-full bg-[#f9f9f9] border border-[#d0d0d0] text-gray-800 rounded-[2px] p-3 text-[13px] font-sans focus:outline-none focus:border-[#26cece] placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono tracking-widest text-gray-400 uppercase mb-2">Target Audience</label>
                            <input 
                                type="text" 
                                placeholder="E.g., Software Engineers and CTOs" 
                                className="w-full bg-[#f9f9f9] border border-[#d0d0d0] text-gray-800 rounded-[2px] p-3 text-[13px] font-sans focus:outline-none focus:border-[#26cece] placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[14px] font-bold text-gray-900 font-mono uppercase tracking-widest flex items-center gap-2 border-b border-[#e0e0e0] pb-3">
                        <List className="w-4 h-4 text-[#26cece]" /> Weekly Output Preview
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {days.map((day) => (
                            <div key={day} className="bg-white border border-[#d0d0d0] rounded-[2px] p-5 flex flex-col md:flex-row gap-5 opacity-70">
                                <div className="w-32 shrink-0 border-r border-[#d0d0d0] pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-[13px] font-bold font-['Space_Grotesk'] text-gray-800 tracking-widest uppercase">{day}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Post Slot</div>
                                </div>
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#d0d0d0] rounded-[2px] bg-[#f9f9f9] min-h-[80px]">
                                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Waiting for generation...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanWeeklyAIView;
