import React from 'react';
import { useAuth } from '../context/AuthContext';
import AgentGrid from '../components/AgentGrid';
import { agents } from '../data/agentsData';
import { Bot, Zap, Clock, ArrowRight } from 'lucide-react';

const AgentsPage = ({ onAgentSelect }) => {
    const { user } = useAuth();
    const handleCardClick = (agent) => {
        console.log('Agent clicked:', agent);
        if (onAgentSelect) {
            onAgentSelect(agent);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="text-center mb-16">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 animate-fade-in">
                        <Bot className="w-4 h-4" />
                        Automation Platform
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight animate-fade-in-up">
                        AI Agents
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Portfolio
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                        Powerful AI-driven automation agents designed to streamline your marketing,
                        content creation, and analytics workflows. Deploy intelligent solutions that work 24/7.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center flex-wrap gap-8 md:gap-12 mt-12 animate-fade-in-up delay-200">
                        <div className="text-center group">
                            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 duration-300">
                                <Bot className="w-8 h-8 opacity-80" />
                                {agents.length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Total Agents</div>
                        </div>
                        <div className="w-px h-16 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
                        <div className="text-center group">
                            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110 duration-300">
                                <Zap className="w-8 h-8 opacity-80" />
                                {agents.filter(a => a.status === 'Available').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Available Now</div>
                        </div>
                        <div className="w-px h-16 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
                        <div className="text-center group">
                            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-yellow-600 dark:text-yellow-400 transition-transform group-hover:scale-110 duration-300">
                                <Clock className="w-8 h-8 opacity-80" />
                                {agents.filter(a => a.status === 'Coming Soon').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <AgentGrid agents={agents} onCardClick={handleCardClick} />

                {/* CTA Section */}
                {!user && (
                    <div className="mt-20 text-center animate-fade-in-up delay-300">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                            <h2 className="text-3xl font-bold mb-4 relative z-10">
                                Ready to automate your workflows?
                            </h2>
                            <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto relative z-10">
                                Start deploying AI agents today and transform your business operations
                                with intelligent automation.
                            </p>
                            <button className="
                  relative z-10 flex items-center gap-2 mx-auto
                  bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold
                  hover:bg-indigo-50 transition-all duration-200
                  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                ">
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentsPage;
