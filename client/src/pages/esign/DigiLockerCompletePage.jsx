/**
 * DigiLockerCompletePage — redirect target after Cashfree DigiLocker consent.
 *
 * Flow: poll status → AUTHENTICATED → Pay Now (Cashfree PG) → /payment/complete
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, FileText, Shield, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_POLLS = 24;
const POLL_INTERVAL = 5000;

async function loadCashfreeSDK() {
    if (window.Cashfree) return;
    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export default function DigiLockerCompletePage() {
    const [params] = useSearchParams();
    const orderId = params.get('order_id');
    const bypass = params.get('bypass') === '1';
    const { token } = useAuth();

    const [status, setStatus] = useState(bypass ? 'AUTHENTICATED' : 'POLLING');
    const [pollCount, setPollCount] = useState(0);
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');
    const intervalRef = useRef(null);

    const savedFields = JSON.parse(sessionStorage.getItem('digilocker_fields') || '{}');
    const verificationId = orderId || savedFields.verificationId;
    const planAmount = savedFields.planAmount || 4999;
    const planName = savedFields.planName || 'Growth';

    const poll = async () => {
        if (!verificationId) return;
        try {
            const res = await fetch(`${API}/api/digilocker/status/${verificationId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!data.success) { setStatus('ERROR'); clearInterval(intervalRef.current); return; }

            const s = (data.status || '').toUpperCase();
            if (s === 'AUTHENTICATED') { setStatus('AUTHENTICATED'); clearInterval(intervalRef.current); }
            else if (s === 'CONSENT_DENIED') { setStatus('CONSENT_DENIED'); clearInterval(intervalRef.current); }
            else if (s === 'EXPIRED') { setStatus('EXPIRED'); clearInterval(intervalRef.current); }
        } catch {
            setStatus('ERROR'); clearInterval(intervalRef.current);
        }
        setPollCount(c => {
            if (c + 1 >= MAX_POLLS) { setStatus('EXPIRED'); clearInterval(intervalRef.current); }
            return c + 1;
        });
    };

    useEffect(() => {
        // DEV BYPASS — skip polling when bypass=1 in URL
        if (bypass) return;
        if (!verificationId) { setStatus('ERROR'); return; }
        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [verificationId, token]);

    const handlePayment = async () => {
        setPayLoading(true);
        setPayError('');
        try {
            // 1. Create Cashfree PG order
            const res = await fetch(`${API}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    verificationId,
                    name: savedFields.name,
                    email: savedFields.email,
                    phone: savedFields.phone,
                    amount: planAmount,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to create payment order');

            // Store for PaymentCompletePage
            sessionStorage.setItem('payment_meta', JSON.stringify({
                ...savedFields,
                verificationId,
                payOrderId: data.orderId,
            }));

            // 2. Load Cashfree JS SDK + open checkout
            await loadCashfreeSDK();
            const cashfree = window.Cashfree({ mode: 'production' });
            cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                returnUrl: `${window.location.origin}/payment/complete?order_id=${data.orderId}&verification_id=${verificationId}`,
            });
        } catch (err) {
            setPayError(err.message || 'Payment could not be initiated. Please try again.');
            setPayLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[#333] bg-[#111] text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-4">
                        <Shield className="w-3 h-3" />
                        DigiLocker · Aadhaar Verification
                    </div>
                </div>

                <div className="bg-[#111] border border-[#1E1E1E] rounded-[2px] p-8 text-center">

                    {/* POLLING */}
                    {status === 'POLLING' && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-[#26cece]/10 border border-[#26cece]/30 flex items-center justify-center mx-auto mb-5">
                                <Loader2 className="w-8 h-8 text-[#26cece] animate-spin" />
                            </div>
                            <h1 className="text-xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                Waiting for Verification
                            </h1>
                            <p className="text-gray-400 text-sm mb-4">
                                Complete the DigiLocker authentication in the redirected window…
                            </p>
                            <div className="bg-[#0d0d0d] border border-[#222] rounded-[2px] px-4 py-3 flex items-center justify-between font-mono text-xs">
                                <span className="text-gray-500">Verification ID</span>
                                <span className="text-[#26cece] truncate ml-2">{verificationId}</span>
                            </div>
                            <p className="text-gray-600 text-[10px] font-mono mt-4">
                                Checking every 5s · attempt {pollCount + 1}/{MAX_POLLS}
                            </p>
                        </>
                    )}

                    {/* AUTHENTICATED → Pay */}
                    {status === 'AUTHENTICATED' && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-[#26cece]/10 border border-[#26cece]/30 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-8 h-8 text-[#26cece]" />
                            </div>
                            <h1 className="text-2xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                Identity Verified!
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                Aadhaar verified via DigiLocker. Complete payment to activate your subscription.
                            </p>

                            {/* Summary */}
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[2px] p-4 space-y-2 text-xs font-mono mb-6 text-left">
                                {[
                                    ['Name', savedFields.name || '—'],
                                    ['Identity', 'DigiLocker · Aadhaar ✓'],
                                    ['Plan', `SEO AI Agent — ${planName}`],
                                    ['Amount', `₹${planAmount.toLocaleString('en-IN')}`],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-4">
                                        <span className="text-gray-500">{k}</span>
                                        <span className={k === 'Amount' ? 'text-[#26cece] font-bold' : k === 'Identity' ? 'text-green-400' : 'text-white'}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={payLoading}
                                className="flex items-center justify-center gap-2 w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors mb-3 text-sm disabled:opacity-60"
                            >
                                {payLoading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing payment…</>
                                    : <><CreditCard className="w-4 h-4" /> Pay ₹{planAmount.toLocaleString('en-IN')}</>}
                            </button>

                            {payError && (
                                <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-[2px] px-4 py-3 flex items-start gap-2 text-red-400 text-xs text-left">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    {payError}
                                </div>
                            )}

                            <Link
                                to="/esign-demo"
                                className="flex items-center justify-center gap-2 w-full border border-[#333] text-gray-400 font-mono text-xs uppercase tracking-widest py-2.5 rounded-[2px] hover:border-[#444] transition-colors mt-3"
                            >
                                <FileText className="w-3.5 h-3.5" /> Start Over
                            </Link>
                        </>
                    )}

                    {/* CONSENT_DENIED / EXPIRED / ERROR */}
                    {(['CONSENT_DENIED', 'EXPIRED', 'ERROR'].includes(status)) && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                                {status === 'EXPIRED'
                                    ? <Clock className="w-8 h-8 text-amber-400" />
                                    : <XCircle className="w-8 h-8 text-red-400" />}
                            </div>
                            <h1 className="text-xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                {status === 'EXPIRED' ? 'Session Expired'
                                    : status === 'CONSENT_DENIED' ? 'Consent Denied'
                                    : 'Verification Failed'}
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                {status === 'EXPIRED'
                                    ? 'The DigiLocker session timed out. Please start again.'
                                    : status === 'CONSENT_DENIED'
                                        ? 'You denied consent on DigiLocker. Please try again to proceed.'
                                        : 'Could not verify status. Check your connection and try again.'}
                            </p>
                            <Link
                                to="/esign-demo"
                                className="flex items-center justify-center gap-2 w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors text-sm"
                            >
                                Try Again
                            </Link>
                        </>
                    )}
                </div>

                <p className="text-center text-gray-600 text-[10px] font-mono mt-6">
                    Identity verified by DigiLocker · Payment by Cashfree PG · IT Act 2000
                </p>
            </div>
        </div>
    );
}
