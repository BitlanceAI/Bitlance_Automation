import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const AwarenessBanner = ({ campaign, variant = 'hero', onImpression, onClose }) => {
    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: true // Only track impression once
    });

    // Safety check for creative assets
    const creative = campaign?.creative_assets || {};
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (inView && onImpression) {
            // Slight delay to ensure it's a "viewable" impression (e.g. 1s)
            const timer = setTimeout(() => {
                onImpression();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [inView, onImpression]);

    if (!isVisible) return null;

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    // Styling based on variant
    const baseClasses = "relative overflow-hidden transition-all duration-300";
    const variantClasses = {
        hero: "w-full min-h-[400px] flex items-center justify-center bg-gray-900 text-white",
        inline: "w-full my-8 rounded-xl shadow-lg bg-white dark:bg-slate-800",
        popup: "fixed bottom-4 right-4 max-w-sm w-full z-50 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700",
        sticky: "sticky top-0 z-40 w-full bg-blue-600 text-white py-3 px-4"
    };

    return (
        <div ref={ref} className={`${baseClasses} ${variantClasses[variant] || variantClasses.inline}`}>
            {/* Background Image / content */}
            {variant === 'hero' && creative.imageUrl && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={creative.imageUrl}
                        alt={creative.headline}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
            )}

            {/* Close Button */}
            {(variant === 'popup' || variant === 'sticky') && (
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Content Container */}
            <div className={`relative z-10 ${variant === 'sticky' ? 'flex justify-between items-center' : 'p-8 flex flex-col items-center text-center'}`}>

                <div className={variant === 'sticky' ? 'flex-1' : 'max-w-2xl'}>
                    <h2 className={`font-bold ${variant === 'hero' ? 'text-4xl md:text-5xl mb-4' : 'text-xl md:text-2xl mb-2'}`}>
                        {creative.headline}
                    </h2>

                    {creative.subheadline && (
                        <p className={`${variant === 'hero' ? 'text-xl text-gray-200 mb-8' : 'text-gray-600 dark:text-gray-300 mb-6'}`}>
                            {creative.subheadline}
                        </p>
                    )}
                </div>

                {creative.ctaText && (
                    <button
                        onClick={() => window.open(creative.ctaUrl, '_blank')}
                        className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95
                            ${variant === 'hero'
                                ? 'bg-white text-black hover:bg-gray-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                            }`}
                    >
                        {creative.ctaText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AwarenessBanner;
