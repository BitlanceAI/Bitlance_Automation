import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/logo.webp";
import { 
    BookOpen, 
    Key, 
    Terminal, 
    Code, 
    Zap, 
    AlertTriangle, 
    Check, 
    Copy, 
    ArrowLeft, 
    ExternalLink, 
    Play, 
    Layers,
    FileCode,
    HelpCircle
} from 'lucide-react';

export default function ApiDocsPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('intro');
    const [selectedLang, setSelectedLang] = useState('curl');
    const [copiedText, setCopiedText] = useState(null);

    const API_BASE_URL = window.location.origin;

    const codeExamples = {
        curl: {
            label: 'cURL',
            icon: Terminal,
            code: `curl -X POST "${API_BASE_URL}/api/admin/api-keys/seo/generate" \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
    "keywords": "Pune real estate, property investment Pune",
    "optimization_mode": "SEO",
    "brand_context_data": {
      "company_name": "Lotlite Edu",
      "industry": "Education Tech"
    }
  }'`
        },
        python: {
            label: 'Python',
            icon: FileCode,
            code: `import requests

url = "${API_BASE_URL}/api/admin/api-keys/seo/generate"
headers = {
    "Authorization": "Bearer sk_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
    "keywords": "Pune real estate, property investment Pune",
    "optimization_mode": "SEO",
    "brand_context_data": {
        "company_name": "Lotlite Edu",
        "industry": "Education Tech"
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Generated SEO Title:", data.get("seoTitle"))
print("Article Content:", data.get("article"))`
        },
        node: {
            label: 'Node.js',
            icon: Code,
            code: `const fetch = require('node-fetch');

const url = '${API_BASE_URL}/api/admin/api-keys/seo/generate';
const options = {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: 'Why Pune is the Best City for Real Estate Investment in 2026',
    keywords: 'Pune real estate, property investment Pune',
    optimization_mode: 'SEO',
    brand_context_data: {
      company_name: 'Lotlite Edu',
      industry: 'Education Tech'
    }
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(data => console.log('Generated Article ID:', data.id))
  .catch(err => console.error('Error:', err));`
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedText(id);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#26cece]/30 selection:text-white">
            {/* --- Sticky Glassmorphic Header --- */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
                            title="Back"
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
                                    e.target.parentElement.innerHTML = '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:22px;color:#26CECE;letter-spacing:-0.5px;">Bitlance <span style="color:#ffffff;">AI</span></span>';
                                }}
                            />
                            <span className="h-5 w-[1px] bg-slate-800 mx-2 hidden sm:block"></span>
                            <span className="text-xs uppercase tracking-widest text-[#26cece] font-semibold hidden sm:inline-block font-mono">Developer API</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/api-test-lab')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#26cece]/10 border border-[#26cece]/30 hover:bg-[#26cece]/20 text-[#26cece] rounded-xl text-sm font-semibold transition-all duration-200"
                        >
                            <Play size={14} className="fill-[#26cece]/20" />
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
                {/* --- Left Navigation Sidebar --- */}
                <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto hidden lg:block pr-4 scrollbar-thin scrollbar-thumb-slate-800">
                    <nav className="space-y-6">
                        <div>
                            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3 px-3">Getting Started</p>
                            <div className="space-y-1">
                                <button
                                    onClick={() => scrollToSection('intro')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'intro' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <BookOpen size={16} />
                                    Overview
                                </button>
                                <button
                                    onClick={() => scrollToSection('auth')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'auth' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <Key size={16} />
                                    Authentication
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3 px-3">Integration Workflow</p>
                            <div className="space-y-1">
                                <button
                                    onClick={() => scrollToSection('workflow')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'workflow' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <Layers size={16} />
                                    System Flow
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3 px-3">API Endpoints</p>
                            <div className="space-y-1">
                                <button
                                    onClick={() => scrollToSection('generate-endpoint')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'generate-endpoint' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-mono">POST</span>
                                    Generate Blog
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3 px-3">Developer Utilities</p>
                            <div className="space-y-1">
                                <button
                                    onClick={() => scrollToSection('code-sdk')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'code-sdk' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <Terminal size={16} />
                                    Code Examples
                                </button>
                                <button
                                    onClick={() => scrollToSection('errors')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5 ${activeSection === 'errors' ? 'bg-[#26cece]/15 text-[#26cece] shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                                >
                                    <AlertTriangle size={16} />
                                    Error Reference
                                </button>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* --- Main Content Panel --- */}
                <main className="flex-1 max-w-4xl space-y-16">
                    {/* --- Section: Overview --- */}
                    <section id="intro" className="scroll-mt-24 space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                Bitlance AI API Documentation
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Welcome to the Bitlance AI API. Connect your CRM, WordPress Site, or custom application to our advanced SEO & GEO Generative content pipeline. Automatically generate highly optimized, context-aware blog posts that rank on Search Engines and Generative Search Engines (AI Overviews, ChatGPT).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                                <div className="p-2.5 bg-[#26cece]/10 text-[#26cece] w-fit rounded-xl border border-[#26cece]/20">
                                    <Zap size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Dual Optimization Modes</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Generate content targeting traditional Google Search results (<strong>SEO</strong>) or optimize for LLM extraction and AI Summary engines (<strong>GEO</strong>).
                                </p>
                            </div>

                            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 w-fit rounded-xl border border-indigo-500/20">
                                    <Code size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Seamless Brand Context</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Inject dynamic brand data directly. The generator references your company info to write natural, contextual internal backlinks.
                                </p>
                            </div>
                        </div>

                        {/* Base URL details */}
                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Production Base URL</h3>
                            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-mono text-sm">
                                <span className="text-[#26cece]">{API_BASE_URL}</span>
                                <button
                                    onClick={() => handleCopy(API_BASE_URL, 'base-url')}
                                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                    {copiedText === 'base-url' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* --- Section: Authentication --- */}
                    <section id="auth" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-900 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Key className="text-[#26cece]" size={24} />
                                Authentication
                            </h2>
                            <p className="text-slate-400">
                                All API requests require a live developer key provided by your administrator. Authenticate by passing your key in the standard <code>Authorization</code> header.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-300">HTTP Header Sample</h3>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                                <div><span className="text-slate-500">Authorization:</span> Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
                                <div><span className="text-slate-500">Content-Type:</span> application/json</div>
                            </div>
                            <div className="text-sm text-amber-400 flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <span><strong>Warning:</strong> Keep your secret key safe. Never commit it to public version control or expose it in client-side frontend code.</span>
                            </div>
                        </div>
                    </section>

                    {/* --- Section: Workflow Diagram --- */}
                    <section id="workflow" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-900 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Layers className="text-[#26cece]" size={24} />
                                Integration Workflow & System Flow
                            </h2>
                            <p className="text-slate-400">
                                Learn how the API performs credit verification, processes optimization parameters, generates content, and updates your balances atomically.
                            </p>
                        </div>

                        {/* Interactive Workflow Visualizer */}
                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#26cece]/20 border border-[#26cece]/40 text-[#26cece] font-bold text-sm">1</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Credit Pre-Flight Check</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">The gateway identifies the plan. If the balance has sufficient credits (50 credits required for standard users, 10 credits for administrators), the request proceeds. Otherwise, it throws a <code>402 Payment Required</code> exception.</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-slate-800 ml-4"></div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#26cece]/20 border border-[#26cece]/40 text-[#26cece] font-bold text-sm">2</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Generative Pipeline Execution</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">The Python AI service processes target topics, integrates custom brand context, checks links, runs GEO/SEO standard adjustments, and returns complete HTML and markdown versions.</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-slate-800 ml-4"></div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#26cece]/20 border border-[#26cece]/40 text-[#26cece] font-bold text-sm">3</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Atomic Balance Ledger Updates</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">The database safely updates your balance inside an isolated transaction. A record is inserted into the <code>credit_ledger</code> table to log the usage for audit trails.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Section: Endpoints --- */}
                    <section id="generate-endpoint" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-900 pt-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-400 font-mono">POST</span>
                                <h2 className="text-2xl font-bold text-white">Generate Blog Content</h2>
                            </div>
                            <p className="text-slate-400">
                                Generate an article according to a target topic and custom-tailored keywords.
                            </p>
                        </div>

                        {/* Route specification */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between font-mono text-sm">
                                <span className="text-slate-300">/api/admin/api-keys/seo/generate</span>
                                <span className="text-xs text-slate-500">Requires Auth Header</span>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Parameters */}
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400">Request Body Parameters</h4>
                                    <div className="divide-y divide-slate-800 border-t border-b border-slate-800">
                                        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="font-mono text-sm text-[#26cece]">topic <span className="text-red-400 text-xs font-sans">* required</span></div>
                                            <div className="text-xs text-slate-400 sm:w-2/3">The core title or topic for content generation.</div>
                                        </div>
                                        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="font-mono text-sm text-[#26cece]">keywords <span className="text-slate-500 text-xs font-sans">* optional</span></div>
                                            <div className="text-xs text-slate-400 sm:w-2/3">Comma-separated key phrases to optimize content layout.</div>
                                        </div>
                                        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="font-mono text-sm text-[#26cece]">optimization_mode <span className="text-slate-500 text-xs font-sans">* default: SEO</span></div>
                                            <div className="text-xs text-slate-400 sm:w-2/3">Choose between <code>SEO</code> (Google Search) or <code>GEO</code> (AI Engine queries).</div>
                                        </div>
                                        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="font-mono text-sm text-[#26cece]">brand_context_data <span className="text-slate-500 text-xs font-sans">* optional</span></div>
                                            <div className="text-xs text-slate-400 sm:w-2/3">A nested JSON object (e.g. <code>&#123; "company_name": "Lotlite", "industry": "Tech" &#125;</code>) to white-label writing style.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Response body example */}
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400">Response Sample (200 OK)</h4>
                                    <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                                        <pre className="overflow-x-auto">{`{
  "success": true,
  "id": "a50c8225-b82d-45fb-995a-b68a27d2bc00",
  "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
  "seoTitle": "Top Reasons to Invest in Pune Real Estate in 2026",
  "seoDescription": "Discover Pune's emerging hubs, real estate growth metrics, and high ROI projections for developers.",
  "imageUrl": "https://supabase.co/storage/v1/object/public/blog-images/blog-16987.png",
  "article": "<h1>Top Reasons...</h1><p>...</p>",
  "markdown": "# Top Reasons to Invest...",
  "wordCount": 782,
  "creditsUsed": 50,
  "newBalance": 3450
}`}</pre>
                                        <button
                                            onClick={() => handleCopy(`{
  "success": true,
  "id": "a50c8225-b82d-45fb-995a-b68a27d2bc00",
  "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
  "seoTitle": "Top Reasons to Invest in Pune Real Estate in 2026",
  "seoDescription": "Discover Pune's emerging hubs, real estate growth metrics, and high ROI projections for developers.",
  "imageUrl": "https://supabase.co/storage/v1/object/public/blog-images/blog-16987.png",
  "article": "<h1>Top Reasons...</h1><p>...</p>",
  "markdown": "# Top Reasons to Invest...",
  "wordCount": 782,
  "creditsUsed": 50,
  "newBalance": 3450
}`, 'res-sample')}
                                            className="absolute top-4 right-4 p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
                                        >
                                            {copiedText === 'res-sample' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Section: Code Examples --- */}
                    <section id="code-sdk" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-900 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Terminal className="text-[#26cece]" size={24} />
                                Code Examples & Client Libraries
                            </h2>
                            <p className="text-slate-400">
                                Launch integration quickly using copy-pasteable snippets formatted in cURL, Python, or Node.js.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                            {/* Lang tabs */}
                            <div className="bg-slate-950/80 border-b border-slate-800 flex">
                                {Object.keys(codeExamples).map((langKey) => {
                                    const ex = codeExamples[langKey];
                                    const Icon = ex.icon;
                                    return (
                                        <button
                                            key={langKey}
                                            onClick={() => setSelectedLang(langKey)}
                                            className={`px-5 py-3 text-xs font-semibold tracking-wider uppercase border-r border-slate-800 flex items-center gap-2 transition-all ${selectedLang === langKey ? 'bg-slate-900 text-[#26cece]' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
                                        >
                                            <Icon size={14} />
                                            {ex.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Code pre block */}
                            <div className="relative p-5 bg-slate-950 font-mono text-xs text-slate-300">
                                <pre className="overflow-x-auto whitespace-pre-wrap">{codeExamples[selectedLang].code}</pre>
                                <button
                                    onClick={() => handleCopy(codeExamples[selectedLang].code, `code-${selectedLang}`)}
                                    className="absolute top-4 right-4 p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
                                >
                                    {copiedText === `code-${selectedLang}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* --- Section: Error Reference --- */}
                    <section id="errors" className="scroll-mt-24 space-y-6">
                        <div className="border-t border-slate-900 pt-10 space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <AlertTriangle className="text-[#26cece]" size={24} />
                                Error Reference
                            </h2>
                            <p className="text-slate-400">
                                Detailed status codes and response schemas to build solid exception handling in your integration.
                            </p>
                        </div>

                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
                            <div className="p-5 flex gap-4 items-start">
                                <div className="font-mono text-sm font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 shrink-0">401</div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Unauthorized</h4>
                                    <p className="text-xs text-slate-400">Occurs when the <code>Authorization</code> header is missing, incorrectly formatted, or the key is invalid.</p>
                                </div>
                            </div>
                            <div className="p-5 flex gap-4 items-start">
                                <div className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 shrink-0">402</div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Payment Required (Insufficient Credits)</h4>
                                    <p className="text-xs text-slate-400">Your account balance is below the execution threshold (50 credits for standard clients, 10 credits for administrative keys). Please upgrade your subscription package.</p>
                                </div>
                            </div>
                            <div className="p-5 flex gap-4 items-start">
                                <div className="font-mono text-sm font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20 shrink-0">429</div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Too Many Requests (Rate Limited)</h4>
                                    <p className="text-xs text-slate-400">You exceeded your plan's requests-per-minute threshold limit. Slow down requests or upgrade plan levels.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            
            {/* Simple Developer footer */}
            <footer className="border-t border-slate-900 mt-20 py-8 bg-slate-950/40">
                <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Bitlance Tech Hub. All rights reserved. API Version 1.0.0-Beta</p>
                </div>
            </footer>
        </div>
    );
}
