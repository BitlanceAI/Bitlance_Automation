import React, { useState, useEffect } from 'react';
import { XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DisqualifiedView = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="p-8 md:p-16 text-center">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Not Eligible Yet
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
                Thank you for your interest! Currently, our AI Growth Audit is tailored for scaling B2B businesses with a minimum marketing spend of ₹1L/month and requires decision-maker participation to implement the strategies effectively.
            </p>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-6 text-left border border-violet-100 dark:border-violet-800/50 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2">
                    Keep In Touch
                </h3>
                <p className="text-sm text-violet-600 dark:text-violet-400">
                    We frequently release free resources and guides on scaling businesses with automation. We'll keep you on our list for future updates when your scale matches our current AI solutions.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    Redirecting to home in <span className="font-bold text-indigo-500">{countdown}s</span>...
                </div>

                <div className="text-center text-sm text-slate-500">
                    <a href="/" className="inline-flex items-center hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home Now
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DisqualifiedView;
