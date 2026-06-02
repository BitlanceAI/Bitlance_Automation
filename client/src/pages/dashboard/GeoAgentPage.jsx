import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Globe, Zap, List, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../config.js';

export default function GeoAgentPage() {
  const navigate = useNavigate();
  const { user, credits, isAdmin, refreshCredits } = useAuth();

  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('General Public');
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    const CREDIT_COST = 5;
    if (!isAdmin && credits < CREDIT_COST) {
      alert(`⚠️ Insufficient credits! You need ${CREDIT_COST} credits to generate an FAQ. Current balance: ${credits}`);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      // In a real app we'd deduct credits and use the auth token
      const response = await fetch(`${API_BASE_URL}/api/geo/generate-faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          target_audience: audience,
          language
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Generation Error:", error);
      alert("Failed to generate FAQ: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/agents')}
            className="p-2 rounded hover:bg-slate-50 text-slate-400 transition-colors"
            title="Back to Agents"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Globe className="text-[#26cece]" size={24} />
            <h1 className="text-xl font-bold text-[#26cece] tracking-tight">
              GEO FAQ Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Generator Form */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-3">
              <Zap className="text-[#26cece]" size={24} />
              Generate FAQ Schema
            </h2>
            <div className="mb-6 p-4 bg-slate-50 rounded-md border border-slate-200 flex gap-3 text-sm text-slate-600">
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <p>Generative Engine Optimization (GEO) relies heavily on structured Q&As. Enter your topic below to generate factual, AI-engine optimized FAQs.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Primary Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Best real estate investments in Dubai"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-slate-200 focus:border-[#26cece] focus:ring-1 focus:ring-[#26cece] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. First-time homebuyers"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-slate-200 focus:border-[#26cece] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-slate-200 focus:border-[#26cece] outline-none"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Hindi</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 mt-4 bg-slate-900 text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-70"
              >
                {isGenerating ? 'Generating FAQ...' : 'Generate GEO Content'}
                {!isGenerating && <Zap size={18} />}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-y-auto max-h-[800px]">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-4">
              <List className="text-[#26cece]" />
              Generated Q&A
            </h3>
            
            {!result && !isGenerating && (
              <div className="text-center py-20 text-slate-400">
                <Globe size={48} className="mx-auto mb-4 opacity-20" />
                <p>Your AI-optimized FAQ will appear here.</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-20 text-[#26cece] animate-pulse">
                <p className="font-semibold">Researching Q&As for Generative Engines...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                  <h4 className="font-bold text-lg mb-1">{result.seo_title}</h4>
                  <p className="text-sm text-slate-500 mb-3">{result.meta_description}</p>
                  
                  {result.target_entities && result.target_entities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase mr-2 self-center">Target Entities:</span>
                      {result.target_entities.map((entity, i) => (
                        <span key={i} className="px-2 py-1 bg-[#26cece]/10 text-[#26cece] border border-[#26cece]/30 rounded text-xs font-semibold">
                          {entity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Blog Introduction */}
                {result.introduction && (
                  <div className="bg-white p-6 border border-slate-200 rounded prose prose-slate max-w-none shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: result.introduction }} />
                  </div>
                )}
                
                <div className="space-y-4">
                  {result.faqs?.map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 rounded p-6 relative group bg-white shadow-sm">
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-[#26cece] bg-[#26cece]/10 px-2 py-1 rounded">
                        {faq.intent}
                      </span>
                      <h5 className="text-lg font-bold text-slate-800 mb-4 pr-24 border-b border-slate-100 pb-2">Q: {faq.question}</h5>
                      <div className="text-slate-600 prose prose-sm max-w-none prose-p:mb-3 prose-ul:my-3 prose-li:my-1" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                  ))}
                </div>

                {/* Blog Conclusion */}
                {result.conclusion && (
                  <div className="bg-slate-900 text-white p-6 border border-slate-800 rounded prose prose-invert max-w-none shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: result.conclusion }} />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
