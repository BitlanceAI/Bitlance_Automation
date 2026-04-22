import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, CheckCircle2, User, Clock, ArrowRight } from 'lucide-react';

const CRMDashboardAnimation = () => {
    const [meetings, setMeetings] = useState([
        { id: 1, name: "Sarah Jenkins", type: "Property Viewing", time: "10:00 AM", status: "booked" },
        { id: 2, name: "Michael Chang", type: "Consultation", time: "11:30 AM", status: "booked" },
        { id: 3, name: "Emma Davis", type: "Follow-up Call", time: "2:00 PM", status: "booked" }
    ]);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callProgress, setCallProgress] = useState(0);

    // Simulation loop
    useEffect(() => {
        let timer;
        let timeoutIds = [];
        let mounted = true;

        const runSimulation = async () => {
            if (!mounted) return;
            // 1. Show Incoming Call
            setIsIncomingCall(true);
            setCallProgress(0);

            // Simulate call duration
            timer = setInterval(() => {
                setCallProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);

                        // 2. End call and book meeting
                        const t1 = setTimeout(() => {
                            if (!mounted) return;
                            setIsIncomingCall(false);
                            const newMeeting = {
                                id: `meeting-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                                name: "Alex Thompson",
                                type: "New Lead - Consult",
                                time: "4:00 PM",
                                status: "just_added"
                            };

                            setMeetings(prevMeetings => {
                                const updated = [newMeeting, ...prevMeetings].slice(0, 4); // Keep top 4
                                return updated;
                            });

                            // Remove 'just_added' status after animation
                            const t2 = setTimeout(() => {
                                if (!mounted) return;
                                setMeetings(current =>
                                    current.map(m => m.id === newMeeting.id ? { ...m, status: "booked" } : m)
                                );
                                // Restart simulation after a gap
                                const t3 = setTimeout(runSimulation, 3000);
                                timeoutIds.push(t3);
                            }, 1500);
                            timeoutIds.push(t2);

                        }, 500);
                        timeoutIds.push(t1);

                        return 100;
                    }
                    return prev + 5; // Fast progression for demo
                });
            }, 100);
        };

        const initialDelay = setTimeout(runSimulation, 2000);
        timeoutIds.push(initialDelay);

        return () => {
            mounted = false;
            clearInterval(timer);
            timeoutIds.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto mt-16 perspective-1000 relative z-20">
            {/* Glowing backdrop */}
            <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-3xl -z-10 transform rotate-2"></div>

            <motion.div
                initial={{ rotateX: 10, y: 20, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-[#0f0f13] border border-gray-200 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/20 flex flex-col md:flex-row"
            >
                {/* Left Sidebar: AI Call Agent Console */}
                <div className="w-full md:w-1/3 bg-[#17171c] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col relative overflow-hidden">
                    {/* Abstract soundwave background */}
                    {isIncomingCall && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full animate-ping z-0 pointer-events-none"></div>
                    )}

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500/20 border border-violet-500/30">
                            <Phone className="text-violet-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-black">AI Voice Agent</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-black/50">Online & Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        <AnimatePresence mode="wait">
                            {isIncomingCall ? (
                                <motion.div
                                    key="calling"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-4 relative">
                                        <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-full animate-[spin_3s_linear_infinite]"></div>
                                        <User className="text-indigo-400" size={28} />
                                    </div>
                                    <p className="text-sm font-medium text-black mb-1">Inbound Call</p>
                                    <p className="text-xs text-black/50 mb-6">Alex Thompson</p>

                                    {/* Call duration bar */}
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            style={{ width: `${callProgress}%` }}
                                        ></motion.div>
                                    </div>

                                    <div className="mt-4 text-xs font-mono text-indigo-300 bg-indigo-500/10 py-1.5 px-3 rounded-full inline-block">
                                        Handling Objections...
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Phone className="text-black/30" size={28} />
                                    </div>
                                    <p className="text-sm font-medium text-black">Waiting for calls...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Area: CRM Dashboard */}
                <div className="w-full md:w-2/3 p-6 bg-[#0f0f13] relative">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-semibold text-black text-lg flex items-center gap-2">
                                <Calendar className="text-gray-500" size={20} />
                                Upcoming Meetings
                            </h3>
                            <p className="text-xs text-black/50">Automatically synced from voice agent</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> CRM Synced
                        </div>
                    </div>

                    <div className="space-y-3 relative">
                        <AnimatePresence >
                            {meetings.map((meeting) => (
                                <motion.div
                                    key={meeting.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        backgroundColor: meeting.status === 'just_added' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                                        borderColor: meeting.status === 'just_added' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 0, 0, 0.05)'
                                    }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4 }}
                                    className={`p-4 mb-3 rounded-xl border flex items-center justify-between ${meeting.status === 'just_added' ? 'shadow-[0_0_20px_rgba(139,92,246,0.2)] z-10 relative' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meeting.status === 'just_added' ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-gray-500'}`}>
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-black text-sm">{meeting.name}</h4>
                                            <p className="text-xs text-black/50 mt-0.5">{meeting.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-black">
                                            <Clock size={14} className="text-gray-500" />
                                            {meeting.time}
                                        </div>
                                        {meeting.status === 'just_added' && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 bg-violet-500/20 px-2 py-1 rounded-md border border-violet-500/30"
                                            >
                                                New Booking
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Connecting line to show flow */}
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 hidden md:flex items-center z-20">
                        <motion.div
                            animate={{
                                x: [0, 5, 0],
                                color: isIncomingCall && callProgress === 100 ? '#a78bfa' : '#4b5563'
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ArrowRight size={24} className="text-black/30" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CRMDashboardAnimation;
