import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/logo.webp";
import {
    BookOpen, Key, Terminal, Code, Zap, AlertTriangle, Check, Copy,
    ArrowLeft, Play, Layers, FileCode, Activity, Search, RefreshCw,
    Eye, TrendingUp, Database
} from 'lucide-react';

const API_BASE = 'https://api.bitlancetechhub.com';

const NAV = [
    {
        group: 'Getting Started',
        items: [
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'auth', label: 'Authentication', icon: Key },
            { id: 'rate-limits', label: 'Rate Limits & Credits', icon: Zap },
            { id: 'workflow', label: 'System Flow', icon: Layers },
        ],
    },
    {
        group: 'Content Generation',
        items: [
            { id: 'seo-generate', label: 'SEO Generate', tag: 'POST', tagColor: 'green' },
            { id: 'geo-generate', label: 'GEO Generate', tag: 'POST', tagColor: 'green' },
            { id: 'topic-generate', label: 'Topic Ideas', tag: 'POST', tagColor: 'green' },
        ],
    },
    {
        group: 'Content Tools',
        items: [
            { id: 'content-audit', label: 'Audit Content', tag: 'POST', tagColor: 'green' },
            { id: 'content-rewrite', label: 'Rewrite Content', tag: 'POST', tagColor: 'green' },
        ],
    },
    {
        group: 'Rank & Visibility',
        items: [
            { id: 'tracking-add', label: 'Track Keyword', tag: 'POST', tagColor: 'green' },
            { id: 'tracking-list', label: 'List Keywords', tag: 'GET', tagColor: 'blue' },
            { id: 'ai-visibility', label: 'AI Visibility Poll', tag: 'POST', tagColor: 'green' },
            { id: 'predict-traffic', label: 'Predict Traffic', tag: 'POST', tagColor: 'green' },
        ],
    },
    {
        group: 'Account',
        items: [
            { id: 'get-api-keys', label: 'My API Keys', tag: 'GET', tagColor: 'blue' },
        ],
    },
    {
        group: 'Developer Utilities',
        items: [
            { id: 'errors', label: 'Error Reference', icon: AlertTriangle },
        ],
    },
];

const TAG_STYLES = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

