import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Search, Send, MoreVertical, Smile, Paperclip,
    Facebook, Instagram, Linkedin, AtSign, RefreshCw,
    ChevronDown, Check, CheckCheck, Circle, Filter
} from 'lucide-react';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const PLATFORM_META = {
    facebook:  { icon: Facebook,  color: '#1877F2', label: 'Facebook' },
    instagram: { icon: Instagram, color: '#E1306C', label: 'Instagram' },
    linkedin:  { icon: Linkedin,  color: '#0A66C2', label: 'LinkedIn' },
    twitter:   { icon: XIcon,     color: '#ffffff', label: 'X' },
};

const MOCK_CONVERSATIONS = [];

const TABS = ['All', 'Unread', 'Facebook', 'Instagram', 'LinkedIn', 'X'];

export default function InboxView() {
    const [activeTab, setActiveTab] = useState('All');
    const [selectedId, setSelectedId] = useState(1);
    const [reply, setReply] = useState('');
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Subscribe to real-time incoming DMs from backend broadcast
        const channel = supabase.channel('meta-inbox-updates');

        channel.on('broadcast', { event: 'new_message' }, (payload) => {
            const newConversation = payload.payload;
            console.log("Received new real-time message:", newConversation);
            
            setConversations(prev => {
                // Check if a conversation from this user already exists
                const existingIndex = prev.findIndex(c => c.name === newConversation.name);
                
                if (existingIndex >= 0) {
                    // Update existing conversation
                    const updated = [...prev];
                    const existing = updated[existingIndex];
                    updated[existingIndex] = {
                        ...existing,
                        messages: [...existing.messages, ...newConversation.messages],
                        lastMessage: newConversation.lastMessage,
                        time: newConversation.time,
                        unread: existing.unread + 1,
                        status: 'open'
                    };
                    // Move to top
                    const [moved] = updated.splice(existingIndex, 1);
                    return [moved, ...updated];
                } else {
                    // Add new conversation to top
                    return [newConversation, ...prev];
                }
            });
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filtered = conversations.filter(c => {
        const matchTab =
            activeTab === 'All' ? true :
            activeTab === 'Unread' ? c.unread > 0 :
            activeTab === 'Facebook' ? c.platform === 'facebook' :
            activeTab === 'Instagram' ? c.platform === 'instagram' :
            activeTab === 'LinkedIn' ? c.platform === 'linkedin' :
            activeTab === 'X' ? c.platform === 'twitter' : true;
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const selected = conversations.find(c => c.id === selectedId);

    const handleSend = () => {
        if (!reply.trim() || !selected) return;
        setConversations(prev => prev.map(c =>
            c.id === selected.id
                ? { ...c, messages: [...c.messages, { id: Date.now(), from: 'me', text: reply.trim(), time: 'Just now' }], lastMessage: reply.trim(), time: 'Just now' }
                : c
        ));
        setReply('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const markRead = (id) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    };

    const PlatformIcon = ({ platform, size = 12 }) => {
        const meta = PLATFORM_META[platform];
        if (!meta) return null;
        return <meta.icon className={`w-[${size}px] h-[${size}px]`} style={{ color: meta.color }} />;
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

    return (
        <div className="flex h-full bg-transparent overflow-hidden">

            {/* ── LEFT: conversation list ─────────────────────────────── */}
            <div className="w-[320px] flex-shrink-0 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-md">

                {/* Header */}
                <div className="px-4 pt-5 pb-3 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[13px]">Inbox</h2>
                            {totalUnread > 0 && (
                                <span className="bg-[#26cece] text-black text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-[2px]">
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                        <button className="text-white/40 hover:text-[#26cece] transition-colors">
                            <RefreshCw className="w-[14px] h-[14px]" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-white/40" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full bg-[#111] border border-white/10 text-white text-[12px] font-mono pl-7 pr-3 py-2 rounded-[2px] placeholder-white/40 focus:outline-none focus:border-[#26cece]/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0.5 px-2 py-2 border-b border-white/10 flex-wrap">
                    {TABS.map(tab => {
                        const count = tab === 'Unread' ? conversations.filter(c => c.unread > 0).length
                            : tab === 'All' ? conversations.length
                            : conversations.filter(c =>
                                (tab === 'Facebook' && c.platform === 'facebook') ||
                                (tab === 'Instagram' && c.platform === 'instagram') ||
                                (tab === 'LinkedIn' && c.platform === 'linkedin') ||
                                (tab === 'X' && c.platform === 'twitter')
                            ).length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-[2px] transition-colors ${
                                    activeTab === tab
                                        ? 'bg-[#26cece]/10 text-[#26cece] border border-[#26cece]/30'
                                        : 'text-white/40 hover:text-white/80 border border-transparent'
                                }`}
                            >
                                {tab} {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/40 font-mono text-[12px] gap-3 px-4 text-center">
                            <AtSign className="w-10 h-10 opacity-20" />
                            <span className="uppercase tracking-widest text-[11px]">No messages yet</span>
                            <span className="text-[10px] opacity-60 leading-relaxed">Incoming DMs from Facebook & Instagram will appear here in real-time.</span>
                        </div>
                    ) : filtered.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => { setSelectedId(conv.id); markRead(conv.id); }}
                            className={`w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-white/10 transition-colors group ${
                                selectedId === conv.id ? 'bg-[#26cece]/10 border-l-2 border-l-[#26cece]' : 'border-l-2 border-l-transparent'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold font-['Space_Grotesk']"
                                        style={{ background: conv.avatarBg }}
                                    >
                                        {conv.avatar}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111] border border-white/20 flex items-center justify-center">
                                        <PlatformIcon platform={conv.platform} size={10} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-[12px] font-['Space_Grotesk'] font-semibold truncate ${conv.unread > 0 ? 'text-white' : 'text-white/70'}`}>
                                            {conv.name}
                                        </span>
                                        <span className="text-[10px] font-mono text-white/40 ml-2 flex-shrink-0">{conv.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                        <p className={`text-[11px] font-mono truncate ${conv.unread > 0 ? 'text-white/80' : 'text-white/40'}`}>
                                            {conv.lastMessage}
                                        </p>
                                        {conv.unread > 0 && (
                                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#26cece] text-black text-[9px] font-bold flex items-center justify-center">
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                    {conv.status === 'resolved' && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-[#26cece]/70 mt-0.5">
                                            <Check className="w-2.5 h-2.5" /> resolved
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── RIGHT: conversation thread ──────────────────────────── */}
            {selected ? (
                <div className="flex-1 flex flex-col min-w-0 bg-transparent">

                    {/* Thread header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold font-['Space_Grotesk'] flex-shrink-0"
                                style={{ background: selected.avatarBg }}
                            >
                                {selected.avatar}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold font-['Space_Grotesk'] text-[13px]">{selected.name}</span>
                                    <div className="flex items-center gap-1 bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-[2px]">
                                        <PlatformIcon platform={selected.platform} size={10} />
                                        <span className="text-[10px] font-mono text-white/70">{PLATFORM_META[selected.platform]?.label}</span>
                                    </div>
                                </div>
                                <span className="text-[11px] font-mono text-white/50">{selected.handle}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="text-[10px] font-mono uppercase tracking-wider text-white/50 border border-white/20 hover:border-[#26cece]/30 hover:text-[#26cece] px-3 py-1.5 rounded-[2px] transition-colors flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> Mark Resolved
                            </button>
                            <button className="text-white/40 hover:text-white/80 transition-colors p-1.5">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-transparent">
                        {selected.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                {msg.from === 'them' && (
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-['Space_Grotesk'] mr-2 flex-shrink-0 mt-0.5"
                                        style={{ background: selected.avatarBg }}
                                    >
                                        {selected.avatar}
                                    </div>
                                )}
                                <div className={`max-w-[60%] ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`px-4 py-2.5 rounded-[2px] text-[13px] font-mono leading-relaxed ${
                                        msg.from === 'me'
                                            ? 'bg-[#26cece]/20 border border-[#26cece]/30 text-[#26cece] rounded-tr-none'
                                            : 'bg-white/10 border border-white/10 text-white/90 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-1 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] font-mono text-white/40">{msg.time}</span>
                                        {msg.from === 'me' && <CheckCheck className="w-3 h-3 text-[#26cece]/60" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply composer */}
                    <div className="border-t border-white/10 bg-black/20 backdrop-blur-md p-4">
                        <div className="bg-[#111] border border-white/10 rounded-[2px] focus-within:border-[#26cece]/40 transition-colors">
                            <textarea
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a reply… (Enter to send)"
                                rows={3}
                                className="w-full bg-transparent text-white/90 text-[13px] font-mono px-4 pt-3 pb-2 resize-none focus:outline-none placeholder-white/40"
                            />
                            <div className="flex items-center justify-between px-3 pb-2.5">
                                <div className="flex items-center gap-3 text-white/40">
                                    <button className="hover:text-[#26cece] transition-colors"><Smile className="w-4 h-4" /></button>
                                    <button className="hover:text-[#26cece] transition-colors"><Paperclip className="w-4 h-4" /></button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!reply.trim()}
                                    className="flex items-center gap-2 bg-[#26cece] text-black text-[11px] font-bold font-mono uppercase tracking-widest px-4 py-2 rounded-[2px] hover:bg-[#1fb8b8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(38,206,206,0.3)]"
                                >
                                    <Send className="w-3.5 h-3.5" /> Send
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] font-mono text-white/40 mt-1.5">
                            Replying via {PLATFORM_META[selected.platform]?.label} · {selected.handle}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-3">
                    <AtSign className="w-12 h-12 opacity-20" />
                    <span className="font-mono text-[13px] uppercase tracking-widest">Select a conversation</span>
                </div>
            )}
        </div>
    );
}
