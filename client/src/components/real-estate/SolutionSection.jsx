import React from 'react';
import { Target, PenTool, MessageSquare, Globe, Share2 } from 'lucide-react';

const SolutionSection = () => {
    const features = [
        {
            title: "Max Power Lead Generation Suite",
            icon: <Target size={32} />,
            points: ["200–300 qualified leads monthly", "Facebook & Google ads management", "Intelligent AI budget scaling"],
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "AI Content Marketing Engine",
            icon: <PenTool size={32} />,
            points: ["30 days of content in hours", "Market-driven copy generation", "Automated email marketing campaigns"],
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "AI CRM Automation",
            icon: <MessageSquare size={32} />,
            points: ["Instant auto follow-ups", "Smart appointment scheduling", "Comprehensive lead management"],
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Website & SEO Optimization",
            icon: <Globe size={32} />,
            points: ["Personal branded website", "High-converting landing pages", "Search visibility boost"],
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Social Media & Branding",
            icon: <Share2 size={32} />,
            points: ["Profile optimization", "Paid ads strategies", "Authority positioning"],
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        }
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-re-blue font-semibold tracking-wide uppercase text-sm">The Solution</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6">The AI Homes On Auto Pilot System</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A complete ecosystem designed to replace your manual workload with intelligent automation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700 group hover:-translate-y-1 duration-300">
                            <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <ul className="space-y-3">
                                {feature.points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-current ${feature.color}`} />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
