import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Akshay Lakde',
    role: 'Founder',
    avatar: '/testimonals/akshay_lakde.jpeg',
    rating: 5,
    text: 'We went from 0 to 3,400 monthly organic visitors in 60 days using Bitlance SEO. The auto-publish feature alone saves us 15 hours a week.',
    metric: '+3,400 organic/month',
    metricLabel: 'in 60 days',
  },
  {
    name: 'Deepak Chaudhari',
    role: 'Head of Marketing',
    avatar: '/testimonals/deepak_chaudhari.jpeg',
    rating: 5,
    text: "I was skeptical about AI-written content but the quality blew me away. Every article ranks within 2 weeks. Our content costs dropped by 80%.",
    metric: '-80%',
    metricLabel: 'content costs',
  },
  {
    name: 'Sahil Guhane',
    role: 'Digital Marketing Lead',
    avatar: '/testimonals/sahil_guhane.jpeg',
    rating: 5,
    text: 'The internal linking alone boosted our domain rating from 18 to 34 in 3 months. Plus the plagiarism check gives us peace of mind.',
    metric: 'DR 18 → 34',
    metricLabel: 'in 3 months',
  },
  {
    name: 'Suyash Nyati',
    role: 'CEO',
    avatar: '/testimonals/suyash_nyati.jpeg',
    rating: 5,
    text: "100 articles published with zero manual effort. Our WordPress site now gets 12,000 organic visits monthly. This tool is a game-changer.",
    metric: '12,000',
    metricLabel: 'organic visits/month',
  },
  {
    name: 'Tejaunsh Nyati',
    role: 'SEO Consultant',
    avatar: '/testimonals/tejaunsh_nyati.jpeg',
    rating: 5,
    text: "I use Bitlance for all my client sites. The keyword research + auto-publish saves me 3 hours per article. My clients see page-1 rankings within weeks.",
    metric: 'Page 1',
    metricLabel: 'rankings in weeks',
  },
];

function TestimonialCard({ t, index, inView }) {
  const colors = ['#26CECE', '#2DD4BF', '#5EEAD4', '#0EA5E9', '#8B5CF6'];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07 + 0.2, duration: 0.6 }}
      className="card-hover bg-card border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
    >
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(t.rating)].map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="#F59E0B">
            <path d="M10 1l2.5 5.5L18 7.6l-4 3.9 1 5.5L10 14.2l-5 2.8 1-5.5-4-3.9 5.5-.9L10 1z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-white/70 text-sm leading-relaxed flex-1">"{t.text}"</p>

      {/* Metric */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
        style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}
      >
        <span className="text-base">{t.metric}</span>
        <span className="text-white/40 font-normal">{t.metricLabel}</span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mt-2">
        <img
          src={t.avatar}
          alt={t.name}
          width="40"
          height="40"
          className="w-10 h-10 rounded-full border border-white/10 object-cover flex-shrink-0"
        />
        <div>
          <div className="text-white font-semibold text-sm">{t.name}</div>
          <div className="text-[#A0A0A0] text-xs">{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" ref={ref} className="py-24 px-4 relative overflow-hidden">
      {/* Orb */}
      <div className="orb w-[500px] h-[500px] bg-brand/5 -top-32 -left-32" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">Social Proof</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Loved by <span className="gradient-text">200+ Businesses</span>
          </h2>
          <p className="mt-4 text-[#A0A0A0] text-base sm:text-lg max-w-xl mx-auto">
            Real results from real customers who let our SEO AI Agent do the heavy lifting.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} inView={inView} />
          ))}
        </div>

        {/* Overall rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 bg-card border border-white/5 rounded-2xl p-6"
        >
          <div className="text-center">
            <div className="text-5xl font-black gradient-text">4.9</div>
            <div className="flex gap-1 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#F59E0B">
                  <path d="M10 1l2.5 5.5L18 7.6l-4 3.9 1 5.5L10 14.2l-5 2.8 1-5.5-4-3.9 5.5-.9L10 1z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center sm:text-left">
            <div className="text-white font-semibold">200+ verified reviews</div>
            <div className="text-white/40 text-sm">Across Product Hunt, Google, and G2</div>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="text-white font-semibold">500+ articles published</div>
            <div className="text-white/40 text-sm">and counting this month</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
