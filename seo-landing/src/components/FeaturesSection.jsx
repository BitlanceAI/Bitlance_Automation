import { motion } from 'framer-motion';

const features = [
  {
    icon: '🔍',
    title: 'Intelligent Keyword Research',
    desc: 'SerpAPI integration surfaces trending topics and high-volume, low-competition keywords your competitors are missing.',
    bullets: ['Real-time SERP analysis', 'Competitor gap detection', 'Search volume & difficulty scores'],
    accent: '#26CECE',
  },
  {
    icon: '✍️',
    title: 'AI Article Writer',
    desc: 'GPT-4o generates fully structured, 1,500+ word articles with proper H1–H6 hierarchy, bullet points, and natural keyword density.',
    bullets: ['1,500–3,000 word depth', 'Schema-ready structure', 'E-E-A-T optimized content'],
    accent: '#2DD4BF',
  },
  {
    icon: '🚀',
    title: 'One-Click Auto-Publish',
    desc: 'Direct WordPress REST API integration. Articles, featured images, categories, and tags — all pushed live automatically.',
    bullets: ['WordPress REST API', 'Auto-featured images', 'Categories & tag sync'],
    accent: '#5EEAD4',
  },
  {
    icon: '🔗',
    title: 'Smart Internal Linking',
    desc: 'Automatically scans your existing posts and weaves relevant internal links into every new article to boost domain authority.',
    bullets: ['Contextual anchor text', 'Domain authority boost', 'Crawl depth optimization'],
    accent: '#26CECE',
  },
  {
    icon: '🛡️',
    title: 'Plagiarism Protection',
    desc: 'Every article passes through our plagiarism engine before publishing. Your reputation stays clean — always.',
    bullets: ['Pre-publish scanning', '100% originality guarantee', 'Rewrite on detection'],
    accent: '#2DD4BF',
  },
  {
    icon: '📊',
    title: 'Performance Dashboard',
    desc: 'Track article rankings, organic traffic, word counts, and publishing history from one beautiful dashboard.',
    bullets: ['Ranking tracker', 'Traffic analytics', 'Publishing history'],
    accent: '#5EEAD4',
  },
];

function FeatureCard({ icon, title, desc, bullets, accent, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: 'easeOut' }}
      className="card-hover group bg-card border border-white/5 rounded-2xl p-7 relative overflow-hidden"
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}15 0%, transparent 70%)` }}
      />

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed mb-5">{desc}</p>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Section header */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-brand text-sm font-bold uppercase tracking-widest mb-4"
        >
          Everything You Need
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-white leading-tight"
        >
          The Complete <span className="gradient-text">SEO Stack</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white/50 text-base sm:text-lg max-w-2xl mx-auto"
        >
          Everything a growing business needs to dominate organic search — no SEO agency required.
        </motion.p>
      </div>

      {/* Feature cards grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} inView={true} />
        ))}
      </div>
    </section>
  );
}
