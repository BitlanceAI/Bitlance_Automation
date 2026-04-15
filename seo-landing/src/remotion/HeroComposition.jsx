import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

const BRAND = '#26CECE';
const BRAND_DIM = 'rgba(38,206,206,0.15)';

// Animated teal grid lines
const GridLines = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(38,206,206,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
};

// Single word that fades/scales in
const Word = ({ text, delay, color = '#fff', size = 72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 150 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [30, 0]);
  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${y}px)`,
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-2px',
        lineHeight: 1.1,
        marginRight: 16,
      }}
    >
      {text}
    </span>
  );
};

// Typing cursor
const Cursor = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const visible = frame > delay && Math.floor((frame - delay) / 15) % 2 === 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 4,
        height: 72,
        background: BRAND,
        marginLeft: 4,
        opacity: visible ? 1 : 0,
        verticalAlign: 'middle',
      }}
    />
  );
};

// Animated stat badge
const StatBadge = ({ value, label, delay, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.7, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        background: 'rgba(26,26,26,0.95)',
        border: `1px solid rgba(38,206,206,0.35)`,
        borderRadius: 16,
        padding: '18px 28px',
        backdropFilter: 'blur(12px)',
        minWidth: 160,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(38,206,206,0.12)',
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: BRAND,
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Inter, sans-serif',
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Pulsing orb
const Orb = ({ x, y, size, delay, color = BRAND }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [delay, delay + 30, delay + 90, delay + 120],
    [0, 0.6, 0.6, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const scale = interpolate(frame, [delay, delay + 60], [0.8, 1.2], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }}
    />
  );
};

// Feature pill
const FeaturePill = ({ text, icon, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [20, 0]);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(38,206,206,0.1)',
        border: '1px solid rgba(38,206,206,0.3)',
        borderRadius: 100,
        padding: '10px 20px',
        opacity,
        transform: `translateX(${x}px)`,
        marginRight: 12,
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: BRAND,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const HeroComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#0A0A0A', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: bgOpacity }}>
        <GridLines />
        {/* Orbs */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(38,206,206,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -300,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(38,206,206,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          gap: 0,
        }}
      >
        {/* Badge */}
        <Sequence from={5}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
            {(() => {
              const { fps } = useVideoConfig();
              const f = useCurrentFrame();
              const p = spring({ frame: f, fps, config: { damping: 16 } });
              return (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(38,206,206,0.08)',
                    border: '1px solid rgba(38,206,206,0.25)',
                    borderRadius: 100,
                    padding: '8px 20px',
                    opacity: interpolate(p, [0,1],[0,1]),
                    transform: `scale(${interpolate(p,[0,1],[0.9,1])})`,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND, display: 'inline-block' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: BRAND, fontFamily: 'Inter, sans-serif' }}>
                    AI-Powered SEO Engine
                  </span>
                </div>
              );
            })()}
          </div>
        </Sequence>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div>
            <Word text="Rank" delay={10} />
            <Word text="#1" delay={18} color={BRAND} />
            <Word text="on" delay={26} />
            <Word text="Google," delay={34} />
          </div>
          <div>
            <Word text="Automatically." delay={44} />
            <Cursor delay={44} />
          </div>
        </div>

        {/* Sub */}
        <Sequence from={60}>
          {(() => {
            const f = useCurrentFrame();
            const { fps } = useVideoConfig();
            const p = spring({ frame: f, fps, config: { damping: 18 } });
            return (
              <p
                style={{
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  maxWidth: 700,
                  lineHeight: 1.65,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  opacity: interpolate(p, [0,1],[0,1]),
                  transform: `translateY(${interpolate(p,[0,1],[16,0])}px)`,
                  marginBottom: 40,
                }}
              >
                Turn any keyword into a fully-researched, SEO-optimised blog post. Auto-publish
                to WordPress and watch organic traffic climb — completely hands-free.
              </p>
            );
          })()}
        </Sequence>

        {/* Feature pills */}
        <Sequence from={80}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
            <FeaturePill text="Auto-Publish" icon="🚀" delay={0} />
            <FeaturePill text="Keyword Research" icon="🔍" delay={8} />
            <FeaturePill text="Plagiarism Check" icon="✅" delay={16} />
            <FeaturePill text="WordPress Sync" icon="🔗" delay={24} />
          </div>
        </Sequence>

        {/* CTA Buttons */}
        <Sequence from={110}>
          {(() => {
            const f = useCurrentFrame();
            const { fps } = useVideoConfig();
            const p = spring({ frame: f, fps, config: { damping: 18 } });
            return (
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 12,
                  opacity: interpolate(p,[0,1],[0,1]),
                  transform: `translateY(${interpolate(p,[0,1],[20,0])}px)`,
                }}
              >
                <div
                  style={{
                    padding: '16px 36px',
                    background: BRAND,
                    borderRadius: 12,
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#000',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    boxShadow: `0 0 40px rgba(38,206,206,0.4)`,
                  }}
                >
                  Start Free Trial
                </div>
                <div
                  style={{
                    padding: '16px 36px',
                    background: 'transparent',
                    border: '1px solid rgba(38,206,206,0.4)',
                    borderRadius: 12,
                    fontSize: 17,
                    fontWeight: 600,
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Watch Demo
                </div>
              </div>
            );
          })()}
        </Sequence>
      </AbsoluteFill>

      {/* Floating stat badges */}
      <StatBadge value="10x" label="Faster Content" delay={130} x={60} y={80} />
      <StatBadge value="500+" label="Articles Generated" delay={140} x={60} y={520} />
      <StatBadge value="#1" label="Google Rankings" delay={150} x={1600} y={80} />
      <StatBadge value="3 min" label="Per Article" delay={160} x={1600} y={520} />
    </AbsoluteFill>
  );
};
