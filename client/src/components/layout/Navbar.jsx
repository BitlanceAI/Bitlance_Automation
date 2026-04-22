import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Logo from "../../assets/logo.webp";
import {
    Home,
    Users,
    FileText,
    LayoutDashboard,
    LogOut,
    Sparkles,
    LogIn,
    ChevronDown,
    Mail,
    Sun,
    Moon,
} from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, credits, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home',    path: '/',        icon: Home },
        { name: 'Agents',  path: '/agents',  icon: Users },
        { name: 'Blog',    path: '/blogs',   icon: FileText },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* ── Top Navbar ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'py-5 bg-transparent'
            }`}>
                <div className="mx-auto px-6 flex justify-between items-center w-full max-w-7xl">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img
                            src={Logo}
                            alt="Bitlance"
                            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:20px;color:#26CECE;">Bitlance</span>';
                            }}
                        />
                    </Link>

                    {/* Desktop nav links — centered */}
                    <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map(({ name, path, icon: Icon }) => (
                            <Link
                                key={name}
                                to={path}
                                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 group ${
                                    isActive(path)
                                        ? 'text-[#26CECE] dark:text-[#26CECE]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-[#26CECE] dark:hover:text-[#26CECE]'
                                }`}
                            >
                                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive(path) ? 'scale-110' : ''}`} />
                                {name}
                            </Link>
                        ))}
                        {user?.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 group ${
                                    location.pathname.startsWith('/admin')
                                        ? 'text-[#26CECE]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-[#26CECE]'
                                }`}
                            >
                                <LayoutDashboard className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden md:flex items-center gap-3">


                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Credits badge */}
                                <div className="bg-[#26CECE]/10 px-3 py-1.5 rounded-lg border border-[#26CECE]/20 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#26CECE]" />
                                    <span className="text-sm font-semibold text-[#26CECE]">
                                        {credits} Credits
                                    </span>
                                </div>
                                {/* Avatar */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#070707] font-bold text-xs shadow-md"
                                    style={{ background: '#26CECE' }}
                                >
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:block">
                                    {user.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-medium transition-colors group"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span className="hidden lg:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                                style={{ background: '#26CECE', color: '#070707' }}
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile top-right: theme + user avatar / login */}
                    <div className="md:hidden flex items-center gap-2">

                        {user ? (
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#070707] font-bold text-xs shadow-md"
                                style={{ background: '#26CECE' }}
                            >
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                                style={{ background: '#26CECE', color: '#070707' }}
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
                {/* Gradient fade at top edge for depth */}
                <div className="h-4 bg-gradient-to-t from-white/60 dark:from-[#0A0A0A]/60 to-transparent pointer-events-none" />
                <div className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200/80 dark:border-[#1E1E1E] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-around px-1 pt-2 pb-4">
                        {navLinks.map(({ name, path, icon: Icon }) => {
                            const active = isActive(path);
                            return (
                                <Link
                                    key={name}
                                    to={path}
                                    className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                                >
                                    {/* Icon container */}
                                    <div className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300 ${
                                        active
                                            ? 'bg-[#26CECE]/15 scale-105'
                                            : 'group-hover:bg-gray-100 dark:group-hover:bg-[#1A1A1A]'
                                    }`}>
                                        <Icon
                                            className={`w-[22px] h-[22px] transition-all duration-300 ${
                                                active
                                                    ? 'text-[#26CECE]'
                                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-[#26CECE]'
                                            }`}
                                            strokeWidth={active ? 2.2 : 1.8}
                                        />
                                    </div>
                                    {/* Label */}
                                    <span className={`text-[10px] font-semibold tracking-wide leading-none transition-all duration-300 ${
                                        active
                                            ? 'text-[#26CECE]'
                                            : 'text-gray-400 dark:text-gray-500 group-hover:text-[#26CECE]'
                                    }`}>
                                        {name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Admin link (only for admin user) */}
                        {user?.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                            >
                                <div className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300 ${
                                    location.pathname.startsWith('/admin')
                                        ? 'bg-[#26CECE]/15 scale-105'
                                        : 'group-hover:bg-gray-100 dark:group-hover:bg-[#1A1A1A]'
                                }`}>
                                    <LayoutDashboard
                                        className={`w-[22px] h-[22px] transition-all duration-300 ${
                                            location.pathname.startsWith('/admin')
                                                ? 'text-[#26CECE]'
                                                : 'text-gray-400 dark:text-gray-500 group-hover:text-[#26CECE]'
                                        }`}
                                        strokeWidth={location.pathname.startsWith('/admin') ? 2.2 : 1.8}
                                    />
                                </div>
                                <span className={`text-[10px] font-semibold tracking-wide leading-none transition-all duration-300 ${
                                    location.pathname.startsWith('/admin')
                                        ? 'text-[#26CECE]'
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    Admin
                                </span>
                            </Link>
                        )}

                        {/* Logout (only when logged in) */}
                        {user && (
                            <button
                                onClick={signOut}
                                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                            >
                                <div className="flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300 group-hover:bg-red-50 dark:group-hover:bg-red-900/10">
                                    <LogOut
                                        className="w-[22px] h-[22px] text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors duration-300"
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold tracking-wide leading-none text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors duration-300">
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
