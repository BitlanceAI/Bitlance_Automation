import { Github, Twitter, Linkedin } from 'lucide-react';

const BRAND_URL = 'https://www.bitlancetechhub.com';
const APP_URL = 'https://www.bitlancetechhub.com';

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
  ],
  Company: [
    { label: 'About Bitlance', href: `${BRAND_URL}/about` },
    { label: 'Blog', href: `${BRAND_URL}/blogs` },
    { label: 'Careers', href: `${BRAND_URL}/careers` },
    { label: 'Contact', href: `https://wa.me/917697762374` },
  ],
  Legal: [
    { label: 'Privacy Policy', href: `${BRAND_URL}/privacy` },
    { label: 'Terms of Service', href: `${BRAND_URL}/terms` },
    { label: 'Refund Policy', href: `${BRAND_URL}/refund` },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <a href={BRAND_URL} className="flex items-center gap-3 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#26CECE" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 8V16M8 10L12 8L16 10" stroke="#26CECE" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold">Bitlance</span>
                <span className="text-brand font-bold"> SEO AI Agent</span>
              </div>
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI-powered SEO content generation and auto-publishing. Rank higher, drive traffic, and grow your business — on autopilot.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Twitter, href: 'https://twitter.com/bitlancehub', label: 'Twitter' },
                { icon: Linkedin, href: 'https://linkedin.com/company/bitlancetechhub', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-brand hover:border-brand/30 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-white/40 text-sm hover:text-white/70 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Bitlance Tech Hub. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}
