import React, { useState, useEffect, useRef, useCallback } from 'react';

const WEBHOOK_URL = 'https://bitlancetechhub.app.n8n.cloud/webhook/lead-chatbot';
const CALENDLY_URL = 'https://calendly.com/YOUR_CALENDLY_LINK'; // ← Replace

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [sessionData, setSessionData] = useState({
        sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
    });
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState('welcome');
    const [progress, setProgress] = useState(0);
    const [calendlyVisible, setCalendlyVisible] = useState(false);
    const [calendlyUrl, setCalendlyUrl] = useState('');
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef(null);
    const sessionDataRef = useRef(sessionData);

    const [showPopup, setShowPopup] = useState(false);

    // Keep ref in sync so async callbacks always read latest sessionData
    useEffect(() => { sessionDataRef.current = sessionData; }, [sessionData]);

    const progressMap = {
        welcome: 5, service: 22, role: 44, budget: 66,
        timeline: 85, contact: 95, booked: 100, end: 100
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && !hasOpened) {
            setHasOpened(true);
            setCalendlyVisible(false);  // always reset overlay on open
            setMessages([]);            // clear any stale messages
            setCurrentStep('welcome');
            // show welcome via local fallback immediately, then try webhook
            setTimeout(() => startConversation(), 400);
        }
    }, [isOpen, hasOpened]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPopup(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-open widget after 5 seconds
    useEffect(() => {
        const autoOpen = setTimeout(() => {
            setIsOpen(true);
            setShowPopup(false);
        }, 5000);
        return () => clearTimeout(autoOpen);
    }, []);

    useEffect(() => {
        const handleMessage = (e) => {
            if (!e.data || typeof e.data !== 'object') return;
            const eventName = e.data.event || e.data.type || '';
            if (
                eventName === 'calendly.event_scheduled' ||
                eventName === 'event_scheduled'
            ) {
                handleBookingConfirmed(e.data.payload || e.data);
            }
            if (typeof e.data === 'string' && e.data.includes('event_scheduled')) {
                handleBookingConfirmed({});
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);                       // no sessionData dependency — use ref inside

    const toggleWidget = () => {
        setIsOpen(prev => !prev);
        if (showPopup) setShowPopup(false);
    };

    const formatText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|\n)/g);
        return parts.map((part, i) => {
            if (part === '\n') return <br key={i} />;
            if (part.startsWith('**') && part.endsWith('**'))
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            return <span key={i}>{part}</span>;
        });
    };

    const addMessage = (msg) => setMessages(prev => [...prev, msg]);

    const startConversation = () => {
        // Always show local welcome immediately — reliable, no webhook dependency
        handleLocalFallback({ step: 'welcome', sessionId: sessionDataRef.current.sessionId });
    };

    const sendToWebhook = async (payload) => {
        setIsTyping(true);
        setProgress(progressMap[payload.step] || 0);

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            setIsTyping(false);
            handleResponse(data);
        } catch (err) {
            setIsTyping(false);
            console.error('Webhook error:', err);
            handleLocalFallback(payload);
        }
    };

    const handleResponse = (data) => {
        const nextStep = data.nextStep || currentStep;
        setCurrentStep(nextStep);
        setProgress(progressMap[nextStep] || 0);

        setSessionData(prev => ({
            ...prev,
            ...(data.selectedServices && { selectedServices: data.selectedServices }),
            ...(data.selectedRole && { selectedRole: data.selectedRole }),
            ...(data.selectedBudget && { selectedBudget: data.selectedBudget }),
            ...(data.selectedTimeline && { selectedTimeline: data.selectedTimeline }),
        }));

        if (data.response) {
            setTimeout(() => addMessage({ type: 'bot', text: data.response }), 0);
        }

        if (data.buttons?.length > 0) {
            setTimeout(() => addMessage({
                type: 'buttons',
                buttons: data.buttons,
                isMulti: data.multiSelect || false,
                confirmLabel: data.confirmButtonLabel || '✅ Continue'
            }), 300);
        }

        if (data.showContactForm) {
            setTimeout(() => addMessage({ type: 'contactForm' }), 400);
        }

        if (data.showCalendly) {
            setTimeout(() => addMessage({
                type: 'calendlyCTA',
                url: data.calendlyUrl || CALENDLY_URL,
                message: data.calendlyMessage
            }), 400);
        }
    };

    const handleLocalFallback = (payload) => {
        const step = payload.step;
        // Use the ref so we always have the latest name/email
        const sd = sessionDataRef.current;

        const flows = {
            welcome: {
                response: "👋 Welcome to **Bitlance TechHub**!\n\nWe build AI Voice Bots & Business Automation solutions. Let's find how we can help — just **4 quick steps**!\n\nWhich services are you interested in? *(Select all that apply)*",
                nextStep: 'service', multiSelect: true, confirmButtonLabel: '✅ Continue with selected',
                buttons: [
                    { label: '🎙️ AI Voice Bot', value: 'ai_voice_bot', step: 'service' },
                    { label: '🤖 AI Chatbot / Lead Bot', value: 'ai_chatbot', step: 'service' },
                    { label: '⚙️ Workflow Automation', value: 'workflow_automation', step: 'service' },
                    { label: '📊 CRM Integration', value: 'crm_integration', step: 'service' },
                    { label: '🌐 Web / App Development', value: 'web_development', step: 'service' },
                    { label: '📣 AI Marketing Automation', value: 'ai_marketing', step: 'service' }
                ]
            },
            service: {
                response: "Excellent choices! 💪 We specialise in all of that.\n\nNow, what best describes your role?",
                nextStep: 'role',
                buttons: [
                    { label: '👔 Business Owner / Founder', value: 'owner', step: 'role' },
                    { label: '📈 Sales / Marketing Manager', value: 'sales_marketing', step: 'role' },
                    { label: '💻 CTO / Tech Lead', value: 'tech_lead', step: 'role' },
                    { label: '🏢 Enterprise / Corp Decision Maker', value: 'enterprise', step: 'role' }
                ]
            },
            role: {
                response: "What's your approximate project budget?", nextStep: 'budget',
                buttons: [
                    { label: '💵 Under $500', value: 'under_500', step: 'budget' },
                    { label: '💰 $500 – $2,000', value: '500_2000', step: 'budget' },
                    { label: '💎 $2,000 – $10,000', value: '2000_10000', step: 'budget' },
                    { label: '🏦 $10,000+', value: '10000_plus', step: 'budget' }
                ]
            },
            budget: {
                response: "Almost there! 🎯 When are you looking to get started?", nextStep: 'timeline',
                buttons: [
                    { label: '🔥 ASAP – Within 1 week', value: 'asap', step: 'timeline' },
                    { label: '📅 This Month', value: 'this_month', step: 'timeline' },
                    { label: '🗓️ Next 1–3 Months', value: '1_3_months', step: 'timeline' },
                    { label: '🔮 Just Exploring', value: 'exploring', step: 'timeline' }
                ]
            },
            timeline: {
                response: "🎉 You're a great fit for **Bitlance TechHub**!\n\nShare your contact details and we'll book a strategy call for you.",
                nextStep: 'contact', showContactForm: true
            },
            contact: {
                response: `Hi **${sd.name || 'there'}**! 🙌 You're all set!\n\nClick below to pick a time — our team will show you a live demo and outline a custom solution.`,
                nextStep: 'booked', showCalendly: true, calendlyUrl: CALENDLY_URL
            }
        };

        const flow = flows[step];
        if (!flow) return;

        setCurrentStep(flow.nextStep);
        setProgress(progressMap[flow.nextStep] || 0);
        addMessage({ type: 'bot', text: flow.response });

        if (flow.buttons) {
            setTimeout(() => addMessage({
                type: 'buttons',
                buttons: flow.buttons,
                isMulti: flow.multiSelect || false,
                confirmLabel: flow.confirmButtonLabel || '✅ Continue'
            }), 300);
        }
        if (flow.showContactForm) {
            setTimeout(() => addMessage({ type: 'contactForm' }), 400);
        }
        if (flow.showCalendly) {
            setTimeout(() => addMessage({
                type: 'calendlyCTA',
                url: flow.calendlyUrl || CALENDLY_URL,
                message: null
            }), 400);
        }
    };

    const handleBookingConfirmed = useCallback(() => {
        setCalendlyVisible(false);
        setMessages(prev => prev.filter(m => m.type !== 'calendlyCTA'));
        setCurrentStep('booked');
        setProgress(100);

        const name = sessionDataRef.current.name || 'there';
        const email = sessionDataRef.current.email || 'your email';

        setTimeout(() => {
            addMessage({
                type: 'bot',
                text: `✅ **Meeting Booked! You're all set, ${name}!**\n\nOur team at **Bitlance TechHub** is excited to speak with you. Check your email and WhatsApp for the confirmation & meeting link.`
            });
        }, 200);

        setTimeout(() => {
            addMessage({ type: 'bookingConfirmed', email });
        }, 800);
    }, []);

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        setInputValue('');
        addMessage({ type: 'user', text });
        sendToWebhook({ step: currentStep, message: text, ...sessionDataRef.current });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // ── Sub-components ────────────────────────────────────────────────────────

    const MultiSelectButtons = ({ buttons, isMulti, confirmLabel }) => {
        const [selected, setSelected] = useState([]);
        const [submitted, setSubmitted] = useState(false);

        const toggleMulti = (val) => {
            setSelected(prev =>
                prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
            );
        };

        const submitMulti = (nextStep) => {
            if (selected.length === 0 || submitted) return;
            setSubmitted(true);

            const serviceLabels = {
                ai_voice_bot: '🎙️ AI Voice Bot',
                ai_chatbot: '🤖 AI Chatbot',
                workflow_automation: '⚙️ Workflow Automation',
                crm_integration: '📊 CRM Integration',
                web_development: '🌐 Web / App Dev',
                ai_marketing: '📣 AI Marketing'
            };
            const summary = selected.map(s => serviceLabels[s] || s).join(', ');
            addMessage({ type: 'user', text: summary });

            setSessionData(prev => ({ ...prev, selectedServices: selected }));

            sendToWebhook({
                step: nextStep,
                selectedServices: selected,
                ...sessionDataRef.current
            });
        };

        const handleSingle = (btn) => {
            if (submitted) return;
            setSubmitted(true);
            addMessage({ type: 'user', text: btn.label });

            const keyMap = { role: 'selectedRole', budget: 'selectedBudget', timeline: 'selectedTimeline' };
            const key = keyMap[btn.step];
            if (key) setSessionData(prev => ({ ...prev, [key]: btn.value }));

            sendToWebhook({
                step: btn.step,
                buttonValue: btn.value,
                ...sessionDataRef.current,
                ...(key ? { [key]: btn.value } : {})
            });
        };

        if (submitted) return null;

        return (
            <div className="multi-select-wrap">
                {isMulti ? (
                    <>
                        {buttons.map(btn => (
                            <button
                                key={btn.value}
                                className={`btn-option multi ${selected.includes(btn.value) ? 'checked' : ''}`}
                                onClick={() => toggleMulti(btn.value)}
                            >
                                {btn.label}
                            </button>
                        ))}
                        <button
                            className={`confirm-btn ${selected.length > 0 ? 'active' : ''}`}
                            onClick={() => submitMulti(buttons[0].step)}
                            disabled={selected.length === 0}
                        >
                            {selected.length > 0
                                ? `✅ Continue with ${selected.length} selected`
                                : confirmLabel}
                        </button>
                    </>
                ) : (
                    buttons.map(btn => (
                        <button
                            key={btn.value}
                            className="btn-option single"
                            onClick={() => handleSingle(btn)}
                        >
                            {btn.label}
                        </button>
                    ))
                )}
            </div>
        );
    };

    const ContactForm = () => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [phone, setPhone] = useState('');
        const [submitted, setSubmitted] = useState(false);
        const [errors, setErrors] = useState({});

        if (submitted) return null;

        const validate = () => {
            const e = {};
            if (!name.trim()) e.name = true;
            if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = true;
            return e;
        };

        const handleSubmit = () => {
            const e = validate();
            if (Object.keys(e).length) { setErrors(e); return; }

            setSubmitted(true);
            // Update session data synchronously via ref so the fallback contact
            // flow can immediately read name/email
            const updated = { ...sessionDataRef.current, name, email, phone };
            setSessionData(updated);
            sessionDataRef.current = updated;

            addMessage({ type: 'user', text: `📧 ${email}` });
            sendToWebhook({ step: 'contact', name, email, phone, ...updated });
        };

        return (
            <div className="contact-form">
                <input
                    type="text"
                    placeholder="Your full name *"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
                    style={{ borderColor: errors.name ? '#ff6b6b' : '' }}
                />
                {errors.name && <span className="form-error">Name is required</span>}
                <input
                    type="email"
                    placeholder="Email address *"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: false })); }}
                    style={{ borderColor: errors.email ? '#ff6b6b' : '' }}
                />
                {errors.email && <span className="form-error">Valid email is required</span>}
                <input
                    type="tel"
                    placeholder="WhatsApp number (e.g. +91...)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <button onClick={handleSubmit}>🚀 Book My Free Strategy Call</button>
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');

        .bitlance-chat-widget-wrapper {
          --brand:      #5B4FE8;
          --brand-dark: #3D31CC;
          --brand-glow: rgba(91,79,232,0.35);
          --accent:     #00E5A0;
          --bg:         #0C0B14;
          --surface:    #141220;
          --surface2:   #1D1A2F;
          --border:     rgba(255,255,255,0.07);
          --text:       #F0EEF8;
          --muted:      #7B78A0;
          --radius:     18px;
          --widget-w:   390px;
          font-family: 'DM Sans', sans-serif;
        }

        .bitlance-chat-widget-wrapper *,
        .bitlance-chat-widget-wrapper *::before,
        .bitlance-chat-widget-wrapper *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        /* ── Bubble ── */
        @keyframes bubbleIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        #chat-bubble {
          position: fixed; bottom: 28px; right: 28px;
          width: 62px; height: 62px; border-radius: 50%;
          background: linear-gradient(135deg, var(--brand), var(--brand-dark));
          box-shadow: 0 8px 32px var(--brand-glow), 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          z-index: 9999; border: none;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: bubbleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        #chat-bubble:hover { transform: scale(1.1); box-shadow: 0 12px 40px var(--brand-glow); }
        #chat-bubble svg { transition: transform 0.3s, opacity 0.3s; }
        #chat-bubble.open .icon-chat  { opacity: 0; transform: scale(0.5) rotate(90deg); }
        #chat-bubble.open .icon-close { opacity: 1; transform: scale(1) rotate(0deg); }
        #chat-bubble .icon-close      { position: absolute; opacity: 0; transform: scale(0.5) rotate(-90deg); }
        .notif-dot {
          position: absolute; top: 4px; right: 4px;
          width: 14px; height: 14px;
          background: var(--accent); border-radius: 50%; border: 2px solid var(--bg);
          animation: pulse 1.8s infinite;
        }

        /* ── Widget panel ── */
        #chat-widget {
          position: fixed; bottom: 104px; right: 28px;
          width: var(--widget-w); max-height: 640px; height: 80vh;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,79,232,0.1);
          display: flex; flex-direction: column; z-index: 9998; overflow: hidden;
          transform: translateY(20px) scale(0.95); opacity: 0; pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.34,1.3,0.64,1), opacity 0.25s ease;
        }
        #chat-widget.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

        /* ── Header ── */
        .widget-header {
          background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%);
          padding: 16px 18px; display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; position: relative; overflow: hidden;
        }
        .widget-header::after {
          content:''; position:absolute; right:-20px; top:-20px;
          width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.06);
        }
        .header-avatar {
          width:40px; height:40px; border-radius:50%;
          background:rgba(255,255,255,0.15);
          display:flex; align-items:center; justify-content:center;
          font-size:1.2rem; flex-shrink:0; border:2px solid rgba(255,255,255,0.2);
        }
        .header-info { flex:1; }
        .header-info strong { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:700; display:block; color:#fff; }
        .header-info span   { font-size:0.72rem; color:rgba(255,255,255,0.7); display:flex; align-items:center; gap:5px; }
        .online-dot { width:6px; height:6px; background:var(--accent); border-radius:50%; animation:pulse 2s infinite; }

        /* ── Progress bar ── */
        .progress-bar  { height:3px; background:rgba(255,255,255,0.1); flex-shrink:0; }
        .progress-fill { height:100%; background:linear-gradient(90deg,var(--accent),#00c87a); transition:width 0.6s ease; }

        /* ── Messages ── */
        .widget-messages {
          flex:1; overflow-y:auto; padding:18px 16px 10px;
          display:flex; flex-direction:column; gap:14px;
          scrollbar-width:thin; scrollbar-color:var(--surface2) transparent;
        }
        .widget-messages::-webkit-scrollbar       { width:4px; }
        .widget-messages::-webkit-scrollbar-thumb { background:var(--surface2); border-radius:4px; }

        @keyframes msgIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .msg             { display:flex; gap:8px; align-items:flex-end; animation:msgIn 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
        .msg.bot         { flex-direction:row; }
        .msg.user        { flex-direction:row-reverse; }
        .msg-avatar      { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--brand),var(--brand-dark)); display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0; }
        .msg-bubble      { max-width:82%; padding:10px 14px; border-radius:16px; font-size:0.875rem; line-height:1.55; }
        .msg.bot  .msg-bubble { background:var(--surface2); border:1px solid var(--border); border-bottom-left-radius:4px; color:var(--text); }
        .msg.user .msg-bubble { background:linear-gradient(135deg,var(--brand),var(--brand-dark)); border-bottom-right-radius:4px; color:#fff; }
        .msg-bubble strong { font-weight:600; }

        /* ── Typing indicator ── */
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .typing-bubble { display:flex; gap:8px; align-items:flex-end; }
        .typing-dots   { background:var(--surface2); border:1px solid var(--border); border-radius:16px; border-bottom-left-radius:4px; padding:12px 16px; display:flex; gap:5px; align-items:center; }
        .typing-dots span { width:7px; height:7px; border-radius:50%; background:var(--muted); animation:bounce 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay:0.15s; }
        .typing-dots span:nth-child(3) { animation-delay:0.3s;  }

        /* ── Buttons ── */
        .multi-select-wrap { display:flex; flex-direction:column; gap:6px; animation:msgIn 0.4s 0.1s cubic-bezier(0.34,1.3,0.64,1) both; }

        .btn-option {
          background: transparent;
          border: 1px solid rgba(91,79,232,0.35);
          color: #c4c0f0;
          font-family: 'DM Sans', sans-serif; font-size: 0.83rem;
          padding: 9px 14px; border-radius: 10px; cursor: pointer;
          text-align: left;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.12s;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          position: relative;
        }
        .btn-option:hover                 { background:rgba(91,79,232,0.15); border-color:var(--brand); color:#fff; }
        .btn-option.single:hover          { transform:translateX(3px); }
        .btn-option.single:active         { transform:scale(0.97); }

        .btn-option.multi { padding-right: 40px; }
        .btn-option.multi::after {
          content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 18px; height: 18px; border: 2px solid rgba(91,79,232,0.5); border-radius: 5px;
          background: transparent; transition: background 0.15s, border-color 0.15s;
        }
        .btn-option.multi.checked { background:rgba(91,79,232,0.2); border-color:var(--brand); color:#fff; }
        .btn-option.multi.checked::after {
          background: var(--brand); border-color: var(--brand);
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='9' viewBox='0 0 12 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4L4.5 7.5L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: center;
        }

        .confirm-btn {
          margin-top: 4px;
          background: linear-gradient(135deg, var(--brand), var(--brand-dark));
          color: #fff; font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
          padding: 11px 18px; border: none; border-radius: 10px; cursor: pointer; width: 100%;
          transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.02em;
          opacity: 0.4; pointer-events: none;
        }
        .confirm-btn.active                { opacity: 1; pointer-events: all; }
        .confirm-btn.active:hover          { transform: translateY(-1px); opacity: 0.9; }

        /* ── Contact form ── */
        .contact-form {
          background:var(--surface2); border:1px solid var(--border); border-radius:14px;
          padding:14px; display:flex; flex-direction:column; gap:9px;
          animation:msgIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both;
        }
        .contact-form input {
          background:var(--bg); border:1px solid var(--border); color:var(--text);
          font-family:'DM Sans',sans-serif; font-size:0.85rem; padding:9px 12px;
          border-radius:9px; outline:none; transition:border-color 0.2s; width:100%;
        }
        .contact-form input:focus       { border-color:var(--brand); }
        .contact-form input::placeholder{ color:var(--muted); }
        .form-error { font-size:0.72rem; color:#ff6b6b; margin-top:-4px; padding-left:4px; }
        .contact-form button {
          background:linear-gradient(135deg,var(--brand),var(--brand-dark));
          color:#fff; font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700;
          padding:10px; border:none; border-radius:9px; cursor:pointer;
          transition:opacity 0.2s,transform 0.15s; letter-spacing:0.02em;
        }
        .contact-form button:hover { opacity:0.9; transform:translateY(-1px); }

        /* ── Calendly CTA ── */
        .calendly-cta {
          background:linear-gradient(135deg,rgba(0,229,160,0.1),rgba(91,79,232,0.15));
          border:1px solid rgba(0,229,160,0.3); border-radius:14px; padding:16px;
          text-align:center; animation:msgIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both;
        }
        .calendly-cta p { font-size:0.82rem; color:var(--muted); margin-bottom:11px; line-height:1.5; }
        .cal-open-btn {
          display:inline-flex; align-items:center; gap:7px;
          background:linear-gradient(135deg,var(--accent),#00c87a);
          color:#0C0B14; font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700;
          padding:11px 22px; border-radius:999px; border:none; cursor:pointer;
          transition:transform 0.2s,box-shadow 0.2s;
          box-shadow:0 4px 20px rgba(0,229,160,0.3); letter-spacing:0.02em;
        }
        .cal-open-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,229,160,0.4); }

        /* ── Calendly overlay ── */
        #cal-overlay {
          position:absolute; inset:0; z-index:100; background:var(--surface);
          display:flex; flex-direction:column;
          transform:translateY(100%); transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);
          border-radius:var(--radius); overflow:hidden;
        }
        #cal-overlay.visible { transform:translateY(0); }
        .cal-overlay-header {
          background:linear-gradient(135deg,var(--brand-dark),var(--brand));
          padding:14px 16px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
        }
        .cal-overlay-header span { font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:#fff; }
        .cal-overlay-header button {
          background:rgba(255,255,255,0.15); border:none; color:#fff; font-size:0.8rem; font-weight:600;
          padding:5px 12px; border-radius:999px; cursor:pointer; transition:background 0.15s; font-family:'DM Sans',sans-serif;
        }
        .cal-overlay-header button:hover { background:rgba(255,255,255,0.25); }

        @keyframes spin { to { transform:rotate(360deg); } }
        .cal-loading {
          flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px;
          color:var(--muted); font-size:0.85rem; position:absolute; inset:56px 0 0 0; background:var(--surface);
        }
        .cal-loading-spinner {
          width:32px; height:32px; border-radius:50%;
          border:3px solid var(--border); border-top-color:var(--brand);
          animation:spin 0.8s linear infinite;
        }
        #calendly-iframe { flex:1; width:100%; border:none; background:#fff; min-height:0; display:block; }

        /* ── Booking confirmed card ── */
        @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
        .booking-confirmed-card {
          background:linear-gradient(135deg,rgba(0,229,160,0.12),rgba(91,79,232,0.18));
          border:1px solid rgba(0,229,160,0.35); border-radius:16px; padding:22px 18px;
          text-align:center; animation:msgIn 0.5s cubic-bezier(0.34,1.4,0.64,1) both;
          display:flex; flex-direction:column; align-items:center; gap:8px;
        }
        .bc-icon     { font-size:2.2rem; animation:popIn 0.5s cubic-bezier(0.34,1.6,0.64,1) both; }
        .bc-title    { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:var(--accent); }
        .bc-subtitle { font-size:0.82rem; color:var(--muted); line-height:1.5; }
        .bc-subtitle strong { color:var(--text); }
        .bc-btn-outline {
          margin-top:6px; display:inline-block;
          border:1px solid rgba(91,79,232,0.5); color:#a89fff;
          font-family:'Syne',sans-serif; font-size:0.8rem; font-weight:600;
          padding:8px 18px; border-radius:999px; text-decoration:none;
          transition:background 0.15s,color 0.15s;
        }
        .bc-btn-outline:hover { background:rgba(91,79,232,0.2); color:#fff; }

        /* ── Footer ── */
        .widget-footer {
          padding:12px 14px; border-top:1px solid var(--border);
          background:var(--surface); flex-shrink:0;
          display:flex; align-items:center; gap:8px;
        }
        .footer-input {
          flex:1; background:var(--surface2); border:1px solid var(--border);
          border-radius:999px; padding:9px 16px; color:var(--text);
          font-family:'DM Sans',sans-serif; font-size:0.85rem;
          outline:none; transition:border-color 0.2s;
        }
        .footer-input:focus       { border-color:var(--brand); }
        .footer-input::placeholder{ color:var(--muted); }
        .footer-send {
          width:38px; height:38px; border-radius:50%; background:var(--brand);
          border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:background 0.2s,transform 0.15s; flex-shrink:0;
        }
        .footer-send:hover { background:var(--brand-dark); transform:scale(1.05); }

        .powered-by {
          text-align:center; font-size:0.68rem; color:var(--muted);
          padding:5px 0 8px; opacity:0.6; letter-spacing:0.03em;
        }

        /* ── Responsive ── */
        @media (max-width: 440px) {
          .bitlance-chat-widget-wrapper { --widget-w: calc(100vw - 24px); }
          #chat-widget  { right:12px; bottom:96px; }
          #chat-bubble  { right:16px; bottom:20px; }
          .chat-popup-label { right: 94px; bottom: 32px; }
        }

        /* ── Book Demo Popup ── */
        .chat-popup-label {
          position: fixed;
          bottom: 40px;
          right: 106px;
          background: #fff;
          color: #0c0b14;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          cursor: pointer;
          z-index: 9999;
          animation: popupFadeIn 0.4s ease-out forwards;
        }
        .chat-popup-label::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: #fff;
        }
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

                {/* Popup Book Demo — outside wrapper so position:fixed is viewport-relative */}
                {!isOpen && showPopup && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            right: '106px',
                            background: '#fff',
                            color: '#0c0b14',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            animation: 'popupFadeIn 0.4s ease-out forwards',
                            whiteSpace: 'nowrap',
                        }}
                        onClick={toggleWidget}
                    >
                        👋 Book a Demo!
                        <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: '4px' }}>✕</span>
                    </div>
                )}

            <div className="bitlance-chat-widget-wrapper">


                {/* Launcher bubble */}
                <button
                    id="chat-bubble"
                    className={isOpen ? 'open' : ''}
                    onClick={toggleWidget}
                    aria-label="Open chat"
                >
                    {!hasOpened && <div className="notif-dot" />}
                    <svg className="icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <svg className="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Chat panel */}
                <div id="chat-widget" className={isOpen ? 'open' : ''}>

                    {/* Header */}
                    <div className="widget-header">
                        <div className="header-avatar">🤖</div>
                        <div className="header-info">
                            <strong>Bitlance TechHub</strong>
                            <span><span className="online-dot" /> AI Assistant · Replies instantly</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Messages */}
                    <div className="widget-messages">
                        {messages.map((msg, idx) => {
                            if (msg.type === 'bot') return (
                                <div key={idx} className="msg bot">
                                    <div className="msg-avatar">🤖</div>
                                    <div className="msg-bubble">{formatText(msg.text)}</div>
                                </div>
                            );
                            if (msg.type === 'user') return (
                                <div key={idx} className="msg user">
                                    <div className="msg-bubble">{msg.text}</div>
                                </div>
                            );
                            if (msg.type === 'buttons') return (
                                <MultiSelectButtons
                                    key={idx}
                                    buttons={msg.buttons}
                                    isMulti={msg.isMulti}
                                    confirmLabel={msg.confirmLabel}
                                />
                            );
                            if (msg.type === 'contactForm') return <ContactForm key={idx} />;
                            if (msg.type === 'calendlyCTA') return (
                                <div key={idx} className="calendly-cta">
                                    <p>{msg.message || "Pick a time that works for you — it's completely free!"}</p>
                                    <button
                                        className="cal-open-btn"
                                        onClick={() => { setCalendlyUrl(msg.url); setCalendlyVisible(true); }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        Schedule My Free Call
                                    </button>
                                </div>
                            );
                            if (msg.type === 'bookingConfirmed') return (
                                <div key={idx} className="booking-confirmed-card">
                                    <div className="bc-icon">🎉</div>
                                    <div className="bc-title">Meeting Confirmed!</div>
                                    <div className="bc-subtitle">
                                        Confirmation sent to<br /><strong>{msg.email}</strong>
                                    </div>
                                    <a
                                        href="https://www.bitlancetechhub.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bc-btn-outline"
                                    >
                                        Visit Our Website →
                                    </a>
                                </div>
                            );
                            return null;
                        })}

                        {isTyping && (
                            <div className="typing-bubble">
                                <div className="msg-avatar">🤖</div>
                                <div className="typing-dots">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer input */}
                    <div className="widget-footer">
                        <input
                            className="footer-input"
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="footer-send" onClick={handleSend} aria-label="Send">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <div className="powered-by">Powered by Bitlance TechHub · AI Lead Qualifier</div>

                    {/* Calendly overlay */}
                    <div id="cal-overlay" className={calendlyVisible ? 'visible' : ''}>
                        <div className="cal-overlay-header">
                            <span>📅 Book Your Free Strategy Call</span>
                            <button onClick={() => setCalendlyVisible(false)}>← Back</button>
                        </div>
                        {calendlyVisible && (
                            <>
                                <div className="cal-loading">
                                    <div className="cal-loading-spinner" />
                                    <p>Loading calendar...</p>
                                </div>
                                <iframe
                                    id="calendly-iframe"
                                    src={
                                        calendlyUrl +
                                        (calendlyUrl.includes('?') ? '&' : '?') +
                                        'embed_domain=' + encodeURIComponent(
                                            (typeof window !== 'undefined' && window.location.hostname) || 'bitlancetechhub.com'
                                        ) +
                                        '&embed_type=inline&hide_landing_page_details=1&hide_gdpr_banner=1'
                                    }
                                    onLoad={e => {
                                        // Hide the loading spinner once iframe loads
                                        const loading = e.currentTarget.previousElementSibling;
                                        if (loading) loading.style.display = 'none';
                                    }}
                                    title="Schedule a call"
                                    allow="payment"
                                />
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default ChatWidget;