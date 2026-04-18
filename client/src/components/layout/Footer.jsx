import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from "../../assets/logo.webp";

const Footer = () => (
    <footer className="bg-[#070707] text-white pt-16 pb-8 border-t border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                {/* Brand */}
                <div>
                    <Link to="/" className="inline-block mb-6">
                        <img src={Logo} alt="Bitlance" className="h-10 w-auto object-contain" />
                    </Link>
                    <p className="text-[#555] text-sm leading-relaxed mb-6">
                        Empowering businesses with intelligent automation agents.
                        Scale your workflow with next-generation AI technology.
                    </p>
                    <div className="flex gap-3">
                        <SocialIcon icon={<Twitter size={16} />} />
                        <SocialIcon icon={<Linkedin size={16} />} href="https://www.linkedin.com/company/bitlance-tech-hub-pvt-ltd/" />
                        <SocialIcon icon={<Facebook size={16} />} />
                        <SocialIcon icon={<Instagram size={16} />} />
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-sm font-semibold mb-6 tracking-widest text-[#555] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Quick Links
                    </h3>
                    <ul className="space-y-3">
                        <FooterLink to="/"                            label="Home" />
                        <FooterLink to="/agents"                      label="All AI Agents" />
                        <FooterLink to="/dashboard/agents/seo"        label="SEO AI Agent" />
                        <FooterLink to="/dashboard/agents/meta"       label="Meta Ads AI" />
                        <FooterLink to="/dashboard/agents/whatsapp"     label="WhatsApp Automation" />
                        <FooterLink to="/dashboard/agents/voice"      label="AI Voice Agent" />
                        <FooterLink to="/dashboard/agents/design"     label="Graphic Designer AI" />
                    </ul>
                </div>

                {/* Contact */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold mb-6 tracking-widest text-[#555] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Contact
                    </h3>
                    <ul className="space-y-4">
                        <ContactItem
                            icon={<MapPin size={18} style={{ color: '#26CECE' }} className="mt-0.5 shrink-0" />}
                            text="Blue Ridge Town Pune, Phase 1, Hinjawadi, Pune, Maharashtra 411057"
                        />
                        <ContactItem
                            icon={<Mail size={18} style={{ color: '#26CECE' }} className="shrink-0" />}
                            text="ceo@bitlancetechhub.com"
                            href="mailto:ceo@bitlancetechhub.com"
                        />
                        <ContactItem
                            icon={<Phone size={18} style={{ color: '#26CECE' }} className="shrink-0" />}
                            text="+91 7391025059"
                            href="tel:+917391025059"
                        />
                    </ul>
                </div>
            </div>

            <div className="border-t border-[#1E1E1E] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[#444] text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                    © {new Date().getFullYear()} Bitlance Automation. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm text-[#444]">
                    <Link to="/privacy-policy" className="hover:text-[#26CECE] transition-colors">Privacy Policy</Link>
                    <Link to="/terms-policy"   className="hover:text-[#26CECE] transition-colors">Terms of Service</Link>
                </div>
            </div>
        </div>
    </footer>
);

const SocialIcon = ({ icon, href }) => (
    <a
        href={href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded flex items-center justify-center text-[#555] border border-[#1E1E1E] hover:border-[#26CECE] hover:text-[#26CECE] transition-all duration-200"
    >
        {icon}
    </a>
);

const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-[#555] hover:text-[#26CECE] transition-colors text-sm font-medium">
            {label}
        </Link>
    </li>
);

const ContactItem = ({ icon, text, href }) => (
    <li className="flex gap-3 items-start">
        {icon}
        {href ? (
            <a href={href} className="text-[#888] hover:text-[#26CECE] transition-colors text-sm">
                {text}
            </a>
        ) : (
            <span className="text-[#888] text-sm leading-relaxed max-w-sm">{text}</span>
        )}
    </li>
);

export default Footer;