function MethodBadge({ method }) {
    const s = method === 'GET' ? TAG_STYLES.blue : TAG_STYLES.green;
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${s}`}>
            {method}
        </span>
    );
}

function CopyButton({ text, id, copiedId, onCopy }) {
    const copied = copiedId === id;
    return (
        <button
            onClick={() => onCopy(text, id)}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
        >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
    );
}

function CodeBlock({ code, id, copiedId, onCopy }) {
    return (
        <div className="relative bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-200">
            <pre className="overflow-x-auto whitespace-pre-wrap">{code}</pre>
            <div className="absolute top-3 right-3">
                <button
                    onClick={() => onCopy(code, id)}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                >
                    {copiedId === id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}

function ParamRow({ name, type, required, description }) {
    return (
        <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-start">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm text-[#0d9488] font-semibold">{name}</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{type}</span>
                {required && <span className="text-[10px] text-red-500 font-semibold">required</span>}
            </div>
            <div className="sm:col-span-2 text-xs text-slate-600 leading-relaxed">{description}</div>
        </div>
    );
}

function SectionHeader({ id, method, route, title, description, children }) {
    return (
        <section id={id} className="scroll-mt-24 space-y-6">
            <div className="border-t border-slate-200 pt-10 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    {method && <MethodBadge method={method} />}
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                </div>
                {route && (
                    <div className="font-mono text-sm text-slate-600 bg-slate-800 inline-flex px-3 py-1.5 rounded-lg items-center gap-1">
                        <span className="text-slate-400 mr-1">{method}</span>
                        <span className="text-[#26cece]">{API_BASE}</span>
                        <span className="text-white">{route}</span>
                    </div>
                )}
                {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
            </div>
            {children}
        </section>
    );
}

function EndpointCard({ params, responseJson, id, copiedId, onCopy }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {params && params.length > 0 && (
                <div className="p-5 space-y-2">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400">Request Body Parameters</h4>
                    <div className="divide-y divide-slate-100">
                        {params.map((p) => <ParamRow key={p.name} {...p} />)}
                    </div>
                </div>
            )}
            {responseJson && (
                <div className="p-5 space-y-3">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400">Response (200 OK)</h4>
                    <CodeBlock code={responseJson} id={`${id}-res`} copiedId={copiedId} onCopy={onCopy} />
                </div>
            )}
        </div>
    );
}

function MultiLangExample({ examples, copiedId, onCopy }) {
    const [lang, setLang] = useState('curl');
    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 border-b border-slate-200 flex overflow-x-auto">
                {Object.keys(examples).map((k) => (
                    <button
                        key={k}
                        onClick={() => setLang(k)}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-r border-slate-200 whitespace-nowrap transition-all ${lang === k ? 'bg-white text-[#0d9488]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                        {examples[k].label}
                    </button>
                ))}
            </div>
            <div className="relative p-5 bg-slate-800 font-mono text-xs text-slate-200">
                <pre className="overflow-x-auto whitespace-pre-wrap">{examples[lang].code}</pre>
                <div className="absolute top-3 right-3">
                    <button
                        onClick={() => onCopy(examples[lang].code, `ml-${lang}`)}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    >
                        {copiedId === `ml-${lang}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ApiDocsPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const scrollTo = (id) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const quickStartExamples = {
        curl: {
            label: 'cURL',
            code: `curl -X POST "${API_BASE}/api/v1/seo/generate" \\
  -H "Authorization: Bearer sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Why Pune is the Best City for Real Estate in 2026",
    "keywords": "Pune real estate, property investment Pune",
    "brand_context_data": {
      "company_name": "Lotlite Edu",
      "industry": "Education Tech"
    }
  }'`,
        },
        python: {
            label: 'Python',
            code: `import requests

response = requests.post(
    "${API_BASE}/api/v1/seo/generate",
    headers={
        "Authorization": "Bearer sk_live_your_key",
        "Content-Type": "application/json",
    },
    json={
        "topic": "Why Pune is the Best City for Real Estate in 2026",
        "keywords": "Pune real estate, property investment Pune",
        "brand_context_data": {
            "company_name": "Lotlite Edu",
            "industry": "Education Tech",
        },
    },
)
data = response.json()
print("Title:", data["meta_title"])
print("Slug:", data["slug"])`,
        },
        node: {
            label: 'Node.js',
            code: `const res = await fetch("${API_BASE}/api/v1/seo/generate", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_live_your_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    topic: "Why Pune is the Best City for Real Estate in 2026",
    keywords: "Pune real estate, property investment Pune",
    brand_context_data: {
      company_name: "Lotlite Edu",
      industry: "Education Tech",
    },
  }),
});
const data = await res.json();
console.log("Slug:", data.slug);`,
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-teal-100">

            {/* ── Header ── */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 text-slate-500 hover:text-slate-800"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <img
                                src={Logo}
                                alt="Bitlance"
                                className="h-9 w-auto object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML =
                                        '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:22px;color:#0d9488;letter-spacing:-0.5px;">Bitlance <span style=\'color:#0f172a;\'>AI</span></span>';
                                }}
                            />
                            <span className="h-5 w-px bg-slate-200 mx-2 hidden sm:block" />
                            <span className="text-xs uppercase tracking-widest text-teal-600 font-semibold hidden sm:block font-mono">
                                Developer API v1
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/api-test-lab')}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold transition-all"
                        >
                            <Play size={14} />
                            Test Lab
                        </button>
                        <button
                            onClick={() => navigate('/home')}
                            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">

                {/* ── Sidebar ── */}
                <aside className="w-60 shrink-0 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto hidden lg:block pr-4">
                    <nav className="space-y-6">
                        {NAV.map((section) => (
                            <div key={section.group}>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 px-3">
                                    {section.group}
                                </p>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const active = activeSection === item.id;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollTo(item.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${active ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                            >
                                                {item.tag ? (
                                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded border font-mono ${TAG_STYLES[item.tagColor]}`}>
                                                        {item.tag}
                                                    </span>
                                                ) : Icon ? (
                                                    <Icon size={14} />
                                                ) : null}
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* ── Main content ── */}
                <main className="flex-1 min-w-0 space-y-20">

                    {/* ── Overview ── */}
                    <section id="overview" className="scroll-mt-24 space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                                    API v1.0
                                </span>
                                <span className="text-xs text-slate-400 font-mono">{API_BASE}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                Bitlance AI API Documentation
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                                The Bitlance API gives you programmatic access to our full SEO & GEO content
                                pipeline. Generate long-form articles optimised for Google Search and AI
                                Overview engines, discover high-value topics, audit existing content, track
                                keyword rankings, and poll AI engine citation visibility — all from a single
                                REST API.
                            </p>
                        </div>

                        {/* Feature cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[
                                { icon: Zap, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', title: 'Dual-Mode Generation', desc: 'Switch between SEO (Google) and GEO (AI Overviews, ChatGPT) with a single parameter.' },
                                { icon: Code, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', title: 'Brand Context Injection', desc: 'Pass your company profile to write natural, on-brand internal backlinks automatically.' },
                                { icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', title: 'AI Visibility Tracking', desc: 'Check if your URLs are cited by Perplexity, ChatGPT and other generative engines.' },
                                { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'Traffic Prediction', desc: 'Estimate monthly organic clicks using CTR curves and search volume.' },
                                { icon: Search, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', title: 'Topic Discovery', desc: 'Get 10 scored topic candidates with search intent and revenue opportunity.' },
                                { icon: Database, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', title: 'Credit-Based Billing', desc: 'Every API call draws from your dashboard balance with full audit trails.' },
                            ].map((c) => {
                                const Icon = c.icon;
                                return (
                                    <div key={c.title} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`p-2.5 w-fit rounded-xl border ${c.bg}`}>
                                            <Icon size={20} className={c.color} />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">{c.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Base URL */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Production Base URL</h3>
                            <div className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-xl font-mono text-sm">
                                <span className="text-[#26cece]">{API_BASE}</span>
                                <button
                                    onClick={() => handleCopy(API_BASE, 'base-url')}
                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedId === 'base-url' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">All endpoints are served over HTTPS. HTTP requests are not supported.</p>
                        </div>

                        {/* Quick start */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quick Start</h3>
                            <MultiLangExample examples={quickStartExamples} copiedId={copiedId} onCopy={handleCopy} />
                        </div>
                    </section>

                    {/* ── Authentication ── */}
                    <section id="auth" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-200 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Key className="text-teal-600" size={24} />
                                Authentication
                            </h2>
                            <p className="text-slate-600">
                                All endpoints require a live API key in the{' '}
                                <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code>{' '}
                                header using the Bearer scheme. Keys are managed from your{' '}
                                <button onClick={() => navigate('/dashboard/api-keys')} className="text-teal-600 underline">
                                    API Keys dashboard
                                </button>.
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-700">Required Header</h3>
                                <CodeBlock
                                    code={`Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nContent-Type: application/json`}
                                    id="auth-header"
                                    copiedId={copiedId}
                                    onCopy={handleCopy}
                                />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-700">How keys are validated</h3>
                                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Middleware reads the <code className="text-teal-700 bg-teal-50 px-1 rounded text-xs font-mono">Authorization</code> header on every request.</li>
                                    <li>The key is matched in Supabase. If missing or unknown → <code className="text-red-600 bg-red-50 px-1 rounded text-xs font-mono">401</code>.</li>
                                    <li>If the key's status is not <code className="text-teal-700 bg-teal-50 px-1 rounded text-xs font-mono">active</code> or it has expired → <code className="text-orange-600 bg-orange-50 px-1 rounded text-xs font-mono">403</code>.</li>
                                    <li>If the per-minute request count exceeds the plan limit → <code className="text-purple-600 bg-purple-50 px-1 rounded text-xs font-mono">429</code>.</li>
                                    <li>On success, <code className="text-teal-700 bg-teal-50 px-1 rounded text-xs font-mono">user_id</code> and <code className="text-teal-700 bg-teal-50 px-1 rounded text-xs font-mono">auth_type</code> are attached to the request state.</li>
                                </ol>
                            </div>

                            <div className="text-sm text-amber-700 flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                                <span>
                                    <strong>Security:</strong> Never commit your key to public repositories or expose it in frontend JavaScript. Rotate compromised keys immediately from your dashboard.
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ── Rate Limits & Credits ── */}
                    <section id="rate-limits" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-200 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Zap className="text-teal-600" size={24} />
                                Rate Limits & Credits
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700">Requests per minute (sliding window)</h3>
                                <div className="space-y-0 divide-y divide-slate-100">
                                    {[
                                        { plan: 'Free', rpm: '10 req / min' },
                                        { plan: 'Pro', rpm: '30 req / min' },
                                        { plan: 'Premium', rpm: '60 req / min' },
                                    ].map((r) => (
                                        <div key={r.plan} className="flex items-center justify-between text-sm py-3">
                                            <span className="text-slate-700 font-medium">{r.plan}</span>
                                            <span className="font-mono text-teal-600 text-xs bg-teal-50 px-2 py-1 rounded">{r.rpm}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">Exceeding limits returns <code className="bg-slate-100 px-1 rounded">429</code>. Back off exponentially before retrying.</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700">Credit consumption per call</h3>
                                <div className="space-y-0 divide-y divide-slate-100">
                                    {[
                                        { endpoint: 'SEO / GEO Generate', credits: '50 credits' },
                                        { endpoint: 'Topic Generation', credits: '1 credit' },
                                        { endpoint: 'Content Audit', credits: '1 credit' },
                                        { endpoint: 'Content Rewrite', credits: '1 credit' },
                                        { endpoint: 'AI Visibility Poll', credits: '1 credit' },
                                        { endpoint: 'Traffic Predict / Tracking', credits: 'Free' },
                                    ].map((r) => (
                                        <div key={r.endpoint} className="flex items-center justify-between text-sm py-3">
                                            <span className="text-slate-600">{r.endpoint}</span>
                                            <span className={`font-mono text-xs px-2 py-1 rounded ${r.credits === 'Free' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                                                {r.credits}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">Admin keys require only 10 credits for generation. Insufficient balance returns <code className="bg-slate-100 px-1 rounded">402</code>.</p>
                            </div>
                        </div>
                    </section>

                    {/* ── System Flow ── */}
                    <section id="workflow" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-200 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Layers className="text-teal-600" size={24} />
                                System Flow
                            </h2>
                            <p className="text-slate-600">Every generation request passes through this pipeline before a response is returned.</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            {[
                                { step: 1, title: 'Auth & Rate-Limit Check', desc: 'APIKeyAuthMiddleware validates the Bearer token against Supabase, checks key status and expiry, then enforces a per-plan rate limit using a sliding 60-second in-memory window.' },
                                { step: 2, title: 'Credit Pre-flight', desc: 'The API calls validate_credits() to confirm the user holds enough credits (50 for standard users, 10 for admin keys). If not, a 402 Payment Required is returned immediately.' },
                                { step: 3, title: 'Generative Pipeline', desc: 'The Python AI service processes your topic and brand context through OpenAI + Perplexity models, runs SEO/GEO-specific adjustments, and generates structured HTML, Markdown, FAQ, schema markup, and citation lists.' },
                                { step: 4, title: 'Storage & Ledger Update', desc: "The finished article is saved to the user's dashboard (draft state). Credits are deducted via the deduct_credits_with_ledger RPC inside an isolated Supabase transaction, ensuring atomic consistency." },
                                { step: 5, title: 'Structured Response', desc: 'The StandardArticleResponse object is returned: title, meta_title, meta_description, slug, HTML content, FAQ items, internal links, external sources, entities, schema markup, keywords, and citations.' },
                            ].map((s, i, arr) => (
                                <React.Fragment key={s.step}>
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold text-sm">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{s.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                    {i < arr.length - 1 && <div className="w-px h-6 bg-slate-200 ml-4 my-1" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>

                    {/* ── SEO Generate ── */}
                    <SectionHeader
                        id="seo-generate"
                        method="POST"
                        route="/api/v1/seo/generate"
                        title="SEO Content Generation"
                        description="Generate a fully structured, SEO-optimised long-form article targeting Google Search. The engine forces optimization_mode to SEO. The response includes HTML content, an FAQ block, internal links, schema markup, and citations."
                    >
                        <EndpointCard
                            id="seo-generate"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'topic', type: 'string', required: true, description: 'The article title or core subject. Be specific — e.g. "Why Pune is the Best City for Real Estate Investment in 2026".' },
                                { name: 'keywords', type: 'string', required: false, description: 'Comma-separated target phrases. Example: "Pune real estate, property investment Pune, Pune ROI 2026".' },
                                { name: 'brand_context_data', type: 'object', required: false, description: 'A JSON object with your brand info (company_name, industry, website, location). Injected for natural internal links and brand voice.' },
                            ]}
                            responseJson={`{
  "title": "Top Reasons to Invest in Pune Real Estate in 2026",
  "meta_title": "Pune Real Estate Investment Guide 2026 | ROI & Hotspots",
  "meta_description": "Discover Pune's emerging hubs, growth metrics, and high ROI projections.",
  "slug": "pune-real-estate-investment-2026",
  "content": "<h1>Top Reasons...</h1><p>...</p>",
  "faq": [
    { "question": "Is Pune real estate a good investment?", "answer": "Yes, with..." }
  ],
  "internal_links": ["https://yourdomain.com/pune-projects"],
  "external_sources": ["https://crediblesite.com/source"],
  "entities": ["Pune", "Maharashtra", "RERA"],
  "schema_markup": { "@type": "Article", "name": "..." },
  "keywords": ["Pune real estate", "property investment Pune"],
  "citations": [],
  "generated_at": "2026-06-20T10:30:00Z"
}`}
                        />
                    </SectionHeader>

                    {/* ── GEO Generate ── */}
                    <SectionHeader
                        id="geo-generate"
                        method="POST"
                        route="/api/v1/geo/generate"
                        title="GEO Content Generation"
                        description="Generate content optimised for Generative Engine Optimisation (GEO). Structured to appear in AI Overviews, ChatGPT responses, and Perplexity answers. Includes citation framework, quick-answer blocks, and fact boxes."
                    >
                        <EndpointCard
                            id="geo-generate"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'topic', type: 'string', required: true, description: 'Core question or topic. Phrase as a direct question for best results — e.g. "What are the safest areas to buy property in Dubai 2026?".' },
                                { name: 'keywords', type: 'string', required: false, description: 'Comma-separated keywords. GEO mode uses these to anchor Quick Answer and Fact Box elements.' },
                                { name: 'brand_context_data', type: 'object', required: false, description: 'Brand context woven into citation paragraphs and authority signals.' },
                            ]}
                            responseJson={`{
  "title": "Safest Areas to Buy Property in Dubai 2026",
  "meta_title": "Dubai Safe Property Areas 2026 | Expert Guide",
  "meta_description": "AI-ready guide covering Dubai's safest residential zones with price benchmarks.",
  "slug": "safest-property-areas-dubai-2026",
  "content": "<h1>...</h1><section class='geo-quick-answer'>...</section>",
  "faq": [
    { "question": "Which Dubai area has the best ROI?", "answer": "Dubai Hills..." }
  ],
  "citations": ["https://credible-source.com/dubai-property-report-2026"],
  "entities": ["Dubai Hills Estate", "DLD", "RERA Dubai"],
  "schema_markup": { "@type": "FAQPage", "mainEntity": [] },
  "keywords": ["Dubai property 2026", "safe investment Dubai"],
  "generated_at": "2026-06-20T10:31:00Z"
}`}
                        />
                    </SectionHeader>

                    {/* ── Topic Generation ── */}
                    <SectionHeader
                        id="topic-generate"
                        method="POST"
                        route="/api/v1/topic/generate"
                        title="Topic Ideas Generation"
                        description="Discover the top 10 high-potential blog topics for your industry. Each candidate is scored for traffic potential and revenue opportunity, labelled with difficulty and search intent, and comes with recommended keywords."
                    >
                        <EndpointCard
                            id="topic-generate"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'industry', type: 'string', required: true, description: 'Your business vertical. Examples: "Real Estate", "SaaS", "D2C Fashion", "Healthcare".' },
                                { name: 'mode', type: 'string', required: false, description: '"SEO" (default) or "GEO". Determines whether topics are scored for Google or AI engine discovery.' },
                                { name: 'location', type: 'string', required: false, description: 'Target market — e.g. "Dubai", "Pune", "Global". Defaults to "Global".' },
                                { name: 'goal', type: 'string', required: false, description: 'Business goal: "Lead Generation", "Direct Sales", "Brand Awareness". Defaults to "Lead Generation".' },
                            ]}
                            responseJson={`{
  "industry": "Real Estate",
  "topics": [
    {
      "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
      "keywords": ["Pune real estate", "property investment Pune"],
      "search_intent": "Commercial / Informational",
      "traffic_score": 87,
      "revenue_score": 91,
      "difficulty": "Medium",
      "scoring_breakdown": "High MSV + Low KD + strong commercial intent"
    },
    { "...": "9 more candidates" }
  ]
}`}
                        />
                    </SectionHeader>

                    {/* ── Content Audit ── */}
                    <SectionHeader
                        id="content-audit"
                        method="POST"
                        route="/api/v1/content/audit"
                        title="Content Audit"
                        description="Submit any existing article for a comprehensive SEO or GEO audit. Evaluates EEAT signals, keyword density, internal link structure, heading hierarchy, content freshness, and citation quality, then returns a structured report with prioritised action items."
                    >
                        <EndpointCard
                            id="content-audit"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'content', type: 'string', required: true, description: 'Full HTML or plain-text content to audit. Maximum ~50 000 characters.' },
                                { name: 'target_keyword', type: 'string', required: false, description: 'Primary focus keyword to use as the audit benchmark.' },
                                { name: 'mode', type: 'string', required: false, description: '"SEO" (default) or "GEO". Controls which audit criteria are applied.' },
                            ]}
                            responseJson={`{
  "success": true,
  "audit_report": "## SEO Audit Report\\n\\n### EEAT Signals\\n- Missing author bio...\\n### Keyword Usage\\n- Appears 2x, recommended: 6-8x...",
  "score": 62,
  "action_items": [
    "Add author expertise section with credentials",
    "Increase target keyword from 2 to 6-8 occurrences",
    "Embed 3 high-authority external citations"
  ]
}`}
                        />
                    </SectionHeader>

                    {/* ── Content Rewrite ── */}
                    <SectionHeader
                        id="content-rewrite"
                        method="POST"
                        route="/api/v1/content/rewrite"
                        title="Content Rewrite"
                        description="Rewrite low-performing or outdated articles to improve SEO or GEO structure. Pass optional instructions to control tone, length, or specific improvements. Credits are deducted only on successful completion."
                    >
                        <EndpointCard
                            id="content-rewrite"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'content', type: 'string', required: true, description: 'Original HTML or plain-text content to be rewritten.' },
                                { name: 'instructions', type: 'string', required: false, description: 'Specific directives. Example: "Make it 20% shorter, increase Dubai mention frequency, add a bullet-point summary at the top.".' },
                                { name: 'mode', type: 'string', required: false, description: '"SEO" (default) or "GEO". Determines structural standards applied during rewriting.' },
                            ]}
                            responseJson={`{
  "success": true,
  "rewritten_content": "## Why Pune Leads Indian Real Estate in 2026\\n\\n**Quick Answer:** Pune offers...",
  "improvements_made": [
    "Applied specific instructions",
    "Optimised for SEO structure",
    "Increased keyword density to recommended range",
    "Added Quick Answer block for featured snippet eligibility"
  ]
}`}
                        />
                    </SectionHeader>

                    {/* ── Track Keyword ── */}
                    <SectionHeader
                        id="tracking-add"
                        method="POST"
                        route="/api/v1/tracking/keywords"
                        title="Track a Keyword"
                        description="Register a URL + keyword pair with the daily rank-tracking engine. Monitors Google organic positions (SEO) and AI engine citations (GEO). Returns 409 if the pair is already tracked."
                    >
                        <EndpointCard
                            id="tracking-add"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'article_url', type: 'string', required: true, description: 'Full public URL of the article to track. Example: "https://yourblog.com/pune-real-estate-2026".' },
                                { name: 'target_keyword', type: 'string', required: true, description: 'Exact keyword phrase to track. Example: "Pune real estate investment 2026".' },
                                { name: 'optimization_mode', type: 'string', required: false, description: '"SEO" (default) or "GEO". Determines which ranking signal is tracked.' },
                            ]}
                            responseJson={`{
  "id": "f8c3de3d-1fea-4d7c-a8b9-29fb8a6c6dac",
  "article_url": "https://yourblog.com/pune-real-estate-2026",
  "target_keyword": "Pune real estate investment 2026",
  "optimization_mode": "SEO",
  "status": "Tracking Initiated"
}`}
                        />
                    </SectionHeader>

                    {/* ── List Keywords ── */}
                    <SectionHeader
                        id="tracking-list"
                        method="GET"
                        route="/api/v1/tracking/keywords"
                        title="List Tracked Keywords"
                        description="Retrieve all URL + keyword pairs for the authenticated user, including the latest organic rank logs and AI citation history. No request body required."
                    >
                        <EndpointCard
                            id="tracking-list"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[]}
                            responseJson={`[
  {
    "id": "f8c3de3d-...",
    "article_url": "https://yourblog.com/pune-real-estate-2026",
    "target_keyword": "Pune real estate investment 2026",
    "optimization_mode": "SEO",
    "seo_rank_logs": [
      { "rank": 14, "checked_at": "2026-06-19T03:00:00Z" },
      { "rank": 11, "checked_at": "2026-06-20T03:00:00Z" }
    ],
    "ai_citation_logs": [
      { "ai_engine": "Perplexity", "was_cited": true, "checked_at": "2026-06-20T04:00:00Z" }
    ]
  }
]`}
                        />
                    </SectionHeader>

                    {/* ── AI Visibility Poll ── */}
                    <SectionHeader
                        id="ai-visibility"
                        method="POST"
                        route="/api/v1/tracking/ai-visibility/poll"
                        title="AI Visibility Poll"
                        description="On-demand check to see if your URL is cited by Perplexity's sonar-pro model. Queries the AI engine with your keyword and parses the response for citations matching your expected URL."
                    >
                        <EndpointCard
                            id="ai-visibility"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'target_keyword', type: 'string', required: true, description: 'Question or keyword to query the AI engine with. Example: "best areas to invest in Pune 2026".' },
                                { name: 'expected_url', type: 'string', required: true, description: 'URL or domain to look for in citations. Example: "yourblog.com/pune-real-estate-2026".' },
                            ]}
                            responseJson={`{
  "ai_engine": "Perplexity",
  "was_cited": true,
  "citation_url_found": "https://yourblog.com/pune-real-estate-2026",
  "engine_response_snippet": "According to recent market data, Pune's real estate sector has seen 18% YoY growth... [source: yourblog.com]..."
}`}
                        />
                    </SectionHeader>

                    {/* ── Predict Traffic ── */}
                    <SectionHeader
                        id="predict-traffic"
                        method="POST"
                        route="/api/v1/tracking/predict-traffic"
                        title="Traffic Prediction"
                        description="Estimate monthly organic clicks using standard CTR curves. Also calculates position-1 traffic potential, a revenue opportunity score (0–100), and a strategic recommendation. This endpoint is free — no credits deducted."
                    >
                        <EndpointCard
                            id="predict-traffic"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[
                                { name: 'search_volume', type: 'integer', required: true, description: 'Monthly search volume for the target keyword.' },
                                { name: 'current_position', type: 'integer', required: true, description: "Your page's current average organic position (1–100+)." },
                                { name: 'topic_growth_rate', type: 'float', required: false, description: 'Growth multiplier. 1.0 = stable, 1.2 = 20% growth, 0.8 = declining. Defaults to 1.0.' },
                            ]}
                            responseJson={`{
  "estimated_monthly_clicks": 540,
  "position_1_potential": 3720,
  "revenue_opportunity_score": 85,
  "recommendation": "Striking distance. Focus strictly on external backlinks and EEAT citations."
}`}
                        />
                    </SectionHeader>

                    {/* ── Get API Keys ── */}
                    <SectionHeader
                        id="get-api-keys"
                        method="GET"
                        route="/api/v1/user/api-keys/"
                        title="Get My API Keys"
                        description="Retrieve all API keys belonging to the authenticated user, ordered by creation date descending."
                    >
                        <EndpointCard
                            id="get-api-keys"
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            params={[]}
                            responseJson={`{
  "keys": [
    {
      "id": "a1b2c3d4-...",
      "user_id": "user-uuid-here",
      "api_key": "sk_live_xxxxxxxxxxxx",
      "plan": "pro",
      "status": "active",
      "created_at": "2026-05-01T12:00:00Z",
      "expires_at": null
    }
  ]
}`}
                        />
                    </SectionHeader>

                    {/* ── Error Reference ── */}
                    <section id="errors" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-200 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <AlertTriangle className="text-teal-600" size={24} />
                                Error Reference
                            </h2>
                            <p className="text-slate-600">
                                All errors return a JSON body with a <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-xs font-mono">detail</code> field. Credit errors include extra billing-state fields.
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                            {[
                                { code: '401', color: 'text-red-700 bg-red-50 border-red-200', title: 'Unauthorized', desc: 'The Authorization header is missing, incorrectly formatted, or the key does not exist in the database.' },
                                { code: '402', color: 'text-amber-700 bg-amber-50 border-amber-200', title: 'Payment Required — Insufficient Credits', desc: 'Balance is below the execution threshold. Response includes credits_remaining, required_credits, and a pricing_url.' },
                                { code: '403', color: 'text-orange-700 bg-orange-50 border-orange-200', title: 'Forbidden — Key Revoked or Expired', desc: 'Key exists but status is not active (revoked, suspended), or the current time has passed its expires_at date.' },
                                { code: '409', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', title: 'Conflict — Already Tracked', desc: 'The exact article_url + target_keyword combination is already registered to your account.' },
                                { code: '422', color: 'text-blue-700 bg-blue-50 border-blue-200', title: 'Unprocessable Entity', desc: 'A required field is missing or fails type validation. Check the errors array in the response body for field-level detail.' },
                                { code: '429', color: 'text-purple-700 bg-purple-50 border-purple-200', title: 'Too Many Requests — Rate Limited', desc: "Exceeded your plan's requests-per-minute threshold. Back off exponentially — wait at least 10 seconds before retrying." },
                                { code: '500', color: 'text-slate-700 bg-slate-100 border-slate-300', title: 'Internal Server Error', desc: 'A downstream error occurred in the AI pipeline or database. These are usually transient — retry once after a few seconds.' },
                            ].map((e) => (
                                <div key={e.code} className="p-5 flex gap-4 items-start">
                                    <div className={`font-mono text-sm font-bold px-2.5 py-1 rounded border shrink-0 ${e.color}`}>{e.code}</div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-800 text-sm">{e.title}</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">{e.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-700">Standard error body</h3>
                                <CodeBlock code={`{ "detail": "Invalid or missing API key." }`} id="err-body" copiedId={copiedId} onCopy={handleCopy} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-700">Credit error body (402)</h3>
                                <CodeBlock
                                    code={`{
  "success": false,
  "code": "INSUFFICIENT_CREDITS",
  "credits_remaining": 12,
  "required_credits": 50,
  "pricing_url": "https://app.bitlance.ai/pricing"
}`}
                                    id="err-402"
                                    copiedId={copiedId}
                                    onCopy={handleCopy}
                                />
                            </div>
                        </div>
                    </section>

                </main>
            </div>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-200 mt-20 py-8 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Bitlance Tech Hub. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="font-mono">API Version 1.0.0</span>
                        <button onClick={() => navigate('/dashboard/api-keys')} className="text-teal-600 hover:underline">Get API Key</button>
                        <button onClick={() => navigate('/api-test-lab')} className="text-teal-600 hover:underline">Test Lab</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
