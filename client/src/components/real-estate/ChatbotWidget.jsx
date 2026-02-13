import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hi there! 👋 I\'m the Bitlance AI assistant. How can I help you automate your real estate business today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botResponses = [
                "That's a great question! Our AI system can generate 200+ leads per month on autopilot.",
                "We integrate directly with your CRM to automate follow-ups via SMS and Email.",
                "Would you like to book a quick demo to see how it works in action?",
                "Our setup takes less than 48 hours, and we handle all the technical heavy lifting."
            ];
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: randomResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-re-navy p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                                <Bot size={24} className="text-re-blue" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-re-navy"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Bitlance AI Agent</h3>
                                <p className="text-xs text-slate-300">Online & Ready</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-re-blue text-re-navy rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-re-blue outline-none"
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 bg-re-blue text-re-navy rounded-full hover:bg-cyan-400 transition-colors shadow-lg disabled:opacity-50"
                                disabled={!inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">Powered by Bitlance AI</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-re-blue text-re-navy shadow-2xl hover:shadow-re-blue/50 hover:scale-110 transition-all flex items-center justify-center relative group"
                >
                    <MessageSquare size={32} className="fill-current" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
                    </span>
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-gray-800 dark:text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat with our AI
                        <div className="absolute top-1/2 right-0 translate-x-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45"></div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
