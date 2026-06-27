import React, { useState } from 'react';
import {
    CalendarDays,
    Send,
    Film,
    FileText,
    ImageIcon,
    Linkedin,
    BarChart2,
    TrendingUp
} from 'lucide-react';

const PerformanceStats = ({ recentPosts, stats, statsDays, setStatsDays }) => {
    const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'overview'

    return (
        <div className="flex flex-col gap-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-4 py-2 text-[13px] font-bold font-['Space_Grotesk'] tracking-tight uppercase flex items-center gap-2 transition-colors rounded-t-lg ${activeTab === 'recent' ? 'text-white border-b-2 border-[#26cece]' : 'text-white/60 hover:text-white'}`}
                >
                    <CalendarDays className="w-4 h-4" /> Recent Posts
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-[13px] font-bold font-['Space_Grotesk'] tracking-tight uppercase flex items-center gap-2 transition-colors rounded-t-lg ${activeTab === 'overview' ? 'text-white border-b-2 border-[#26cece]' : 'text-white/60 hover:text-white'}`}
                >
                    <BarChart2 className="w-4 h-4" /> Performance Overview
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)] min-h-[400px]">
                {activeTab === 'recent' && (
                    <>
                        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
                            <h3 className="text-[15px] font-bold font-['Space_Grotesk'] tracking-tight text-white uppercase flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-white/80" /> Recent Posts
                            </h3>
                            <button className="text-[11px] font-mono tracking-widest text-[#26cece] uppercase hover:text-white transition-colors cursor-pointer">View all</button>
                        </div>
                        {recentPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 backdrop-blur-md border border-white/10 -[2px] rounded-2xl">
                                <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center mb-3">
                                    <Send className="w-4 h-4 text-[#26cece]" />
                                </div>
                                <p className="font-mono text-[11px] tracking-widest uppercase text-white/60 px-4">No posts yet. Publish your first post above.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPosts.map((post) => (
                                    <div key={post.id} className="flex gap-3 p-3.5 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all duration-300 rounded-2xl">
                                        <div className={`w-9 h-9 rounded-full border border-white/10 shrink-0 flex items-center justify-center text-teal-50 ${post.media_category === 'IMAGE' ? 'bg-[#26cece]/10' : post.media_category === 'VIDEO' ? 'bg-[#26cece]/10' : post.media_category === 'DOCUMENT' ? 'bg-[#26cece]/10' : 'bg-[#26cece]/10'}`}>
                                            {post.media_category === 'VIDEO' ? <Film className="w-4 h-4 text-[#26cece]" /> : post.media_category === 'DOCUMENT' ? <FileText className="w-4 h-4 text-[#26cece]" /> : post.media_category === 'IMAGE' ? <ImageIcon className="w-4 h-4 text-[#26cece]" /> : <Linkedin className="w-4 h-4 text-[#26cece]" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-mono tracking-widest text-teal-50 leading-snug line-clamp-2">{post.text}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-white/40">·</span>
                                                <span className={`text-[10px] font-mono tracking-widest uppercase ${post.visibility === 'PUBLIC' ? 'text-[#26cece]' : 'text-white/60'}`}>{post.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Connections'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'overview' && (
                    <>
                        <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                            <h3 className="text-[15px] font-bold font-['Space_Grotesk'] tracking-tight text-white uppercase flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-white/80" /> Performance Overview
                            </h3>
                            <select
                                value={statsDays}
                                onChange={e => {
                                    const d = Number(e.target.value);
                                    setStatsDays(d);
                                    window._fetchLinkedInStats?.(d);
                                }}
                                className="bg-[#115e59] border border-white/10 font-mono uppercase tracking-widest text-white/80 text-[10px] -[2px] px-2.5 py-1.5 focus:outline-none focus:border-[#26cece] cursor-pointer rounded-2xl"
                            >
                                <option value={7}>Last 7 days</option>
                                <option value={30}>Last 30 days</option>
                            </select>
                        </div>

                        {!stats ? (
                            <div className="grid grid-cols-2 gap-4 animate-pulse">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 backdrop-blur-md border border-white/10 -[2px] rounded-2xl" />)}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Posts this period */}
                                    <div className="p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors rounded-2xl">
                                        <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mb-1">Posts Published</div>
                                        <div className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-white">{stats.periodPosts}</div>
                                        <div className={`flex items-center text-[10px] font-mono tracking-widest uppercase mt-2 ${stats.periodPct === null ? 'text-white/60' : stats.periodPct >= 0 ? 'text-[#26cece]' : 'text-[#FF4A4A]'}`}>
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            {stats.periodPct === null ? 'No previous data' : `${stats.periodPct > 0 ? '+' : ''}${stats.periodPct}% vs prev`}
                                        </div>
                                    </div>
                                    {/* Total all time */}
                                    <div className="p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors rounded-2xl">
                                        <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mb-1">Total Posts</div>
                                        <div className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-white">{stats.totalPosts}</div>
                                        <div className="text-[10px] font-mono tracking-widest uppercase text-white/60 mt-2">All time</div>
                                    </div>
                                    {/* Public vs Connections */}
                                    <div className="p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors rounded-2xl">
                                        <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mb-2">Visibility</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-mono text-[#26cece]">🌐 {stats.publicPosts}</span>
                                            <span className="text-white/40">·</span>
                                            <span className="text-[11px] font-mono text-white/80">🔒 {stats.connectionPosts}</span>
                                        </div>
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-white/60 mt-2">Public · Conn</div>
                                    </div>
                                    {/* Media vs text */}
                                    <div className="p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors rounded-2xl">
                                        <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mb-2">Post Type</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-mono text-teal-50">📎 {stats.withMedia}</span>
                                            <span className="text-white/40">·</span>
                                            <span className="text-[11px] font-mono text-white/80">📝 {stats.textOnly}</span>
                                        </div>
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-white/60 mt-2">Media · Text</div>
                                    </div>
                                </div>

                                {/* Spark bar chart */}
                                {stats.byDay?.length > 0 && (
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 -[2px] p-4 rounded-2xl">
                                        <div className="text-[10px] font-mono tracking-widest uppercase text-white/60 mb-2">Posts per day</div>
                                        <div className="flex items-end gap-1 h-10">
                                            {stats.byDay.map(({ date, count }) => {
                                                const max = Math.max(...stats.byDay.map(d => d.count), 1);
                                                const h = Math.max((count / max) * 100, count > 0 ? 15 : 4);
                                                return (
                                                    <div key={date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                                                        <div
                                                            className={`w-full rounded-sm transition-all border border-white/10 ${count > 0 ? 'bg-[#26cece] hover:bg-white border-none' : 'bg-white/10'}`}
                                                            style={{ height: `${h}%` }}
                                                        />
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#26cece] text-[#070707] text-[10px] font-mono px-1.5 py-0.5 rounded-2xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 font-bold uppercase">
                                                            {date.slice(5)}: {count}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PerformanceStats;
