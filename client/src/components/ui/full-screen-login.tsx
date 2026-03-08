"use client";

import { Bot as BotIcon, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";

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
        <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-slate-900">
            <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl">

                {/* Left side Image & Branding */}
                <div className="w-full md:w-1/2 relative overflow-hidden bg-black flex flex-col justify-end min-h-[400px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    <div className="relative z-10 p-8 md:p-12 text-white pb-16">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white shadow-sm">
                            Welcome back to Bitlance!
                        </h1>
                        <p className="mt-4 text-slate-300 text-lg">
                            Sign in to access your intelligent automation agents and continue building.
                        </p>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-20 text-slate-900 justify-center">
                    <div className="flex flex-col items-start mb-8">
                        <div className="text-indigo-600 mb-4 bg-indigo-50 p-3 rounded-xl inline-flex">
                            <BotIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">
                            Sign In
                        </h2>
                        <p className="text-left text-slate-500">
                            Access your AI agents
                        </p>
                    </div>

                    <form
                        className="flex flex-col gap-5"
                        onSubmit={handleSubmit}
                    >
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-slate-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="hi@bitlance.in"
                                    className="w-full pl-10 py-3 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-4 shadow-sm disabled:opacity-70 flex justify-center items-center"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="text-center text-slate-600 text-sm mt-4">
                            Don't have an account?{" "}
                            <a href="/signup" className="text-indigo-600 font-medium hover:underline">
                                Create account
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
