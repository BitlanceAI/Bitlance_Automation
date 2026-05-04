import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Phone, 
    Calendar, 
    CheckCircle2, 
    Facebook, 
    MessageSquare,
    User,
    ArrowRight,
    Loader2
} from 'lucide-react';

const ProductDemoAnimation = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            id: 'lead',
            icon: <Facebook className="text-blue-500" size={28} />,
            title: "Meta Ads Lead",
            subtitle: "Phase 01 / Capture",
            duration: 4000,
            content: (
                <div className="space-y-3 w-full px-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 border border-indigo-500/30 rounded-lg bg-indigo-500/5"
                    >
                        <User size={16} className="text-indigo-400" />
                        <div className="flex-1 space-y-1">
                            <div className="h-1 w-10 bg-indigo-500/20 rounded" />
                            <p className="text-xs text-black/90 font-mono">John Smith</p>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                        <Phone size={16} className="text-black/20" />
                        <div className="flex-1 space-y-1">
                            <div className="h-1 w-14 bg-white/5 rounded" />
                            <p className="text-xs text-black/50 font-mono">+1 (234) XXX-XXXX</p>
                        </div>
                    </motion.div>
                </div>
            )
        },
        {
            id: 'call',
            icon: (
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-4 border-2 border-indigo-500 rounded-full"
                >
                    <Phone className="text-indigo-500" size={28} />
                </motion.div>
            ),
            title: "AI Calling Lead",
            subtitle: "Phase 02 / Outreach",
            duration: 4000,
            content: (
                <div className="flex flex-col items-center w-full py-2">
                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    height: [6, 24, 6],
                                    opacity: [0.2, 1, 0.2]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.1 
                                }}
                                className="w-1 bg-indigo-500 rounded-full"
                            />
                        ))}
                    </div>
                    <motion.p 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase mb-3"
                    >
                        Active Dialing
                    </motion.p>
                    <div className="w-full h-px bg-white/5 relative">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4, ease: "linear" }}
                            className="absolute inset-0 bg-indigo-500/40"
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'conv',
            icon: <MessageSquare className="text-black" size={28} />,
            title: "Live Conversation",
            subtitle: "Phase 03 / Qualify",
            duration: 5000,
            content: (
                <div className="space-y-3 w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="border border-indigo-500/40 p-3 rounded-xl rounded-tl-none bg-indigo-500/5 max-w-[85%]"
                    >
                        <p className="text-[10px] text-black/90 font-mono leading-tight">
                            <span className="text-indigo-400 mr-1">[BOT]</span>
                            "Confirmed interest. Schedule meeting?"
                        </p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 }}
                        className="border border-gray-200 p-3 rounded-xl rounded-tr-none ml-auto max-w-[85%]"
                    >
                        <p className="text-[10px] text-black/50 font-mono leading-tight">
                            <span className="text-black/20 mr-1">[USER]</span>
                            "Yes, Tuesday works."
                        </p>
                    </motion.div>
                </div>
            )
        },
        {
            id: 'meeting',
            icon: <Calendar className="text-emerald-500" size={28} />,
            title: "Meeting Booked",
            subtitle: "Phase 04 / Finalize",
            duration: 4000,
            content: (
                <div className="flex flex-col items-stretch w-full gap-3">
                    <motion.div 
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 border border-emerald-500/30 rounded-2xl bg-emerald-500/5 flex flex-col items-center gap-3"
                    >
                        <div className="relative">
                           <div className="w-10 h-10 border border-emerald-500/50 rounded-full flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.5 }}
                                >
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                </motion.div>
                           </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-tighter mb-0.5">Confirmation OK</p>
                            <p className="text-base text-black font-black">TUE @ 10:00 AM</p>
                        </div>
                    </motion.div>
                    <div className="h-1 border border-white/5 rounded bg-white/5 mx-6" />
                </div>
            )
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, steps[activeStep].duration);
        return () => clearTimeout(timer);
    }, [activeStep]);

    return (
        <div className="relative w-full max-w-[420px] mx-auto min-h-[420px] flex flex-col items-center justify-center p-6 overflow-visible bg-transparent">
            
            {/* Transparent and integrated stage features */}
            <div className="absolute inset-x-0 top-0 bottom-4 overflow-hidden pointer-events-none">
                {/* Grid Overlay - extremely subtle */}
                <div className="absolute inset-0 opacity-20" style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }} />
            </div>

            {/* Animation Stage */}
            <div className="relative w-full z-10 -mt-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full"
                    >
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-6 px-4 font-mono text-[9px] text-black/10 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                                <span>Core_Sys_v0.2</span>
                            </div>
                            <span>DATA_0{activeStep + 1}</span>
                        </div>

                        {/* Card Component */}
                        <div className="w-full flex flex-col items-center px-4">
                            <div className="mb-4">
                                {steps[activeStep].icon}
                            </div>
                            
                            <h3 className="text-black font-black text-xl uppercase tracking-tighter mb-0.5">
                                {steps[activeStep].title}
                            </h3>
                            <p className="text-[9px] text-indigo-400 uppercase font-mono tracking-[0.2em] mb-6">
                                {steps[activeStep].subtitle}
                            </p>

                            <div className="w-full min-h-[180px] flex flex-col items-center justify-center p-5 border border-gray-200 bg-white/[0.02] backdrop-blur-sm rounded-[1.5rem] relative overflow-hidden">
                                {steps[activeStep].content}

                                {/* Integrated Progress Bar */}
                                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/5">
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        key={activeStep}
                                        transition={{ duration: steps[activeStep].duration / 1000, ease: "linear" }}
                                        className="h-full bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductDemoAnimation;
