"use client";

import { Bot as BotIcon, Mail, User, Phone, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import React, { useState } from "react";

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
                            Build AI Agents that Close Deals & Support Customers 24/7.
                        </h1>
                        <p className="mt-4 text-slate-300 text-lg">
                            Bitlance Platform gives you the tools to build, deploy, and scale intelligent automation.
                        </p>
                    </div>
                </div>

                {/* Right side form */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-20 text-slate-900">
                    <div className="flex flex-col items-start mb-8">
                        <div className="text-indigo-600 mb-4 bg-indigo-50 p-3 rounded-xl inline-flex">
                            <BotIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">
                            Create Account
                        </h2>
                        <p className="text-left text-slate-500">
                            Welcome to Bitlance Platform — Let's get started
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800">
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-slate-700">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="w-full pl-10 py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1.5 text-slate-700">
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+1 234 567 8900"
                                    className="w-full pl-10 py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

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
                                    className="w-full pl-10 py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-slate-700">
                                Create new password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.password}
                                    onChange={handleChange}
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



                        <div className="text-sm text-slate-600 bg-indigo-50/50 p-4 rounded-xl text-center border border-indigo-100 mt-2">
                            🎁 New accounts get <strong className="text-indigo-700">50 free credits</strong> to start!
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-2 shadow-sm disabled:opacity-70 flex justify-center items-center"
                        >
                            {loading ? 'Creating Account...' : 'Create Account & Claim 50 Credits'}
                        </button>

                        <div className="text-center text-xs text-slate-500 mt-2">
                            🔒 100% Free · No credit card required
                        </div>

                        <div className="text-center text-slate-600 text-sm mt-4">
                            Already have an account?{" "}
                            <a href="/login" className="text-indigo-600 font-medium hover:underline">
                                Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
