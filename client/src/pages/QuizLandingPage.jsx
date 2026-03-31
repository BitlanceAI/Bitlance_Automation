/**
 * Quiz Landing Page
 * Aesthetic: Dark Editorial Brutalism
 * DFII: 15 — Excellent
 *
 * Design system:
 *   Fonts   — Space Grotesk (display) + DM Mono (numbers/counters)
 *   Colors  — #070707 bg · #B9FF66 accent · #EFEFEF text · #1A1A1A surface · #2A2A2A border
 *   Motion  — one strong entrance per stage, purposeful hover states, no decorative spam
 *   Anchor  — electric-lime on true black; score counter in DM Mono; thin lime progress bar
 *
 * Avoids: purple-gradient SaaS, Inter, circular gauges, symmetrical card grids
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { ArrowRight, ChevronLeft, Download, CheckCircle, LogIn, UserPlus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/layout/SEOHead';

// ── Floating ambient particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 12 + 8,
  delay: Math.random() * 6,
  opacity: Math.random() * 0.25 + 0.05,
}));

function FloatingParticles({ accent }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: accent,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Teal grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}

// ── Confetti burst on answer pick ────────────────────────────────────────────
function BurstDot({ x, y, color, angle, dist }) {
  return (
    <motion.div
      style={{
        position: 'fixed', left: x, top: y,
        width: 6, height: 6, borderRadius: '50%',
        background: color, pointerEvents: 'none', zIndex: 9999,
      }}
      initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
      animate={{
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    />
  );
}

function AnswerBurst({ pos, color, onDone }) {
  const dots = Array.from({ length: 10 }, (_, i) => ({
    angle: (i / 10) * Math.PI * 2,
    dist: Math.random() * 60 + 30,
    color: i % 3 === 0 ? '#ffffff' : color,
  }));
  useEffect(() => { const t = setTimeout(onDone, 600); return () => clearTimeout(t); }, [onDone]);
  return <>{dots.map((d, i) => <BurstDot key={i} x={pos.x} y={pos.y} {...d} />)}</>;
}

// ── Canvas confetti rain (done screen) ───────────────────────────────────────
function ConfettiRain({ accent }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const COLORS = [accent, '#ffffff', '#a78bfa', '#fbbf24', '#34d399'];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: Math.random() * 3 + 1.5,
      vx: (Math.random() - 0.5) * 1.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const stop = setTimeout(() => cancelAnimationFrame(raf), 4000);
    return () => { cancelAnimationFrame(raf); clearTimeout(stop); };
  }, [accent]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// ── Design tokens (inline CSS vars baked into component) ─────────────────────
const T = {
  bg:      '#070707',
  surface: '#111111',
  border:  '#222222',
  accent:  '#26CECE',
  text:    '#EFEFEF',
  muted:   '#555555',
  font:    "'Space Grotesk', sans-serif",
  mono:    "'DM Mono', monospace",
};

// ── Quiz Data ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    tag: 'TIME DRAIN',
    question: 'How many hours per week do you lose on repetitive tasks?',
    hint: 'Emails · data entry · follow-ups · content',
    options: [
      { label: 'A', text: '10+ hours',      sub: 'Most of my week is manual work',          points: 4 },
      { label: 'B', text: '5–10 hours',     sub: 'A big chunk of my productivity gone',     points: 3 },
      { label: 'C', text: '1–5 hours',      sub: 'Some tasks could definitely be automated', points: 2 },
      { label: 'D', text: 'Almost none',    sub: 'I\'ve already optimised most of it',       points: 1 },
    ],
  },
  {
    id: 2,
    tag: 'AI EXPERIENCE',
    question: 'What\'s your current automation experience?',
    hint: 'Be honest — there\'s no wrong answer',
    options: [
      { label: 'A', text: 'Complete beginner', sub: 'Never used Zapier, Make, or AI agents',           points: 4 },
      { label: 'B', text: 'Basic tools',       sub: 'Using Zapier / Make / ChatGPT, want more',       points: 3 },
      { label: 'C', text: 'Building flows',    sub: 'Simple automations done, want AI agents',        points: 2 },
      { label: 'D', text: 'Experienced',       sub: 'Looking to scale or sell automations',           points: 1 },
    ],
  },
  {
    id: 3,
    tag: 'PRIMARY GOAL',
    question: 'Your biggest goal with AI automation?',
    hint: 'Pick the one that fits you most right now',
    options: [
      { label: 'A', text: 'Save time & cut costs',      sub: 'In my own business',                    points: 3 },
      { label: 'B', text: 'Serve clients faster',       sub: 'Deliver better, faster results',        points: 3 },
      { label: 'C', text: 'Build & sell AI systems',    sub: 'Freelance or agency income',             points: 4 },
      { label: 'D', text: 'Learn & stay ahead',         sub: 'Future-proof my skills',                points: 2 },
    ],
  },
  {
    id: 4,
    tag: 'INVESTMENT READY',
    question: 'Budget to learn AI automation in the next 30–60 days?',
    hint: 'Helps us recommend the right path for you',
    options: [
      { label: 'A', text: 'Free only',                  sub: 'Starting with zero budget',             points: 1 },
      { label: 'B', text: '₹5k or under / $60',         sub: 'Open to affordable options',            points: 2 },
      { label: 'C', text: '₹5k–₹15k / $60–$180',        sub: 'Ready to invest in growth',             points: 3 },
      { label: 'D', text: '₹15k+ / $180+',              sub: 'Investing for fast ROI',                points: 4 },
    ],
  },
  {
    id: 5,
    tag: 'URGENCY',
    question: 'How soon do you want results?',
    hint: 'Your timeline shapes your blueprint',
    options: [
      { label: 'A', text: 'Within 2–4 weeks',           sub: 'I need this now — fast results',        points: 4 },
      { label: 'B', text: '1–2 months',                 sub: 'Building steadily toward my goal',      points: 3 },
      { label: 'C', text: '3+ months / exploring',      sub: 'Taking my time, learning first',        points: 1 },
    ],
  },
];

const MAX_SCORE = 20;

function calcScore(answers) {
  return QUESTIONS.reduce((t, q) => {
    const sel = answers[q.id];
    return t + (sel != null ? (q.options[sel]?.points || 0) : 0);
  }, 0);
}

function toPct(raw) { return Math.round((raw / MAX_SCORE) * 100); }

function scoreMeta(pct) {
  if (pct >= 80) return { label: 'HIGH POTENTIAL',     line: 'Automation-Ready',    color: T.accent };
  if (pct >= 60) return { label: 'STRONG CANDIDATE',   line: 'Great Fit',           color: '#60a5fa' };
  if (pct >= 40) return { label: 'SOLID FOUNDATION',   line: 'Good Starting Point', color: '#fbbf24' };
  return           { label: 'EARLY EXPLORER',          line: 'Just Getting Started', color: '#a78bfa' };
}

function pLine(answers, pct) {
  const h = answers[1];
  const hrs = h === 0 ? '15+' : h === 1 ? '12+' : h === 2 ? '8+' : '5+';
  if (pct >= 70) return `You could reclaim ${hrs} hours/week once you follow the Blueprint`;
  if (pct >= 50) return `The right system will recover ${hrs} hours/week for you`;
  return 'The Blueprint maps your exact first steps to start saving time this week';
}

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return val;
}

// ── Shared motion variants ────────────────────────────────────────────────────
const enter = {
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.22 } },
};

// ── Components ────────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <span style={{
      fontFamily: T.mono,
      fontSize: 10,
      letterSpacing: '0.18em',
      color: T.muted,
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

function AccentLine() {
  return <div style={{ height: 1, background: T.accent, marginBottom: 32, opacity: 0.25 }} />;
}

function OptionCard({ opt, selected, onClick, index }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        border: `1px solid ${selected ? T.accent : T.border}`,
        borderRadius: 4,
        background: selected ? `${T.accent}12` : T.surface,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: 8,
      }}
    >
      {/* Index badge */}
      <span style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.mono,
        fontSize: 12,
        color: selected ? T.bg : T.muted,
        background: selected ? T.accent : '#1E1E1E',
        borderRadius: 2,
        transition: 'background 0.15s, color 0.15s',
      }}>
        {opt.label}
      </span>
      <div>
        <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.text, lineHeight: 1.3 }}>
          {opt.text}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2 }}>
          {opt.sub}
        </div>
      </div>
      {/* Selection tick */}
      {selected && (
        <CheckCircle
          size={16}
          style={{ marginLeft: 'auto', flexShrink: 0, color: T.accent }}
        />
      )}
    </motion.button>
  );
}

