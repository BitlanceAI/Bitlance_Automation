import React from 'react';
import { Globe, Zap, Shield, BarChart3 } from 'lucide-react';

const SocialProofSection = () => {
    return (
        <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Teams are closing more deals with less effort</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        "+40% more enquiries handled without adding staff.",
                        "Up to 2× increase in booked appointments from same ad spend.",
                        "Response time reduced from hours to under 10 seconds."
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center font-semibold text-lg">
                            {stat}
                        </div>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <blockquote className="text-2xl font-medium italic leading-relaxed mb-6">
                        “We used to miss 20–30% calls during peak time. After adding the AI agent, every lead is answered and pre‑qualified before it reaches our sales team.”
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        {/* <div className="w-12 h-12 rounded-full bg-gray-300"></div> */}
                        <div className="text-left">
                            <div className="font-bold">[Client Name]</div>
                            <div className="text-indigo-200 text-sm">[Business Type]</div>
                        </div>
                    </div>
                </div>

                <div className="text-center opacity-60 text-sm uppercase tracking-widest mb-8">Trusted by teams in real estate, healthcare, education, and local services</div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                    {/* Logos Placeholder */}
                    <div className="flex items-center gap-2 font-bold text-xl"><Globe /> GlobalRealty</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Zap /> MedCare</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Shield /> EduTech</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><BarChart3 /> ServicePro</div>
                </div>
            </div>
        </section>
    );
};

export default SocialProofSection;
