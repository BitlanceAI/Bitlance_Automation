import React from 'react';
import { CalendarClock } from 'lucide-react';

/**
 * Step 3: Schedule
 * Select date and time for the post
 */
const StepSchedule = ({ scheduledTime, onScheduleChange }) => {
    // Get minimum datetime (now + 2 minutes)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 2);
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-500" /> Schedule Your Post
            </h4>

            <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date & Time
                </label>
                <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => onScheduleChange(e.target.value)}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Posts must be scheduled at least 2 minutes in advance. <br />
                    <span className="font-semibold text-blue-600">Times are in India Standard Time (IST).</span>
                </p>
            </div>

            {/* Quick Schedule Options */}
            <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Schedule (IST)
                </p>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Tomorrow 9 AM', hours: 24, setHour: 9 },
                        { label: 'Tomorrow 12 PM', hours: 24, setHour: 12 },
                        { label: 'Tomorrow 6 PM', hours: 24, setHour: 18 },
                        { label: 'In 2 Days', hours: 48, setHour: 10 },
                        { label: 'Next Week', hours: 168, setHour: 10 }
                    ].map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + Math.floor(option.hours / 24));
                                date.setHours(option.setHour, 0, 0, 0);
                                // The input expects local time format but we want to ensure user thinks in IST
                                // For now, relying on browser's local time if user is in India is best approach without complex lib
                                // We just format it for the input
                                const offset = date.getTimezoneOffset() * 60000;
                                const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                                onScheduleChange(localISOTime);
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepSchedule;
