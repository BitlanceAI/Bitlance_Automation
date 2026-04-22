import { MessageCircle, Check, Calendar, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';

const features = [
    { title: 'Manual Work',           desc: 'How much time does your team waste every week updating sheets, reports, and follow-up lists manually?',                                              icon: MessageCircle },
    { title: 'Visibility',            desc: 'Do you have one place where you can see every lead, every conversation, and every follow-up status in real time?',                               icon: Check },
    { title: 'Lost Opportunities',    desc: "How many 'hot' leads go cold because nobody sent a reminder message or follow-up sequence?",                                                     icon: Calendar },
    { title: 'Data-Driven Decisions', desc: 'If you could see which campaigns and ads actually bring leads that convert, what decisions would you change this month?',                        icon: Globe },
];

const SolutionSection = () => (
    <section className="py-24 relative overflow-hidden bg-transparent">
        <ScrollReveal className="max-w-7xl mx-auto px-6">
            {/* Heading */}
            <div className="mb-16 max-w-3xl">
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: T, textTransform: 'uppercase' }}>
                    The Solution
                </span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }} viewport={{ once: true }}
                    className="mt-4 text-3xl md:text-5xl font-extrabold text-black leading-tight"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.025em' }}
                >
                    What would happen to your revenue if every lead got a response in under 5 minutes, automatically?
                </motion.h2>
                <div className="mt-6" style={{ width: 48, height: 2, background: T }} />
            </div>

            {/* Features — left-border list style, not card grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {features.map((f, idx) => {
                    const Icon = f.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -32 : 32 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            viewport={{ once: true }}
                            className="flex gap-5 group"
                        >
                            <div
                                className="flex-shrink-0 w-11 h-11 rounded flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ background: `${T}12`, border: `1px solid ${T}25` }}
                            >
                                <Icon size={20} style={{ color: T }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold mb-2 text-black transition-colors group-hover:text-[#26CECE]"
                                    style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                                    {f.title}
                                </h3>
                                <p className="text-black/50 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </ScrollReveal>
    </section>
);

export default SolutionSection;
