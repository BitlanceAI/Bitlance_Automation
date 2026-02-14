import React from 'react';
import { MessageCircle, Check, Calendar, Globe } from 'lucide-react';

const SolutionSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm">Solution</span>
                    <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6">Meet Your AI Agent: Only-On, On-Brand, On-Time</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Your AI agent becomes a trained virtual team member that handles conversations, qualifies leads, and triggers actions in your existing tools—all in real time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {[
                        {
                            title: "Smart conversations",
                            desc: "Understands natural language, answers FAQs, and handles objections in multiple languages so your prospects feel they’re talking to a real executive, not a bot.",
                            icon: MessageCircle,
                            color: "indigo"
                        },
                        {
                            title: "Lead qualification",
                            desc: "Asks the right questions, captures intent, filters out junk, and sends only qualified leads to your team with full context.",
                            icon: Check,
                            color: "green"
                        },
                        {
                            title: "Booking & workflows",
                            desc: "Books appointments, schedules demos, and pushes data into your CRM, calendar, or WhatsApp flows automatically—no manual follow‑ups.",
                            icon: Calendar,
                            color: "purple"
                        },
                        {
                            title: "Omnichannel presence",
                            desc: "Works on your website, WhatsApp, social DMs, and landing pages so you never lose a prospect because they chose the ‘wrong’ channel.",
                            icon: Globe,
                            color: "blue"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="flex gap-6 group">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
