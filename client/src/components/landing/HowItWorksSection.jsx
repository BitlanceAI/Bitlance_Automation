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

const CustomAutomationAnim = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
        <defs>
            <linearGradient id="ca1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
            </linearGradient>
        </defs>
        {/* Nodes */}
        <rect x="40" y="20" width="20" height="20" rx="4" fill="none" stroke="url(#ca1)" strokeWidth="2.5" />
        <rect x="20" y="60" width="20" height="20" rx="4" fill="none" stroke="url(#ca1)" strokeWidth="2.5" />
        <rect x="60" y="60" width="20" height="20" rx="4" fill="none" stroke="url(#ca1)" strokeWidth="2.5" />

        {/* Lines */}
        <path d="M50 40 L50 50 L30 50 L30 60" fill="none" stroke="url(#ca1)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 40 L50 50 L70 50 L70 60" fill="none" stroke="url(#ca1)" strokeWidth="2" strokeLinejoin="round" />

        {/* Pulses traveling along lines */}
        <motion.circle r="3" fill="url(#ca1)"
            animate={{
                cx: [50, 50, 30, 30],
                cy: [40, 50, 50, 60],
                opacity: [0, 1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        />
        <motion.circle r="3" fill="url(#ca1)"
            animate={{
                cx: [50, 50, 70, 70],
                cy: [40, 50, 50, 60],
                opacity: [0, 1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 1.25, ease: 'linear' }}
        />

        {/* Node Highlights */}
        {[
            { cx: 50, cy: 30, delay: 0 },
            { cx: 30, cy: 70, delay: 2.5 },
            { cx: 70, cy: 70, delay: 3.75 }
        ].map((node, i) => (
            <motion.circle key={i} cx={node.cx} cy={node.cy} r="6" fill="url(#ca1)"
                animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, delay: node.delay }} />
        ))}
    </svg>
);

const GeoAnim = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
        <defs>
            <linearGradient id="ga1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
            </linearGradient>
        </defs>
        {/* Document outline */}
        <rect x="30" y="20" width="40" height="50" rx="4" fill="none" stroke="url(#ga1)" strokeWidth="2.5" />
        {/* Lines */}
        <line x1="40" y1="35" x2="60" y2="35" stroke="url(#ga1)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="45" x2="55" y2="45" stroke="url(#ga1)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Magic wand / AI stars */}
        {[
            { cx: 70, cy: 30, delay: 0 },
            { cx: 80, cy: 45, delay: 0.5 },
            { cx: 75, cy: 65, delay: 1 }
        ].map((star, i) => (
            <motion.path key={i} d={`M${star.cx} ${star.cy - 4} L${star.cx + 1} ${star.cy - 1} L${star.cx + 4} ${star.cy} L${star.cx + 1} ${star.cy + 1} L${star.cx} ${star.cy + 4} L${star.cx - 1} ${star.cy + 1} L${star.cx - 4} ${star.cy} L${star.cx - 1} ${star.cy - 1} Z`} fill="url(#ga1)"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], rotate: [0, 90, 180] }}
                transition={{ repeat: Infinity, duration: 2, delay: star.delay }} />
        ))}
        {/* Globe or web symbol */}
        <circle cx="50" cy="75" r="12" fill="none" stroke="url(#ga1)" strokeWidth="2" />
        <ellipse cx="50" cy="75" rx="5" ry="12" fill="none" stroke="url(#ga1)" strokeWidth="1" />
        <line x1="38" y1="75" x2="62" y2="75" stroke="url(#ga1)" strokeWidth="1" />
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
                className="absolute inset-3 transition-all duration-300
                    bg-white/5 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]
                    group-hover:shadow-[0_8px_40px_rgba(38,206,206,0.18)] group-hover:border-[#26CECE50]"
                style={{
                    transform: 'translateZ(60px)',
                    transformStyle: 'preserve-3d',
                    borderRadius: 16,
                }}
            >
                <div className="p-6 flex flex-col h-full" style={{ transform: 'translateZ(40px)' }}>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-2xl"
                            style={{ background: `${T}15`, color: T, fontFamily: "'DM Mono',monospace" }}>
                            {label}
                        </span>
                        {badge && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-xl
                                bg-white/[0.07] text-teal-300"
                                style={{ fontFamily: "'DM Mono',monospace" }}>
                                {badge}
                            </span>
                        )}
                    </div>

                    {/* Title + desc */}
                    <h3 className="text-xl font-extrabold mb-2 text-white"
                        style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                        {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-teal-50/90">{desc}</p>

                    {/* Animated illustration */}
                    <div className="flex-1 mt-5 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ background: `${T}08`, border: `1px solid ${T}20`, minHeight: 120 }}>
                        <div className="w-20 h-20 relative z-10">
                            <Icon />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const services = [
    {
        icon: WhatsAppAnim,
        label: 'WhatsApp Bot',
        title: 'WhatsApp AI Agent',
        desc: 'Responds to every WhatsApp enquiry in 0.4 seconds. Qualifies leads, sends brochures, books appointments — all without a single human touchpoint. Day or night.',
        badge: '0.4s response',
    },
    {
        icon: VoiceAnim,
        label: 'Voice Agent',
        title: 'AI Voice Agent',
        desc: 'Answers every inbound call in a natural human voice. Handles objections, books appointments, and never puts a caller on hold. Never miss a lead during peak hours again.',
        badge: '24/7 calls',
    },
    {
        icon: GeoAnim,
        label: 'GEO Blog',
        title: 'GEO Blog AI Agent',
        desc: 'Stop writing manually. This agent researches trending topics, generates fully optimized articles, and posts directly to your website — hands-free.',
        badge: 'Auto-Publish',
    },
    {
        icon: CustomAutomationAnim,
        label: 'Custom Automation',
        title: 'Custom AI Automations',
        desc: 'Have a workflow that doesn\'t fit a template? We build exactly what your business needs. Talk to us.',
        badge: 'Contact Us',
    },
];

const HowItWorksSection = () => (
    <section className="py-12 relative overflow-hidden bg-teal-950">
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
                <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}>
                    Three AI agents. Zero missed leads.{' '}
                    <span style={{ color: T }}>Zero manual work.</span>
                </h2>
                <div className="mt-6 rounded-full" style={{ width: 48, height: 2, background: T }} />
                <p className="mt-6 text-base leading-relaxed text-teal-100">
                    Every enquiry answered. Every lead qualified. Every appointment booked — automatically across WhatsApp, phone, and your website.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-7xl mx-auto">
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
