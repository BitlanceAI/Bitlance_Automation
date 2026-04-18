import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Loader } from 'lucide-react';
import API_BASE_URL from '../../config.js';

/**
 * Fetches Google Autocomplete suggestions for a query and renders
 * clickable keyword pills. Calls onAdd(keyword) when a pill is clicked.
 *
 * Props:
 *   query       — the topic/title to base suggestions on
 *   token       — auth bearer token
 *   onAdd       — callback(keyword: string) when a suggestion is picked
 *   activeKws   — comma-separated string of already-selected keywords (to dim dupes)
 */
export default function KeywordSuggestions({ query, token, onAdd, activeKws = '' }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(false);
    const debounceRef                    = useRef(null);

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/keywords/suggest?q=${encodeURIComponent(query.trim())}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (data.success) setSuggestions(data.suggestions || []);
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 600);

        return () => clearTimeout(debounceRef.current);
    }, [query, token]);

    if (!query || query.trim().length < 3) return null;

    const active = new Set(
        activeKws.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    );

    return (
        <div className="mt-2">
            <div className="flex items-center gap-1.5 mb-2">
                {loading
                    ? <Loader className="w-3 h-3 text-indigo-400 animate-spin" />
                    : <Sparkles className="w-3 h-3 text-indigo-400" />
                }
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {loading ? 'Finding keywords…' : 'Suggested keywords — click to add'}
                </span>
            </div>

            {!loading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((kw, i) => {
                        const already = active.has(kw.toLowerCase());
                        return (
                            <button
                                key={i}
                                type="button"
                                disabled={already}
                                onClick={() => !already && onAdd(kw)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border
                                    ${already
                                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-600 cursor-default opacity-60'
                                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 cursor-pointer'
                                    }`}
                            >
                                {already
                                    ? <X className="w-2.5 h-2.5" />
                                    : <span className="text-indigo-400 dark:text-indigo-500">+</span>
                                }
                                {kw}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
