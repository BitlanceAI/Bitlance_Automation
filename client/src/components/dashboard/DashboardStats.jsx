
import React from 'react';
import { Activity, Coins, FileText, Phone } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
    // Extract just the text color from the passed prop (e.g., "text-amber-500") for flat neon look
    const iconColor = color.split(' ').find(c => c.startsWith('text-')) || 'text-[#26CECE]';
    
    return (
        <div className="bg-[#111111] rounded-[2px] p-6 border border-[#1E1E1E] transition-all hover:border-[#333] hover:bg-[#151515] relative group overflow-hidden">
            {/* Left Accent Bar on Hover */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#26CECE] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center justify-between mb-5">
                <div className={`text-white p-2 border border-[#222] bg-[#070707] rounded-[2px]`}>
                    <Icon size={20} className={iconColor} />
                </div>
                {subtext && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 bg-[#1A1A1A] px-2 py-1 rounded-[2px] border border-[#222]">
                        {subtext}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-[13px] font-sans font-medium text-gray-400 mb-2 font-['Space_Grotesk'] tracking-tight">{title}</h3>
                <div className="text-[32px] font-mono font-medium text-white tracking-tight leading-none">{value}</div>
            </div>
        </div>
    );
};

const DashboardStats = ({ credits, articlesCount, callsCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Available Credits"
                value={credits !== null ? credits : '...'}
                icon={Coins}
                color="text-amber-500 bg-amber-500"
                subtext="Credits"
            />
            <StatCard
                title="Articles Generated"
                value={articlesCount !== null ? articlesCount : '...'}
                icon={FileText}
                color="text-indigo-500 bg-indigo-500"
                subtext="Lifetime"
            />
            <StatCard
                title="Sales Calls Made"
                value={callsCount !== null ? callsCount : '...'}
                icon={Phone}
                color="text-emerald-500 bg-emerald-500"
                subtext="Lifetime"
            />
        </div>
    );
};

export default DashboardStats;
