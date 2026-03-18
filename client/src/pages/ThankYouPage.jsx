import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowLeft } from 'lucide-react';

const REDIRECT_DELAY = 10; // seconds

const ThankYouPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(REDIRECT_DELAY);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;

        if (countdown <= 0) {
            navigate('/');
            return;
        }

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, paused, navigate]);

    const handleBookDemo = () => {
        setPaused(true);
        navigate('/apply/audit');
    };

    const handleGoHome = () => {
        setPaused(true);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white px-4">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl">

                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>

                <h1 className="text-3xl font-bold mb-3 tracking-tight">You're All Set! 🎉</h1>
                <p className="text-neutral-400 mb-8 leading-relaxed">
                    The ultimate automation guide has been sent to your email. Check your inbox (and spam folder) in a few minutes.
                </p>

                {/* Book Demo CTA */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Want to skip the reading?</h3>
                    <p className="text-sm text-neutral-300 mb-4">
                        See exactly how we can automate your business in a free personalized strategy session.
                    </p>
                    <button
                        onClick={handleBookDemo}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Book Your Free Demo</span>
                    </button>
                </div>

                {/* Countdown + home link */}
                <div className="space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="flex items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors text-sm mx-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Return to homepage
                    </button>

                    {!paused && (
                        <p className="text-xs text-neutral-700">
                            Redirecting to homepage in{' '}
                            <span className={`font-bold tabular-nums ${countdown <= 3 ? 'text-amber-500' : 'text-neutral-500'}`}>
                                {countdown}s
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {!paused && (
                <div className="w-full max-w-md mt-4 bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / REDIRECT_DELAY) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default ThankYouPage;
