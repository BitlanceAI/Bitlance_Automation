
import React from 'react';
import { Activity, Coins, FileText, Phone } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {subtext && (
                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {subtext}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        </div>
    </div>
);

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
