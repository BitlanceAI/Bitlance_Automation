"use client";

import { Bot as BotIcon, Mail, User, Phone, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { ElegantShape } from "./shape-landing-hero";
import { MeshGradient } from "@paper-design/shaders-react";

const TEAL = '#26CECE';

interface FullScreenSignupProps {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    success: string;
}

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (pw.length === 0) return { label: '', color: '#333', width: '0%' };
    if (pw.length < 6)   return { label: 'Too short', color: '#ef4444', width: '25%' };
    if (pw.length < 10)  return { label: 'Weak', color: '#f97316', width: '50%' };
    if (pw.length < 14 || !/[0-9]/.test(pw)) return { label: 'Good', color: '#eab308', width: '75%' };
    return { label: 'Strong', color: TEAL, width: '100%' };
}

export const FullScreenSignup = ({
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success
}: FullScreenSignupProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const markTouched = (name: string) =>
        setTouched(prev => ({ ...prev, [name]: true }));

    const emailInvalid = touched.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordShort = touched.password && formData.password && formData.password.length < 6;
    const strength = getPasswordStrength(formData.password);

    const fieldBorder = (name: string, invalid?: boolean) => {
        if (invalid) return '#ef4444';
        if (touched[name] && formData[name]) return TEAL;
        return 'rgba(94, 234, 212, 0.2)';
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-auto p-4 sm:p-8 bg-teal-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <MeshGradient
                    speed={0.6}
                    colors={["#26CECE", "#1AA8A8", "#0d5c5c", "#178282"]}
                    distortion={0.8}
                    swirl={0.1}
                    grainMixer={0.15}
                    grainOverlay={0}
                    style={{ height: "100%", width: "100%" }}
                />
            </div>

            <div className="w-full relative z-10 max-w-7xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-md">

                {/* Left side — Branding */}
                <div className="w-full md:w-1/2 relative overflow-hidden bg-black/10 flex flex-col justify-end min-h-[400px] border-b md:border-b-0 md:border-r border-white/10">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                        <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-[#26CECE]/[0.3]" className="left-[-15%] top-[15%]" />
                        <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-[#26CECE]/[0.2]" className="right-[-10%] top-[70%]" />
                    </div>

                    <div className="relative z-10 p-8 md:p-10 text-white pb-12">
                        <div style={{ fontFamily: "'DM Mono', monospace", color: TEAL, fontSize: 11, letterSpacing: '0.14em', marginBottom: 16 }}>
                            START AUTOMATING IN 60 SECONDS
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                            Your leads answered. Your calendar filled. On autopilot.
                        </h1>
                        <p className="text-teal-50/90 text-lg leading-relaxed">
                            Create your free account and get 50 credits instantly — enough to start qualifying leads and booking appointments today. No credit card. No setup fees.
                        </p>
                    </div>
                </div>

                {/* Right side — Form */}
                <div className="p-8 md:p-10 md:w-1/2 flex flex-col bg-black/20 z-20 text-white justify-center">
                    <div className="flex flex-col items-start mb-6">
                        <div className="mb-4 flex items-center justify-center w-10 h-10" style={{ background: `${TEAL}25`, border: `1px solid ${TEAL}40`, borderRadius: 12, color: TEAL }}>
                            <BotIcon size={24} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
                        <p className="text-teal-100" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                            Takes less than 60 seconds · No credit card required
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 flex items-start gap-3" style={{ background: '#ef444425', border: '1px solid #ef444450', borderRadius: 8, color: '#fca5a5' }}>
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}


                    <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>

                        {/* Email — first, lowest friction */}
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-widest font-bold mb-2 text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="you@yourcompany.com"
                                    autoComplete="email"
                                    className="w-full pl-11 py-2.5 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    style={{ border: `1px solid ${fieldBorder('email', emailInvalid)}` }}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = emailInvalid ? '#ef4444' : TEAL}
                                    onBlur={(e) => { markTouched('email'); e.target.style.borderColor = fieldBorder('email', emailInvalid); }}
                                    required
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                            </div>
                            {emailInvalid && (
                                <p className="mt-1 text-xs text-red-400">Enter a valid email address</p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-xs uppercase tracking-widest font-bold mb-2 text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Your full name"
                                    autoComplete="name"
                                    className="w-full pl-11 py-2.5 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    style={{ border: `1px solid ${fieldBorder('name')}` }}
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => { markTouched('name'); e.target.style.borderColor = fieldBorder('name'); }}
                                    required
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                            </div>
                        </div>

                        {/* Phone — with context explaining why it's needed */}
                        <div>
                            <label htmlFor="phone" className="block text-xs uppercase tracking-widest font-bold mb-2 text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+91 98765 43210"
                                    autoComplete="tel"
                                    className="w-full pl-11 py-2.5 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    style={{ border: `1px solid ${fieldBorder('phone')}` }}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => { markTouched('phone'); e.target.style.borderColor = fieldBorder('phone'); }}
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                            </div>
                            <p className="mt-1 text-xs text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
                                {'We\'ll only use this to get your agent live faster.'}
                            </p>
                        </div>

                        {/* Password — with strength meter and upfront hint */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs uppercase tracking-widest font-bold text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                    Create a password
                                </label>
                                <span className="text-xs text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>At least 6 characters</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-11 py-2.5 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    style={{ border: `1px solid ${fieldBorder('password', passwordShort)}` }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = passwordShort ? '#ef4444' : TEAL}
                                    onBlur={(e) => { markTouched('password'); e.target.style.borderColor = fieldBorder('password', passwordShort); }}
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-100/50 hover:text-white"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Strength meter */}
                            {formData.password.length > 0 && (
                                <div className="mt-2">
                                    <div className="h-1 w-full rounded-full bg-teal-950/60">
                                        <div
                                            className="h-1 rounded-full transition-all duration-300"
                                            style={{ width: strength.width, background: strength.color }}
                                        />
                                    </div>
                                    {strength.label && (
                                        <p className="mt-1 text-xs" style={{ color: strength.color, fontFamily: "'DM Mono', monospace" }}>
                                            {strength.label}
                                        </p>
                                    )}
                                </div>
                            )}
                            {passwordShort && (
                                <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters</p>
                            )}
                        </div>

                        <div className="text-sm font-bold p-4 text-center mt-2 flex items-center justify-center gap-2" style={{ background: `${TEAL}25`, border: `1px solid ${TEAL}40`, borderRadius: 8, color: TEAL }}>
                            🎁 <span className="text-white">You start with <strong>50 free credits</strong>. No catch.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-bold py-3 px-4 rounded-lg bg-white text-teal-800 hover:bg-teal-50 focus:ring-4 focus:ring-teal-500/30 transition-all mt-2 flex justify-center items-center hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'CLAIMING CREDITS...' : 'Claim My 50 Free Credits →'}
                        </button>

                        <div className="text-center text-[10px] mt-2 text-teal-100/50" style={{ fontFamily: "'DM Mono', monospace" }}>
                            60-SECOND SETUP · NO CREDIT CARD · CANCEL ANY TIME · LIVE IN 48 HOURS
                        </div>

                        <div className="text-center text-teal-100/80 text-sm mt-4">
                            Already have an account?{" "}
                            <a href="/login" className="font-bold text-white hover:underline transition-colors">
                                Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Success Modal */}
            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-6">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 mb-8 font-medium">{success}</p>
                        <a 
                            href="/login" 
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-teal-500/30 text-center"
                        >
                            Go to Login
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};
