import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, X, Clapperboard, Timer, Bot, UploadCloud } from 'lucide-react';
import seoVideo from '../../assets/SEO_AI_agent-_implementation.mp4';

const VIDEO_URL = seoVideo;
const THUMBNAIL_URL = null; // Set to a real thumbnail URL or null for gradient placeholder

export default function VideoSection({ videoRef: externalRef }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [playing, setPlaying] = useState(false);

  // Allow parent to scroll to this section via ref
  const sectionRef = externalRef || ref;

  return (
    <section id="demo" ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      {/* Orb */}
      <div className="orb w-[600px] h-[600px] bg-brand/5 -bottom-32 left-1/2 -translate-x-1/2" />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <p className="text-brand text-sm font-bold uppercase tracking-widest mb-4">Live Demo</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="mt-4 text-white/50 text-base sm:text-lg max-w-xl mx-auto">
            Watch the SEO AI Agent take a keyword from input to a published WordPress article — in under 3 minutes.
          </p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden border border-brand/20 shadow-2xl shadow-brand/10"
          style={{ aspectRatio: '16/9' }}
        >
          {playing ? (
            <>
              {VIDEO_URL?.includes('.mp4') ? (
                <video
                  src={VIDEO_URL}
                  autoPlay
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={VIDEO_URL}
                  title="Bitlance SEO AI Agent Demo"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                />
              )}
              <button
                onClick={() => setPlaying(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all z-10"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
              onClick={() => setPlaying(true)}
              style={{
                background: THUMBNAIL_URL
                  ? `url(${THUMBNAIL_URL}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #0D1A1A 0%, #0A2020 40%, #0D0D0D 100%)',
              }}
            >
              {/* Grid overlay */}
              {!THUMBNAIL_URL && (
                <svg className="absolute inset-0 w-full h-full opacity-30">
                  <defs>
                    <pattern id="vg" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(38,206,206,0.08)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#vg)" />
                </svg>
              )}

              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[200, 160, 120].map((size, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-brand/10 group-hover:border-brand/20 transition-all duration-700"
                    style={{ width: size, height: size, transitionDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>

              {!THUMBNAIL_URL && (
                <div className="relative z-10 mb-6 text-center flex flex-col items-center">
                  <div className="mb-4 text-brand">
                    <Clapperboard size={56} strokeWidth={1.5} />
                  </div>
                  <p className="text-white/40 text-sm">SEO AI Agent — Live Demo</p>
                </div>
              )}

              {/* Play button */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-brand group-hover:bg-brand/90 flex items-center justify-center shadow-2xl shadow-brand/40 group-hover:shadow-brand/60 group-hover:scale-110 transition-all duration-300 animate-glow">
                <Play size={28} className="text-black fill-black ml-1" />
              </div>

              <p className="relative z-10 mt-6 text-white/50 text-sm group-hover:text-white/70 transition-colors">
                Click to play · 2 min 47 sec
              </p>
            </div>
          )}
        </motion.div>

        {/* Feature callouts below video */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Timer size={20} className="text-brand" />, text: 'Real-time generation in 3 minutes' },
            { icon: <Bot size={20} className="text-brand" />, text: 'No prompting or editing required' },
            { icon: <UploadCloud size={20} className="text-brand" />, text: 'Publishes directly to WordPress' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 bg-card border border-white/5 rounded-xl px-4 py-3"
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm text-white/60 font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
