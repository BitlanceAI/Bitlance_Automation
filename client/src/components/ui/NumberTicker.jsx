import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animates a number from start to end when in view.
 * @param {number} value - The target number to animate to.
 * @param {number} start - The starting number (default 0).
 * @param {string} direction - "up" or "down" (default "up"). If "down", starts at value*2 or specified start.
 * @param {number} delay - Delay in seconds.
 * @param {string} className - CSS class for styling.
 */
export default function NumberTicker({ value, start = 0, direction = "up", delay = 0, className = "" }) {
    const ref = useRef(null);
    const initialValue = direction === "down" ? (start || value + 20) : start;
    const targetValue = value;

    const motionValue = useMotionValue(initialValue);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
        duration: 2 // Slower animation for visibility
    });

    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(targetValue);
            }, delay * 1000);
        }
    }, [isInView, motionValue, targetValue, delay]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // Format with commas if needed, and removal decimal points for integers
                ref.current.textContent = Intl.NumberFormat("en-US").format(latest.toFixed(0));
            }
        });
    }, [springValue]);

    return <span className={className} ref={ref}>{initialValue}</span>;
}
