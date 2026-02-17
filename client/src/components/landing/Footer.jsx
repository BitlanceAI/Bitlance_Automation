import { MapPin, Mail, Phone, Twitter, Linkedin, Github, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#020202] border-t border-white/10 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Bot className="w-8 h-8 text-indigo-500" />
                            <span className="text-2xl font-bold text-white">Agentic AI</span>
                        </div>
                        <p className="text-gray-400 max-w-md leading-relaxed">
                            Empowering businesses with intelligent automation. 24/7 engagement, instant qualification, and seamless scheduling.
                        </p>
                        <div className="flex gap-4 mt-6">
                            {/* <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all ring-1 ring-white/10">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all ring-1 ring-white/10">
                                <Linkedin size={18} />
                            </a> */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all ring-1 ring-white/10">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                            <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors ring-1 ring-white/10">
                                    <MapPin size={18} />
                                </div>
                                <span className="text-sm leading-relaxed group-hover:text-white transition-colors">
                                    Blue Ridge Town Pune, Phase 1,<br />
                                    Hinjawadi Rajiv Gandhi Infotech Park,<br />
                                    Hinjawadi, Pune, Pimpri-Chinchwad,<br />
                                    Maharashtra 411057
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors ring-1 ring-white/10">
                                    <Mail size={18} />
                                </div>
                                <a href="mailto:ceo@bitlancetechhub.com" className="text-sm group-hover:text-white transition-colors">
                                    ceo@bitlancetechhub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors ring-1 ring-white/10">
                                    <Phone size={18} />
                                </div>
                                <a href="tel:+7391025059" className="text-sm group-hover:text-white transition-colors">
                                    +91 7391025059
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Bitlance. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
