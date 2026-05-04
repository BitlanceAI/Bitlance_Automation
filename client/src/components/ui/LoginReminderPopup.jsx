import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
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
        const isClosed = localStorage.getItem('login_reminder_closed');
        if (!isClosed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 20000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('login_reminder_closed', 'true');
    };

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
                    <div
                        className={`relative overflow-hidden rounded-2xl backdrop-blur-2xl ${
                            isSmallScreen ? "p-5" : "p-6"
                        }`}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 20px 60px rgba(38,206,206,0.12), 0 4px 24px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Teal ambient glow */}
                        <div
                            className="absolute top-0 right-0 w-36 h-36 pointer-events-none"
                            style={{ background: 'var(--accent)', opacity: 0.06, filter: 'blur(50px)' }}
                        />
                        {/* Top accent line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.6 }}
                        />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 transition-colors"
                            style={{ color: 'var(--muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                        >
                            <X size={16} />
                        </button>

                        <div className="flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: 'var(--accent-muted)',
                                        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                                    }}
                                >
                                    <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
                                        Ready to scale?
                                    </h4>
                                    <p
                                        className="text-[11px] font-semibold uppercase tracking-widest"
                                        style={{ color: 'var(--accent)', opacity: 0.8 }}
                                    >
                                        Join 120+ Businesses
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                                Don't miss out on automated growth. Sign up or log in to access your custom AI dashboard.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col gap-2 mt-1">
                                <Link
                                    to="/login"
                                    className="btn-primary w-full py-3 rounded-xl text-center text-sm font-bold transition-all"
                                    style={{ display: 'block' }}
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full py-3 rounded-xl text-center text-sm font-semibold transition-all"
                                    style={{
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                        e.currentTarget.style.color = 'var(--accent)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.color = 'var(--text)';
                                    }}
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
