import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo.webp";
import {
    Home,
    Users,
    FileText,
    LayoutDashboard,
    LogOut,
    Sparkles,
    LogIn,
    Mail,
} from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, credits, isAdmin, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home',    path: '/',        icon: Home },
        { name: 'Agents',  path: '/agents',  icon: Users },
        { name: 'Pricing', path: '/pricing', icon: Sparkles },
        { name: 'Blog',    path: '/blogs',   icon: FileText },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    const isActive = (path) => location.pathname === path;

    /* Scrolled state — floating pill style */
    const scrolledClass = scrolled
        ? 'py-2.5 bg-[#0D0D1A]/85 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        : 'py-4 bg-transparent';

    return (
        <>
            {/* ── Top Navbar ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolledClass}`}>
                <div className="mx-auto px-5 flex justify-between items-center w-full max-w-7xl">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="Bitlance Home">
                        <img
                            src={Logo}
                            alt="Bitlance"
                            width="120"
                            height="40"
                            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:800;font-size:19px;color:#26CECE;">Bitlance</span>';
                            }}
                        />
                    </Link>

                    {/* Desktop nav links — centered pill container */}
                    <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2
                        px-2 py-1.5 rounded-2xl
                        bg-white/[0.06]
                        border border-white/[0.08]
                        backdrop-blur-md">
                        {navLinks.map(({ name, path, icon: Icon }) => (
                            <Link
                                key={name}
                                to={path}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive(path)
                                        ? 'bg-white/[0.12] text-[#26CECE] shadow-sm shadow-black/20'
                                        : 'text-slate-300 hover:text-[#26CECE] hover:bg-white/[0.08]'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive(path) ? 'text-[#26CECE]' : ''}`} />
                                {name}
                            </Link>
                        ))}
                        {user?.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    location.pathname.startsWith('/admin')
                                        ? 'bg-white/[0.12] text-[#26CECE] shadow-sm'
                                        : 'text-slate-300 hover:text-[#26CECE] hover:bg-white/[0.08]'
                                }`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">

                        {user ? (
                            <div className="flex items-center gap-2">
                                {/* Credits badge */}
                                <Link
                                    to={isAdmin ? "/admin/api-keys" : "/dashboard/api-keys"}
                                    className="px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 transition-all duration-200
                                        bg-[#26CECE]/[0.09] border-[#26CECE]/25 text-[#26CECE] hover:bg-[#26CECE]/[0.16]"
                                    title={isAdmin ? "Manage API Keys" : "View API Keys & Integrations"}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">
                                        {typeof credits === 'number' ? credits.toLocaleString() : credits} Credits
                                    </span>
                                </Link>
                                {/* Avatar */}
                                <div
                                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-[#070707] font-bold text-xs shadow-md flex-shrink-0"
                                    style={{ background: '#26CECE' }}
                                >
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-slate-200 hidden lg:block max-w-[90px] truncate">
                                    {user.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-2xl transition-all duration-200
                                        text-slate-400 hover:text-red-400 bg-white/[0.05] hover:bg-red-500/[0.08]
                                        border border-white/[0.07]"
                                    title="Logout"
                                    aria-label="Logout"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-2xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                                style={{ background: '#26CECE', color: '#070707', boxShadow: '0 4px 14px rgba(38,206,206,0.3)' }}
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile top-right: user */}
                    <div className="md:hidden flex items-center gap-2">
                        {user ? (
                            <div
                                className="w-8 h-8 rounded-2xl flex items-center justify-center text-[#070707] font-bold text-xs shadow-md"
                                style={{ background: '#26CECE' }}
                            >
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all"
                                style={{ background: '#26CECE', color: '#070707', boxShadow: '0 3px 10px rgba(38,206,206,0.28)' }}
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Mobile Bottom Navigation Bar ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <div className="h-5 bg-gradient-to-t from-[#0A0A12]/80 to-transparent pointer-events-none" />
                <div className="bg-[#0D0D1A]/95 backdrop-blur-xl
                    border-t border-white/[0.07]
                    shadow-[0_-6px_24px_rgba(0,0,0,0.45)]">
                    <div className="flex items-center justify-around px-2 pt-2.5 pb-5">
                        {navLinks.map(({ name, path, icon: Icon }) => {
                            const active = isActive(path);
                            return (
                                <Link
                                    key={name}
                                    to={path}
                                    className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                                    aria-label={name}
                                >
                                    <div className={`flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-300 ${
                                        active
                                            ? 'bg-teal-50 dark:bg-[#26CECE]/[0.12] scale-105'
                                            : 'group-hover:bg-slate-100 dark:group-hover:bg-white/[0.06]'
                                    }`}>
                                        <Icon
                                            className={`w-[20px] h-[20px] transition-all duration-300 ${
                                                active ? 'text-[#26CECE]' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#26CECE]'
                                            }`}
                                            strokeWidth={active ? 2.2 : 1.8}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-semibold tracking-wide leading-none transition-all duration-300 ${
                                        active ? 'text-[#26CECE]' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#26CECE]'
                                    }`}>
                                        {name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Admin */}
                        {user?.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                                aria-label="Admin"
                            >
                                <div className={`flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-300 ${
                                    location.pathname.startsWith('/admin')
                                        ? 'bg-teal-50 dark:bg-[#26CECE]/[0.12] scale-105'
                                        : 'group-hover:bg-slate-100 dark:group-hover:bg-white/[0.06]'
                                }`}>
                                    <LayoutDashboard
                                        className={`w-[20px] h-[20px] transition-all duration-300 ${
                                            location.pathname.startsWith('/admin') ? 'text-[#26CECE]' : 'text-slate-400 dark:text-slate-500 group-hover:text-[#26CECE]'
                                        }`}
                                        strokeWidth={location.pathname.startsWith('/admin') ? 2.2 : 1.8}
                                    />
                                </div>
                                <span className={`text-[10px] font-semibold tracking-wide leading-none transition-all duration-300 ${
                                    location.pathname.startsWith('/admin') ? 'text-[#26CECE]' : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                    Admin
                                </span>
                            </Link>
                        )}

                        {/* Logout */}
                        {user && (
                            <button
                                onClick={signOut}
                                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                                aria-label="Logout"
                            >
                                <div className="flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-300 group-hover:bg-red-50 dark:group-hover:bg-red-900/[0.12]">
                                    <LogOut
                                        className="w-[20px] h-[20px] text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition-colors duration-300"
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold tracking-wide leading-none text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition-colors duration-300">
                                    Logout
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
