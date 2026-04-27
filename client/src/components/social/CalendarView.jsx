import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Linkedin, Facebook } from 'lucide-react';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const CalendarView = () => {
    // Current month/year placeholder
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate days for a simple mock calendar view (e.g. 5 weeks)
    const days = Array.from({ length: 35 }, (_, i) => i - 2); 

    const getMonthName = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 p-8 bg-[#070707] overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111111] p-5 border border-[#1E1E1E] rounded-[2px] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)]">
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#26cece]" /> Content Calendar
                        </h2>
                        <p className="text-[11px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Schedule and manage your posts</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-[#070707] border border-[#333] rounded-[2px] p-1 flex-1 md:flex-none justify-between">
                            <button className="p-1 hover:bg-[#1E1E1E] hover:text-white text-gray-500 rounded-[2px] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-[13px] font-mono uppercase tracking-widest text-white px-2 cursor-pointer select-none">{getMonthName(currentDate)}</span>
                            <button className="p-1 hover:bg-[#1E1E1E] hover:text-white text-gray-500 rounded-[2px] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <button className="bg-[#26cece] text-[#070707] px-5 py-2.5 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 transition-all flex items-center gap-2 text-[12px] shrink-0">
                            <Plus className="w-4 h-4" /> New Post
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-[2px] overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-[#1E1E1E] bg-[#070707]">
                        {daysOfWeek.map(day => (
                            <div key={day} className="px-2 py-3 text-[11px] font-mono text-gray-400 uppercase tracking-widest text-center border-r border-[#1E1E1E] last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {days.map((day, idx) => {
                            const isCurrentMonth = day > 0 && day <= 30; // mock logic
                            const isToday = day === 15; // mock logic

                            return (
                                <div key={idx} className={`group min-h-[120px] p-2 border-r border-b border-[#1E1E1E] last:border-r-0 transition-colors ${!isCurrentMonth ? 'bg-[#0a0a0a] opacity-40' : 'hover:bg-[#151515]'} ${isToday ? 'bg-[#26cece]/5 border-[#26cece]/30' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[12px] font-mono ${isToday ? 'bg-[#26cece] text-[#070707] px-1.5 py-0.5 rounded-[2px] font-bold' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {day > 0 ? (day > 31 ? day - 31 : day) : 31 + day}
                                        </span>
                                        {isCurrentMonth && (
                                            <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-[#26cece] transition-opacity cursor-pointer">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Scheduled posts will appear here */}
                                    <div className="space-y-1.5">
                                        
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
