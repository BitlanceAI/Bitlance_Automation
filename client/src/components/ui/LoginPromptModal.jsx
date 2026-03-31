import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose, agentTitle }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-md pointer-events-auto overflow-hidden rounded-2xl"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 24px 80px rgba(38,206,206,0.15), 0 8px 32px rgba(0,0,0,0.6)',
                            }}
                        >
                            {/* Top teal accent line */}
                            <div
                                className="absolute top-0 left-0 right-0 h-[2px]"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                                }}
                            />
                            {/* Ambient glow */}
                            <div
                                className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none"
                                style={{ background: 'var(--accent)', opacity: 0.07, filter: 'blur(60px)' }}
                            />

                            <div className="p-8 relative">
                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-5 right-5 transition-colors"
                                    style={{ color: 'var(--muted)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                                >
                                    <X size={18} />
                                </button>

                                {/* Lock icon */}
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: 'var(--accent-muted)',
                                            border: '1px solid rgba(38,206,206,0.25)',
                                        }}
                                    >
                                        <Lock size={28} style={{ color: 'var(--accent)' }} />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="text-center mb-6">
                                    <h2
                                        className="text-xl font-bold mb-2 font-['Space_Grotesk'] uppercase tracking-tight"
                                        style={{ color: 'var(--text)' }}
                                    >
                                        Login Required
                                    </h2>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                                        {agentTitle
                                            ? <>Sign in to start using <span style={{ color: 'var(--accent)' }} className="font-semibold">{agentTitle}</span>.</>
                                            : 'Sign in to access this agent and all automation tools.'
                                        }
                                    </p>
                                </div>

                                {/* CTAs */}
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to="/login"
                                        className="btn-primary w-full py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                        style={{ display: 'flex' }}
                                    >
                                        <LogIn size={16} />
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="w-full py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 transition-all"
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
                                        <UserPlus size={16} />
                                        Create Free Account
                                    </Link>
                                </div>

                                <p className="text-center text-xs mt-5" style={{ color: 'var(--muted)' }}>
                                    Free to join · No credit card required
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginPromptModal;
