import React, { useRef } from 'react';
import { Globe, Zap, Shield, BarChart3, Bot, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NumberTicker from '../ui/NumberTicker';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';
const T2 = '#1AA8A8';

// SVG animations — teal palette only
const StatAnim = ({ type }) => {
    if (type === 'chart') return (
        <svg viewBox="0 0 100 100" className="absolute -bottom-4 right-0 w-28 h-28 opacity-10 pointer-events-none">
            <defs>
                <linearGradient id="sg1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor={T} stopOpacity="0" />
                    <stop offset="100%" stopColor={T} />
                </linearGradient>
            </defs>
            {[{x:20,y:60,h:20,dur:2},{x:45,y:45,h:35,dur:2.5,d:.2},{x:70,y:20,h:60,dur:3,d:.4}].map((b,i)=>(
                <motion.rect key={i} x={b.x} y={b.y} width="10" height={b.h} fill="url(#sg1)" rx="2"
                    animate={{ height:[b.h,b.h+10,b.h], y:[b.y,b.y-10,b.y] }}
                    transition={{ repeat:Infinity, duration:b.dur, ease:'easeInOut', delay:b.d||0 }} />
            ))}
        </svg>
    );
    if (type === 'multiplier') return (
        <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.06] pointer-events-none">
            <defs>
                <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
                </linearGradient>
            </defs>
            <motion.circle cx="50" cy="50" r="28" fill="none" stroke="url(#sg2)" strokeWidth="4" strokeDasharray="20 10"
                animate={{rotate:360}} transition={{repeat:Infinity,duration:14,ease:'linear'}} style={{originX:'50px',originY:'50px'}} />
            <motion.circle cx="50" cy="50" r="40" fill="none" stroke="url(#sg2)" strokeWidth="2" strokeDasharray="12 18" opacity="0.5"
                animate={{rotate:-360}} transition={{repeat:Infinity,duration:20,ease:'linear'}} style={{originX:'50px',originY:'50px'}} />
        </svg>
    );
    return (
        <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-28 h-28 opacity-10 pointer-events-none">
            <defs>
                <linearGradient id="sg3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
                </linearGradient>
            </defs>
            <circle cx="70" cy="30" r="20" fill="none" stroke="url(#sg3)" strokeWidth="3" />
            <motion.line x1="70" y1="30" x2="70" y2="18" stroke="url(#sg3)" strokeWidth="3" strokeLinecap="round"
                animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}} style={{originX:'70px',originY:'30px'}} />
            <motion.circle cx="70" cy="30" r="20" fill="none" stroke="url(#sg3)" strokeWidth="2"
                animate={{scale:[1,2],opacity:[0.8,0]}} transition={{repeat:Infinity,duration:1.5,ease:'easeOut'}} />
        </svg>
    );
};

