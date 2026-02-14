import React from 'react';
import { motion } from 'framer-motion';

/**
 * Wraps content with a scroll reveal animation.
 * @param {React.ReactNode} children - The content to reveal.
 * @param {string} className - Optional CSS class.
 * @param {number} delay - Optional delay.
 */
const ScrollReveal = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.22, 1, 0.36, 1] // Custom refined ease curve
            }}
            viewport={{ once: true, margin: "-100px" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
