import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AgentGrid from '../../components/agent/AgentGrid';
import { agents } from '../../data/agentsData';
import { Bot, Zap, Clock, ArrowRight } from 'lucide-react';
import LoginPromptModal from '../../components/ui/LoginPromptModal';
import { Link } from 'react-router-dom';
import { MeshGradient } from '@paper-design/shaders-react';

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
        <div className="min-h-screen bg-teal-900 transition-colors duration-300 relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                <MeshGradient
                    speed={0.6}
                    colors={["#26CECE", "#1AA8A8", "#0d5c5c", "#178282"]}
                    distortion={0.8}
                    swirl={0.1}
                    grainMixer={0.15}
                    grainOverlay={0}
                    style={{ height: "100%", width: "100%" }}
                />
            </div>

            {/* Login prompt modal for unauthenticated users */}
            <LoginPromptModal
                isOpen={loginModal.open}
                onClose={() => setLoginModal({ open: false, agentTitle: '' })}
                agentTitle={loginModal.agentTitle}
            />

            {/* Header Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="text-center mb-16">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/20 text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-6 animate-fade-in backdrop-blur-md">
                        <Bot className="w-3 h-3" />
                        Automation Platform
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up font-['Space_Grotesk'] uppercase tracking-tight">
                        AI Agents <br/>
                        <span className="text-[#26cece]">
                            Portfolio
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-teal-50/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100 font-sans">
                        Powerful AI-driven automation agents designed to streamline your marketing,
                        content creation, and analytics workflows. Deploy intelligent solutions that work 24/7.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center flex-wrap gap-4 mt-12 animate-fade-in-up delay-200">
                        <div className="text-center group bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-[24px] w-48 hover:border-white/30 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-white font-mono">
                                <Bot className="w-6 h-6 text-[#26cece]" />
                                {agents.length}
                            </div>
                            <div className="text-[10px] text-teal-100/60 mt-2 font-mono uppercase tracking-widest">Total Agents</div>
                        </div>
                        <div className="text-center group bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-[24px] w-48 hover:border-white/30 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-white font-mono">
                                <Zap className="w-6 h-6 text-[#26cece]" />
                                {agents.filter(a => a.status === 'Available').length}
                            </div>
                            <div className="text-[10px] text-teal-100/60 mt-2 font-mono uppercase tracking-widest">Available Now</div>
                        </div>
                        <div className="text-center group bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-[24px] w-48 hover:border-white/30 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-[32px] font-bold text-white font-mono">
                                <Clock className="w-6 h-6 text-[#26cece]" />
                                {agents.filter(a => a.status === 'Coming Soon').length}
                            </div>
                            <div className="text-[10px] text-teal-100/60 mt-2 font-mono uppercase tracking-widest">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <AgentGrid agents={agents} onCardClick={handleCardClick} />

                {/* CTA Section for guests */}
                {!user && (
                    <div className="mt-20 text-center animate-fade-in-up delay-300">
                        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-white relative overflow-hidden">
                            <h2 className="text-[28px] font-bold mb-4 relative z-10 font-['Space_Grotesk'] tracking-tight uppercase text-white">
                                Ready to automate your workflows?
                            </h2>
                            <p className="text-teal-50/80 mb-8 text-[15px] max-w-2xl mx-auto relative z-10 font-sans">
                                Start deploying AI agents today and transform your business operations
                                with intelligent automation.
                            </p>
                            <Link
                                to="/login"
                                className="
                                  relative z-10 inline-flex items-center gap-2 mx-auto
                                  bg-white text-teal-900 px-8 py-4 rounded-[12px] font-bold font-['Space_Grotesk'] uppercase tracking-widest
                                  hover:bg-teal-50 transition-all duration-200
                                  hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(38,206,206,0.2)]
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
