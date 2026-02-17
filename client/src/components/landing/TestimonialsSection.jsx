import React from 'react';
import { motion } from 'framer-motion';
import { Carousel, TestimonialCard } from '../ui/retro-testimonial';
import ScrollReveal from '../ui/ScrollReveal';

const testimonials = [
    {
        name: "Tejaunsh S Nyati",
        designation: "CEO at Nyati Technologies",
        description: "We used to miss 20–30% calls during peak time. After adding the AI agent, every lead is answered and pre‑qualified before it reaches our sales team. It's been a game changer for our weekend closings.",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
    },
    {
        name: "Suyash Nyati",
        designation: "Director at Nyati Technologies Pvt Ltd",
        description: "Our front desk was overwhelmed with appointment queries. The AI voice agent now handles 80% of routine calls, allowing our staff to focus on critical tasks. Efficiency has skyrocketed.",
        profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1770&auto=format&fit=crop",
    },
    {
        name: "Deepak Chaudhari",
        designation: "FinTech | Business Development",
        description: "The AI automation didn't just streamline our workflow; it understood our niche requirements perfectly. We've seen a significant increase in client engagement without expanding our team.",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
    },
    {
        name: "Akshay Lakade",
        designation: "Embedded Engineer",
        description: "I was skeptical about AI integration, but the onboarding was seamless. It feels like having a dedicated assistant who knows our technical stack inside out.",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1770&auto=format&fit=crop",
    },
    {
        name: "Alok Kumar",
        designation: "Lotlite Real Estate",
        description: "Managing ads across multiple platforms was a nightmare. This system automates the entire lifecycle. Our ROI on ad spend improved by 40% in the first month alone.",
        profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
    }
];

const TestimonialsSection = () => {
    const cards = testimonials.map((testimonial, index) => (
        <TestimonialCard
            key={testimonial.name}
            testimonial={testimonial}
            index={index}
            backgroundImage={`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop`}
        />
    ));

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-6 text-white"
                >
                    Trusted by forward-thinking businesses
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-lg text-white/60 max-w-2xl mx-auto"
                >
                    See how companies are scaling their operations with our AI agents.
                </motion.p>
            </div>

            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="w-full">
                    <Carousel items={cards} />
                </div>
            </ScrollReveal>
        </section>
    );
};

export default TestimonialsSection;
