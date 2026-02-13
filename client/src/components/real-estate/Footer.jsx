import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Home } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-re-dark text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                            <Home className="text-re-blue" />
                            <span>AiHomes</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Automating real estate success with next-gen AI agents and lead generation systems.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-re-blue transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-re-blue transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-re-blue transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-re-blue transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; {new Date().getFullYear()} AI Homes On Auto Pilot. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 max-w-md text-center md:text-right opacity-60">
                        This site is not part of the Facebook website or Facebook Inc. Additionally, this site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
