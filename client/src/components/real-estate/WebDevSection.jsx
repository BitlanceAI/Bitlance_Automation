import React from 'react';
import { Monitor, Smartphone, Zap, Search, LayoutTemplate, MousePointerClick } from 'lucide-react';

const WebDevSection = () => {
    const services = [
        {
            icon: <Monitor size={32} />,
            title: "Custom IDX Websites",
            description: "Seamlessly integrate property listings with your brand. Our sites are built to keep buyers searching on YOUR platform, not Zillow."
        },
        {
            icon: <Smartphone size={32} />,
            title: "Mobile-First Design",
            description: "Over 70% of home searches happen on mobile. We ensure your site looks and performs perfectly on every device."
        },
        {
            icon: <Zap size={32} />,
            title: "Lightning Fast Speed",
            description: "Google ranks fast sites higher. We optimize every line of code to ensure near-instant load times for better SEO."
        },
        {
            icon: <Search size={32} />,
            title: "SEO Domination",
            description: "From schema markup to keyword optimization, our sites are engineered to climb the search rankings in your local market."
        },
        {
            icon: <LayoutTemplate size={32} />,
            title: "High-Converting Landers",
            description: "Need a page specifically for that luxury listing? We build dedicated landing pages that drive targeted leads."
        },
        {
            icon: <MousePointerClick size={32} />,
            title: "Lead Capture Funnels",
            description: "Strategic pop-ups, sticky bars, and value-offer forms that capture visitor info without being annoying."
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <span className="text-re-blue font-semibold tracking-wide uppercase text-sm">Beyond Automation</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 leading-tight text-re-navy dark:text-white">
                            We Also Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-re-blue to-re-accent">World-Class Real Estate Websites</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            Your automation is only as good as the destination you send traffic to. We provide full-stack web development services tailored specifically for high-performing agents and brokerages.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            {services.map((service, index) => (
                                <div key={index} className="flex flex-col items-center lg:items-start text-center lg:text-left group">
                                    <div className="w-12 h-12 rounded-lg bg-re-navy/5 dark:bg-white/5 text-re-blue flex items-center justify-center mb-4 group-hover:bg-re-blue group-hover:text-white transition-colors duration-300">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-re-navy dark:text-white mb-2">{service.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual / Image Side */}
                    <div className="flex-1 relative w-full lg:w-auto">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
                            {/* Abstract Browser UI representation */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl relative overflow-hidden flex flex-col">
                                {/* Browser Header */}
                                <div className="h-8 bg-gray-200 dark:bg-slate-700 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <div className="ml-4 flex-1 h-5 rounded-md bg-white dark:bg-slate-800 opacity-50"></div>
                                </div>
                                {/* Browser Body - Abstract Layout */}
                                <div className="flex-1 p-6 relative">
                                    {/* Abstract Hero */}
                                    <div className="h-1/3 bg-re-navy/10 dark:bg-white/5 rounded-lg mb-4 w-full animate-pulse-slow"></div>
                                    {/* Abstract Grid */}
                                    <div className="grid grid-cols-3 gap-4 h-1/3">
                                        <div className="bg-re-blue/10 rounded-lg"></div>
                                        <div className="bg-re-blue/10 rounded-lg"></div>
                                        <div className="bg-re-blue/10 rounded-lg"></div>
                                    </div>
                                    {/* Decorative Elements */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
                                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl border border-re-blue/20">
                                            <span className="text-re-blue font-bold text-lg flex items-center gap-2">
                                                <Zap size={20} className="fill-current" />
                                                High Performance
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Blobs */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-re-blue/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-re-accent/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WebDevSection;
