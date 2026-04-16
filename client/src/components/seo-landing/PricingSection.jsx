import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Zap, Phone } from 'lucide-react';

const APP_URL = 'https://app.bitlancetechhub.com';
const APPLY_URL = `${APP_URL}/apply`;

const productPlans = [
  {
    name: 'Starter',
    price: 1999,
    badge: null,
    desc: 'For founders testing SEO automation.',
    features: ['8 articles / month', '1 WordPress site', 'Basic keyword research', 'Plagiarism check', 'Email support'],
    missing: ['Auto-publish', 'Interlinking', 'Push notifications'],
    cta: 'Start Free Trial',
    ctaLink: `${APP_URL}/esign`,
  },
  {
    name: 'Growth',
    price: 4999,
    badge: 'Most Popular',
    desc: 'For teams ready to dominate Google.',
    features: ['30 articles / month', '3 WordPress sites', 'SerpAPI trending topics', 'Plagiarism check', 'Auto-publish', 'Interlinking', 'Push notifications', 'Priority support'],
    missing: [],
    cta: 'Get Started',
    ctaLink: `${APP_URL}/esign`,
  },
  {
    name: 'Agency',
    price: 9999,
    badge: null,
    desc: 'For agencies & multi-site businesses.',
    features: ['100 articles / month', 'Unlimited WordPress sites', 'SerpAPI + custom keywords', 'Plagiarism check', 'Auto-publish + Interlinking', 'Push notifications', 'Dedicated support'],
    missing: [],
    cta: 'Get Started',
    ctaLink: `${APP_URL}/esign`,
  },
];

const servicePlans = [
  {
    name: 'Managed Basic',
    price: 14999,
    badge: null,
    desc: 'Fully managed SEO — we handle everything.',
    features: ['12 articles / month', 'Keyword & competitor research', 'WordPress publishing', 'Monthly performance report', 'Email support'],
    missing: ['Dedicated SEO manager', 'Custom strategy', 'Backlink outreach'],
    cta: 'Apply Now',
    ctaLink: APPLY_URL,
  },
  {
    name: 'Managed Pro',
    price: 29999,
    badge: 'Most Popular',
    desc: 'Full SEO strategy + execution by our team.',
    features: ['30 articles / month', 'Custom content strategy', 'Keyword + competitor analysis', 'WordPress publishing', 'Interlinking & on-page SEO', 'Bi-weekly performance calls', 'Priority support'],
    missing: ['Backlink outreach'],
    cta: 'Apply Now',
    ctaLink: APPLY_URL,
  },
  {
    name: 'Enterprise',
    price: null,
    badge: 'Custom',
    desc: 'Unlimited scale, custom strategy, dedicated team.',
    features: ['Unlimited articles', 'Custom content strategy', 'Full backlink outreach', 'Dedicated SEO manager', 'Weekly reporting calls', 'Custom integrations', 'SLA guarantee'],
    missing: [],
    cta: 'Contact Sales',
    ctaLink: `https://wa.me/917697762374`,
  },
];

function PlanCard({ plan, index, inView }) {
  const isPopular = !!plan.badge && plan.badge !== 'Custom';
  const isCustom = plan.badge === 'Custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
      className={`card-hover relative flex flex-col rounded-2xl p-7 border transition-all ${
        isPopular
          ? 'bg-brand/5 border-brand/40 shadow-xl shadow-brand/10'
          : 'bg-card border-white/5'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
            isCustom ? 'bg-white/10 text-white/70' : 'bg-brand text-black'
          }`}
        >
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
        <p className="text-white/40 text-sm">{plan.desc}</p>
      </div>

      <div className="mb-7">
        {plan.price ? (
          <>
            <span className="text-white/40 text-base">₹</span>
            <span className="text-4xl font-black text-white mx-1">{plan.price.toLocaleString('en-IN')}</span>
            <span className="text-white/40 text-sm">/month</span>
          </>
        ) : (
          <span className="text-3xl font-black gradient-text">Custom</span>
        )}
      </div>

      <ul className="space-y-3 mb-7 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <Check size={14} className="text-brand flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
        {plan.missing.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/25 line-through">
            <X size={14} className="flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={plan.ctaLink}
        className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
          isPopular
            ? 'bg-brand text-black hover:bg-brand/90 shadow-lg shadow-brand/25'
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
        }`}
      >
        {plan.cta}
      </a>
    </motion.div>
  );
}

export default function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [tab, setTab] = useState('product');

  const plans = tab === 'product' ? productPlans : servicePlans;

  return (
    <section id="pricing" ref={ref} className="py-24 px-4 relative overflow-hidden">
      {/* BG orb */}
      <div className="orb w-[600px] h-[600px] bg-brand/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">Transparent Pricing</p>
          <h2 className="text-5xl font-black text-white leading-tight">
            Choose Your <span className="gradient-text">Growth Plan</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg">All plans include a 7-day free trial. No credit card required.</p>
        </motion.div>

        {/* Tab toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
          className="flex justify-center mb-10"
        >
          <div className="flex gap-1 bg-card border border-white/5 rounded-xl p-1">
            {[
              { id: 'product', label: 'Self-Serve SaaS', icon: Zap },
              { id: 'service', label: 'Done For You', icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === id
                    ? 'bg-brand text-black shadow-lg shadow-brand/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} inView={inView} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          All prices in INR · GST applicable · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
