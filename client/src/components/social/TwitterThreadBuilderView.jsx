import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Send } from 'lucide-react';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TwitterThreadBuilderView = () => {
    const [tweets, setTweets] = useState(['']);

    const addTweet = () => setTweets([...tweets, '']);
    const removeTweet = (index) => {
        if (tweets.length > 1) {
            setTweets(tweets.filter((_, i) => i !== index));
        }
    };
    
    const updateTweet = (index, value) => {
        const newTweets = [...tweets];
        newTweets[index] = value;
        setTweets(newTweets);
    };

    return (
        <div className="flex-1 p-8 bg-[#070707] overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-[#111111] p-5 border border-[#1E1E1E] rounded-[2px]">
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <XIcon className="w-5 h-5 text-current" /> Thread Builder
                        </h2>
                        <p className="text-[11px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Connect multiple posts seamlessly</p>
                    </div>
                    <button className="bg-white text-black px-5 py-2.5 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-gray-200 hover:-translate-y-1 transition-all flex items-center gap-2 text-[13px]">
                        <Send className="w-4 h-4" /> Publish Thread
                    </button>
                </div>

                <div className="space-y-4">
                    {tweets.map((tweet, index) => (
                        <div key={index} className="relative flex gap-4">
                            {/* Threadline */}
                            <div className="flex flex-col items-center shrink-0 w-10">
                                <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#333] flex items-center justify-center text-gray-500 font-mono text-[12px]">
                                    {index + 1}
                                </div>
                                {index < tweets.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-[#333] my-2"></div>
                                )}
                            </div>

                            <div className="flex-1 bg-[#111111] border border-[#1E1E1E] hover:border-[#333] rounded-[2px] p-4 transition-colors group shadow-sm focus-within:border-white">
                                <textarea
                                    value={tweet}
                                    onChange={(e) => updateTweet(index, e.target.value)}
                                    placeholder={index === 0 ? "What's happening?" : "Add another post..."}
                                    className="w-full bg-transparent border-none text-white resize-none focus:outline-none min-h-[90px] text-[15px] font-sans placeholder:text-gray-600"
                                />
                                <div className="flex items-center justify-between pt-2 border-t border-[#1E1E1E] mt-2">
                                    <div className="flex gap-1 text-gray-600">
                                        <button className="p-1 hover:text-white transition-colors cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
                                        <button className="p-1 hover:text-white transition-colors cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-mono uppercase tracking-widest ${tweet.length > 280 ? 'text-[#FF4A4A]' : tweet.length > 250 ? 'text-[#FFCA4A]' : 'text-gray-500'}`}>
                                            {tweet.length}/280
                                        </span>
                                        {tweets.length > 1 && (
                                            <button onClick={() => removeTweet(index)} className="text-gray-600 hover:text-[#FF4A4A] transition-colors cursor-pointer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pl-14 pt-2">
                        <button 
                            onClick={addTweet}
                            className="bg-transparent border border-dashed border-[#333] hover:border-white text-gray-400 hover:text-white w-full py-3 rounded-[2px] font-mono text-[12px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add to Thread
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwitterThreadBuilderView;
