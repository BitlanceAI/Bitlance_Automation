import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function PartnerPortal() {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mode, setMode] = useState('SEO');
  const [brandInfo, setBrandInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!apiKey.startsWith('sk_live_')) {
      toast.error('Invalid API Key format.');
      return;
    }
    
    setLoading(true);
    setGeneratedData(null);
    
    // Route through Node.js backend — Python AI agent is an internal DO service
    const apiUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://bitlance-app-97qhp.ondigitalocean.app' : 'http://localhost:3001');
    
    try {
      const response = await axios.post(`${apiUrl}/api/admin/api-keys/seo/generate`, {
        topic,
        keywords,
        optimization_mode: mode,
        brand_context_data: {
          company_name: "Partner Client",
          industry: brandInfo // Send their specific deep info here
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.data.success) {
        toast.success('Blog generated successfully!');
        setGeneratedData(response.data);
      } else {
        toast.error('Generation failed.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 402) {
        toast.error('Insufficient Credits!');
      } else if (err.response?.status === 401) {
        toast.error('Invalid API Key!');
      } else {
        toast.error(err.response?.data?.detail || 'An error occurred during generation.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl pt-24">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Partner API Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Securely generate optimized blog content without writing code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl pb-24">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleGenerate}>
            
            {/* API Key Block */}
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-md">
              <label htmlFor="apiKey" className="block text-sm font-semibold text-teal-900">
                1. Submit Your Access Token
              </label>
              <div className="mt-2">
                <input
                  id="apiKey"
                  type="password"
                  required
                  placeholder="Paste your sk_live_... token here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 pt-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-900">2. Define Your Content</label>
              </div>
              {/* Topic */}
              <div className="sm:col-span-2">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Topic / Title
                </label>
                <div className="mt-1">
                  <input
                    id="topic"
                    type="text"
                    required
                    placeholder="e.g. Best E-Learning Platforms in 2025"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Optimization Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Optimization Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                >
                  <option value="SEO">SEO (Google Search Ranking)</option>
                  <option value="GEO">GEO (AI Overviews & ChatGPT)</option>
                </select>
              </div>

              {/* Keywords */}
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                  Keywords (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="keywords"
                    type="text"
                    placeholder="e.g. edtech, online courses"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Deep Specific Information */}
            <div className="pt-2">
              <label htmlFor="brandInfo" className="block text-sm font-semibold text-gray-900">
                3. Deep Specific Information
              </label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Provide private context, specific facts, or proprietary details not found on the internet. The AI will seamlessly integrate this into the article.</p>
              <div className="mt-1">
                <textarea
                  id="brandInfo"
                  rows={5}
                  value={brandInfo}
                  onChange={(e) => setBrandInfo(e.target.value)}
                  placeholder="e.g. Lotlite Edu offers 1-on-1 mentorship for all enterprise tiers. We launched a new feature last week..."
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
              >
                {loading ? 'Generating Article... (This takes 1-2 minutes)' : 'Generate Blog Content'}
              </button>
            </div>
          </form>

          {/* Result Block */}
          {generatedData && (
            <div className="mt-10 border-t pt-8 border-gray-200">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4">Generation Complete</h3>
              <p className="text-sm text-gray-500 mb-6">Your content is ready. You can now copy and paste it into your CMS.</p>
              
              <div className="mb-6">
                <span className="block text-sm font-semibold text-gray-900 mb-1">Generated Title</span>
                <div className="p-3 bg-gray-50 rounded-md border text-sm font-medium text-gray-800">{generatedData.seoTitle || generatedData.topic}</div>
              </div>
              
              {generatedData.imageUrl && (
                <div className="mb-6">
                  <span className="block text-sm font-semibold text-gray-900 mb-2">Featured Image</span>
                  <img src={generatedData.imageUrl} alt="Generated" className="rounded-md max-h-64 object-cover border" />
                  <a href={generatedData.imageUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs text-teal-600 hover:text-teal-800 block">Open Image in New Tab</a>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="block text-sm font-semibold text-gray-900">Markdown Content</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedData.markdown || generatedData.article);
                      toast.success('Copied to clipboard!');
                    }}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Copy Markdown
                  </button>
                </div>
                <div className="mt-1">
                  <textarea 
                    readOnly 
                    className="w-full h-96 p-4 bg-gray-50 border rounded-md font-mono text-sm leading-relaxed"
                    value={generatedData.markdown || generatedData.article}
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
