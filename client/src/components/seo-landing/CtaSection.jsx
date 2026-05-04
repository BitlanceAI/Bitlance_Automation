import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, MessageCircle, Check } from 'lucide-react';

const APP_URL = 'https://www.bitlancetechhub.com';
const WA_URL = 'https://wa.me/917697762374?text=Hi%20Bitlance!%20I%27d%20like%20to%20know%20more%20about%20the%20SEO%20AI%20Agent.';

export default function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden">
      {/* Animated orbs */}
      <div className="orb w-[700px] h-[700px] bg-brand/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="orb w-[400px] h-[400px] bg-brand/5 -top-32 -left-32" />
      <div className="orb w-[400px] h-[400px] bg-brand/5 -bottom-32 -right-32" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-brand/10 border border-brand/25 rounded-full px-5 py-2 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-brand text-sm font-bold">7-Day Free Trial Available</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6"
        >
          Ready to Rank <span className="gradient-text">#1 on Google</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/50 text-sm sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Join 200+ businesses using Bitlance SEO AI Agent to drive organic traffic on autopilot.
          No agency fees. No manual work. Just rankings.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <a
            href={`${APP_URL}/login`}
            className="shimmer-btn group flex items-center gap-3 px-10 py-4 bg-brand text-black font-bold text-lg rounded-xl hover:bg-brand/90 transition-all shadow-2xl shadow-brand/30 hover:shadow-brand/50 hover:scale-105 w-full sm:w-auto justify-center"
          >
            Start Free Trial
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-8 py-4 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-base rounded-xl hover:bg-[#25D366]/20 transition-all w-full sm:w-auto justify-center"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-white/30"
        >
          {[
            'No credit card required',
            'Cancel anytime',
            '7-day free trial',
            'WordPress-ready',
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Check size={14} className="text-brand" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
