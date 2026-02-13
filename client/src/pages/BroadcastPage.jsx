import React, { useState } from 'react';
import BroadcastForm from '../components/BroadcastForm';
import TemplateManager from '../components/TemplateManager';
import BroadcastHistory from '../components/BroadcastHistory';
import BroadcastSettings from '../components/BroadcastSettings';
import Navbar from '../components/Navbar';
import { Radio, FileText, Clock, Send, Zap, Settings } from 'lucide-react';

const BroadcastPage = () => {
    const [activeTab, setActiveTab] = useState('broadcast');

    const tabs = [
        { id: 'broadcast', label: 'New Broadcast', icon: Send },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'history', label: 'History', icon: Clock },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const stats = [
        { label: 'Templates', value: '—', icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
        { label: 'Total Sent', value: '—', icon: Send, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
        { label: 'Delivery Rate', value: '—', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <Navbar />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
                        <Radio className="w-4 h-4" />
                        WhatsApp Business API
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl bg-clip-text">
                        Broadcast Console
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Send targeted WhatsApp broadcasts to your audience using approved templates or direct messages.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 md:p-8">
                    {activeTab === 'broadcast' && <BroadcastForm />}
                    {activeTab === 'templates' && <TemplateManager />}
                    {activeTab === 'history' && <BroadcastHistory />}
                    {activeTab === 'settings' && <BroadcastSettings />}
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
