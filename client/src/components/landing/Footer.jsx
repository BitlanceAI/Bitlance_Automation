import { MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.webp';

const TEAL = '#26CECE';

const Footer = () => {
    return (
        <footer className="bg-[#070707] border-t border-[#1E1E1E] text-white/60 py-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 flex flex-col items-start pr-0 md:pr-12">
                        <div className="flex items-center gap-2 mb-6">
                            <img src={Logo} alt="Bitlance.ai" className="h-8 w-auto" />
                        </div>
                        <p className="max-w-md leading-relaxed text-sm mb-6">
                            Empowering businesses with intelligent automation. 24/7 engagement, instant qualification, and seamless scheduling.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 flex items-center justify-center transition-all group hover:border-[#26CECE]"
                               style={{
                                   background: '#111111',
                                   border: '1px solid #1E1E1E',
                                   borderRadius: 2,
                               }}
                            >
                                <Linkedin size={18} className="text-white/60 group-hover:text-[#26CECE] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/blogs" className="hover:text-[#26CECE] transition-colors">Blog</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-[#26CECE] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-policy" className="hover:text-[#26CECE] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Contact</h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 w-8 h-8 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{
                                         background: '#111111',
                                         border: '1px solid #1E1E1E',
                                         borderRadius: 2,
                                     }}
                                >
                                    <MapPin size={16} className="text-white/40 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <span className="leading-relaxed group-hover:text-white transition-colors">
                                    Blue Ridge Town Pune, Phase 1,<br />
                                    Hinjawadi Rajiv Gandhi Infotech Park,<br />
                                    Hinjawadi, Pune, Pimpri-Chinchwad,<br />
                                    Maharashtra 411057
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{
                                         background: '#111111',
                                         border: '1px solid #1E1E1E',
                                         borderRadius: 2,
                                     }}
                                >
                                    <Mail size={16} className="text-white/40 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="mailto:ceo@bitlancetechhub.com" className="group-hover:text-white transition-colors">
                                    ceo@bitlancetechhub.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-all group-hover:border-[#26CECE]"
                                     style={{
                                         background: '#111111',
                                         border: '1px solid #1E1E1E',
                                         borderRadius: 2,
                                     }}
                                >
                                    <Phone size={16} className="text-white/40 group-hover:text-[#26CECE] transition-colors" />
                                </div>
                                <a href="tel:+917391025059" className="group-hover:text-white transition-colors">
                                    +91 7391025059
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#1E1E1E] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <p>&copy; {new Date().getFullYear()} Bitlance. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms-policy" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
