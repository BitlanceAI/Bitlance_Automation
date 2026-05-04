import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Zap } from 'lucide-react';

const TEAL = '#26CECE';

const STEPS = [
    {
        id: 'source-type',
        title: 'Step 1 — Choose Source',
        desc: 'Pick how you want to provide article topics. Use "Manual" to type a title yourself, or "WordPress" to pull topics from your site automatically.',
        position: 'bottom',
    },
    {
        id: 'article-title',
        title: 'Step 2 — Enter Your Topic',
        desc: 'Type the article title or topic you want the AI to write about. Be specific — e.g. "Best SEO strategies for real estate 2025" ranks better than "SEO tips".',
        position: 'bottom',
    },
    {
        id: 'profile-select',
        title: 'Step 3 — Select Profile',
        desc: 'Choose an author profile so the article gets the right name and metadata attached. You can add new profiles from the Settings page.',
        position: 'bottom',
    },
    {
        id: 'article-options',
        title: 'Step 4 — Article Settings',
        desc: 'Set language, writing style, length, and target audience. These guide how the AI frames the content. "Professional" + "Long" works best for SEO.',
        position: 'top',
    },
    {
        id: 'generate-btn',
        title: 'Step 5 — Generate Article',
        desc: 'Click this button to start the AI pipeline. It will research keywords, write the article, and check for plagiarism. Takes about 30–90 seconds and costs 10 credits.',
        position: 'top',
    },
    {
        id: 'article-output',
        title: 'Step 6 — Review Output',
        desc: 'Your generated article appears here. Read through it, check the SEO title, and make any tweaks before publishing.',
        position: 'left',
    },
    {
        id: 'wp-upload',
        title: 'Step 7 — Publish to WordPress',
        desc: 'Happy with the article? Click this button to push it directly to your WordPress site — with title, content, image, and SEO fields, all set automatically.',
        position: 'top',
    },
];

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 160; // approximate
const GAP = 14;

function getTooltipStyle(rect, position) {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    switch (position) {
        case 'bottom':
            return {
                top: rect.bottom + scrollY + GAP,
                left: Math.max(8, Math.min(
                    rect.left + scrollX + rect.width / 2 - TOOLTIP_WIDTH / 2,
                    window.innerWidth - TOOLTIP_WIDTH - 8
                )),
                width: TOOLTIP_WIDTH,
            };
        case 'top':
            return {
                top: rect.top + scrollY - TOOLTIP_HEIGHT - GAP,
                left: Math.max(8, Math.min(
                    rect.left + scrollX + rect.width / 2 - TOOLTIP_WIDTH / 2,
                    window.innerWidth - TOOLTIP_WIDTH - 8
                )),
                width: TOOLTIP_WIDTH,
            };
        case 'left':
            return {
                top: rect.top + scrollY + rect.height / 2 - TOOLTIP_HEIGHT / 2,
                left: Math.max(8, rect.left + scrollX - TOOLTIP_WIDTH - GAP),
                width: TOOLTIP_WIDTH,
            };
        case 'right':
        default:
            return {
                top: rect.top + scrollY + rect.height / 2 - TOOLTIP_HEIGHT / 2,
                left: rect.right + scrollX + GAP,
                width: TOOLTIP_WIDTH,
            };
    }
}

function HighlightBox({ rect }) {
    if (!rect) return null;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const PAD = 6;
    return (
        <div
            style={{
                position: 'absolute',
                top: rect.top + scrollY - PAD,
                left: rect.left + scrollX - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
                border: `2px solid ${TEAL}`,
                borderRadius: 3,
                boxShadow: `0 0 0 4000px rgba(0,0,0,0.65)`,
                pointerEvents: 'none',
                zIndex: 9998,
                transition: 'all 0.3s ease',
            }}
        />
    );
}

export default function SeoAgentTour({ onClose }) {
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState(null);

    const current = STEPS[step];

    const measureTarget = useCallback(() => {
        const el = document.querySelector(`[data-tour="${current.id}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Give scroll time to settle
            setTimeout(() => {
                setRect(el.getBoundingClientRect());
            }, 350);
        } else {
            setRect(null);
        }
    }, [current.id]);

    useEffect(() => {
        measureTarget();
        window.addEventListener('resize', measureTarget);
        return () => window.removeEventListener('resize', measureTarget);
    }, [measureTarget]);

    const next = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else onClose();
    };
    const prev = () => { if (step > 0) setStep(s => s - 1); };

    const tooltipStyle = getTooltipStyle(rect, current.position);

    return createPortal(
        <>
            {/* Overlay + Spotlight */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9997,
                    pointerEvents: 'none',
                }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none' }}>
                <HighlightBox rect={rect} />
            </div>

            {/* Tooltip card */}
            <div
                style={{
                    position: 'absolute',
                    zIndex: 9999,
                    ...tooltipStyle,
                }}
            >
                <div
                    style={{
                        background: '#111',
                        border: `1px solid ${TEAL}60`,
                        borderRadius: 3,
                        padding: '20px',
                        boxShadow: `0 0 0 1px #1E1E1E, 0 20px 50px rgba(0,0,0,0.7), 0 0 30px ${TEAL}15`,
                        width: TOOLTIP_WIDTH,
                    }}
                >
                    {/* Progress bar */}
                    <div className="flex gap-1 mb-4">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: 2,
                                    borderRadius: 1,
                                    background: i <= step ? TEAL : '#2A2A2A',
                                    transition: 'background 0.3s',
                                }}
                            />
                        ))}
                    </div>

                    {/* Step label */}
                    <div
                        className="text-[10px] font-mono tracking-widest uppercase mb-2"
                        style={{ color: TEAL }}
                    >
                        {step + 1} / {STEPS.length}
                    </div>

                    {/* Title */}
                    <h3
                        className="text-sm font-bold text-white mb-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {current.title}
                    </h3>

                    {/* Description */}
                    <p
                        className="text-[12px] text-white/60 leading-relaxed mb-4"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                        {current.desc}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={onClose}
                            className="text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors"
                        >
                            Skip tour
                        </button>
                        <div className="flex items-center gap-2">
                            {step > 0 && (
                                <button
                                    onClick={prev}
                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-white/60 hover:text-white border border-[#333] hover:border-[#555] transition-all"
                                    style={{ borderRadius: 2 }}
                                >
                                    <ArrowLeft size={11} /> Back
                                </button>
                            )}
                            <button
                                onClick={next}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
                                style={{
                                    background: TEAL,
                                    color: '#070707',
                                    borderRadius: 2,
                                }}
                            >
                                {step === STEPS.length - 1 ? (
                                    <><Zap size={11} /> Done</>
                                ) : (
                                    <>Next <ArrowRight size={11} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Close button fixed top-right */}
            <button
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 80,
                    right: 16,
                    zIndex: 10000,
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: 2,
                    padding: '8px',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                }}
            >
                <X size={16} />
            </button>
        </>,
        document.body
    );
}
