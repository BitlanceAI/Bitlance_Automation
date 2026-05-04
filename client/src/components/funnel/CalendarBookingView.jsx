import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import API_BASE_URL from '../../config.js';

const CALENDLY_URL = "https://calendly.com/bitlanceai/task-regarding";

const CalendarBookingView = ({ leadData, onSuccess }) => {
    const [bookingComplete, setBookingComplete] = useState(false);
    const [loading, setLoading] = useState(false);

    useCalendlyEventListener({
        onEventScheduled: async (e) => {
            console.log('📅 [CalendarBookingView] calendly.event_scheduled fired!');
            console.log('📅 [CalendarBookingView] Raw payload:', e.data.payload);

            const eventUri = e.data?.payload?.event?.uri || null;
            const inviteeUri = e.data?.payload?.invitee?.uri || null;
            const email = leadData?.email || null;

            console.log('[CalendarBookingView] eventUri:', eventUri);
            console.log('[CalendarBookingView] inviteeUri:', inviteeUri);
            console.log('[CalendarBookingView] leadData.email:', email);
            console.log('[CalendarBookingView] leadData.id:', leadData?.id);

            setLoading(true);

            // ── 1. confirm-booking — save booked status + booking times ──
            if (email) {
                try {
                    console.log('[CalendarBookingView] Calling /api/leads/confirm-booking...');
                    const res = await fetch(`${API_BASE_URL}/api/leads/confirm-booking`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, eventUri })
                    });
                    const data = await res.json();
                    console.log('[CalendarBookingView] confirm-booking response:', data);
                } catch (err) {
                    console.error('[CalendarBookingView] confirm-booking error:', err);
                }
            } else {
                console.warn('[CalendarBookingView] ⚠️ No email in leadData, skipping confirm-booking');
            }

            // ── 2. book-audit — trigger WhatsApp + email nurture ──
            try {
                console.log('[CalendarBookingView] Calling /api/leads/book-audit...');
                const res = await fetch(`${API_BASE_URL}/api/leads/book-audit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        leadData: { ...leadData },
                        booking: {
                            date: new Date().toISOString(),
                            time: '10:00 AM',
                            source: 'calendly',
                        }
                    })
                });
                const data = await res.json();
                console.log('[CalendarBookingView] book-audit response:', data);
            } catch (err) {
                console.error('[CalendarBookingView] book-audit error (non-fatal):', err);
            }

            // Meta Pixel
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'CompleteRegistration');
            }

            setLoading(false);
            setBookingComplete(true);
            setTimeout(() => { onSuccess(); }, 2000);
        },
    });

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
            {/* Header */}
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

            {/* Calendly InlineWidget (official react-calendly component) */}
            <div className="flex-1 w-full overflow-hidden bg-white">
                <InlineWidget
                    url={`${CALENDLY_URL}?name=${encodeURIComponent(leadData?.name || '')}&email=${encodeURIComponent(leadData?.email || '')}`}
                    styles={{ height: '100%', width: '100%', minHeight: '650px' }}
                />
            </div>
        </div>
    );
};

export default CalendarBookingView;
