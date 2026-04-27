import React from 'react';
import { Star, LayoutTemplate, Briefcase, Zap, Heart, Trophy, Search } from 'lucide-react';

const AITemplatesView = () => {
    const templates = [
        { icon: Briefcase, category: 'Business', title: 'Company Milestone', desc: 'Announce a major company achievement or anniversary.' },
        { icon: Zap, category: 'Product', title: 'New Feature Launch', desc: 'Create excitement around a new product feature or release.' },
        { icon: Heart, category: 'Culture', title: 'Employee Spotlight', desc: 'Highlight a team member and their contributions.' },
        { icon: Trophy, category: 'Industry', title: 'Thought Leadership', desc: 'Share an authoritative hot take or deep industry insight.' },
        { icon: LayoutTemplate, category: 'Engagement', title: 'Question / Poll', desc: 'Ask a thought-provoking question to generate comments.' },
        { icon: LayoutTemplate, category: 'Education', title: 'How-to / Tutorial', desc: 'Share actionable advice or steps to solve a problem.' },
    ];

    return (
        <div className="flex-1 p-8 bg-[#070707] overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <Star className="w-6 h-6 text-[#26cece]" /> Use AI Templates
                        </h2>
                        <p className="text-sm font-mono text-gray-500 mt-1 uppercase tracking-widest">Start with a proven framework for high-engagement posts</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search templates (e.g. 'Launch', 'Milestone')..." 
                        className="w-full bg-[#111111] border border-[#333] text-white rounded-[2px] pl-11 pr-4 py-3 text-[13px] font-mono tracking-widest uppercase focus:outline-none focus:border-[#26cece]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {templates.map((tpl, i) => (
                        <div key={i} className="bg-[#111111] border border-[#1E1E1E] hover:border-[#26cece] rounded-[2px] p-6 hover:-translate-y-1 hover:shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] transition-all cursor-pointer group flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-[#26cece]/10 rounded-[2px] flex items-center justify-center border border-[#1E1E1E] group-hover:border-[#26cece]/30">
                                    <tpl.icon className="w-5 h-5 text-[#26cece]" />
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 bg-[#070707] px-2 py-1 rounded-[2px] border border-[#333]">{tpl.category}</span>
                            </div>
                            <h3 className="text-[15px] font-bold text-white font-['Space_Grotesk'] uppercase tracking-tight mb-2">{tpl.title}</h3>
                            <p className="text-[12px] font-sans text-gray-400 flex-1">{tpl.desc}</p>
                            <div className="mt-5 pt-4 border-t border-[#1E1E1E]">
                                <span className="text-[11px] font-mono tracking-widest text-[#26cece] uppercase group-hover:underline flex items-center gap-1">
                                    Use Template →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AITemplatesView;
