import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Sparkles, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../config.js';

const AdsLibraryView = () => {
    const { session } = useAuth();
    const authToken = session?.access_token;

    const [brandConfigs, setBrandConfigs] = useState([]);
    const [selectedBrandId, setBrandSessionId] = useState('');
    const [query, setQuery] = useState('');
    const [topK, setTopK] = useState(6);

    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!authToken) return;
        fetch(`${API_BASE_URL}/api/agent/ads/brands`, {
            headers: { Authorization: `Bearer ${authToken}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setBrandConfigs(data.brands);
                    if (data.brands.length === 1) setBrandSessionId(data.brands[0].id);
                }
            })
            .catch(() => {});
    }, [authToken]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedBrandId || !query.trim()) return;
        setLoading(true);
        setError(null);
        setAds([]);
        setSearched(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/agent/ads/find-reference`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ brand_id: selectedBrandId, query, top_k: topK }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch ads');
            setAds(data.ads || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto overflow-y-auto h-full">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#26cece]/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#26cece]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk'] text-white tracking-tight uppercase">
                        High-Performing Ads Library
                    </h1>
                </div>
                <p className="text-white/50 font-mono text-sm tracking-widest uppercase ml-[52px]">
                    Discover and recreate top-performing ads in your brand's style
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">

                    {/* Brand selector */}
                    <div>
                        <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest mb-2">
                            Brand *
                        </label>
                        {brandConfigs.length === 0 ? (
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                No brands found. Create a brand in AI Campaigns first.
                            </div>
                        ) : (
                            <select
                                value={selectedBrandId}
                                onChange={e => setBrandSessionId(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#26cece]/50 transition-colors"
                            >
                                        <option value="" disabled className="bg-[#0d4a45]">Select a brand…</option>
                                {brandConfigs.map(b => (
                                    <option key={b.id} value={b.id} className="bg-[#0d4a45]">
                                        {b.name || b.brand_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Query */}
                    <div>
                        <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest mb-2">
                            Ad Concept / Query *
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g. summer sale lifestyle product"
                            required
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-white/30 focus:outline-none focus:border-[#26cece]/50 transition-colors"
                        />
                    </div>

                    {/* Top K */}
                    <div>
                        <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest mb-2">
                            Results
                        </label>
                        <input
                            type="number"
                            value={topK}
                            onChange={e => setTopK(Math.max(1, Math.min(20, Number(e.target.value))))}
                            min={1}
                            max={20}
                            className="w-24 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#26cece]/50 transition-colors"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !selectedBrandId || !query.trim()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#26cece] text-[#115e59] font-bold text-sm font-mono uppercase tracking-wider hover:bg-[#1fb8b8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                        {loading ? 'Searching…' : 'Find Ads'}
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-red-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Results */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-white/40 font-mono text-sm">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#26cece]" />
                    Searching for high-performing ads…
                </div>
            )}

            {!loading && searched && ads.length === 0 && !error && (
                <div className="text-center py-20 text-white/30 font-mono text-sm">
                    No ads found for this query. Try a different concept.
                </div>
            )}

            {!loading && ads.length > 0 && (
                <>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-4">
                        {ads.length} high-performing ad{ads.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {ads.map((ad, idx) => (
                            <div
                                key={ad.id || idx}
                                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#26cece]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(38,206,206,0.12)] transition-all duration-300"
                            >
                                {/* Ad image */}
                                {ad.image_url ? (
                                    <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                                        <img
                                            src={ad.image_url}
                                            alt={ad.brand_name || `Ad ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ) : (
                                    <div className="aspect-[4/3] bg-white/5 flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 text-white/10" />
                                    </div>
                                )}

                                {/* Ad info */}
                                <div className="p-4">
                                    {ad.brand_name && (
                                        <p className="text-[#26cece] text-[11px] font-mono uppercase tracking-widest mb-1">
                                            {ad.brand_name}
                                        </p>
                                    )}
                                    {ad.description && (
                                        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                                            {ad.description}
                                        </p>
                                    )}
                                    {ad.id && (
                                        <p className="text-white/20 text-[10px] font-mono mt-2 truncate">
                                            ID: {ad.id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdsLibraryView;
