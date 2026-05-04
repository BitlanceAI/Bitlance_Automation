/**
 * PaymentCompletePage — Cashfree PG redirect target after payment.
 *
 * Server bounces: /payment/complete?order_id=PAY-...&verification_id=DL-...
 * Polls /api/payment/status/:orderId until PAID / FAILED / EXPIRED.
 * On PAID → generate agreement PDF + allow download.
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, Download, FileText, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_POLLS = 24;
const POLL_INTERVAL = 5000;

function generateAgreementPDF(fields) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = margin;

    // Header bar
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, W, 70, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 206, 206);
    doc.text('AUTOMATION-BITLANCE', margin, 38);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('automation-bitlance.com  |  Verified via DigiLocker · Paid via Cashfree', margin, 54);

    doc.setFillColor(26, 158, 158);
    doc.roundedRect(W - 120, 18, 90, 22, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PAID & VERIFIED', W - 113, 33);

    y = 100;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('SERVICE AGREEMENT', margin, y);
    y += 30;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
    y += 30;

    // Identity + Payment section
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, W - margin * 2, 110, 'F');
    y += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 206, 206);
    doc.text('CLIENT DETAILS', margin + 10, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    [
        ['Name', fields.name || '—'],
        ['Email', fields.email || '—'],
        ['Phone', fields.phone || '—'],
        ['Identity', 'DigiLocker · Aadhaar Authenticated ✓'],
        ['Payment', 'Cashfree PG · PAID ✓'],
    ].forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${k}:`, margin + 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(v, margin + 90, y);
        y += 14;
    });
    y += 20;

    // Terms
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('TERMS & CONDITIONS', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    [
        '1. The client agrees to subscribe to the SEO AI Agent service at Rs. 4,999/month.',
        '2. The subscription auto-renews monthly unless cancelled with 15 days written notice.',
        '3. Automation-Bitlance retains rights to all AI-generated content strategies.',
        '4. The client confirms their identity has been verified via Aadhaar through DigiLocker.',
        '5. Payment has been successfully processed via Cashfree Payment Gateway.',
        '6. This agreement is legally binding under the Information Technology Act, 2000.',
    ].forEach(t => {
        const lines = doc.splitTextToSize(t, W - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 13 + 4;
    });

    // Signature line
    y += 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, W / 2 - 20, y);
    y += 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Client (Aadhaar Verified)', margin, y);
    doc.text(fields.name || '', margin, y + 12);

    // Footer
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageH - 40, W, 40, 'F');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Verified by DigiLocker · Paid via Cashfree PG · Valid under IT Act 2000', margin, pageH - 18);

    return doc;
}

export default function PaymentCompletePage() {
    const [params] = useSearchParams();
    const orderId = params.get('order_id');

    const [status, setStatus] = useState('POLLING');
    const [pollCount, setPollCount] = useState(0);
    const intervalRef = useRef(null);

    const savedMeta = JSON.parse(sessionStorage.getItem('payment_meta') || '{}');

    const poll = async () => {
        if (!orderId) return;
        try {
            const res = await fetch(`${API}/api/payment/status/${orderId}`);
            const data = await res.json();
            if (!data.success) { setStatus('ERROR'); clearInterval(intervalRef.current); return; }

            const s = (data.status || '').toUpperCase();
            if (s === 'PAID') { setStatus('PAID'); clearInterval(intervalRef.current); }
            else if (s === 'FAILED' || s === 'CANCELLED') { setStatus('FAILED'); clearInterval(intervalRef.current); }
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
        if (!orderId) { setStatus('ERROR'); return; }
        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [orderId]);

    const handleDownload = () => {
        const pdf = generateAgreementPDF(savedMeta);
        pdf.save(`agreement-${orderId}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[#333] bg-[#111] text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-4">
                        <Shield className="w-3 h-3" />
                        Cashfree PG · Payment Verification
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
                                Confirming Payment
                            </h1>
                            <p className="text-gray-400 text-sm mb-4">
                                Verifying your payment with Cashfree…
                            </p>
                            <div className="bg-[#0d0d0d] border border-[#222] rounded-[2px] px-4 py-3 flex items-center justify-between font-mono text-xs">
                                <span className="text-gray-500">Order ID</span>
                                <span className="text-[#26cece] truncate ml-2">{orderId}</span>
                            </div>
                            <p className="text-gray-600 text-[10px] font-mono mt-4">
                                Checking every 5s · attempt {pollCount + 1}/{MAX_POLLS}
                            </p>
                        </>
                    )}

                    {/* PAID */}
                    {status === 'PAID' && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-[#26cece]/10 border border-[#26cece]/30 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-8 h-8 text-[#26cece]" />
                            </div>
                            <h1 className="text-2xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                Payment Successful!
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                Your subscription is active. Download your signed agreement below.
                            </p>
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[2px] p-4 space-y-2 text-xs font-mono mb-6 text-left">
                                {[
                                    ['Order ID', orderId],
                                    ['Name', savedMeta.name || '—'],
                                    ['Identity', 'Aadhaar ✓'],
                                    ['Payment', 'PAID ✓'],
                                    ['Time', new Date().toLocaleString('en-IN')],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-4">
                                        <span className="text-gray-500">{k}</span>
                                        <span className={['Identity', 'Payment'].includes(k) ? 'text-green-400' : k === 'Order ID' ? 'text-[#26cece]' : 'text-white'}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleDownload}
                                className="flex items-center justify-center gap-2 w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors mb-3 text-sm"
                            >
                                <Download className="w-4 h-4" /> Download Agreement PDF
                            </button>
                            <Link
                                to="/esign-demo"
                                className="flex items-center justify-center gap-2 w-full border border-[#333] text-gray-300 font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:border-[#26cece] hover:text-[#26cece] transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" /> New Agreement
                            </Link>
                        </>
                    )}

                    {/* FAILED / EXPIRED / ERROR */}
                    {(['FAILED', 'EXPIRED', 'ERROR'].includes(status)) && (
                        <>
                            <div className="w-16 h-16 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                                {status === 'EXPIRED'
                                    ? <Clock className="w-8 h-8 text-amber-400" />
                                    : <XCircle className="w-8 h-8 text-red-400" />}
                            </div>
                            <h1 className="text-xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight mb-2">
                                {status === 'EXPIRED' ? 'Payment Expired' : 'Payment Failed'}
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                {status === 'EXPIRED'
                                    ? 'The payment session expired. Please try again.'
                                    : 'Your payment could not be processed. No amount was charged.'}
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
                    Payment secured by Cashfree PG · Identity by DigiLocker · IT Act 2000
                </p>
            </div>
        </div>
    );
}
