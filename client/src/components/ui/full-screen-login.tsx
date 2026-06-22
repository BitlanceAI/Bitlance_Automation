"use client";

import { Bot as BotIcon, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { ElegantShape } from "./shape-landing-hero";
import { MeshGradient } from "@paper-design/shaders-react";

const TEAL = '#26CECE';

interface FullScreenLoginProps {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

export const FullScreenLogin = ({
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    loading
}: FullScreenLoginProps) => {
    const [showPassword, setShowPassword] = useState(false);

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
            
            <div className="w-full relative z-10 max-w-6xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-md">

                {/* Left side Image & Branding */}
                <div className="w-full md:w-1/2 relative overflow-hidden bg-black/10 flex flex-col justify-end min-h-[400px] border-b md:border-b-0 md:border-r border-white/10">
                    {/* Animated Shapes Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                        <ElegantShape
                            delay={0.3}
                            width={600}
                            height={140}
                            rotate={12}
                            gradient="from-[#26CECE]/[0.3]"
                            className="left-[-15%] top-[15%]"
                        />
                        <ElegantShape
                            delay={0.5}
                            width={500}
                            height={120}
                            rotate={-15}
                            gradient="from-[#26CECE]/[0.2]"
                            className="right-[-10%] top-[70%]"
                        />
                    </div>

                    <div className="relative z-10 p-8 md:p-12 text-white pb-16">
                        <div style={{ fontFamily: "'DM Mono', monospace", color: TEAL, fontSize: 11, letterSpacing: '0.14em', marginBottom: 16 }}>
                            SECURE ACCESS
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                            Welcome back to<br />
                            <span style={{ color: TEAL }}>Bitlance.</span>
                        </h1>
                        <p className="text-teal-50/90 text-lg leading-relaxed">
                            Sign in to access your intelligent automation agents and continue building.
                        </p>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-black/20 z-20 text-white justify-center">
                    <div className="flex flex-col items-start mb-8">
                        <div className="mb-6 flex items-center justify-center w-12 h-12" style={{ background: `${TEAL}25`, border: `1px solid ${TEAL}40`, borderRadius: 12, color: TEAL }}>
                            <BotIcon size={24} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            Sign In
                        </h2>
                        <p className="text-teal-100" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                            Access your AI agents
                        </p>
                    </div>

                    <form
                        className="flex flex-col gap-6"
                        onSubmit={handleSubmit}
                    >
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-widest font-bold mb-2 text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="hi@bitlance.in"
                                    className="w-full pl-11 py-3 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-xs uppercase tracking-widest font-bold mb-2 text-teal-100" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-11 py-3 px-3 focus:outline-none transition-all rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-100/50" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-100/50 hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-bold py-3.5 px-4 rounded-lg bg-white text-teal-800 hover:bg-teal-50 focus:ring-4 focus:ring-teal-500/30 transition-all mt-4 flex justify-center items-center hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>

                        <div className="text-center text-teal-100/80 text-sm mt-4">
                            Don't have an account?{" "}
                            <a href="/signup" className="font-bold text-white hover:underline transition-colors">
                                Create account
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
