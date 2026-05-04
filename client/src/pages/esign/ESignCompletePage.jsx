/**
 * ESignCompletePage — Cashfree VRS redirect target after Aadhaar OTP signing.
 *
 * Cashfree redirects to: /esign/complete?order_id=ESIGN-...
 * This page polls /api/esign/status/:orderId until it gets SIGNED / FAILED / EXPIRED.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, Download, FileText, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_POLLS = 24;      // 24 × 5s = 2 minutes
const POLL_INTERVAL = 5000;

export default function ESignCompletePage() {
    const [params] = useSearchParams();
    const orderId = params.get('order_id');
    const { token } = useAuth();

    const [status, setStatus] = useState('POLLING'); // POLLING | SIGNED | FAILED | EXPIRED | ERROR
    const [signedPdfUrl, setSignedPdfUrl] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const intervalRef = useRef(null);

    const poll = async () => {
        if (!orderId || !token) return;
        try {
            const res = await fetch(`${API}/api/esign/status/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data.success) {
                setStatus('ERROR');
                clearInterval(intervalRef.current);
                return;
            }
            if (data.status === 'SIGNED') {
                setStatus('SIGNED');
                setSignedPdfUrl(data.signedPdfUrl);
                clearInterval(intervalRef.current);
            } else if (data.status === 'FAILED') {
                setStatus('FAILED');
                clearInterval(intervalRef.current);
            } else if (data.status === 'EXPIRED') {
                setStatus('EXPIRED');
                clearInterval(intervalRef.current);
            }
        } catch {
            setStatus('ERROR');
            clearInterval(intervalRef.current);
        }
        setPollCount(c => {
            if (c + 1 >= MAX_POLLS) {
                setStatus('EXPIRED');
                clearInterval(intervalRef.current);
            }
            return c + 1;
        });
    };

    useEffect(() => {
        if (!orderId) { setStatus('ERROR'); return; }
        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [orderId, token]);

    return (
        <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">

                {/* Header badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[#333] bg-[#111] text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-4">
                        <Shield className="w-3 h-3" />
                        Cashfree VRS · Aadhaar e-Sign
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
                                Verifying Signature
                            </h1>
                            <p className="text-gray-400 text-sm mb-4">
                                Confirming your Aadhaar OTP e-sign with Cashfree VRS…
                            </p>
                            <div className="bg-[#0d0d0d] border border-[#222] rounded-[2px] px-4 py-3 flex items-center justify-between font-mono text-xs">
                                <span className="text-gray-500">Order ID</span>
                                <span className="text-[#26cece]">{orderId}</span>
                            </div>
                            <p className="text-gray-600 text-[10px] font-mono mt-4">
                                Checking every 5s · attempt {pollCount + 1}/{MAX_POLLS}
                            </p>
                        </>
                    )}

                    {/* SIGNED */}
                    {status === 'SIGNED' && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-[#26cece]/10 border border-[#26cece]/30 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-8 h-8 text-[#26cece]" />
                            </div>
                            <h1 className="text-2xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                Agreement Signed!
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                Your Aadhaar OTP e-signature has been applied and the document is legally valid.
                            </p>
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[2px] p-4 space-y-2 text-xs font-mono mb-6">
                                {[
                                    ['Order ID', orderId, 'text-[#26cece]'],
                                    ['Method', 'Aadhaar OTP via Cashfree VRS', 'text-white'],
                                    ['Status', 'SIGNED', 'text-green-400'],
                                    ['Timestamp', new Date().toLocaleString('en-IN'), 'text-white'],
                                ].map(([k, v, cls]) => (
                                    <div key={k} className="flex justify-between gap-4">
                                        <span className="text-gray-500">{k}</span>
                                        <span className={`${cls} text-right`}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            {signedPdfUrl && (
                                <a
                                    href={signedPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors mb-3 text-sm"
                                >
                                    <Download className="w-4 h-4" /> Download Signed PDF
                                </a>
                            )}
                            <Link
                                to="/esign-demo"
                                className="flex items-center justify-center gap-2 w-full border border-[#333] text-gray-300 font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:border-[#26cece] hover:text-[#26cece] transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" /> New Agreement
                            </Link>
                        </>
                    )}

                    {/* FAILED / EXPIRED / ERROR */}
                    {(status === 'FAILED' || status === 'EXPIRED' || status === 'ERROR') && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                                {status === 'EXPIRED'
                                    ? <Clock className="w-8 h-8 text-amber-400" />
                                    : <XCircle className="w-8 h-8 text-red-400" />}
                            </div>
                            <h1 className="text-xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                {status === 'EXPIRED' ? 'Session Expired' : 'Signing Failed'}
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                {status === 'EXPIRED'
                                    ? 'The signing session timed out. Please start a new agreement.'
                                    : status === 'ERROR'
                                        ? 'Could not verify signing status. Check your internet connection and try again.'
                                        : 'The Aadhaar OTP verification was unsuccessful. Please try again.'}
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
                    e-Sign powered by Cashfree VRS · Aadhaar OTP · Legally valid under IT Act 2000
                </p>
            </div>
        </div>
    );
}
