import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(target, duration = 1800, inView = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, inView]);
  return count;
}

const stats = [
  { value: 500, suffix: '+', label: 'Articles Generated', desc: 'and counting' },
  { value: 10, suffix: 'x', label: 'Faster Than Manual', desc: 'average time saved' },
  { value: 94, suffix: '%', label: 'Avg SEO Score', desc: 'across all articles' },
  { value: 3, suffix: ' min', label: 'Per Article', desc: 'from keyword to publish' },
];

function StatCard({ value, suffix, label, desc, index, inView }) {
  const count = useCountUp(value, 1600, inView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
      className="card-hover flex flex-col items-center text-center p-5 sm:p-8 bg-card border border-white/5 rounded-2xl"
    >
      <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">
        {count}{suffix}
      </div>
      <div className="text-white font-semibold text-lg mb-1">{label}</div>
      <div className="text-white/40 text-sm">{desc}</div>
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-brand/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">By the Numbers</p>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Results That Speak for Themselves</h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
