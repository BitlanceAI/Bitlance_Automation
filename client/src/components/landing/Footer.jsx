import { MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.webp';

const TEAL = '#26CECE';

const Footer = () => {
    return (
        <footer className="bg-[#070707] border-t border-[#1E1E1E] text-white/60 py-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6">
                {/* 5-column grid: Brand | Company | Address | Contact */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">

                    {/* Brand — col-span-2 on md */}
                    <div className="col-span-2 md:col-span-2 flex flex-col items-start pr-0 md:pr-8">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={Logo} alt="Bitlance.ai" className="h-6 w-auto" />
                        </div>
                        <p className="leading-relaxed text-xs mb-3">
                            Empowering businesses with intelligent automation. 24/7 engagement, instant qualification, and seamless scheduling.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/" target="_blank" rel="noopener noreferrer"
                               className="w-8 h-8 flex items-center justify-center transition-all group hover:border-[#26CECE]"
                               style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 2 }}
                            >
                                <Linkedin size={15} className="text-white/60 group-hover:text-[#26CECE] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Company</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link to="/blogs" className="hover:text-[#26CECE] transition-colors">Blog</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-[#26CECE] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-policy" className="hover:text-[#26CECE] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Address — separate column */}
                    <div>
                        <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Address</h4>
                        <div className="flex items-start gap-2 group">
                            <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 transition-all"
                                 style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 2 }}>
                                <MapPin size={13} style={{ color: TEAL }} />
                            </div>
                            <p className="text-xs leading-relaxed text-white/50">
                                Blue Ridge Town Pune, Phase 1,<br />
                                Hinjawadi Rajiv Gandhi Infotech Park,<br />
                                Hinjawadi, Pune,<br />
                                Maharashtra 411057
                            </p>
                        </div>
                    </div>

                    {/* Contact — email + phone only */}
                    <div>
                        <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Contact</h4>
                        <ul className="space-y-3 text-xs">
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 2 }}>
                                    <Mail size={13} className="text-white/40 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="mailto:ceo@bitlancetechhub.com" className="group-hover:text-white transition-colors break-all">
                                    ceo@bitlancetechhub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 2 }}>
                                    <Phone size={13} className="text-white/40 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="tel:+917391025059" className="group-hover:text-white transition-colors">
                                    +91 7391025059
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#1E1E1E] pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <p>&copy; {new Date().getFullYear()} Bitlance. All rights reserved.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms-policy" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
