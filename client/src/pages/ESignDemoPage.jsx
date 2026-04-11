import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  FileText, CheckCircle, ArrowRight,
  User, Mail, Phone, Shield, Zap, AlertCircle, Loader2, Download, ExternalLink, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AGENT = {
  name: 'SEO AI Agent',
  price: 'Rs. 4,999 / month',
  description: 'Automated SEO content generation & publishing pipeline.',
};

// ─── PDF builder ────────────────────────────────────────────────────────────────
function buildPDF(fields = {}, signed = false) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = W - margin * 2;
  let y = margin;

  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, W, 70, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(38, 206, 206);
  doc.text('AUTOMATION-BITLANCE', margin, 38);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('automation-bitlance.com  |  Secured by Cashfree VRS e-Sign', margin, 54);

  doc.setFillColor(26, 158, 158);
  doc.roundedRect(W - 120, 18, 90, 22, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(signed ? 'SIGNED' : 'PENDING SIGN', W - 113, 33);

  y = 95;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('SERVICE AGREEMENT', margin, y);
  y += 8;
  doc.setDrawColor(38, 206, 206);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + 200, y);
  y += 22;

  const infoRows = [
    ['Agreement No.', `AB-${Date.now().toString(36).toUpperCase().slice(-6)}`],
    ['Date', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Service', AGENT.name],
    ['Price', AGENT.price],
  ];
  doc.setFontSize(9);
  doc.setLineWidth(0.5);
  infoRows.forEach(([k, v], i) => {
    const rowY = y + i * 22;
    if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, rowY - 12, contentW, 20, 'F'); }
    doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80); doc.text(k, margin + 6, rowY);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20); doc.text(v, margin + 140, rowY);
  });
  y += infoRows.length * 22 + 20;

  const section = (title) => {
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 15, 15);
    doc.setFillColor(240, 253, 253); doc.rect(margin, y - 12, contentW, 18, 'F');
    doc.setDrawColor(38, 206, 206); doc.setLineWidth(3); doc.line(margin, y - 12, margin, y + 6);
    doc.text(title, margin + 10, y); doc.setLineWidth(0.5); y += 22;
  };
  const para = (text) => {
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentW - 10);
    doc.text(lines, margin + 6, y); y += lines.length * 13 + 6;
  };
  const field = (label, value, isPlaceholder = false) => {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    doc.text(`${label}:`, margin + 6, y);
    const valX = margin + 130;
    if (isPlaceholder && !signed) {
      doc.setFillColor(254, 243, 199); doc.roundedRect(valX - 3, y - 10, 180, 14, 2, 2, 'F');
      doc.setDrawColor(217, 119, 6); doc.setLineWidth(0.5); doc.roundedRect(valX - 3, y - 10, 180, 14, 2, 2, 'S');
      doc.setFont('helvetica', 'italic'); doc.setTextColor(180, 83, 9); doc.text(value, valX, y);
    } else if (signed && isPlaceholder) {
      doc.setFillColor(220, 252, 231); doc.roundedRect(valX - 3, y - 10, 200, 14, 2, 2, 'F');
      doc.setDrawColor(22, 163, 74); doc.setLineWidth(0.5); doc.roundedRect(valX - 3, y - 10, 200, 14, 2, 2, 'S');
      doc.setFont('helvetica', 'normal'); doc.setTextColor(21, 128, 61); doc.text(value, valX, y);
    } else {
      doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20); doc.text(value, valX, y);
    }
    y += 18;
  };

  section('1. CLIENT DETAILS');
  field('Full Name', fields.name || '{{CLIENT_NAME}}', !fields.name);
  field('Email Address', fields.email || '{{CLIENT_EMAIL}}', !fields.email);
  field('Phone Number', fields.phone || '{{CLIENT_PHONE}}', !fields.phone);
  y += 6;

  section('2. SCOPE OF SERVICE');
  para(`Automation-Bitlance agrees to provide access to the "${AGENT.name}" — ${AGENT.description} The service includes onboarding, technical support via email, and platform access for the duration of the active subscription.`);

  section('3. PAYMENT TERMS');
  para(`The Client agrees to pay ${AGENT.price} billed on the subscription start date. Payments are processed securely via Cashfree Payments. All amounts are inclusive of applicable GST. Subscriptions auto-renew unless cancelled 7 days prior to billing.`);

  section('4. CONFIDENTIALITY');
  para(`Both parties agree to keep confidential any proprietary information shared during the term of this agreement. The Client's data is processed in accordance with Automation-Bitlance's Privacy Policy available at automation-bitlance.com/privacy.`);

  section('5. ELECTRONIC SIGNATURE');
  para('By signing this document the Client confirms acceptance of all terms above.');
  y += 6;

  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5);
  doc.rect(margin, y, contentW / 2 - 10, 60);
  doc.rect(margin + contentW / 2 + 10, y, contentW / 2 - 10, 60);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
  doc.text('CLIENT SIGNATURE', margin + 8, y + 14);

  if (signed && fields.name) {
    doc.setFillColor(220, 252, 231); doc.rect(margin + 1, y + 1, contentW / 2 - 12, 58, 'F');
    doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(16); doc.setTextColor(21, 128, 61);
    doc.text(fields.name, margin + 10, y + 38);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
    doc.text(`Signed via Cashfree VRS  •  ${new Date().toLocaleString('en-IN')}`, margin + 8, y + 52);
  } else {
    doc.setFillColor(254, 243, 199); doc.rect(margin + 1, y + 1, contentW / 2 - 12, 58, 'F');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(180, 83, 9);
    doc.text('Awaiting Signature', margin + 10, y + 38);
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
  doc.text('DATE OF SIGNING', margin + contentW / 2 + 18, y + 14);
  if (signed) {
    doc.setFillColor(220, 252, 231); doc.rect(margin + contentW / 2 + 11, y + 1, contentW / 2 - 12, 58, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(21, 128, 61);
    doc.text(new Date().toLocaleDateString('en-IN'), margin + contentW / 2 + 18, y + 38);
  } else {
    doc.setFillColor(254, 243, 199); doc.rect(margin + contentW / 2 + 11, y + 1, contentW / 2 - 12, 58, 'F');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(180, 83, 9);
    doc.text('Awaiting Date', margin + contentW / 2 + 18, y + 38);
  }
  y += 80;

  doc.setFillColor(15, 15, 15); doc.rect(0, pageH - 36, W, 36, 'F');
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text('Automation-Bitlance  |  automation-bitlance.com', margin, pageH - 17);
  doc.text('e-Sign secured by Cashfree VRS  |  Confidential', W - margin, pageH - 17, { align: 'right' });

  return doc;
}

// ─── Step bar ───────────────────────────────────────────────────────────────────
const steps = ['Your Details', 'Review Agreement', 'Sign'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-[2px] flex items-center justify-center text-xs font-bold font-mono transition-colors
            ${i < current ? 'bg-[#26cece] text-[#070707]' :
              i === current ? 'bg-[#26cece]/20 border border-[#26cece] text-[#26cece]' :
                'bg-[#111] border border-[#222] text-gray-500'}`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-[10px] mt-1 font-mono uppercase tracking-widest whitespace-nowrap
            ${i === current ? 'text-[#26cece]' : i < current ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-px mx-1 mb-5 transition-colors ${i < current ? 'bg-[#26cece]' : 'bg-[#222]'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── PDF Viewer ──────────────────────────────────────────────────────────────────
const PDFViewer = ({ fields, signed }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const doc = buildPDF(fields, signed);
    const blob = doc.output('blob');
    const objUrl = URL.createObjectURL(blob);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [fields, signed]);

  if (!url) return (
    <div className="h-[480px] bg-[#0d0d0d] border border-[#222] rounded-[2px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#26cece] animate-spin" />
    </div>
  );
  return <iframe src={url} className="w-full h-[480px] rounded-[2px] border border-[#222]" title="Service Agreement" />;
};

// ─── Main ────────────────────────────────────────────────────────────────────────
const ESignPage = () => {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [signStatus, setSignStatus] = useState('idle');
  const [signError, setSignError] = useState('');

  const validate = () => {
    const e = {};
    if (!fields.name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Valid email required';
    if (!/^\d{10}$/.test(fields.phone)) e.phone = '10-digit phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    setStep(s => s + 1);
  };

  const handleSign = async () => {
    setLoading(true);
    setSignStatus('pending');
    setSignError('');
    try {
      const res = await fetch(`${API}/api/digilocker/create-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ document_requested: ['AADHAAR'], user_flow: 'signup' }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create DigiLocker session');

      // Store fields so DigiLockerCompletePage can generate the PDF
      sessionStorage.setItem('digilocker_fields', JSON.stringify({
        ...fields,
        verificationId: data.verification_id,
      }));

      window.location.href = data.consentUrl;
    } catch (err) {
      setSignStatus('error');
      setSignError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white px-4 pt-28 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] border border-[#333] bg-[#111] text-[#26cece] font-mono text-[10px] uppercase tracking-widest mb-4">
            <Shield className="w-3 h-3" />
            Secured by Cashfree VRS
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight">
            Sign Your <span className="text-[#26cece]">Service Agreement</span>
          </h1>
          <p className="text-gray-400 mt-3 text-sm max-w-lg mx-auto">
            Review and sign your service agreement digitally. Legally valid under the IT Act 2000.
          </p>
        </div>

        {/* Agent card */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-[2px] p-5 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-[2px] bg-[#26cece]/10 border border-[#26cece]/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#26cece]" />
          </div>
          <div className="flex-1">
            <p className="font-bold font-['Space_Grotesk'] text-white">{AGENT.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{AGENT.description}</p>
          </div>
          <span className="text-[#26cece] font-mono font-bold text-sm whitespace-nowrap">{AGENT.price}</span>
        </div>

        <StepBar current={step} />

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-[2px] p-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-5">Your Details</h2>
            {[
              { key: 'name', label: 'Full Name', icon: User, placeholder: 'Rahul Sharma', type: 'text' },
              { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'rahul@example.com', type: 'email' },
              { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '9876543210', type: 'tel' },
            ].map(({ key, label, icon: Icon, placeholder, type }) => (
              <div key={key} className="mb-4">
                <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={type}
                    value={fields[key]}
                    onChange={e => setFields({ ...fields, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={`w-full bg-[#0d0d0d] border ${errors[key] ? 'border-red-500' : 'border-[#222]'} rounded-[2px] pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#26cece] transition-colors`}
                  />
                </div>
                {errors[key] && (
                  <p className="text-red-400 text-[11px] mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors[key]}
                  </p>
                )}
              </div>
            ))}
            <button
              onClick={handleNext}
              className="mt-2 w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Review Agreement <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1 — Review PDF */}
        {step === 1 && (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-[2px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#26cece]" />
                <h2 className="text-lg font-bold font-['Space_Grotesk'] uppercase tracking-tight">Service Agreement</h2>
              </div>
              <button
                onClick={() => { const d = buildPDF(fields, false); d.save('agreement-draft.pdf'); }}
                className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-[#26cece] transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Save PDF
              </button>
            </div>

            <PDFViewer fields={fields} signed={false} />

            <p className="text-[11px] text-gray-500 font-mono mt-3 mb-5 flex items-start gap-1.5">
              <Shield className="w-3 h-3 text-[#26cece] mt-0.5 flex-shrink-0" />
              Please review all terms carefully before proceeding to sign.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-[#333] text-gray-300 font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:border-[#26cece] hover:text-[#26cece] transition-colors text-sm">
                Back
              </button>
              <button onClick={handleNext} className="flex-1 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors flex items-center justify-center gap-2 text-sm">
                I Agree — Proceed to Sign <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Verify */}
        {step === 2 && (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-[2px] p-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] uppercase tracking-tight mb-1">Verify Identity</h2>
            <p className="text-gray-400 text-sm mb-8">
              You'll be redirected to DigiLocker to verify your Aadhaar and confirm the agreement.
            </p>

            {/* Summary */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[2px] p-4 space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-medium">{fields.name}</span>
              </div>
              <div className="h-px bg-[#1a1a1a]" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{fields.email}</span>
              </div>
              <div className="h-px bg-[#1a1a1a]" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{fields.phone}</span>
              </div>
              <div className="h-px bg-[#1a1a1a]" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-[#26cece] font-bold">{AGENT.price}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} disabled={loading} className="flex-1 border border-[#333] text-gray-300 font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:border-[#26cece] hover:text-[#26cece] transition-colors text-sm disabled:opacity-40">
                Back
              </button>
              <button onClick={handleSign} disabled={loading} className="flex-1 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3 rounded-[2px] hover:bg-white transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</>
                  : <><Shield className="w-4 h-4" /> Verify with DigiLocker <ExternalLink className="w-3.5 h-3.5" /></>}
              </button>
            </div>

            {signStatus === 'pending' && (
              <div className="mt-4 bg-[#26cece]/5 border border-[#26cece]/20 rounded-[2px] px-4 py-3 flex items-center gap-2 text-[#26cece] text-xs font-mono">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                Creating DigiLocker session · redirecting…
              </div>
            )}
            {signStatus === 'error' && (
              <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-[2px] px-4 py-3 flex items-start gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{signError}</span>
              </div>
            )}

            <p className="text-center text-gray-600 text-[10px] font-mono mt-6">
              Secured by Cashfree VRS · Legally valid under IT Act 2000
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ESignPage;
