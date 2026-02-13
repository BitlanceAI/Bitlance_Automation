import React from 'react';
import { UserX, Scissors, Clock, PhoneOff, TrendingDown } from 'lucide-react';

const ProblemSection = () => {
    const problems = [
        {
            icon: <UserX size={24} />,
            text: "Cold leads that don’t convert"
        },
        {
            icon: <Scissors size={24} />,
            text: "Buyers cutting you out of deals"
        },
        {
            icon: <Clock size={24} />,
            text: "Endless admin work & paperwork"
        },
        {
            icon: <PhoneOff size={24} />,
            text: "Manual follow-ups wasting your day"
        },
        {
            icon: <TrendingDown size={24} />,
            text: "No consistent inbound lead flow"
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Why Most Agents Are <span className="text-red-500">Falling Behind</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        The old way of relying on referrals and manual outreach is broken.
                        Top producers are using AI to scale, while everyone else struggles to keep up.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {problems.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.text}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Stop wasting time on activities that don't generate revenue.
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* Empty card to balance grid or call to action */}
                    <div className="flex items-center justify-center p-6 rounded-2xl bg-re-navy text-white text-center">
                        <div>
                            <p className="text-lg font-bold mb-2">Ready to fix this?</p>
                            <div className="text-re-blue font-semibold">See the solution &rarr;</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
