import React, { useState, useEffect } from 'react';
import {
    MessageCircle, RefreshCw, Send, Check, ChevronDown,
    Instagram, Loader2, Image as ImageIcon, ExternalLink, Clock
} from 'lucide-react';
import API_BASE_URL from '../../config.js';
import { supabase } from '../../services/supabaseClient';
import { useWorkspace } from '../../context/WorkspaceContext';

const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
};

const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function CommentsView({ connectedProfiles = [] }) {
    const { workspaceHeaders } = useWorkspace();

    const igAccounts = connectedProfiles.filter(p => p.platform === 'instagram');

    const [selectedAccountId, setSelectedAccountId] = useState(igAccounts[0]?.profileId || '');
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [replies, setReplies] = useState({});   // { commentId: text }
    const [sendingId, setSendingId] = useState(null);
    const [sentIds, setSentIds] = useState(new Set());
    const [expandedPost, setExpandedPost] = useState(null);

    // Realtime subscription on ig_comments
    useEffect(() => {
        const channel = supabase
            .channel('ig-comments-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ig_comments' }, (payload) => {
                if (payload.eventType === 'UPDATE' && payload.new?.replied) {
                    setSentIds(prev => new Set([...prev, payload.new.ig_comment_id]));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const handleFetch = async () => {
        if (!selectedAccountId) return;
        setLoading(true);
        setError(null);
        setMedia([]);
        setExpandedPost(null);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/meta/comments/${selectedAccountId}`, {
                headers: { 'Authorization': `Bearer ${token}`, ...workspaceHeaders }
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch comments');
            setMedia(data.media || []);
            if (data.media?.length) setExpandedPost(data.media[0].id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (commentId) => {
        const message = replies[commentId]?.trim();
        if (!message || !selectedAccountId) return;
        setSendingId(commentId);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/meta/comments/${commentId}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...workspaceHeaders
                },
                body: JSON.stringify({ message, accountId: selectedAccountId })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send reply');
            setSentIds(prev => new Set([...prev, commentId]));
            setReplies(prev => ({ ...prev, [commentId]: '' }));
        } catch (err) {
            alert(err.message);
        } finally {
            setSendingId(null);
        }
    };

    const totalComments = media.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    const pendingCount = media.reduce((sum, post) =>
        sum + (post.comments || []).filter(c => !sentIds.has(c.id)).length, 0);

    return (
        <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#26cece]" />
                            Comment Manager
                        </h2>
                        <p className="text-[12px] text-white/50 font-mono mt-1 uppercase tracking-widest">
                            View and reply to Instagram post comments
                        </p>
                    </div>

                    {media.length > 0 && (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-white/60">
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                                {totalComments} total
                            </span>
                            <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-md">
                                {pendingCount} pending
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {igAccounts.length === 0 ? (
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-md text-[13px] text-white/40 font-mono">
                            <Instagram className="w-4 h-4" />
                            No Instagram accounts connected. Add one via Social Profiles.
                        </div>
                    ) : (
                        <div className="relative flex-1">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                            <select
                                value={selectedAccountId}
                                onChange={e => setSelectedAccountId(e.target.value)}
                                className="w-full pl-9 pr-8 py-3 bg-white/5 border border-white/10 text-white text-[13px] font-mono rounded-md focus:outline-none focus:border-[#26cece] appearance-none cursor-pointer"
                            >
                                {igAccounts.map(acc => (
                                    <option key={acc.profileId} value={acc.profileId} className="bg-[#111]">
                                        @{acc.username || acc.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>
                    )}

                    <button
                        onClick={handleFetch}
                        disabled={loading || !selectedAccountId || igAccounts.length === 0}
                        className="flex items-center gap-2 px-5 py-3 bg-[#26cece] hover:bg-[#1fb8b8] disabled:bg-white/10 disabled:cursor-not-allowed text-[#070707] disabled:text-white/40 font-mono text-[12px] uppercase tracking-widest rounded-md transition-colors font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {loading ? 'Loading…' : 'Fetch Comments'}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-[13px] text-red-400 font-mono">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && media.length === 0 && !error && (
                    <div className="py-20 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <MessageCircle className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-[13px] font-mono text-white/40 uppercase tracking-widest">
                            Select an account and click "Fetch Comments"
                        </p>
                    </div>
                )}

                {/* Media Posts with Comments */}
                {media.map(post => {
                    const isExpanded = expandedPost === post.id;
                    const commentCount = post.comments?.length || 0;
                    const thumb = post.thumbnail_url || post.media_url;

                    return (
                        <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            {/* Post header */}
                            <button
                                onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                    {thumb ? (
                                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[13px] text-white/80 font-sans line-clamp-2">
                                        {post.caption || <span className="text-white/30 italic">No caption</span>}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {timeAgo(post.timestamp)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {commentCount} comment{commentCount !== 1 ? 's' : ''}
                                        </span>
                                        {post.permalink && (
                                            <a
                                                href={post.permalink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center gap-1 hover:text-[#26cece] transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" /> View
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Comments list */}
                            {isExpanded && (
                                <div className="border-t border-white/10">
                                    {commentCount === 0 ? (
                                        <div className="px-6 py-8 text-center text-[12px] font-mono text-white/30 uppercase tracking-widest">
                                            No comments on this post
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {post.comments.map(comment => {
                                                const isReplied = sentIds.has(comment.id);
                                                const isSending = sendingId === comment.id;

                                                return (
                                                    <div key={comment.id} className="p-4 space-y-3">
                                                        {/* Comment */}
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                                                {comment.username?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[13px] font-bold text-white font-mono">
                                                                        @{comment.username}
                                                                    </span>
                                                                    <span className="text-[10px] text-white/30 font-mono">
                                                                        {timeAgo(comment.timestamp)}
                                                                    </span>
                                                                    {isReplied && (
                                                                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                                                                            <Check className="w-3 h-3" /> Replied
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[13px] text-white/80 font-sans leading-relaxed">
                                                                    {comment.text}
                                                                </p>

                                                                {/* Existing replies */}
                                                                {comment.replies?.data?.length > 0 && (
                                                                    <div className="mt-3 ml-4 space-y-2 border-l-2 border-white/10 pl-3">
                                                                        {comment.replies.data.map(reply => (
                                                                            <div key={reply.id} className="text-[12px]">
                                                                                <span className="font-bold text-[#26cece] font-mono">@{reply.username}</span>
                                                                                <span className="text-white/60 ml-2">{reply.text}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Reply input */}
                                                        {!isReplied && (
                                                            <div className="flex gap-2 ml-11">
                                                                <input
                                                                    type="text"
                                                                    value={replies[comment.id] || ''}
                                                                    onChange={e => setReplies(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)}
                                                                    placeholder="Write a reply…"
                                                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] transition-colors"
                                                                />
                                                                <button
                                                                    onClick={() => handleReply(comment.id)}
                                                                    disabled={!replies[comment.id]?.trim() || isSending}
                                                                    className="px-3 py-2 bg-[#26cece]/10 hover:bg-[#26cece]/20 disabled:opacity-40 disabled:cursor-not-allowed border border-[#26cece]/30 text-[#26cece] rounded-md transition-colors"
                                                                >
                                                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
