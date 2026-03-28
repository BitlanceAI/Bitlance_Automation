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
    Menu,
    X,
    LogIn,
    ChevronDown,
    Mail,
    Sun,
    Moon,
} from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, credits, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home',    path: '/',        icon: Home },
        { name: 'Agents',  path: '/agents',  icon: Users },
        { name: 'Blog',    path: '/blogs',   icon: FileText },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
            scrolled ? 'top-4 py-2.5' : 'top-0 py-5 bg-transparent'
        }`}>
            <div className={`mx-auto px-6 flex justify-between items-center transition-all duration-500 ${
                scrolled
                    ? 'w-[92%] max-w-6xl bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-2xl py-2 border border-[#E0E0E0] dark:border-[#1E1E1E]'
                    : 'w-full max-w-7xl px-6'
            }`}>

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

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#26CECE] dark:hover:text-[#26CECE] hover:bg-[#26CECE]/10 transition-all"
                        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

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
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#070707] font-bold text-xs shadow-md"
                                style={{ background: '#26CECE' }}>
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

                {/* Mobile hamburger */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#26CECE] transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-gray-700 dark:text-gray-200 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-lg border-t border-gray-100 dark:border-[#1E1E1E] md:hidden animate-fade-in-up">
                    <div className="p-4 space-y-1">
                        {navLinks.map(({ name, path, icon: Icon }) => (
                            <Link
                                key={name}
                                to={path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive(path)
                                        ? 'bg-[#26CECE]/10 text-[#26CECE]'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{name}</span>
                            </Link>
                        ))}

                        {user?.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Admin Dashboard</span>
                            </Link>
                        )}

                        <div className="h-px bg-gray-100 dark:bg-[#1E1E1E] my-2" />

                        {user ? (
                            <div className="space-y-3 px-4 pt-1">
                                <div className="flex items-center gap-3 text-[#26CECE] bg-[#26CECE]/10 p-3 rounded-lg border border-[#26CECE]/20">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-semibold">{credits} Credits</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#070707] font-bold text-xs"
                                        style={{ background: '#26CECE' }}>
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-sm">{user.email}</span>
                                </div>
                                <button
                                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-3 rounded-xl transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 px-4 pb-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-[#1E1E1E] rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors dark:text-white"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <button
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                                        style={{ background: '#26CECE', color: '#070707' }}
                                    >
                                        Get Started
                                        <ChevronDown className="w-4 h-4 -rotate-90" />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
