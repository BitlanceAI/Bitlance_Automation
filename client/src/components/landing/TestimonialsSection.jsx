import React from 'react';
import { motion } from 'framer-motion';
import imgTejaunsh from '../../assets/testimonals/tejaunsh_nyati.jpeg';
import imgSuyash from '../../assets/testimonals/suyash_nyati.jpeg';
import imgDeepak from '../../assets/testimonals/deepak_chaudhari.jpeg';
import imgAkshay from '../../assets/testimonals/akshay_lakde.jpeg';
import imgsahil from '../../assets/testimonals/sahil_guhane.jpeg';
import { Quote } from 'lucide-react';

const T = '#26CECE';

const testimonials = [
    { name: 'Suyash Nyati',     designation: 'Director at Nyati Technologies Pvt Ltd',  profileImage: imgSuyash,   description: 'Our front desk was overwhelmed with appointment queries. The AI voice agent now handles 80% of routine calls, allowing our staff to focus on critical tasks. Efficiency has skyrocketed.' },
    { name: 'Deepak Chaudhari', designation: 'FinTech | Business Development',           profileImage: imgDeepak,   description: "The AI automation didn't just streamline our workflow; it understood our niche requirements perfectly. We've seen a significant increase in client engagement without expanding our team." },
    { name: 'Tejaunsh S Nyati', designation: 'CEO at Nyati Technologies',                profileImage: imgTejaunsh, description: 'We used to miss 20–30% calls during peak time. After adding the AI agent, every lead is answered and pre-qualified before it reaches our sales team. It\'s been a game changer.' },
    { name: 'Akshay Lakade',    designation: 'Embedded Engineer',                        profileImage: imgAkshay,   description: 'I was skeptical about AI integration, but the onboarding was seamless. It feels like having a dedicated assistant who knows our technical stack inside out.' },
    { name: 'Sahil Guhane',     designation: 'Cloud Engineer',                           profileImage: imgsahil,    description: 'I was skeptical about AI integration, but the onboarding was seamless. It feels like having a dedicated assistant who knows our technical stack inside out.' },
];

const doubled = [...testimonials, ...testimonials];

const TestimonialsSection = () => (
    /* ── WHITE SECTION ── */
    <section className="py-12 relative overflow-hidden bg-white">
        {/* Subtle teal tint at top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${T}, transparent)` }} />
        {/* Light teal glow in bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[160px] pointer-events-none"
            style={{ background: 'rgba(38,206,206,0.06)' }} />

        {/* Heading */}
        <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: T, textTransform: 'uppercase' }}>
                Social Proof
            </span>
            <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }} viewport={{ once: true }}
                className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight"
                style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.025em', color: '#0A0A0A' }}
            >
                Trusted by forward-thinking<br />
                <span style={{ color: T }}>businesses</span>
            </motion.h2>
            <div className="mt-6" style={{ width: 48, height: 2, background: T }} />
        </div>

        {/* Scrolling strip */}
        <div className="w-full overflow-hidden relative">
            {/* Edge fades — white */}
            <div className="absolute top-0 bottom-0 left-0 w-32 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }} />
            <div className="absolute top-0 bottom-0 right-0 w-32 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }} />

            <motion.div
                className="flex gap-5 w-max py-6 pr-5"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, ease: 'linear', duration: 38 }}
            >
                {doubled.map((t, i) => (
                    <div
                        key={i}
                        className="w-[300px] md:w-[400px] flex flex-col shrink-0 gap-5 rounded-xl p-6 transition-all duration-300"
                        style={{
                            background: '#F8FFFE',
                            border: '1px solid #E5F9F9',
                            boxShadow: '0 2px 16px rgba(38,206,206,0.06)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = `${T}60`;
                            e.currentTarget.style.boxShadow = `0 8px 32px rgba(38,206,206,0.12)`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#E5F9F9';
                            e.currentTarget.style.boxShadow = '0 2px 16px rgba(38,206,206,0.06)';
                        }}
                    >
                        <Quote size={24} style={{ color: `${T}50` }} />
                        <p className="leading-relaxed text-sm italic flex-grow" style={{ color: '#000' }}>
                            "{t.description}"
                        </p>
                        <div className="flex items-center gap-3 mt-auto">
                            <img src={t.profileImage} alt={t.name}
                                className="w-10 h-10 rounded-full object-cover"
                                style={{ border: `2px solid ${T}40` }} />
                            <div>
                                <h4 className="font-extrabold text-sm" style={{ color: '#0A0A0A', fontFamily: "'Space Grotesk',sans-serif" }}>{t.name}</h4>
                                <p className="text-xs mt-0.5" style={{ color: T, fontFamily: "'DM Mono',monospace" }}>
                                    {t.designation}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>

        {/* Bottom transition to dark */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(7,7,7,0.04))' }} />
    </section>
);

export default TestimonialsSection;
