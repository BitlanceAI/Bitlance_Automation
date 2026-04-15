import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

const BRAND = '#26CECE';

const features = [
  {
    icon: '🔍',
    title: 'Keyword Research',
    desc: 'SerpAPI-powered trending topic discovery. Know exactly what your audience is searching.',
    color: '#26CECE',
  },
  {
    icon: '✍️',
    title: 'AI Article Writer',
    desc: 'GPT-4o generates fully structured, 1500+ word articles with headers, bullets, and internal links.',
    color: '#2DD4BF',
  },
  {
    icon: '🚀',
    title: 'Auto-Publish',
    desc: 'Direct WordPress REST API integration. Articles go live automatically — zero manual steps.',
    color: '#5EEAD4',
  },
  {
    icon: '🔗',
    title: 'Smart Interlinking',
    desc: 'Automatically interlinks new posts with your existing content to boost site authority.',
    color: '#26CECE',
  },
  {
    icon: '🛡️',
    title: 'Plagiarism Check',
    desc: 'Every article is scanned before publishing. 100% original content, guaranteed.',
    color: '#2DD4BF',
  },
  {
    icon: '📊',
    title: 'SEO Analytics',
    desc: 'Track rankings, traffic growth, and article performance from your dashboard.',
    color: '#5EEAD4',
  },
];

const FeatureCard = ({ icon, title, desc, color, delay, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 130 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [40, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        background: '#1A1A1A',
        border: `1px solid rgba(38,206,206,0.15)`,
        borderRadius: 16,
        padding: '32px',
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at top right, ${color}20 0%, transparent 70%)`,
          borderRadius: '0 16px 0 0',
        }}
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `rgba(38,206,206,0.1)`,
          border: `1px solid rgba(38,206,206,0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          marginBottom: 20,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.65,
        }}
      >
        {desc}
      </div>
    </div>
  );
};

// Animated workflow step
const WorkflowStep = ({ step, text, delay, isLast = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: isLast ? 0 : 24,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: BRAND,
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
        }}
      >
        {step}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const FeaturesComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 18 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ background: '#0D0D0D', overflow: 'hidden', padding: '60px 80px' }}>
      {/* Background grid */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}
      >
        <defs>
          <pattern id="g2" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(38,206,206,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g2)" />
      </svg>

      {/* Section title */}
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: BRAND,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontFamily: 'Inter, sans-serif',
            opacity: titleOpacity,
            marginBottom: 16,
          }}
        >
          Everything You Need
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-1.5px',
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          The Complete{' '}
          <span style={{ color: BRAND }}>SEO Stack</span>
        </div>
      </div>

      {/* Features grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} delay={20 + i * 12} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Workflow composition (how it works animation)
export const WorkflowComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill
      style={{
        background: '#0A0A0A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
        padding: '0 80px',
      }}
    >
      {/* Left: Steps */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: BRAND,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontFamily: 'Inter, sans-serif',
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
            marginBottom: 20,
          }}
        >
          How It Works
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            marginBottom: 48,
            opacity: interpolate(spring({ frame: frame - 5, fps }), [0, 1], [0, 1]),
          }}
        >
          From Keyword<br />
          to <span style={{ color: BRAND }}>Live Article</span><br />
          in 3 Minutes
        </div>

        <WorkflowStep step="1" text="Enter your keyword or topic" delay={20} />
        <WorkflowStep step="2" text="AI researches and writes the article" delay={35} />
        <WorkflowStep step="3" text="Plagiarism check runs automatically" delay={50} />
        <WorkflowStep step="4" text="Article auto-publishes to WordPress" delay={65} isLast />
      </div>

      {/* Right: Terminal animation */}
      <Sequence from={15}>
        {(() => {
          const f = useCurrentFrame();
          const { fps } = useVideoConfig();
          const p = spring({ frame: f, fps, config: { damping: 18 } });
          const lines = [
            { text: '$ bitlance generate --keyword "best SEO tools 2025"', color: '#fff', delay: 0 },
            { text: '🔍 Researching SERP data...', color: '#26CECE', delay: 20 },
            { text: '✍️  Generating 1,847-word article...', color: '#26CECE', delay: 40 },
            { text: '🛡️  Plagiarism score: 0% ✓', color: '#22c55e', delay: 60 },
            { text: '🚀 Published to WordPress ✓', color: '#22c55e', delay: 80 },
            { text: '📊 SEO score: 94/100', color: '#f59e0b', delay: 100 },
          ];
          return (
            <div
              style={{
                flex: 1,
                background: '#111',
                border: '1px solid rgba(38,206,206,0.2)',
                borderRadius: 16,
                padding: 32,
                fontFamily: 'JetBrains Mono, monospace',
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `scale(${interpolate(p, [0, 1], [0.95, 1])})`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Terminal header */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              {lines.map((line, i) => {
                const lineProgress = spring({
                  frame: f - line.delay,
                  fps,
                  config: { damping: 18 },
                });
                const lineOpacity = interpolate(lineProgress, [0, 1], [0, 1]);
                const lineY = interpolate(lineProgress, [0, 1], [10, 0]);
                return (
                  <div
                    key={i}
                    style={{
                      color: line.color,
                      fontSize: 15,
                      lineHeight: '28px',
                      opacity: lineOpacity,
                      transform: `translateY(${lineY}px)`,
                    }}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