const StatCard = ({ delay, value, symbol, text, type, direction='up', start=0, contrast }) => {
    const ref = useRef(null);
    const x = useMotionValue(0); const y = useMotionValue(0);
    const xs = useSpring(x); const ys = useSpring(y);
    const rX = useTransform(ys,[-0.5,0.5],['6deg','-6deg']);
    const rY = useTransform(xs,[-0.5,0.5],['-6deg','6deg']);
    const mv = e => { const r=ref.current.getBoundingClientRect(); x.set((e.clientX-r.left)/r.width-0.5); y.set((e.clientY-r.top)/r.height-0.5); };
    const ml = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref} onMouseMove={mv}
            onMouseLeave={e => { ml(); e.currentTarget.style.borderColor = ''; }}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            transition={{ duration:0.45, delay }} viewport={{ once:true }}
            className="group relative p-7 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden transition-all duration-300
                bg-white/5 border border-white/10 hover:border-teal-400"
            style={{ rotateY:rY, rotateX:rX, transformStyle:'preserve-3d' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${T}40`)}
        >
            <StatAnim type={type} />

            {/* Number — DM Mono, teal */}
            <div style={{ transform:'translateZ(24px)', fontFamily:"'DM Mono',monospace", fontSize:42, fontWeight:500, color:T }}
                className="flex items-center relative z-10 mb-1">
                {symbol==='<' && <span className="mr-1 text-3xl" style={{ color:`${T}99` }}>&lt;</span>}
                {symbol==='+' && <span className="mr-0.5 text-3xl" style={{ color:`${T}99` }}>+</span>}
                <NumberTicker value={value} start={start} direction={direction} />
                {symbol!=='+' && symbol!=='<' && <span>{symbol}</span>}
            </div>

            <p style={{ transform:'translateZ(16px)', fontFamily:"'Space Grotesk',sans-serif" }}
                className="relative z-10 font-medium text-center text-sm max-w-[180px] leading-relaxed text-teal-50/90">
                {text}
            </p>
            {contrast && (
                <p style={{ transform:'translateZ(12px)', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.08em' }}
                    className="relative z-10 text-center mt-1 max-w-[180px] text-teal-200/60">
                    {contrast}
                </p>
            )}
        </motion.div>
    );
};

const SocialProofSection = () => (
    <section className="py-12 bg-teal-900 relative overflow-hidden">
        {/* Single teal glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none"
            style={{ background:`${T}0A` }} />

        <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Heading */}
            <div className="mb-20 max-w-2xl">
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.18em', color:T, textTransform:'uppercase' }}>
                    Results
                </span>
                <motion.h2
                    initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                    transition={{ duration:0.45 }} viewport={{ once:true }}
                    className="mt-4 text-3xl md:text-5xl font-black leading-tight text-white"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-0.03em' }}
                >
                    Real businesses. <br /><span style={{ color:T }}>Real numbers.</span>
                </motion.h2>
                <div className="mt-6 rounded-full" style={{ width:48, height:2, background:T }} />
                <motion.p
                    initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                    transition={{ duration:0.45, delay:0.15 }} viewport={{ once:true }}
                    className="mt-6 text-base leading-relaxed text-teal-100"
                >
                    Don't take our word for it — here's what happened when these teams stopped doing it manually.
                </motion.p>
            </div>

            {/* Stat cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto perspective-1000">
                <StatCard delay={0}   value={40} symbol="+" text="more enquiries handled without adding a single staff member."   type="chart" />
                <StatCard delay={0.1} value={2}  symbol="×" text="more booked appointments from the exact same ad spend." type="multiplier" />
                <StatCard delay={0.2} value={10} symbol="<" text="seconds response time — vs. the 8-hour industry avg." start={60} direction="down" type="time" />
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-2 gap-6 mb-24 max-w-6xl mx-auto">
                {[
                    "The AI Voice agent has changed lots of missed calls. Our staff finally have time to focus on what actually moves the needle.",
                    "We used to miss 20-30% of calls at peak time. Now every lead is answered and pre-qualified before it reaches our sales team. Game changer."
                ].map((quote, i) => (
                    <motion.div key={i}
                        initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                        transition={{ duration:0.45, delay: 0.3 + (i*0.1) }} viewport={{ once:true }}
                        className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
                    >
                        <p className="text-lg italic text-teal-50 mb-6 leading-relaxed">"{quote}"</p>
                    </motion.div>
                ))}
            </div>

            {/* Trust label */}
            <div className="text-center mb-10 text-teal-100" style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase' }}>
                Trusted by teams in real estate · healthcare · education · local services
            </div>

            {/* Logo marquee */}
            <div className="relative flex overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none
                    bg-gradient-to-r from-teal-900 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none
                    bg-gradient-to-l from-teal-900 to-transparent" />

                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap"
                    animate={{ x:[0,-1400] }} transition={{ repeat:Infinity, ease:'linear', duration:36 }}
                >
                    {[...Array(2)].map((_,i)=>(
                        <React.Fragment key={i}>
                            {[
                                { icon:Globe,      name:'GlobalRealty' },
                                { icon:Zap,        name:'MedCare' },
                                { icon:Shield,     name:'EduTech' },
                                { icon:BarChart3,  name:'ServicePro' },
                                { icon:Bot,        name:'AutoBot' },
                                { icon:CheckCircle,name:'LeadGenius' },
                                { icon:Award,      name:'TopTier' },
                                { icon:TrendingUp, name:'GrowthX' },
                            ].map(({ icon:Icon, name }) => (
                                <div key={name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-teal-50"
                                    style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18 }}>
                                    <Icon size={20} style={{ color:T }} />
                                    {name}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </ScrollReveal>
    </section>
);

export default SocialProofSection;
