import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Coins, FileText, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
    // Extract just the text color from the passed prop (e.g., "text-amber-500") for flat neon look
    const iconColor = color.split(' ').find(c => c.startsWith('text-')) || 'text-[#26CECE]';
    
    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 transition-all hover:border-[#26cece] hover:bg-white/10 relative group overflow-hidden backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            {/* Left Accent Bar on Hover */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#26CECE] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_#26cece]"></div>
            
            <div className="flex items-center justify-between mb-5">
                <div className={`text-white p-2 border border-white/10 bg-white/5 rounded-xl group-hover:border-[#26cece]/30 transition-colors`}>
                    <Icon size={20} className={iconColor} />
                </div>
                {subtext && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-teal-100/50 bg-white/5 px-2 py-1 rounded-xl border border-white/10 group-hover:border-[#26cece]/30 group-hover:text-teal-100/80 transition-colors">
                        {subtext}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-[13px] font-sans font-medium text-teal-100/60 mb-2 font-['Space_Grotesk'] tracking-tight group-hover:text-teal-100/80 transition-colors">{title}</h3>
                <div className="text-[32px] font-mono font-medium text-white tracking-tight leading-none group-hover:text-[#26cece] transition-colors">{value}</div>
            </div>
        </div>
    );
};

const DashboardStats = ({ credits, articlesCount, callsCount }) => {
    const { isAdmin } = useAuth();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to={isAdmin ? "/admin/api-keys" : "/dashboard/api-keys"} className="block cursor-pointer">
                <StatCard
                    title="Available Credits"
                    value={credits !== null ? credits.toLocaleString() : '...'}
                    icon={Coins}
                    color="text-amber-500 bg-amber-500"
                    subtext="Credits"
                />
            </Link>
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
