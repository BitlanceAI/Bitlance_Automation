import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8001';

const generateCurlSnippet = (apiKey, topic, keywords, mode, brandInfo) => `curl -X POST "${PYTHON_API_URL}/api/blog/generate" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "${topic || 'Your Blog Topic'}",
    "keywords": "${keywords || ''}",
    "optimization_mode": "${mode}",
    "brand_context_data": {
      "company_name": "Your Company",
      "additional_info": "${brandInfo || ''}"
    }
  }'`;

const generateJsSnippet = (apiKey, topic, keywords, mode, brandInfo) =>
`const response = await fetch(
  "${PYTHON_API_URL}/api/blog/generate",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic: "${topic || 'Your Blog Topic'}",
      keywords: "${keywords || ''}",
      optimization_mode: "${mode}",
      brand_context_data: {
        company_name: "Your Company",
        additional_info: "${brandInfo || ''}"
      }
    })
  }
);
const data = await response.json();
console.log(data.article); // ← Rendered blog content`;

// ─── Reusable Badge ───────────────────────────────────────────────────────────
const Badge = ({ children, color = 'teal' }) => {
  const colors = {
    teal: 'bg-teal-100 text-teal-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ n, label, active, done }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
        ${done ? 'bg-teal-500 border-teal-500 text-white' : active ? 'bg-white border-teal-500 text-teal-600' : 'bg-white border-gray-200 text-gray-400'}`}
    >
      {done ? '✓' : n}
    </div>
    <span className={`text-xs font-medium ${active || done ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
  </div>
);

// ─── Code Block ───────────────────────────────────────────────────────────────
const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-mono">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PartnerTestLab() {
  const [step, setStep] = useState(1); // 1=config 2=preview 3=integrate
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mode, setMode] = useState('SEO');
  const [brandInfo, setBrandInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [showRaw, setShowRaw] = useState(false);
  const previewRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${PYTHON_API_URL}/api/blog/generate`,
        {
          topic,
          keywords,
          optimization_mode: mode,
          brand_context_data: brandInfo
            ? { company_name: 'Partner Client', additional_info: brandInfo }
            : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 180000,
        }
      );
      setResult(res.data);
      setStep(2);
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      const msg =
        err.response?.status === 402
          ? '⚡ Insufficient Credits. Top up your balance to continue.'
          : err.response?.status === 401
          ? '🔑 Invalid API Key. Double-check your access token.'
          : err.response?.status === 429
          ? '🚦 Rate limit hit. Wait a moment and try again.'
          : err.response?.data?.detail || 'Something went wrong. Check console for details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = result?.wordCount || (result?.markdown || '').split(/\s+/).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/50 border border-teal-700/50 text-teal-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Partner Integration Test Lab
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Test Your API Integration <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #2dd4bf, #818cf8)' }}>
              Before You Ship
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Generate a live blog using your API key, preview the output exactly as it'll appear in your platform,
            then copy the integration snippet directly.
          </p>
        </div>

        {/* ── Step indicators ── */}
        <div className="flex items-center justify-center gap-0 mb-12">
          <StepDot n={1} label="Configure" active={step === 1} done={step > 1} />
          <div className={`h-0.5 w-16 mx-2 transition-colors duration-500 ${step > 1 ? 'bg-teal-500' : 'bg-gray-700'}`} />
          <StepDot n={2} label="Preview" active={step === 2} done={step > 2} />
          <div className={`h-0.5 w-16 mx-2 transition-colors duration-500 ${step > 2 ? 'bg-teal-500' : 'bg-gray-700'}`} />
          <StepDot n={3} label="Integrate" active={step === 3} done={false} />
        </div>

        {/* ── STEP 1: Config Form ── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-sm">1</div>
            <h2 className="text-white font-semibold text-lg">Configure Request</h2>
          </div>
          <form onSubmit={handleGenerate} className="p-6 space-y-5">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                API Key <span className="text-red-400">*</span>
              </label>
              <input
                id="lab-apikey"
                type="password"
                required
                placeholder="sk_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Topic */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Blog Topic <span className="text-red-400">*</span>
                </label>
                <input
                  id="lab-topic"
                  type="text"
                  required
                  placeholder="e.g. Why E-Learning Will Dominate Education in 2026"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Optimization Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Optimization Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                >
                  <option value="SEO">SEO — Google Search Ranking (10 credits)</option>
                  <option value="GEO">GEO — AI Overviews / ChatGPT (15 credits)</option>
                </select>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Keywords (optional)</label>
                <input
                  id="lab-keywords"
                  type="text"
                  placeholder="e.g. edtech, online learning, LMS"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Brand Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Brand Context <span className="text-gray-500 text-xs font-normal">(optional — private info the AI will weave in)</span>
              </label>
              <textarea
                id="lab-brand"
                rows={3}
                value={brandInfo}
                onChange={(e) => setBrandInfo(e.target.value)}
                placeholder="e.g. Lotlite Edu offers 1-on-1 mentorship for enterprise clients. We have 50,000+ students and launched a new AI tutor feature in May 2026..."
                className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: loading ? '#374151' : 'linear-gradient(135deg, #0d9488, #6366f1)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating… this takes 60-90 seconds
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Generate Test Blog
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── STEP 2: Preview ── */}
        {result && (
          <div ref={previewRef}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold text-sm">✓</div>
                  <h2 className="text-white font-semibold text-lg">Blog Preview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="green">Generated</Badge>
                  <Badge color="blue">{wordCount} words</Badge>
                  <Badge color={mode === 'GEO' ? 'purple' : 'teal'}>{mode}</Badge>
                </div>
              </div>

              {/* Stats bar */}
              <div className="px-6 py-3 bg-gray-900/30 border-b border-white/5 flex flex-wrap gap-4 text-xs text-gray-400">
                <span>📝 Title: <strong className="text-gray-200">{result.seoTitle || result.topic}</strong></span>
                {result.wordCount && <span>🔢 Words: <strong className="text-gray-200">{result.wordCount}</strong></span>}
                {result.plagiarismCheck && <span>✅ Plagiarism: <strong className="text-green-300">{result.plagiarismCheck?.originality_score ?? 'Passed'}</strong></span>}
              </div>

              {/* View toggle */}
              <div className="px-6 pt-5 flex gap-2 mb-4">
                <button
                  onClick={() => setShowRaw(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!showRaw ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  Rendered Preview
                </button>
                <button
                  onClick={() => setShowRaw(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${showRaw ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  Raw Markdown
                </button>
              </div>

              {/* Featured image */}
              {result.imageUrl && (
                <div className="px-6 mb-4">
                  <img
                    src={result.imageUrl}
                    alt="Generated blog"
                    className="w-full max-h-72 object-cover rounded-xl border border-white/10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="px-6 pb-6">
                {showRaw ? (
                  <div className="relative">
                    <textarea
                      readOnly
                      className="w-full h-96 bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-sm text-green-300 leading-relaxed resize-none focus:outline-none"
                      value={result.markdown || result.article}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.markdown || result.article);
                      }}
                      className="absolute top-3 right-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <div
                    className="prose prose-invert prose-sm max-w-none bg-gray-900/40 rounded-xl p-6 border border-white/5"
                    style={{ '--tw-prose-headings': '#f1f5f9', '--tw-prose-body': '#cbd5e1', '--tw-prose-bold': '#f1f5f9', '--tw-prose-links': '#2dd4bf' }}
                  >
                    <ReactMarkdown>{result.markdown || result.article}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-6 py-4 border-t border-white/10 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.markdown || result.article);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  📋 Copy Markdown
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'blog-response.json'; a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  ⬇ Download JSON
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-4 py-2 border border-indigo-500 text-indigo-300 hover:bg-indigo-900/30 text-sm font-medium rounded-lg transition-colors ml-auto"
                >
                  Next: Integration Code →
                </button>
              </div>
            </div>

            {/* ── Full JSON Response Inspector ── */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8">
              <details>
                <summary className="px-6 py-4 cursor-pointer text-gray-400 text-sm font-medium hover:text-gray-200 transition-colors flex items-center gap-2">
                  <span>🔍 Full API Response Inspector</span>
                  <span className="text-xs text-gray-600 ml-auto">click to expand</span>
                </summary>
                <div className="px-6 pb-6 pt-2">
                  <CodeBlock
                    lang="JSON Response"
                    code={JSON.stringify({ ...result, article: result.article?.substring(0, 200) + '…', markdown: result.markdown?.substring(0, 200) + '…' }, null, 2)}
                  />
                </div>
              </details>
            </div>
          </div>
        )}

        {/* ── STEP 3: Integration Snippets ── */}
        {(step >= 3 || result) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border
                ${step >= 3 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>3</div>
              <h2 className="text-white font-semibold text-lg">Integration Code</h2>
              <span className="text-xs text-gray-500 ml-2">Copy into your platform</span>
            </div>
            <div className="p-6">
              {/* Tab selector */}
              <div className="flex gap-2 mb-4">
                {['curl', 'javascript', 'python'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${activeCodeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {tab === 'curl' ? 'cURL' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeCodeTab === 'curl' && (
                <CodeBlock lang="bash" code={generateCurlSnippet(apiKey, topic, keywords, mode, brandInfo)} />
              )}
              {activeCodeTab === 'javascript' && (
                <CodeBlock lang="javascript" code={generateJsSnippet(apiKey, topic, keywords, mode, brandInfo)} />
              )}
              {activeCodeTab === 'python' && (
                <CodeBlock
                  lang="python"
                  code={`import requests\n\nresponse = requests.post(\n    "${PYTHON_API_URL}/api/blog/generate",\n    headers={\n        "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}",\n        "Content-Type": "application/json"\n    },\n    json={\n        "topic": "${topic || 'Your Blog Topic'}",\n        "keywords": "${keywords || ''}",\n        "optimization_mode": "${mode}",\n        "brand_context_data": {\n            "company_name": "Your Company",\n            "additional_info": "${brandInfo || ''}"\n        }\n    },\n    timeout=180\n)\ndata = response.json()\nprint(data["article"])  # ← Rendered blog content`}
                />
              )}

              {/* Response structure guide */}
              <div className="mt-6 bg-gray-900/50 rounded-xl p-5 border border-white/5">
                <h3 className="text-white text-sm font-semibold mb-3">📦 Response Fields</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
                  {[
                    ['article', 'Full blog content (HTML/Markdown string)'],
                    ['markdown', 'Raw markdown version'],
                    ['seoTitle', 'AI-generated SEO-optimized title'],
                    ['imageUrl', 'Featured image URL (Supabase CDN)'],
                    ['wordCount', 'Total word count (integer)'],
                    ['keywords', 'Extracted/generated keywords'],
                    ['plagiarismCheck', 'Originality check result'],
                    ['backlinkAnalysis', 'Internal + external link map'],
                  ].map(([field, desc]) => (
                    <div key={field} className="flex gap-2">
                      <span className="text-teal-400 shrink-0">{field}</span>
                      <span className="text-gray-600">→</span>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
