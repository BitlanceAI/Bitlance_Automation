import { MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.webp';

const TEAL = '#26CECE';

const Footer = () => {
    return (
        <footer className="bg-transparent border-t border-gray-200 font-medium text-black py-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6">
                {/* 5-column grid: Brand | Company | Address | Contact */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">

                    {/* Brand — col-span-2 on md */}
                    <div className="col-span-2 md:col-span-2 flex flex-col items-start pr-0 md:pr-8">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={Logo} alt="Bitlance.ai" width="100" height="24" className="h-6 w-auto" />
                        </div>
                        <p className="leading-relaxed text-xs mb-3 text-gray-700">
                            Empowering businesses with intelligent automation. 24/7 engagement, instant qualification, and seamless scheduling.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/" 
                               target="_blank" rel="noopener noreferrer"
                               aria-label="Visit our LinkedIn page"
                               className="w-8 h-8 flex items-center justify-center transition-all group hover:border-[#26CECE]"
                               style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}
                            >
                                <Linkedin size={15} className="font-medium text-black group-hover:text-[#26CECE] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-black font-extrabold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Company</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link to="/blogs" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#26CECE] transition-colors">Blog</Link></li>
                            <li><a href="https://www.bitlancetechhub.com/privacy-policy" className="hover:text-[#26CECE] transition-colors">Privacy Policy</a></li>
                            <li><a href="https://www.bitlancetechhub.com/terms-policy" className="hover:text-[#26CECE] transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Address — separate column */}
                    <div>
                        <h4 className="text-black font-extrabold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Address</h4>
                        <div className="flex items-start gap-2 group">
                            <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 transition-all"
                                 style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                                <MapPin size={13} style={{ color: TEAL }} />
                            </div>
                            <p className="text-xs leading-relaxed text-gray-700">
                                Blue Ridge Town Pune, Phase 1,<br />
                                Hinjawadi Rajiv Gandhi Infotech Park,<br />
                                Hinjawadi, Pune,<br />
                                Maharashtra 411057
                            </p>
                        </div>
                    </div>

                    {/* Contact — email + phone only */}
                    <div>
                        <h4 className="text-black font-extrabold mb-3 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>Contact</h4>
                        <ul className="space-y-3 text-xs">
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                                    <Mail size={13} className="text-gray-600 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="mailto:ceo@bitlancetechhub.com" className="text-gray-700 group-hover:text-black transition-colors break-all">
                                    ceo@bitlancetechhub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 group">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                                    <Phone size={13} className="text-gray-600 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="tel:+917391025059" className="text-gray-700 group-hover:text-black transition-colors">
                                    +91 7391025059
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <p>&copy; {new Date().getFullYear()} Bitlance. All rights reserved.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <a href="https://www.bitlancetechhub.com/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</a>
                        <a href="https://www.bitlancetechhub.com/terms-policy" className="hover:text-black transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
