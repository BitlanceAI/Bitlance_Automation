import React, { useState } from 'react';
import BroadcastForm from '../components/broadcast/BroadcastForm';
import TemplateManager from '../components/broadcast/TemplateManager';
import BroadcastHistory from '../components/broadcast/BroadcastHistory';
import BroadcastSettings from '../components/broadcast/BroadcastSettings';
import Navbar from '../components/layout/Navbar';
import SEOHead from '../components/layout/SEOHead';
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
        { label: 'Templates', value: '—', icon: FileText },
        { label: 'Total Sent', value: '—', icon: Send },
        { label: 'Delivery Rate', value: '—', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#070707] font-mono pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <SEOHead canonicalUrl="https://www.bitlancetechhub.com/dashboard/agents/social" noIndex={true} />
            <Navbar />
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#26cece]/10 border border-[#26cece] text-[#26cece] text-[10px] font-bold tracking-widest uppercase shadow-[4px_4px_0_0_#26cece]">
                        <Radio className="w-4 h-4 animate-pulse" />
                        WhatsApp Business API
                    </div>
                    
                    <div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-['Space_Grotesk'] text-gray-900 dark:text-white uppercase tracking-tight">
                            Broadcast Console
                        </h1>
                        <div className="w-full h-1 bg-[#26cece] mt-4 transform -skew-x-12"></div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 font-mono tracking-widest text-sm max-w-2xl leading-relaxed uppercase">
                        &gt; Send targeted WhatsApp broadcasts to your audience using approved templates or direct messages.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] p-6 hover:border-[#26cece] hover:shadow-[4px_4px_0_0_#26cece] transition-all group flex items-center gap-5">
                            <div className="p-4 bg-gray-100 dark:bg-[#070707] border border-gray-200 dark:border-[#333] group-hover:bg-[#26cece] group-hover:border-[#26cece] transition-colors">
                                <stat.icon className="w-6 h-6 text-[#26cece] group-hover:text-[#070707]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold font-mono tracking-widest uppercase text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-3xl font-extrabold font-['Space_Grotesk'] text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex flex-col sm:flex-row gap-2 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111] p-1 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-[10px] sm:text-xs font-bold font-mono tracking-widest uppercase transition-all ${activeTab === tab.id
                                ? 'bg-[#26cece] text-[#070707] shadow-[2px_2px_0_0_#333] -translate-y-0.5'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-[#333] bg-transparent'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-gray-100 dark:bg-[#070707] border border-gray-200 dark:border-[#333] shadow-[8px_8px_0_0_#26cece] p-6 md:p-8">
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
