import React from 'react';
import { motion } from 'framer-motion';
import { Carousel, TestimonialCard } from '../ui/retro-testimonial';
import ScrollReveal from '../ui/ScrollReveal';

import imgTejaunsh from '../../assets/testimonals/tejaunsh_nyati.jpeg';
import imgSuyash from '../../assets/testimonals/suyash_nyati.jpeg';
import imgDeepak from '../../assets/testimonals/deepak_chaudhari.jpeg';
import imgAkshay from '../../assets/testimonals/akshay_lakde.jpeg';
import imgsahil from '../../assets/testimonals/sahil_guhane.jpeg';

const testimonials = [
    {
        name: "Tejaunsh S Nyati",
        designation: "CEO at Nyati Technologies",
        description: "We used to miss 20–30% calls during peak time. After adding the AI agent, every lead is answered and pre‑qualified before it reaches our sales team. It's been a game changer for our weekend closings.",
        profileImage: imgTejaunsh,
    },
    {
        name: "Suyash Nyati",
        designation: "Director at Nyati Technologies Pvt Ltd",
        description: "Our front desk was overwhelmed with appointment queries. The AI voice agent now handles 80% of routine calls, allowing our staff to focus on critical tasks. Efficiency has skyrocketed.",
        profileImage: imgSuyash,
    },
    {
        name: "Deepak Chaudhari",
        designation: "FinTech | Business Development",
        description: "The AI automation didn't just streamline our workflow; it understood our niche requirements perfectly. We've seen a significant increase in client engagement without expanding our team.",
        profileImage: imgDeepak,
    },
    {
        name: "Akshay Lakade",
        designation: "Embedded Engineer",
        description: "I was skeptical about AI integration, but the onboarding was seamless. It feels like having a dedicated assistant who knows our technical stack inside out.",
        profileImage: imgAkshay,
    },
    {
        name: "Sahil Guhane",
        designation: "Cloud Engineer",
        description: "I was skeptical about AI integration, but the onboarding was seamless. It feels like having a dedicated assistant who knows our technical stack inside out.",
        profileImage: imgsahil,
    }
    // },
    // {
    //     name: "Alok Kumar",
    //     designation: "Lotlite Real Estate",
    //     description: "Managing ads across multiple platforms was a nightmare. This system automates the entire lifecycle. Our ROI on ad spend improved by 40% in the first month alone.",
    //     profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
    // }
];

const TestimonialsSection = () => {
    const cards = testimonials.map((testimonial, index) => (
        <TestimonialCard
            key={testimonial.name}
            testimonial={testimonial}
            index={index}
        // backgroundImage={`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop`}
        />
    ));

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black pointer-events-none" />

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
