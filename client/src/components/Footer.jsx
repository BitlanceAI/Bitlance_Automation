import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from '../assets/logo.webp';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="inline-block mb-6">
                            <img src={Logo} alt="Bitlance.ai" className="h-10 w-auto object-contain bg-white/10 rounded-lg p-1" />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Empowering businesses with intelligent automation agents.
                            Scale your workflow with next-generation AI technology.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Linkedin size={18} />} href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/" />
                            <SocialIcon icon={<Facebook size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/agents" label="All AI Agents" />
                            <FooterLink to="/seo-agent" label="SEO AI Agent" />
                            <FooterLink to="/meta-ads-agent" label="Meta Ads Automation" />
                            <FooterLink to="/broadcast" label="Social Media Automation" />
                            <FooterLink to="/dashboard" label="AI Voice Agent" />
                            <FooterLink to="/design-agent" label="Graphic Designer AI" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <ContactItem
                                icon={<MapPin size={20} className="text-blue-500 mt-1" />}
                                text="Blue Ridge Town Pune, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Pimpri-Chinchwad, Maharashtra 411057"
                            />
                            <ContactItem
                                icon={<Mail size={20} className="text-blue-500" />}
                                text="ceo@bitlancetechhub"
                                href="mailto:ceo@bitlancetechhub"
                            />
                            <ContactItem
                                icon={<Phone size={20} className="text-blue-500" />}
                                text="+7391025059"
                                href="tel:+7391025059"
                            />
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Bitlance Automation. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon, href }) => (
    <a href={href || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
        {icon}
    </a>
);

const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
            {label}
        </Link>
    </li>
);

const ContactItem = ({ icon, text, href }) => (
    <li className="flex gap-3">
        <div className="shrink-0">{icon}</div>
        {href ? (
            <a href={href} className="text-slate-300 hover:text-white transition-colors text-sm">
                {text}
            </a>
        ) : (
            <span className="text-slate-300 text-sm leading-relaxed max-w-sm">
                {text}
            </span>
        )}
    </li>
);

export default Footer;
