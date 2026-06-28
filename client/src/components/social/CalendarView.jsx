import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Linkedin, Facebook } from 'lucide-react';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = Array.from({ length: 35 }, (_, i) => i - 2); 
    const getMonthName = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 p-8 h-full overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-5 border border-white/10 rounded-[2px] shadow-[0_2px_16px_0_rgba(0,0,0,0.2)]">
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#26cece]" /> Content Calendar
                        </h2>
                        <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">Schedule and manage your posts</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-[2px] p-1 flex-1 md:flex-none justify-between">
                            <button className="p-1 hover:bg-white/10 hover:text-[#26cece] text-white/40 rounded-[2px] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-[13px] font-mono uppercase tracking-widest text-white/90 px-2 cursor-pointer select-none">{getMonthName(currentDate)}</span>
                            <button className="p-1 hover:bg-white/10 hover:text-[#26cece] text-white/40 rounded-[2px] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <button className="bg-[#26cece] text-black px-5 py-2.5 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-[#1fb8b8] hover:shadow-[0_0_15px_rgba(38,206,206,0.3)] transition-all flex items-center gap-2 text-[12px] shrink-0">
                            <Plus className="w-4 h-4" /> New Post
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white/5 border border-white/10 rounded-[2px] overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
                        {daysOfWeek.map(day => (
                            <div key={day} className="px-2 py-3 text-[11px] font-mono text-white/50 uppercase tracking-widest text-center border-r border-white/10 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {days.map((day, idx) => {
                            const isCurrentMonth = day > 0 && day <= 30; // mock logic
                            const isToday = day === 15; // mock logic

                            return (
                                <div key={idx} className={`group min-h-[120px] p-2 border-r border-b border-white/10 last:border-r-0 transition-colors ${!isCurrentMonth ? 'bg-black/10 opacity-40' : 'hover:bg-white/5'} ${isToday ? 'bg-[#26cece]/10 border border-[#26cece]/30 relative z-10' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[12px] font-mono ${isToday ? 'bg-[#26cece] text-black px-1.5 py-0.5 rounded-[2px] font-bold' : isCurrentMonth ? 'text-white/80' : 'text-white/30'}`}>
                                            {day > 0 ? (day > 31 ? day - 31 : day) : 31 + day}
                                        </span>
                                        {isCurrentMonth && (
                                            <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-[#26cece] transition-opacity cursor-pointer">
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
