import React, { useState } from 'react';
import { Sparkles, MessageSquare, Target, Settings2, ArrowRight } from 'lucide-react';

const CreateWithAIView = () => {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Professional');

    return (
        <div className="flex-1 p-8 bg-[#f5f5f5] overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#26cece]" /> Create a Post with AI
                    </h2>
                    <p className="text-sm font-mono text-gray-400 mt-1 uppercase tracking-widest">Transform your ideas into high-converting posts</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white border border-[#e0e0e0] rounded-[2px] p-6 shadow-[0_2px_16px_0_rgba(0,0,0,0.06)]">
                            <h3 className="text-[15px] font-bold text-gray-900 font-['Space_Grotesk'] uppercase tracking-tight mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#26cece]" /> What's on your mind?
                            </h3>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the topic, announcement, or insight you want to share. Provide some context, bullet points, or even just a rough idea..."
                                className="w-full h-40 bg-[#f9f9f9] border border-[#d0d0d0] rounded-[2px] p-4 text-[14px] text-gray-800 font-sans focus:outline-none focus:border-[#26cece] transition-colors resize-none placeholder:text-gray-400"
                            />
                            <div className="mt-4 flex justify-end">
                                <button className="bg-[#26cece] text-white px-6 py-2.5 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-[#1fb8b8] hover:-translate-y-1 transition-transform flex items-center gap-2">
                                    Generate Draft <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-[#e0e0e0] rounded-[2px] p-6">
                            <h3 className="text-[13px] font-bold text-gray-900 font-mono uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#e0e0e0] pb-3">
                                <Settings2 className="w-4 h-4 text-[#26cece]" /> AI Settings
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Tone of Voice</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full bg-[#f9f9f9] border border-[#d0d0d0] text-gray-700 text-[12px] font-mono tracking-widest rounded-[2px] px-3 py-2.5 focus:outline-none focus:border-[#26cece]"
                                    >
                                        <option>Professional</option>
                                        <option>Casual</option>
                                        <option>Inspirational</option>
                                        <option>Witty / Bold</option>
                                        <option>Educational</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Length</label>
                                    <div className="flex gap-2">
                                        {['Short', 'Medium', 'Long'].map((l) => (
                                            <button key={l} className="flex-1 py-2 text-[10px] font-mono uppercase tracking-widest border border-[#d0d0d0] bg-[#f9f9f9] text-gray-500 hover:text-[#26cece] hover:border-[#26cece] rounded-[2px]">
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response area placeholder */}
                <div className="p-10 border border-dashed border-[#d0d0d0] rounded-[2px] flex flex-col items-center justify-center text-center opacity-60">
                    <Target className="w-8 h-8 text-gray-400 mb-3" />
                    <p className="text-[12px] font-mono uppercase tracking-widest text-gray-400">Your generated draft will appear here</p>
                </div>
            </div>
        </div>
    );
};

export default CreateWithAIView;
