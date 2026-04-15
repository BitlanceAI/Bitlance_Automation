import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const BRAND_URL = 'https://www.bitlancetechhub.com';
const APP_URL = 'https://www.bitlancetechhub.com';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  // { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={BRAND_URL} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center group-hover:bg-brand/30 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#26CECE" strokeWidth="2" strokeLinejoin="round" />
              <path d="M12 8V16M8 10L12 8L16 10" stroke="#26CECE" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-sm leading-none">Bitlance</span>
            <span className="text-[#26CECE] font-bold text-sm leading-none"> SEO</span>
            <div className="text-white/40 text-[10px] leading-none mt-0.5">AI Agent</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://www.bitlancetechhub.com/login"
            className="text-sm text-white/70 hover:text-white transition-colors font-medium"
          >
            Sign In
          </a>
          <a
            href={`${APP_URL}/login`}
            className="shimmer-btn px-5 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white/60 hover:text-white"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm text-white/70 hover:text-white border-b border-white/5 last:border-0 font-medium"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={`${APP_URL}/esign`}
                className="mt-2 py-3 text-center bg-brand text-black text-sm font-bold rounded-lg"
              >
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
