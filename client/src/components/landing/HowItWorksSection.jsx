import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';      // logo teal — only accent
const T2 = '#1AA8A8';     // darker teal for SVG depth

// SVG per step — teal palette only
const StepAnim = ({ step }) => {
    if (step === 1) return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
            <defs>
                <linearGradient id="sh1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
                </linearGradient>
            </defs>
            {[{cx:30,cy:40,r:8,dy:-5,dur:3},{cx:70,cy:30,r:10,dy:6,dur:4},{cx:50,cy:70,r:6,dy:-8,dur:3.5}].map((c,i)=>(
                <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="url(#sh1)"
                    animate={{y:[0,c.dy,0]}} transition={{repeat:Infinity,duration:c.dur,ease:'easeInOut'}} />
            ))}
            {[[30,40,70,30],[70,30,50,70],[50,70,30,40]].map(([x1,y1,x2,y2],i)=>(
                <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#sh1)" strokeWidth="2" strokeDasharray="4 4"
                    animate={{strokeDashoffset:[0,i%2===0?20:-20]}} transition={{repeat:Infinity,duration:4,ease:'linear'}} />
            ))}
        </svg>
    );
    if (step === 2) return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
            <defs>
                <linearGradient id="sh2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
                </linearGradient>
            </defs>
            <motion.circle cx="50" cy="50" r="20" fill="none" stroke="url(#sh2)" strokeWidth="4" strokeDasharray="30 10"
                animate={{rotate:360}} transition={{repeat:Infinity,duration:8,ease:'linear'}} style={{originX:'50px',originY:'50px'}} />
            <motion.circle cx="50" cy="50" r="32" fill="none" stroke="url(#sh2)" strokeWidth="1.5" strokeDasharray="15 15" opacity="0.4"
                animate={{rotate:-360}} transition={{repeat:Infinity,duration:14,ease:'linear'}} style={{originX:'50px',originY:'50px'}} />
            <motion.rect x="45" y="45" width="10" height="10" rx="2" fill="url(#sh2)"
                animate={{scale:[1,1.3,1]}} transition={{repeat:Infinity,duration:3,ease:'easeInOut'}} style={{originX:'50px',originY:'50px'}} />
        </svg>
    );
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity overflow-visible">
            <defs>
                <linearGradient id="sh3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={T2} />
                </linearGradient>
            </defs>
            <motion.path d="M 10 70 Q 30 30 50 50 T 90 20" fill="none" stroke="url(#sh3)" strokeWidth="3" strokeLinecap="round"
                animate={{pathLength:[0,1],opacity:[0,1,0]}} transition={{repeat:Infinity,duration:3,ease:'easeInOut'}} />
            <motion.circle cx="90" cy="20" r="5" fill="url(#sh3)"
                animate={{scale:[0,1.5,0],opacity:[0,1,0]}} transition={{repeat:Infinity,duration:3,ease:'easeInOut',delay:1.5}} />
            <motion.circle cx="50" cy="50" r="10" fill="none" stroke="url(#sh3)" strokeWidth="1"
                animate={{scale:[1,5],opacity:[0.8,0]}} transition={{repeat:Infinity,duration:2,ease:'easeOut'}} />
        </svg>
    );
};

const Card3D = ({ step, title, desc }) => {
    const ref = useRef(null);
    const x = useMotionValue(0); const y = useMotionValue(0);
    const xs = useSpring(x); const ys = useSpring(y);
    const rX = useTransform(ys,[-0.5,0.5],['15deg','-15deg']);
    const rY = useTransform(xs,[-0.5,0.5],['-15deg','15deg']);
    const move = e => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left)/r.width - 0.5);
        y.set((e.clientY - r.top)/r.height - 0.5);
    };
    const leave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref} onMouseMove={move} onMouseLeave={leave}
            style={{ rotateY: rY, rotateX: rX, transformStyle:'preserve-3d' }}
            className="relative h-full min-h-[420px] w-full cursor-pointer group"
        >
            <div style={{ transform:'translateZ(60px)', transformStyle:'preserve-3d',
                background:'#111', border:'1px solid #1E1E1E', borderRadius:4 }}
                className="absolute inset-3 grid place-content-center transition-all duration-300 group-hover:border-[#26CECE33]">
                <div className="text-center p-6 flex flex-col items-center justify-between h-full"
                    style={{ transform:'translateZ(40px)' }}>
                    <div>
                        {/* Step number — DM Mono */}
                        <div className="w-14 h-14 mx-auto rounded flex items-center justify-center text-xl font-bold mb-6"
                            style={{ fontFamily:"'DM Mono',monospace", background:`${T}15`, border:`1px solid ${T}30`, color:T }}>
                            0{step}
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
                            {title}
                        </h3>
                        <p className="text-white/50 text-sm max-w-[230px] mx-auto leading-relaxed">{desc}</p>
                    </div>
                    {/* Anim box */}
                    <div className="h-36 w-full mt-6 rounded flex items-center justify-center relative overflow-hidden"
                        style={{ background:'#0A0A0A', border:'1px solid #1E1E1E' }}>
                        <div className="w-20 h-20 relative z-10"><StepAnim step={step} /></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const HowItWorksSection = () => (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#070707]">
        <ScrollReveal className="max-w-7xl mx-auto px-6">
            {/* Heading */}
            <div className="mb-20 max-w-2xl">
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.18em', color:'#555', textTransform:'uppercase' }}>
                    Process
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-0.03em' }}>
                    Go live in{' '}
                    <span style={{ color: T }}>3 simple steps</span>
                </h2>
                <div className="mt-6" style={{ width:48, height:2, background:T }} />
                <p className="mt-6 text-base text-white/40 leading-relaxed">
                    We handle the complexity. You get a fully trained AI agent ready to close deals.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-10 relative z-10 max-w-6xl mx-auto">
                {[
                    { step:1, title:'Strategy & Script',    desc:'We analyse your business and map out conversational flows that convert.' },
                    { step:2, title:'Setup & Integrations', desc:'We connect the AI to your phone, website, CRM, and calendar instantly.' },
                    { step:3, title:'Launch & Optimise',    desc:'Go live. We monitor performance and tweak the AI for maximum ROI.' },
                ].map(item => <Card3D key={item.step} {...item} />)}
            </div>

            {/* Subtle teal background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] -z-0 pointer-events-none"
                style={{ background:`${T}08` }} />
        </ScrollReveal>
    </section>
);

export default HowItWorksSection;
