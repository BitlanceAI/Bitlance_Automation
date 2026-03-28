"use client";

import { Bot as BotIcon, Mail, User, Phone, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { ElegantShape } from "./shape-landing-hero";

const TEAL = '#26CECE';

interface FullScreenSignupProps {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    success: string;
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

    return (
        <div className="min-h-screen flex items-center justify-center overflow-auto p-4 bg-[#070707]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl my-8" style={{ borderRadius: 2, border: '1px solid #1E1E1E' }}>

                {/* Left side Image & Branding */}
                <div className="w-full md:w-1/2 relative overflow-hidden bg-[#0a0a0a] flex flex-col justify-end min-h-[400px] border-b md:border-b-0 md:border-r border-[#1E1E1E]">
                    {/* Animated Shapes Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <ElegantShape
                            delay={0.3}
                            width={600}
                            height={140}
                            rotate={12}
                            gradient="from-[#26CECE]/[0.15]"
                            className="left-[-15%] top-[15%]"
                        />
                        <ElegantShape
                            delay={0.5}
                            width={500}
                            height={120}
                            rotate={-15}
                            gradient="from-[#26CECE]/[0.10]"
                            className="right-[-10%] top-[70%]"
                        />
                        <ElegantShape
                            delay={0.7}
                            width={300}
                            height={80}
                            rotate={-8}
                            gradient="from-indigo-500/[0.15]"
                            className="left-[5%] bottom-[10%]"
                        />
                    </div>

                    {/* Brutalist Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(${TEAL} 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                    <div className="relative z-10 p-8 md:p-12 text-white pb-16">
                        <div style={{ fontFamily: "'DM Mono', monospace", color: TEAL, fontSize: 11, letterSpacing: '0.14em', marginBottom: 16 }}>
                            AGENT DEPLOYMENT
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                            Build AI Agents that Close Deals.
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Bitlance Platform gives you the tools to build, deploy, and scale intelligent automation.
                        </p>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-[#111111] z-20 text-white justify-center">
                    <div className="flex flex-col items-start mb-8">
                        <div className="mb-6 flex items-center justify-center w-12 h-12" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}40`, borderRadius: 2, color: TEAL }}>
                            <BotIcon size={24} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            Create Account
                        </h2>
                        <p className="text-[#888]" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                            Welcome to Bitlance Platform
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 flex items-start gap-3" style={{ background: '#ef444415', border: '1px solid #ef444450', borderRadius: 2, color: '#fca5a5' }}>
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 flex items-start gap-3" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}50`, borderRadius: 2, color: TEAL }}>
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-bold">{success}</span>
                        </div>
                    )}

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-xs uppercase tracking-widest font-bold mb-2 text-[#888]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="w-full pl-11 py-3 px-3 focus:outline-none transition-all"
                                    style={{ background: '#070707', border: '1px solid #222', borderRadius: 2, color: '#EFEFEF' }}
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => e.target.style.borderColor = '#222'}
                                    required
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-xs uppercase tracking-widest font-bold mb-2 text-[#888]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+1 234 567 8900"
                                    className="w-full pl-11 py-3 px-3 focus:outline-none transition-all"
                                    style={{ background: '#070707', border: '1px solid #222', borderRadius: 2, color: '#EFEFEF' }}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => e.target.style.borderColor = '#222'}
                                    required
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-widest font-bold mb-2 text-[#888]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="hi@bitlance.in"
                                    className="w-full pl-11 py-3 px-3 focus:outline-none transition-all"
                                    style={{ background: '#070707', border: '1px solid #222', borderRadius: 2, color: '#EFEFEF' }}
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => e.target.style.borderColor = '#222'}
                                    required
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-xs uppercase tracking-widest font-bold mb-2 text-[#888]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Create new password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-11 py-3 px-3 focus:outline-none transition-all"
                                    style={{ background: '#070707', border: '1px solid #222', borderRadius: 2, color: '#EFEFEF' }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.borderColor = TEAL}
                                    onBlur={(e) => e.target.style.borderColor = '#222'}
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888]"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="text-sm font-bold p-4 text-center mt-2 flex items-center justify-center gap-2" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}40`, borderRadius: 2, color: TEAL }}>
                            🎁 <span>New accounts get <strong>50 free credits</strong> to start!</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-bold py-4 px-4 transition-all mt-2 flex justify-center items-center hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
                            style={{ background: TEAL, color: '#070707', border: 'none', borderRadius: 2 }}
                        >
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT & CLAIM 50 CREDITS'}
                        </button>

                        <div className="text-center text-xs mt-2 text-[#888]" style={{ fontFamily: "'DM Mono', monospace" }}>
                            🔒 100% FREE · NO CREDIT CARD REQUIRED
                        </div>

                        <div className="text-center text-[#888] text-sm mt-4">
                            Already have an account?{" "}
                            <a href="/login" className="font-bold hover:underline" style={{ color: TEAL }}>
                                Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
