import { MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.webp';

const TEAL = '#26CECE';

const Footer = () => {
    return (
        <footer className="bg-transparent border-t font-medium py-6
            border-slate-200 text-slate-700
            dark:border-white/[0.08] dark:text-white/70"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">

                    {/* Brand */}
                    <div className="col-span-2 flex flex-col items-start pr-0 md:pr-8">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={Logo} alt="Bitlance.ai" width="100" height="24" className="h-6 w-auto" />
                        </div>
                        <p className="leading-relaxed text-xs mb-3 text-slate-600 dark:text-white/50">
                            Empowering businesses with intelligent automation. 24/7 engagement, instant qualification, and seamless scheduling.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/"
                                target="_blank" rel="noopener noreferrer"
                                aria-label="Visit our LinkedIn page"
                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all group
                                    bg-slate-100 border border-slate-200 hover:border-teal-400
                                    dark:bg-white/[0.06] dark:border-white/[0.1] dark:hover:border-teal-500/50"
                            >
                                <Linkedin size={15} className="text-slate-600 group-hover:text-[#26CECE] dark:text-white/60 transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-extrabold mb-3 text-xs uppercase tracking-widest text-slate-900 dark:text-white"
                            style={{ fontFamily: "'DM Mono',monospace" }}>Company</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link to="/blogs" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#26CECE] transition-colors">Blog</Link></li>
                            <li><a href="https://www.bitlancetechhub.com/privacy-policy" className="hover:text-[#26CECE] transition-colors">Privacy Policy</a></li>
                            <li><a href="https://www.bitlancetechhub.com/terms-policy" className="hover:text-[#26CECE] transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Address */}
                    <div>
                        <h4 className="font-extrabold mb-3 text-xs uppercase tracking-widest text-slate-900 dark:text-white"
                            style={{ fontFamily: "'DM Mono',monospace" }}>Address</h4>
                        <div className="flex items-start gap-2 group">
                            <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 rounded-lg
                                bg-slate-100 border border-slate-200 dark:bg-white/[0.06] dark:border-white/[0.1]">
                                <MapPin size={13} style={{ color: TEAL }} />
                            </div>
                            <p className="text-xs leading-relaxed text-slate-500 dark:text-white/50">
                                Blue Ridge Town Pune, Phase 1,<br />
                                Hinjawadi Rajiv Gandhi Infotech Park,<br />
                                Hinjawadi, Pune,<br />
                                Maharashtra 411057
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-extrabold mb-3 text-xs uppercase tracking-widest text-slate-900 dark:text-white"
                            style={{ fontFamily: "'DM Mono',monospace" }}>Contact</h4>
                        <ul className="space-y-3 text-xs">
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 rounded-lg transition-all
                                    bg-slate-100 border border-slate-200 group-hover:border-teal-400
                                    dark:bg-white/[0.06] dark:border-white/[0.1] dark:group-hover:border-teal-500/40">
                                    <Mail size={13} className="text-slate-500 group-hover:text-[#26CECE] dark:text-white/50 transition-colors" />
                                </div>
                                <a href="mailto:ceo@bitlancetechhub.com"
                                    className="text-slate-600 dark:text-white/55 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors break-all">
                                    ceo@bitlancetechhub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 rounded-lg transition-all
                                    bg-slate-100 border border-slate-200 group-hover:border-teal-400
                                    dark:bg-white/[0.06] dark:border-white/[0.1] dark:group-hover:border-teal-500/40">
                                    <Phone size={13} className="text-slate-500 group-hover:text-[#26CECE] dark:text-white/50 transition-colors" />
                                </div>
                                <a href="tel:+917391025059"
                                    className="text-slate-600 dark:text-white/55 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    +91 7391025059
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t pt-4 flex flex-col md:flex-row items-center justify-between text-xs
                    border-slate-200 dark:border-white/[0.07] text-slate-500 dark:text-white/40"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    <p>&copy; {new Date().getFullYear()} Bitlance. All rights reserved.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <a href="https://www.bitlancetechhub.com/privacy-policy"
                            className="hover:text-slate-800 dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="https://www.bitlancetechhub.com/terms-policy"
                            className="hover:text-slate-800 dark:hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
