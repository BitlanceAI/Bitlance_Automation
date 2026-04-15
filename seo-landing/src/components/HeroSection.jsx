import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Send, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { HeroVideoDialog } from './ui/hero-video-dialog';

const APP_URL = 'https://www.bitlancetechhub.com';
const BRAND = '#26CECE';

const PILLS = [
  { icon: <Send size={15} />, text: 'Auto-Publish' },
  { icon: <Search size={15} />, text: 'Keyword Research' },
  { icon: <ShieldCheck size={15} />, text: 'Plagiarism Check' },
  { icon: <RefreshCw size={15} />, text: 'WordPress Sync' },
];

const STATS = [
  { value: '10x', label: 'Faster Content', pos: 'top-[15%] left-6 md:left-12' },
  { value: '500+', label: 'Articles Generated', pos: 'bottom-[15%] left-6 md:left-12' },
  { value: '#1', label: 'Google Rankings', pos: 'top-[15%] right-6 md:right-12' },
  { value: '3 min', label: 'Per Article', pos: 'bottom-[15%] right-6 md:right-12' },
];

// Typewriter effect for the headline
const useTypewriter = (words, speed = 120, pause = 1800) => {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setWordIdx(i => (i + 1) % words.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
};

export default function HeroSection({ onWatchDemo }) {
  const verb = useTypewriter(['Automatically.', 'Effortlessly.', 'Hands-Free.']);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg pt-20 pb-12 px-4">
      {/* Background orbs */}
      <div className="orb w-[700px] h-[700px] bg-brand/10 -top-48 left-1/2 -translate-x-1/2" />
      <div className="orb w-[400px] h-[400px] bg-brand/6 bottom-0 right-0" />
      <div className="orb w-[300px] h-[300px] bg-brand/4 bottom-20 left-0" />

      {/* Floating stat badges */}
      {STATS.map(({ value, label, pos }, i) => (
        <motion.div
          key={label}
          className={`absolute ${pos} hidden sm:block z-20`}
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ delay: 0.8 + i * 0.15, duration: 0.5, type: 'spring', stiffness: 120 }}
        >
          <div
            className="rounded-2xl px-5 py-4 text-center min-w-[140px] backdrop-blur-md"
            style={{
              background: 'rgba(26,26,26,0.92)',
              border: '1px solid rgba(38,206,206,0.3)',
              boxShadow: '0 8px 32px rgba(38,206,206,0.1)',
            }}
          >
            <div className="text-3xl font-black" style={{ color: BRAND, lineHeight: 1 }}>{value}</div>
            <div className="text-xs text-white/55 mt-1 font-medium">{label}</div>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'rgba(38,206,206,0.08)', border: '1px solid rgba(38,206,206,0.25)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: BRAND }} />
          <span className="text-sm font-semibold" style={{ color: BRAND }}>AI-Powered SEO Engine</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-4"
        >
          Rank{' '}
          <span className="gradient-text">#1</span>
          {' '}on Google,
          <br />
          <span className="inline-block min-h-[1.1em]">
            {verb}
            <span
              className="inline-block w-[3px] h-[0.85em] ml-1 align-middle animate-pulse"
              style={{ background: BRAND, verticalAlign: 'middle' }}
            />
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm sm:text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-8"
        >
          Turn any keyword into a fully-researched, SEO-optimised blog post.
          Auto-publish to WordPress and watch organic traffic climb — completely hands-free.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {PILLS.map(({ icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(38,206,206,0.08)',
                border: '1px solid rgba(38,206,206,0.25)',
                color: BRAND,
              }}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href={`${APP_URL}/login`}
            className="shimmer-btn group flex items-center gap-2 px-8 py-4 font-bold text-base rounded-xl transition-all shadow-xl hover:scale-105"
            style={{
              background: BRAND,
              color: '#000',
              boxShadow: `0 8px 32px rgba(38,206,206,0.3)`,
            }}
          >
            Start Free Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

        </motion.div>

        {/* Social proof (Avatars) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-3">
            {[
              '/testimonals/suyash_nyati.jpeg',
              '/testimonals/akshay_lakde.jpeg',
              '/testimonals/sahil_guhane.jpeg',
              '/testimonals/deepak_chaudhari.jpeg',
              '/testimonals/tejaunsh_nyati.jpeg',
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="User"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-black object-cover relative z-10 hover:z-20 transition-transform hover:scale-110"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
               {/* 5 stars */}
               {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#F59E0B">
                    <path d="M10 1l2.5 5.5L18 7.6l-4 3.9 1 5.5L10 14.2l-5 2.8 1-5.5-4-3.9 5.5-.9L10 1z" />
                  </svg>
               ))}
            </div>
            <span className="text-white/70 text-sm font-medium">Loved by top founders</span>
          </div>
        </motion.div>

      </div>

      {/* HeyGen Video Hero */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="relative z-10 mt-16 w-full max-w-5xl mx-auto rounded-2xl p-1 bg-white/5 border border-white/10 backdrop-blur-md"
        style={{ boxShadow: "0 20px 80px rgba(38,206,206,0.15)" }}
      >
        <HeroVideoDialog
          animationStyle="from-center"
          videoSrc="/SEO_AI_agent-_implementation.mp4"
          thumbnailSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
          thumbnailAlt="Bitlance SEO AI Demo Dashboard"
        />
      </motion.div>
    </section>
  );
}
