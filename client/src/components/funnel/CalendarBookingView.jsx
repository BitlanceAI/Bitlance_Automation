import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const CalendarBookingView = ({ leadData, onSuccess }) => {
    const [bookingComplete, setBookingComplete] = useState(false);
    const [loading, setLoading] = useState(false);

    // Replace this with your actual Calendly URL
    const CALENDLY_URL = "https://calendly.com/bitlanceai/task-regarding";

    useEffect(() => {
        // Listen for messages from the Calendly iframe to know when a booking is completed
        const handleCalendlyEvent = async (e) => {
            if (e.data.event && e.data.event === 'calendly.event_scheduled') {
                console.log("Calendly booking completed:", e.data.payload);

                // We don't have the exact selected time/date from the Calendly widget payload easily
                // depending on the Calendly plan/API, but we know it was booked.
                // We'll set a default next-day time for the nurture sequence trigger 
                // or just trigger the immediate emails.
                const simulatedDate = new Date();
                simulatedDate.setDate(simulatedDate.getDate() + 1);

                setLoading(true);
                try {
                    // Still ping our backend to trigger the Nurture sequence
                    const payload = {
                        leadData: { ...leadData },
                        booking: {
                            date: simulatedDate.toISOString(),
                            time: "10:00 AM", // Fallback, real time is in Calendly
                            source: 'calendly'
                        }
                    };

                    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads/book-audit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    setBookingComplete(true);
                    // Tell parent container we succeeded after a short delay
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);

                } catch (err) {
                    console.error('Error triggering nurture sequence:', err);
                    // Even if our backend fails, Calendly succeeded. Let them proceed.
                    setBookingComplete(true);
                    setTimeout(() => onSuccess(), 2000);
                } finally {
                    setLoading(false);
                }
            }
        };

        window.addEventListener('message', handleCalendlyEvent);
        return () => window.removeEventListener('message', handleCalendlyEvent);
    }, [leadData, onSuccess]);

    if (bookingComplete) {
        return (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Processing...</h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Setting up your AI Growth Audit container...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[750px] bg-white dark:bg-slate-900">
            {/* Header info */}
            <div className="p-6 md:px-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shrink-0 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Limited 5 AI Audits Per Week
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-1">Pick a Time for Your Audit</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Select a slot below. Information you provided previously will be used to prep for our call.
                </p>
            </div>

            {/* Calendly Embed */}
            <div className="flex-1 w-full relative">
                {/* 
                   Pass lead data into Calendly URL params to prefill the form if possible.
                   Calendly accepts: name, email, a1 (custom answer 1), etc.
                 */}
                <iframe
                    src={`${CALENDLY_URL}?name=${encodeURIComponent(leadData?.name || '')}&email=${encodeURIComponent(leadData?.email || '')}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Calendly Scheduling Page"
                    className="absolute inset-0"
                ></iframe>
            </div>
        </div>
    );
};

export default CalendarBookingView;
