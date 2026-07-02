
import React from 'react';
import { FileText, Phone, Clock } from 'lucide-react';

const ActivityItem = ({ type, title, date, status }) => {
    const isBlog = type === 'blog';
    const Icon = isBlog ? FileText : Phone;
    
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
            <div className="p-2 border border-white/10 bg-white/5 rounded-xl text-[#26cece]">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-['Space_Grotesk'] text-[15px] font-medium text-white truncate">{title}</h4>
                <div className="flex items-center gap-2 text-[11px] font-mono text-teal-100/50 mt-[6px] tracking-wider uppercase">
                    <Clock size={10} />
                    <span>{new Date(date).toLocaleDateString()}</span>
                    {status && (
                        <>
                            <span className="text-white/20">•</span>
                            <span className="text-[#26CECE]">{status}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 bg-white/5 border border-white/10 text-teal-100/60 rounded-xl">
                {isBlog ? 'Article' : 'Call'}
            </div>
        </div>
    );
};

const RecentActivity = ({ activities = [] }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center w-full h-full flex flex-col justify-center items-center min-h-[300px]">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 text-[#26CECE]">
                    <Clock size={20} />
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white mb-2 tracking-tight">No Recent Activity</h3>
                <p className="font-mono text-[12px] text-teal-100/50 tracking-wide uppercase">Awaitings logs...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-2 h-2 bg-[#26CECE] shadow-[0_0_8px_#26cece]" />
                <h2 className="text-[16px] font-bold text-white font-['Space_Grotesk'] uppercase tracking-widest">
                    Recent Activity
                </h2>
            </div>
            <div className="space-y-[2px]">
                {activities.map((activity, index) => (
                    <ActivityItem
                        key={index}
                        type={activity.type}
                        title={activity.title}
                        date={activity.date}
                        status={activity.status}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
