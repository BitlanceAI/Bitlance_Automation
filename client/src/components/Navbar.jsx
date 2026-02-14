import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.webp';
import ThemeToggle from './ThemeToggle';
import {
    Home,
    Users,
    Radio,
    FileText,
    LayoutDashboard,
    LogOut,
    Sparkles,
    Menu,
    X,
    LogIn,
    ChevronDown
} from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, credits, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Agents', path: '/agents', icon: Users },
        { name: 'Broadcast', path: '/broadcast', icon: Radio },
        { name: 'Blogs', path: '/blogs', icon: FileText },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img
                        src={Logo}
                        alt="Bitlance.ai"
                        className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-2xl font-bold text-blue-600 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>Bitlance<span class="text-gray-800 dark:text-white">.ai</span></span>';
                        }}
                    />
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 group ${location.pathname === link.path
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${location.pathname === link.path ? 'scale-110' : ''}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                    {user && user.email === 'rahul7697762@gmail.com' && (
                        <Link
                            to="/admin"
                            className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 group ${location.pathname.startsWith('/admin')
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                            Admin
                        </Link>
                    )}

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center gap-2 transition-transform hover:scale-105">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                        {credits} Credits
                                    </span>
                                </div>
                                <div className="relative group flex items-center gap-2 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:block">
                                        {user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium transition-colors group"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span className="hidden lg:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-gray-700 dark:text-gray-200 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-t border-gray-100 dark:border-gray-800 md:hidden animate-fade-in-down">
                    <div className="p-4 space-y-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === link.path
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            );
                        })}

                        {user && user.email === 'rahul7697762@gmail.com' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Admin Dashboard</span>
                            </Link>
                        )}

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                        {user ? (
                            <div className="space-y-4 px-4">
                                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-semibold">{credits} Credits</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-xl transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 px-4 pb-2">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white">
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                                        Get Started
                                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
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
