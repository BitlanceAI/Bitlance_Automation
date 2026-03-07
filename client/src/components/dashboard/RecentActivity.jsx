
import React from 'react';
import { FileText, Phone, Clock } from 'lucide-react';

const ActivityItem = ({ type, title, date, status }) => {
    const isBlog = type === 'blog';
    const Icon = isBlog ? FileText : Phone;
    const colorClass = isBlog ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock size={12} />
                    <span>{new Date(date).toLocaleDateString()}</span>
                    {status && (
                        <>
                            <span>•</span>
                            <span className="capitalize">{status}</span>
                        </>
                    )}
                </div>
            </div>
            {isBlog && (
                <div className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                    Article
                </div>
            )}
            {!isBlog && (
                <div className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
                    Call
                </div>
            )}
        </div>
    );
};

const RecentActivity = ({ activities = [] }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Clock size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
                <p className="text-gray-500 dark:text-gray-400">Your generated articles and calls will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="text-indigo-600" size={24} />
                Recent Activity
            </h2>
            <div className="space-y-2">
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
