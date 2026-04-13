import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';
const T2 = '#1AA8A8';

// ─── Animated SVG per service ────────────────────────────────────────────────
const WhatsAppAnim = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
        <defs>
            <linearGradient id="wa1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
            </linearGradient>
        </defs>
        {/* Phone outline */}
        <rect x="30" y="15" width="40" height="65" rx="6" fill="none" stroke="url(#wa1)" strokeWidth="2.5" />
        {/* Chat bubbles */}
        {[
            { x: 36, y: 32, w: 20, delay: 0 },
            { x: 44, y: 46, w: 16, delay: 0.5 },
            { x: 36, y: 60, w: 22, delay: 1 },
        ].map((b, i) => (
            <motion.rect key={i} x={b.x} y={b.y} width={b.w} height={7} rx="3" fill="url(#wa1)"
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: b.delay, ease: 'easeInOut' }} />
        ))}
        {/* Signal dots */}
        {[0, 1, 2].map(i => (
            <motion.circle key={i} cx={44 + i * 6} cy={88} r="2" fill="url(#wa1)"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
        ))}
    </svg>
);

const VoiceAnim = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
        <defs>
            <linearGradient id="va1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
            </linearGradient>
        </defs>
        {/* Microphone body */}
        <rect x="40" y="18" width="20" height="34" rx="10" fill="none" stroke="url(#va1)" strokeWidth="2.5" />
        {/* Mic stand */}
        <motion.path d="M30 52 Q30 70 50 70 Q70 70 70 52" fill="none" stroke="url(#va1)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="70" x2="50" y2="82" stroke="url(#va1)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="82" x2="62" y2="82" stroke="url(#va1)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sound waves */}
        {[14, 22, 30].map((r, i) => (
            <motion.circle key={i} cx="50" cy="35" r={r} fill="none" stroke="url(#va1)" strokeWidth="1"
                animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }} />
        ))}
    </svg>
);

const ChatbotAnim = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
        <defs>
            <linearGradient id="cb1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
            </linearGradient>
        </defs>
        {/* Chat bubble */}
        <rect x="15" y="20" width="70" height="45" rx="10" fill="none" stroke="url(#cb1)" strokeWidth="2.5" />
        <path d="M35 65 L28 78 L50 65" fill="none" stroke="url(#cb1)" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Bot face */}
        <motion.circle cx="36" cy="40" r="5" fill="url(#cb1)"
            animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        <motion.circle cx="64" cy="40" r="5" fill="url(#cb1)"
            animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: 'easeInOut' }} />
        {/* Smile */}
        <motion.path d="M38 52 Q50 60 62 52" fill="none" stroke="url(#cb1)" strokeWidth="2.5" strokeLinecap="round"
            animate={{ d: ['M38 52 Q50 60 62 52', 'M38 54 Q50 62 62 54', 'M38 52 Q50 60 62 52'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
    </svg>
);

// ─── 3D Tilt Card ────────────────────────────────────────────────────────────
const ServiceCard = ({ icon: Icon, label, title, desc, badge }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const xs = useSpring(x);
    const ys = useSpring(y);
    const rX = useTransform(ys, [-0.5, 0.5], ['12deg', '-12deg']);
    const rY = useTransform(xs, [-0.5, 0.5], ['-12deg', '12deg']);

    const move = e => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
    };
    const leave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref} onMouseMove={move} onMouseLeave={leave}
            style={{ rotateY: rY, rotateX: rX, transformStyle: 'preserve-3d' }}
            className="relative h-full min-h-[400px] w-full cursor-pointer group"
        >
            <div
                style={{
                    transform: 'translateZ(60px)',
                    transformStyle: 'preserve-3d',
                    background: '#ffffff',
                    border: '1px solid #E8F8F8',
                    borderRadius: 12,
                    boxShadow: '0 4px 24px rgba(38,206,206,0.08)',
                }}
                className="absolute inset-3 transition-all duration-300 group-hover:shadow-[0_8px_40px_rgba(38,206,206,0.18)] group-hover:border-[#26CECE50]"
            >
                <div className="p-6 flex flex-col h-full" style={{ transform: 'translateZ(40px)' }}>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm"
                            style={{ background: `${T}15`, color: T, fontFamily: "'DM Mono',monospace" }}>
                            {label}
                        </span>
                        {badge && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm"
                                style={{ background: '#0A0A0A', color: '#26CECE', fontFamily: "'DM Mono',monospace" }}>
                                {badge}
                            </span>
                        )}
                    </div>

                    {/* Title + desc */}
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#0A0A0A' }}>
                        {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{desc}</p>

                    {/* Animated illustration */}
                    <div className="flex-1 mt-5 rounded-xl flex items-center justify-center relative overflow-hidden"
                        style={{ background: '#F0FEFE', border: `1px solid ${T}20`, minHeight: 120 }}>
                        <div className="w-20 h-20 relative z-10">
                            <Icon />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Section ─────────────────────────────────────────────────────────────────
const services = [
    {
        icon: WhatsAppAnim,
        label: 'WhatsApp Bot',
        title: 'WhatsApp AI Agent',
        desc: 'Instantly responds to every WhatsApp enquiry, qualifies leads, shares brochures, and books appointments — 24/7 with zero human involvement.',
        badge: '0.4s response',
    },
    {
        icon: VoiceAnim,
        label: 'Voice Agent',
        title: 'AI Voice Agent',
        desc: 'Answers every inbound call, handles objections, and books appointments in a natural human voice. Never miss a lead during peak hours again.',
        badge: '24/7 calls',
    },
    {
        icon: ChatbotAnim,
        label: 'Website Chatbot',
        title: 'AI Chat Agent',
        desc: 'Converts website visitors into leads with a smart chatbot trained on your business data. Handles FAQs, captures contacts, and routes hot leads instantly.',
        badge: 'Live on site',
    },
];

const HowItWorksSection = () => (
    <section className="py-12 relative overflow-hidden bg-[#F8FFFE]">
        <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${T}60, transparent)` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] -z-0 pointer-events-none"
            style={{ background: 'rgba(38,206,206,0.07)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: `radial-gradient(circle, ${T} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-16 max-w-2xl">
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: T, textTransform: 'uppercase' }}>
                    Our Services
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em', color: '#0A0A0A' }}>
                    Three agents,{' '}
                    <span style={{ color: T }}>zero manual work</span>
                </h2>
                <div className="mt-6" style={{ width: 48, height: 2, background: T }} />
                <p className="mt-6 text-base leading-relaxed" style={{ color: '#666' }}>
                    Every enquiry answered. Every lead qualified. Every appointment booked — automatically across WhatsApp, phone, and your website.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
                {services.map((s, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: i * 0.1 }} viewport={{ once: true }}
                        className="h-full"
                    >
                        <ServiceCard {...s} />
                    </motion.div>
                ))}
            </div>
        </ScrollReveal>
    </section>
);

export default HowItWorksSection;
