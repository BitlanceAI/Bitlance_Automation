import React from 'react';
import { useAuth } from '../context/AuthContext';
import AgentGrid from '../components/AgentGrid';
import { agents } from '../data/agentsData';

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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Automation Platform
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        AI Agents
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Portfolio
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Powerful AI-driven automation agents designed to streamline your marketing,
                        content creation, and analytics workflows. Deploy intelligent solutions that work 24/7.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 mt-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                {agents.length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI Agents</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                {agents.filter(a => a.status === 'Available').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available Now</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                                {agents.filter(a => a.status === 'Coming Soon').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <AgentGrid agents={agents} onCardClick={handleCardClick} />

                {/* CTA Section */}
                {!user && (
                    <div className="mt-20 text-center">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
                            <h2 className="text-3xl font-bold mb-4">
                                Ready to automate your workflows?
                            </h2>
                            <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
                                Start deploying AI agents today and transform your business operations
                                with intelligent automation.
                            </p>
                            <button className="
                  bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold
                  hover:bg-indigo-50 transition-colors duration-200
                  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                ">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentsPage;
