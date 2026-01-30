import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RetellWebClient } from 'retell-client-js-sdk';
import { Mic, PhoneOff, Activity, Wifi, Volume2, Loader } from 'lucide-react';

const VoiceAgentInterface = () => {
    const [status, setStatus] = useState('idle'); // idle, connecting, active, cleaning
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState([20, 20, 20, 20, 20]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [callType, setCallType] = useState('web'); // 'web' or 'phone'
    const retellWebClient = useRef(null);

    // Initialize Client
    useEffect(() => {
        retellWebClient.current = new RetellWebClient();

        // Event Listeners
        retellWebClient.current.on('call_started', () => {
            console.log('Call started');
            setStatus('active');
        });

        retellWebClient.current.on('call_ended', () => {
            console.log('Call ended');
            setStatus('idle');
            setDuration(0);
        });

        retellWebClient.current.on('error', (error) => {
            console.error('Voice Agent Error:', error);
            setStatus('idle');
            alert('Error connecting to voice agent: ' + error.message);
        });

        return () => {
            if (retellWebClient.current) {
                retellWebClient.current.stopCall();
            }
        };
    }, []);

    // Timer functionality
    useEffect(() => {
        let interval;
        if (status === 'active') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
                // Simulate voice wave fluctuation
                setVolume(Array(5).fill(0).map(() => Math.random() * 80 + 20));
            }, 1000);
        } else {
            setVolume([20, 20, 20, 20, 20]);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCallToggle = async () => {
        if (status === 'idle') {
            setStatus('connecting');
            if (callType === 'phone') {
                if (!phoneNumber) {
                    alert('Please enter a phone number');
                    setStatus('idle');
                    return;
                }
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;

                    const response = await fetch('/api/create-phone-call', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ to_number: phoneNumber })
                    });
                    const data = await response.json();
                    if (data.error) throw new Error(data.error);

                    alert('Call initiated to ' + phoneNumber);
                    setStatus('active'); // Manually set active for UI feedback, though real status depends on phone pickup
                    // In a real app, we'd poll for status or use websockets
                } catch (error) {
                    console.error('Phone call failed:', error);
                    setStatus('idle');
                    alert('Failed to call: ' + error.message);
                }
                return;
            }

            try {
                // 1. Fetch params from our local backend
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const response = await fetch('/api/create-web-call', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_phone: phoneNumber })
                });
                const data = await response.json();

                if (data.error) throw new Error(data.error);

                // 2. Start the call
                await retellWebClient.current.startCall({
                    accessToken: data.access_token,
                });

            } catch (error) {
                console.error('Connection failed:', error);
                setStatus('idle');
                alert('Failed to connect: ' + error.message);
            }
        } else {
            // Hangup
            if (callType === 'web' && retellWebClient.current) {
                retellWebClient.current.stopCall();
            }
            // For phone calls, we can't hang up out-of-band easily without another API endpoint, 
            // so we just reset UI for now.
            setStatus('idle');
            setDuration(0);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl transition-all duration-1000 ${status === 'active' ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`} />

            {/* Status Header */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                    <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-300">
                        {status === 'idle' && 'Ready to Connect'}
                        {status === 'connecting' && 'Establishing Connection...'}
                        {status === 'active' && 'Live Session'}
                    </span>
                </div>
                {status === 'active' && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Wifi size={16} className="text-green-500" />
                        <span>32ms latency</span>
                    </div>
                )}
            </div>

            {/* Main Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-12">

                {/* Avatar / Visualizer Circle */}
                <div className="relative">
                    <div className={`w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${status === 'active'
                        ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_50px_rgba(34,197,94,0.3)]'
                        : 'border-slate-700 bg-slate-800'
                        }`}>
                        {status === 'active' ? (
                            <div className="flex items-center gap-1 h-12">
                                {/* Simulated Audio Waveform */}
                                <div className="w-2 bg-green-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${volume[0]}px` }}></div>
                                <div className="w-2 bg-green-500 rounded-full animate-[bounce_1.2s_infinite]" style={{ height: `${volume[1]}px` }}></div>
                                <div className="w-2 bg-green-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: `${volume[2]}px` }}></div>
                                <div className="w-2 bg-green-500 rounded-full animate-[bounce_1.1s_infinite]" style={{ height: `${volume[3]}px` }}></div>
                                <div className="w-2 bg-green-500 rounded-full animate-[bounce_0.9s_infinite]" style={{ height: `${volume[4]}px` }}></div>
                            </div>
                        ) : status === 'connecting' ? (
                            <Loader size={48} className="text-slate-500 animate-spin" />
                        ) : (
                            <Activity size={48} className="text-slate-500" />
                        )}
                    </div>

                    {/* Ring pings */}
                    {status === 'connecting' && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping delay-150"></div>
                        </>
                    )}
                </div>

                {/* Counter */}
                <div className="text-4xl font-mono font-light tracking-wider text-slate-200">
                    {formatTime(duration)}
                </div>

                {/* Call Type Selector & Input */}
                {status === 'idle' && (
                    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setCallType('web')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${callType === 'web' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Web Call
                            </button>
                            <button
                                onClick={() => setCallType('phone')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${callType === 'phone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Phone Call
                            </button>
                        </div>

                        <input
                            type="tel"
                            placeholder={callType === 'web' ? "Enter your number (Optional)" : "+91 98765 43210"}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors text-center"
                        />
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <Volume2 size={24} />
                    </button>

                    <button
                        onClick={handleCallToggle}
                        disabled={status === 'connecting'}
                        className={`p-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl ${status === 'active'
                            ? 'bg-red-500 hover:bg-red-600'
                            : status === 'connecting'
                                ? 'bg-slate-600 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {status === 'idle' ? (
                            <Mic size={32} className="text-white" fill="currentColor" />
                        ) : status === 'connecting' ? (
                            <Loader size={32} className="text-white animate-spin" />
                        ) : (
                            <PhoneOff size={32} className="text-white" fill="currentColor" />
                        )}
                    </button>

                    <button className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <Activity size={24} />
                    </button>
                </div>

                {/* Instructions */}
                <div className="text-center max-w-sm">
                    <p className="text-slate-500 text-sm">
                        {status === 'idle'
                            ? "Click the microphone to start a live conversation with the AI sales agent."
                            : "Microphone active. Speak naturally to the agent."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgentInterface;
