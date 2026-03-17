import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginReminderPopup = ({ chatbotOpen }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth <= 780);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        // Check if user has already closed the reminder
        const isClosed = localStorage.getItem('login_reminder_closed');

        if (!isClosed) {
            // Show popup after 20 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 20000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Persist the choice to hide it
        localStorage.setItem('login_reminder_closed', 'true');
    };

    // On mobile/tablet, if the chatbot is open, hide the popup
    const shouldShow = isVisible && !(isSmallScreen && chatbotOpen);

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9, x: -50 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`fixed z-[100] transition-all duration-300 ${
                        isSmallScreen 
                        ? "bottom-4 left-4 right-4 w-auto" 
                        : "bottom-8 left-8 right-auto w-full max-w-[320px]"
                    }`}
                >
                    <div className={`relative bg-[#151515]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${
                        isSmallScreen ? "p-5" : "p-6"
                    }`}>
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Sparkles className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm tracking-tight">Ready to scale?</h4>
                                    <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider">Join 120+ businesses</p>
                                </div>
                            </div>

                            <p className="text-white/70 text-sm leading-relaxed">
                                Don't miss out on automated growth. Sign up or log in to access your custom AI dashboard.
                            </p>

                            <div className="flex flex-col gap-2 mt-2">
                                <Link
                                    to="/login"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-center text-sm transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-center text-sm transition-all border border-white/5"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginReminderPopup;
