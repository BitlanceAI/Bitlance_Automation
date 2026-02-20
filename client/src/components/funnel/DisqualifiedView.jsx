import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';

const DisqualifiedView = () => {
    return (
        <div className="p-8 md:p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Not Eligible Yet
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
                Thank you for your interest! Currently, our AI Growth Audit is tailored for real estate builders with a minimum marketing spend of ₹1L/month and requires decision-maker participation to implement the strategies effectively.
            </p>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-6 text-left border border-violet-100 dark:border-violet-800/50 max-w-lg mx-auto">
                <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2">
                    Keep In Touch
                </h3>
                <p className="text-sm text-violet-600 dark:text-violet-400">
                    We frequently release free resources and guides on scaling real estate businesses. We'll keep you on our list for future updates when your scale matches our current AI solutions.
                </p>
            </div>

            <div className="mt-12 text-center text-sm text-slate-500">
                <a href="/" className="inline-flex items-center hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </a>
            </div>
        </div>
    );
};

export default DisqualifiedView;
