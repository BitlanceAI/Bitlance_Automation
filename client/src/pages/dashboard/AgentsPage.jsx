import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AgentGrid from '../../components/agent/AgentGrid';
import { agents } from '../../data/agentsData';
import { Bot, Zap, Clock, ArrowRight } from 'lucide-react';
import LoginPromptModal from '../../components/ui/LoginPromptModal';
import { Link } from 'react-router-dom';

const AgentsPage = ({ onAgentSelect }) => {
    const { user } = useAuth();
    const [loginModal, setLoginModal] = useState({ open: false, agentTitle: '' });

    const handleCardClick = (agent) => {
        // If not logged in, show login prompt instead of navigating
        if (!user) {
            setLoginModal({ open: true, agentTitle: agent.title });
            return;
        }
        console.log('Agent clicked:', agent);
        if (onAgentSelect) {
            onAgentSelect(agent);
        }
    };

    return (
        <div className="min-h-screen bg-white transition-colors duration-300">
            {/* Login prompt modal for unauthenticated users */}
            <LoginPromptModal
                isOpen={loginModal.open}
                onClose={() => setLoginModal({ open: false, agentTitle: '' })}
                agentTitle={loginModal.agentTitle}
            />

            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="text-center mb-16">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-gray-200 bg-gray-50 text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-6 animate-fade-in">
                        <Bot className="w-3 h-3" />
                        Automation Platform
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6 leading-tight animate-fade-in-up font-['Space_Grotesk'] uppercase tracking-tight">
                        AI Agents <br/>
                        <span className="text-[#26cece]">
                            Portfolio
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100 font-sans">
                        Powerful AI-driven automation agents designed to streamline your marketing,
                        content creation, and analytics workflows. Deploy intelligent solutions that work 24/7.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center flex-wrap gap-4 mt-12 animate-fade-in-up delay-200">
                        <div className="text-center group bg-white border border-gray-200 p-6 rounded-[2px] w-48 hover:border-gray-200 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-black font-mono">
                                <Bot className="w-6 h-6 text-[#26cece]" />
                                {agents.length}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-widest">Total Agents</div>
                        </div>
                        <div className="text-center group bg-white border border-gray-200 p-6 rounded-[2px] w-48 hover:border-gray-200 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-black font-mono">
                                <Zap className="w-6 h-6 text-emerald-400" />
                                {agents.filter(a => a.status === 'Available').length}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-widest">Available Now</div>
                        </div>
                        <div className="text-center group bg-white border border-gray-200 p-6 rounded-[2px] w-48 hover:border-gray-200 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-black font-mono">
                                <Clock className="w-6 h-6 text-amber-400" />
                                {agents.filter(a => a.status === 'Coming Soon').length}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-widest">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <AgentGrid agents={agents} onCardClick={handleCardClick} />

                {/* CTA Section for guests */}
                {!user && (
                    <div className="mt-20 text-center animate-fade-in-up delay-300">
                        <div className="bg-white border border-gray-200 rounded-[2px] p-12 text-black relative overflow-hidden">
                            <h2 className="text-[28px] font-bold mb-4 relative z-10 font-['Space_Grotesk'] tracking-tight uppercase text-black">
                                Ready to automate your workflows?
                            </h2>
                            <p className="text-gray-600 mb-8 text-[15px] max-w-2xl mx-auto relative z-10 font-sans">
                                Start deploying AI agents today and transform your business operations
                                with intelligent automation.
                            </p>
                            <Link
                                to="/login"
                                className="
                                  relative z-10 inline-flex items-center gap-2 mx-auto
                                  bg-[#26cece] text-[#070707] px-8 py-4 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest
                                  hover:bg-white transition-all duration-200
                                  hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#e5e7eb]
                                "
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentsPage;