// ── Audio Utilities ────────────────────────────────────────────────────────────
const playClickSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Click audio failed:', e);
  }
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizLandingPage() {
  const [stage, setStage] = useState('intro');   // intro | quiz | result | gate | done
  const [qIdx, setQIdx]   = useState(0);
  const [answers, setAnswers] = useState({});
  const [pct, setPct]     = useState(0);
  const [form, setForm]   = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');
  const [burst, setBurst] = useState(null); // { x, y } for answer burst effect
  const topRef = useRef(null);
  const up = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });
  const clearBurst = useCallback(() => setBurst(null), []);

  // Play entry sound on mount
  useEffect(() => {
    const playEntrySound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        // Oscillator 1 - low tech sweep up
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(100, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
        
        gain1.gain.setValueAtTime(0, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // Oscillator 2 - high tech ping
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.25);
        
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.warn('Audio play failed:', e);
      }
    };
    
    // Slight delay for dramatic effect
    const timer = setTimeout(playEntrySound, 100);
    return () => clearTimeout(timer);
  }, []);

  const meta = scoreMeta(pct);
  const displayed = useCountUp(stage === 'result' ? pct : 0, 1200);

  const pickAnswer = (i, e) => {
    playClickSound();
    // Capture click position for burst
    if (e) setBurst({ x: e.clientX, y: e.clientY });
    const qId = QUESTIONS[qIdx].id;
    const next = { ...answers, [qId]: i };
    setAnswers(next);
    setTimeout(() => {
      if (qIdx < QUESTIONS.length - 1) { setQIdx(qIdx + 1); up(); }
      else {
        const raw = calcScore(next);
        setPct(toPct(raw));
        setStage('result'); up();
      }
    }, 260);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErr('All fields are required.');
      return;
    }
    setErr('');
    setBusy(true);
    
    const payload = { 
      name: form.name, 
      email: form.email, 
      phone: form.phone, 
      quizScore: pct, 
      quizAnswers: answers,
      source: 'QuizLandingPage'
    };

    try {
      // Send to both backend DB and n8n Webhook concurrently
      // Use Promise.allSettled so if one fails, the other still fires
      await Promise.allSettled([
        fetch(`${API_BASE}/api/leads/quiz-optin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        fetch('https://bitlancetechhub.app.n8n.cloud/webhook/lead', {
          method: 'POST',
          // mode: 'no-cors', // Uncomment if running into strict CORS issues from n8n
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      ]);
    } catch (error) {
      console.error('Lead submission error:', error);
    }
    
    setBusy(false);
    setStage('done'); up();
  };

  const progress = (qIdx / QUESTIONS.length) * 100;

  return (
    <>
      <SEOHead
        title="AI Automation Score Quiz | Get Your Free Blueprint"
        description="5 questions to discover your AI automation potential. Get a free personalised Blueprint delivered to your inbox."
      />
      {/* Burst overlay */}
      {burst && <AnswerBurst pos={burst} color={T.accent} onDone={clearBurst} />}
      {/* Done screen confetti */}
      {stage === 'done' && <ConfettiRain accent={T.accent} />}

      <div
        ref={topRef}
        style={{
          minHeight: '100vh',
          background: T.bg,
          color: T.text,
          fontFamily: T.font,
          paddingBottom: 80,
          position: 'relative',
        }}
      >
        {/* Ambient floating particles on every stage */}
        <FloatingParticles accent={T.accent} />
        <AnimatePresence mode="wait">

          {/* ── INTRO ──────────────────────────────────────────────────────── */}
          {stage === 'intro' && (
            <motion.div key="intro" {...enter}
              style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px 0' }}
            >
              {/* Top label */}
              <Label>Free 5-question assessment</Label>

              {/* Headline — broken grid, hard left */}
              <h1 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 'clamp(36px, 6vw, 64px)',
                lineHeight: 1.05,
                marginTop: 20,
                marginBottom: 0,
                letterSpacing: '-0.03em',
              }}>
                Find out if you're<br />
                <span style={{ color: T.accent }}>ready to automate</span><br />
                your business.
              </h1>

              {/* Thin accent rule — asymmetric */}
              <div style={{ marginTop: 32, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 2, background: T.accent }} />
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.14em' }}>
                  05 QUESTIONS · 2 MIN
                </span>
              </div>

              <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.7, marginBottom: 48, maxWidth: 440 }}>
                Answer 5 questions. Get your personalised AI Automation Score and a free step-by-step Blueprint — delivered to your inbox.
              </p>

              {/* What you receive — sparse list, not cards */}
              <div style={{ borderLeft: `2px solid ${T.border}`, paddingLeft: 20, marginBottom: 56 }}>
                {[
                  ['Score /100', 'See exactly where you stand against other operators'],
                  ['Blueprint PDF', 'Step-by-step system to start saving hours immediately'],
                  ['7-day sequence', 'Tips, case studies & an exclusive offer — dripped daily'],
                ].map(([title, sub]) => (
                  <div key={title} style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{title}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={() => { playClickSound(); setStage('quiz'); up(); }}
                whileHover={{ backgroundColor: '#35DFDF' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '18px 36px',
                  background: T.accent,
                  color: T.bg,
                  border: 'none',
                  borderRadius: 2,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.15s',
                }}
              >
                Get Free Audit <ArrowRight size={18} />
              </motion.button>

              <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.1em' }}>
                NO SIGNUP REQUIRED TO START
              </div>
            </motion.div>
          )}

          {/* ── QUIZ ───────────────────────────────────────────────────────── */}
          {stage === 'quiz' && (
            <motion.div key={`q-${qIdx}`} {...enter}
              style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 0' }}
            >
              {/* Progress bar — thin electric lime */}
              <div style={{ height: 2, background: T.border, borderRadius: 1, marginBottom: 40, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: T.accent, borderRadius: 1 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>

              {/* Step counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
                <Label>{QUESTIONS[qIdx].tag}</Label>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>
                  0{qIdx + 1}&nbsp;/&nbsp;0{QUESTIONS.length}
                </span>
              </div>

              <h2 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 'clamp(22px, 4vw, 32px)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}>
                {QUESTIONS[qIdx].question}
              </h2>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.08em', marginBottom: 36 }}>
                {QUESTIONS[qIdx].hint.toUpperCase()}
              </p>

              <div>
                {QUESTIONS[qIdx].options.map((opt, i) => (
                  <OptionCard
                    key={i}
                    opt={opt}
                    index={i}
                    selected={answers[QUESTIONS[qIdx].id] === i}
                    onClick={(e) => pickAnswer(i, e)}
                  />
                ))}
              </div>

              {/* Back */}
              <button
                onClick={() => {
                  playClickSound();
                  if (qIdx > 0) { setQIdx(qIdx - 1); up(); }
                  else { setStage('intro'); up(); }
                }}
                style={{
                  marginTop: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: T.muted,
                  fontFamily: T.font,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            </motion.div>
          )}

          {/* ── RESULT ─────────────────────────────────────────────────────── */}
          {stage === 'result' && (
            <motion.div key="result" {...enter}
              style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px 0' }}
            >
              <Label>Your score</Label>

              {/* Score — typographic with pulsing glow ring */}
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end', gap: 16, margin: '16px 0 4px' }}>
                {/* Pulsing ring */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 140, height: 140,
                    borderRadius: '50%',
                    border: `2px solid ${meta.color}`,
                    pointerEvents: 'none',
                  }}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 100, height: 100,
                    borderRadius: '50%',
                    border: `1px solid ${meta.color}50`,
                    pointerEvents: 'none',
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <span style={{
                  fontFamily: T.mono,
                  fontWeight: 500,
                  fontSize: 'clamp(72px, 16vw, 120px)',
                  lineHeight: 1,
                  color: meta.color,
                  letterSpacing: '-0.04em',
                }}>
                  {displayed}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 20, color: T.muted, paddingBottom: 12 }}>
                  /100
                </span>
              </div>

              {/* Animated lime underline — the signature anchor */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{ height: 3, background: meta.color, borderRadius: 1, maxWidth: '100%', marginBottom: 20 }}
              />

              <h2 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 'clamp(20px, 4vw, 28px)',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}>
                {meta.label}
              </h2>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginBottom: 40 }}>
                {meta.line}
              </p>

              <AccentLine />

              {/* Personalised line */}
              <p style={{
                fontFamily: T.font,
                fontSize: 18,
                lineHeight: 1.6,
                color: T.text,
                marginBottom: 48,
                borderLeft: `3px solid ${T.accent}`,
                paddingLeft: 20,
              }}>
                {pLine(answers, pct)}
              </p>

              {/* Blueprint CTA */}
              <div style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                padding: '28px 24px',
                marginBottom: 40,
              }}>
                <Label>What you're unlocking</Label>
                <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 20, margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  AI Automation Blueprint
                </h3>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 0 }}>
                  Personalised to your score · PDF + bonus checklist · delivered to your inbox
                </p>
              </div>

              <motion.button
                onClick={() => { playClickSound(); setStage('gate'); up(); }}
                whileHover={{ backgroundColor: '#35DFDF' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '18px 36px',
                  background: T.accent,
                  color: T.bg,
                  border: 'none',
                  borderRadius: 2,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.15s',
                }}
              >
                <Download size={18} /> Download Free Blueprint
              </motion.button>
              <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.1em' }}>
                TAKES 10 SECONDS · NO CREDIT CARD
              </div>
            </motion.div>
          )}

          {/* ── EMAIL GATE ─────────────────────────────────────────────────── */}
          {stage === 'gate' && (
            <motion.div key="gate" {...enter}
              style={{ maxWidth: 520, margin: '0 auto', padding: '80px 24px 0' }}
            >
              {/* Score reminder — small mono */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                <span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 500, color: meta.color, letterSpacing: '-0.04em' }}>
                  {pct}
                </span>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.14em' }}>/100 · {meta.label}</div>
                  <div style={{ height: 2, background: meta.color, borderRadius: 1, marginTop: 4, width: `${Math.max(pct, 10) * 0.6}px` }} />
                </div>
              </div>

              <Label>One last step</Label>
              <h2 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 'clamp(24px, 5vw, 36px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                margin: '12px 0 8px',
              }}>
                Where should we send<br />your Blueprint?
              </h2>
              <p style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginBottom: 36 }}>
                Blueprint PDF + bonus checklist sent instantly.
              </p>

              {err && (
                <div style={{
                  border: '1px solid #ef4444',
                  background: '#ef444412',
                  borderRadius: 2,
                  padding: '10px 16px',
                  fontSize: 13,
                  color: '#fca5a5',
                  marginBottom: 20,
                }}>
                  {err}
                </div>
              )}

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'name',  type: 'text',  ph: 'Your name' },
                  { key: 'email', type: 'email', ph: 'Email address' },
                  { key: 'phone', type: 'tel',   ph: 'WhatsApp / phone number' },
                ].map(({ key, type, ph }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 2,
                      color: T.text,
                      fontFamily: T.font,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = T.accent)}
                    onBlur={(e) => (e.target.style.borderColor = T.border)}
                  />
                ))}

                <motion.button
                  type="submit"
                  disabled={busy}
                  whileHover={busy ? {} : { backgroundColor: '#35DFDF' }}
                  whileTap={busy ? {} : { scale: 0.97 }}
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '18px 0',
                    background: busy ? '#6b7280' : T.accent,
                    color: T.bg,
                    border: 'none',
                    borderRadius: 2,
                    fontFamily: T.font,
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {busy ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity="0.75" />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    <><Download size={16} /> Send My Blueprint</>
                  )}
                </motion.button>
              </form>

              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.1em', marginTop: 16, textAlign: 'center' }}>
                NO SPAM · UNSUBSCRIBE ANYTIME
              </p>
            </motion.div>
          )}

          {/* ── DONE ───────────────────────────────────────────────────────── */}
          {stage === 'done' && (
            <motion.div key="done" {...enter}
              style={{ maxWidth: 560, margin: '0 auto', padding: '100px 24px 0', textAlign: 'center' }}
            >
              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  background: T.accent,
                  borderRadius: 2,
                  marginBottom: 36,
                }}
              >
                <CheckCircle size={34} color={T.bg} />
              </motion.div>

              <h2 style={{
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 'clamp(28px, 5vw, 40px)',
                letterSpacing: '-0.025em',
                marginBottom: 12,
              }}>
                You're in, {form.name.split(' ')[0] || 'friend'}.
              </h2>
              <p style={{ fontFamily: T.font, fontSize: 16, color: T.muted, marginBottom: 40 }}>
                Check your inbox — the Blueprint lands in the next few minutes. Or download it directly below.
              </p>

              <motion.a
                href="https://paskzwoegduhzehkxoyu.supabase.co/storage/v1/object/public/workbook/ai_agents_blueprint.pdf"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ backgroundColor: '#35DFDF' }}
                whileTap={{ scale: 0.97 }}
                onClick={playClickSound}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 32px',
                  background: T.accent,
                  color: T.bg,
                  border: 'none',
                  textDecoration: 'none',
                  borderRadius: 2,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.15s',
                  marginBottom: 60,
                }}
              >
                <Download size={18} /> Download Workbook Now
              </motion.a>

              {/* Auth CTA */}
              <div style={{ marginTop: 32, marginBottom: 8 }}>
                <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>
                  Ready to use your AI agents?
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 28px',
                      background: T.accent,
                      color: T.bg,
                      border: 'none',
                      borderRadius: 2,
                      fontFamily: T.font,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#35DFDF')}
                    onMouseLeave={e => (e.currentTarget.style.background = T.accent)}
                  >
                    <LogIn size={15} /> Log In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 28px',
                      background: 'transparent',
                      color: T.text,
                      border: `1px solid ${T.border}`,
                      borderRadius: 2,
                      fontFamily: T.font,
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                  >
                    <UserPlus size={15} /> Create Account
                  </Link>
                </div>
              </div>


              {/* Score recap */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 48,
                padding: '10px 20px',
                border: `1px solid ${T.border}`,
                borderRadius: 2,
              }}>
                <span style={{ fontFamily: T.mono, fontSize: 14, color: meta.color }}>
                  {pct}/100
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em' }}>
                  {meta.label}
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}
