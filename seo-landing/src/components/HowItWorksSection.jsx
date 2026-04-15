import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Microscope, PenTool, Shield, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Target size={24} className="text-white" />,
    title: 'Enter Your Keyword',
    desc: 'Type any topic or keyword. Optionally pick a target audience, writing style, and article length.',
    detail: 'Supports manual input, WordPress auto-queue, or Google Sheets bulk import.',
  },
  {
    number: '02',
    icon: <Microscope size={24} className="text-white" />,
    title: 'AI Researches the Topic',
    desc: 'SerpAPI fetches the top-ranking content. The AI identifies gaps, outlines the article, and gathers supporting data.',
    detail: 'Uses GPT-4o with a custom SEO-tuned prompt for maximum relevance and depth.',
  },
  {
    number: '03',
    icon: <PenTool size={24} className="text-white" />,
    title: 'Article is Written',
    desc: 'A 1,500–3,000 word article is generated with proper structure, keyword density, headers, and meta description.',
    detail: 'Includes title tag, meta description, slug suggestion, and featured image prompt.',
  },
  {
    number: '04',
    icon: <Shield size={24} className="text-white" />,
    title: 'Plagiarism Scan',
    desc: 'The article is scanned for originality before publishing. If anything flags, it gets rewritten automatically.',
    detail: '100% original content — no risk of Google penalties.',
  },
  {
    number: '05',
    icon: <Rocket size={24} className="text-white" />,
    title: 'Auto-Published',
    desc: "Article, image, categories, tags, and internal links are pushed directly to your WordPress site via REST API.",
    detail: 'Works with any WordPress installation. No plugin required beyond REST API access.',
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-4 relative overflow-hidden">
      {/* Faint teal radial */}
      <div className="orb w-[700px] h-[700px] bg-brand/5 -top-64 -right-64" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">Simple Process</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            From Keyword to <span className="gradient-text">Live Article</span>
          </h2>
          <p className="mt-4 text-white/50 text-base sm:text-lg max-w-xl mx-auto">
            Five automated steps. Zero manual work. Consistent results every time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand/30 via-brand/10 to-transparent md:-translate-x-1/2 hidden sm:block" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.6 }}
                className={`flex items-start gap-6 md:gap-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Number bubble */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-dark border-2 border-brand/40 flex items-center justify-center shadow-lg shadow-brand/10 relative z-10">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-black text-xs font-black">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 md:max-w-[calc(50%-80px)] bg-card border border-white/5 rounded-2xl p-6 hover:border-brand/20 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-brand text-xs font-mono font-bold">{step.number}</span>
                    <h3 className="text-white font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex items-start gap-2 text-xs text-white/35">
                    <span className="text-brand mt-0.5">→</span>
                    <span>{step.detail}</span>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block flex-1 md:max-w-[calc(50%-80px)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
