import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  CONFIG  ─ replace with your real URLs before deploying
// ─────────────────────────────────────────────────────────────────────────────
const WEBHOOK_URL = "https://bitlancetechhub.app.n8n.cloud/webhook/lead-chatbot";
const CALENDLY_URL = "https://calendly.com/bitlanceai/task-regarding";

// ─────────────────────────────────────────────────────────────────────────────
// 📊  PROGRESS MAP  ─ each step = % filled in the top progress bar
// ─────────────────────────────────────────────────────────────────────────────
const PROGRESS_MAP = {
  welcome: 5,
  service: 22,
  role: 44,
  budget: 66,
  timeline: 85,
  contact: 95,
  booked: 100,
  end: 100,
};

// ─────────────────────────────────────────────────────────────────────────────
// 🗂️  LOCAL FALLBACK FLOWS
//    Used when the webhook is unreachable.
//    Each key is a "step". When that step is sent to the webhook (or fails),
//    this object tells the bot what to say next and what buttons to show.
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_FLOWS = {
  welcome: {
    response: "👋 Welcome to **Bitlance TechHub**!\n\nWe build AI Voice Bots & Business Automation solutions. Let's find how we can help — just **4 quick steps**!\n\nWhich services are you interested in? *(Select all that apply)*",
    nextStep: "service",
    multiSelect: true,
    confirmButtonLabel: "✅ Continue with selected",
    buttons: [
      { label: "🎙️ AI Voice Bot", value: "ai_voice_bot", step: "service" },
      { label: "🤖 AI Chatbot / Lead Bot", value: "ai_chatbot", step: "service" },
      { label: "⚙️ Workflow Automation", value: "workflow_automation", step: "service" },
      { label: "📊 CRM Integration", value: "crm_integration", step: "service" },
      { label: "🌐 Web / App Development", value: "web_development", step: "service" },
      { label: "📣 AI Marketing Automation", value: "ai_marketing", step: "service" },
    ],
  },
  service: {
    response: "Excellent choices! 💪 We specialise in all of that.\n\nNow, what best describes your role?",
    nextStep: "role",
    buttons: [
      { label: "👔 Business Owner / Founder", value: "owner", step: "role" },
      { label: "📈 Sales / Marketing Manager", value: "sales_marketing", step: "role" },
      { label: "💻 CTO / Tech Lead", value: "tech_lead", step: "role" },
      { label: "🏢 Enterprise / Corp Decision Maker", value: "enterprise", step: "role" },
    ],
  },
  role: {
    response: "What's your approximate project budget?",
    nextStep: "budget",
    buttons: [
      { label: "💵 Under $500", value: "under_500", step: "budget" },
      { label: "💰 $500 – $2,000", value: "500_2000", step: "budget" },
      { label: "💎 $2,000 – $10,000", value: "2000_10000", step: "budget" },
      { label: "🏦 $10,000+", value: "10000_plus", step: "budget" },
    ],
  },
  budget: {
    response: "Almost there! 🎯 When are you looking to get started?",
    nextStep: "timeline",
    buttons: [
      { label: "🔥 ASAP – Within 1 week", value: "asap", step: "timeline" },
      { label: "📅 This Month", value: "this_month", step: "timeline" },
      { label: "🗓️ Next 1–3 Months", value: "1_3_months", step: "timeline" },
      { label: "🔮 Just Exploring", value: "exploring", step: "timeline" },
    ],
  },
  timeline: {
    response: "🎉 You're a great fit for **Bitlance TechHub**!\n\nShare your contact details and we'll book a strategy call for you.",
    nextStep: "contact",
    showContactForm: true,
  },
  contact: {
    response: "🙌 You're all set!\n\nClick below to pick a time — our team will show you a live demo and outline a custom solution.",
    nextStep: "booked",
    showCalendly: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔤  HELPER: parse **bold** markdown + newlines → JSX
// ─────────────────────────────────────────────────────────────────────────────
function FormattedText({ text }) {
  const parts = text.split(/(\*\*.*?\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 💬  TYPING INDICATOR  ─ three bouncing dots shown while webhook is called
// ─────────────────────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={styles.msgRow}>
      <div style={styles.botAvatar}>🤖</div>
      <div style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎉  CONFETTI  ─ 32 random dots that fall after booking is confirmed
// ─────────────────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#5B4FE8", "#00E5A0", "#fff", "#a89fff", "#00c87a"];
  return (
    <>
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${20 + Math.random() * 60}%`,
            top: "30%",
            width: `${5 + Math.random() * 6}px`,
            height: `${5 + Math.random() * 6}px`,
            background: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: "2px",
            pointerEvents: "none",
            zIndex: 99999,
            animation: `confettiFall ${0.8 + Math.random() * 0.6}s ${Math.random() * 0.5}s linear both`,
          }}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📅  CALENDLY OVERLAY  ─ slides up INSIDE the widget when user clicks "Book"
//    Listens for postMessage from Calendly iframe to detect booking confirmed
// ─────────────────────────────────────────────────────────────────────────────
function CalendlyOverlay({ url, onClose, onBooked }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  // Step 1 ─ animate in after mount (requestAnimationFrame trick)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Step 2 ─ listen for Calendly's postMessage event
  //   Calendly fires  { event: "calendly.event_scheduled" }  when the user
  //   completes a booking inside the iframe.
  useEffect(() => {
    function handler(e) {
      if (!e.data || typeof e.data !== "object") return;
      const name = e.data.event || e.data.type || "";
      if (name === "calendly.event_scheduled" || name === "event_scheduled") {
        onBooked(e.data.payload || e.data);
      }
      if (typeof e.data === "string" && e.data.includes("event_scheduled")) {
        onBooked({});
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onBooked]);

  // Build iframe URL with required Calendly embed params
  const embedUrl =
    url +
    (url.includes("?") ? "&" : "?") +
    "embed_domain=" +
    encodeURIComponent(window.location.hostname || "bitlancetechhub.com") +
    "&embed_type=inline&hide_landing_page_details=1&hide_gdpr_banner=1";

  return (
    <div style={{ ...styles.calOverlay, transform: visible ? "translateY(0)" : "translateY(100%)" }}>
      {/* Header bar with back button */}
      <div style={styles.calHeader}>
        <span style={styles.calHeaderTitle}>📅 Book Your Free Strategy Call</span>
        <button style={styles.calBackBtn} onClick={onClose}>← Back</button>
      </div>

      {/* Loading spinner shown until iframe fires onLoad */}
      {!iframeLoaded && (
        <div style={styles.calLoading}>
          <div style={styles.calSpinner} />
          <p style={{ color: "#7B78A0", fontSize: "0.85rem" }}>Loading calendar...</p>
        </div>
      )}

      {/* The actual Calendly embed iframe */}
      <iframe
        src={embedUrl}
        style={{ ...styles.calIframe, opacity: iframeLoaded ? 1 : 0 }}
        onLoad={() => setIframeLoaded(true)}
        title="Book a call"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📋  CONTACT FORM  ─ collects name / email / phone before showing Calendly
// ─────────────────────────────────────────────────────────────────────────────
function ContactForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit() {
    const e = {};
    if (!name.trim()) e.name = true;
    if (!email.trim()) e.email = true;
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  }

  return (
    <div style={styles.contactForm}>
      <input
        style={{ ...styles.cfInput, ...(errors.name ? styles.cfInputError : {}) }}
        placeholder="Your full name *"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: false })); }}
      />
      <input
        style={{ ...styles.cfInput, ...(errors.email ? styles.cfInputError : {}) }}
        placeholder="Email address *"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: false })); }}
      />
      <input
        style={styles.cfInput}
        placeholder="WhatsApp number (e.g. +91...)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button style={styles.cfBtn} onClick={handleSubmit}>
        🚀 Book My Free Strategy Call
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔘  OPTION BUTTONS  ─ single-select OR multi-select depending on isMulti
// ─────────────────────────────────────────────────────────────────────────────
function OptionButtons({ buttons, isMulti, confirmLabel, onSingle, onMultiConfirm }) {
  const [checked, setChecked] = useState([]);   // tracks multi-select state
  const [done, setDone] = useState(false); // disables buttons after selection

  // Toggle one checkbox in multi-select
  function toggle(value) {
    setChecked((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  // Confirm multi-select → send checked values up
  function confirmMulti() {
    if (!checked.length) return;
    setDone(true);
    onMultiConfirm(checked);
  }

  // Single click → lock all buttons, send up
  function clickSingle(btn) {
    if (done) return;
    setDone(true);
    onSingle(btn);
  }

  return (
    <div style={styles.optionWrap}>
      {buttons.map((btn) => {
        const isChecked = checked.includes(btn.value);
        const isSelected = done && !isMulti; // highlight selected single button
        return (
          <button
            key={btn.value}
            disabled={done && !isMulti}
            style={{
              ...styles.optBtn,
              ...(isMulti ? styles.optBtnMulti : styles.optBtnSingle),
              ...(isChecked ? styles.optBtnChecked : {}),
            }}
            onClick={() => isMulti ? toggle(btn.value) : clickSingle(btn)}
          >
            <span>{btn.label}</span>
            {/* Checkbox square for multi-select */}
            {isMulti && (
              <span style={{ ...styles.checkbox, ...(isChecked ? styles.checkboxChecked : {}) }}>
                {isChecked && "✓"}
              </span>
            )}
          </button>
        );
      })}

      {/* Confirm button only appears in multi-select mode */}
      {isMulti && (
        <button
          style={{
            ...styles.confirmBtn,
            ...(checked.length > 0 && !done ? styles.confirmBtnActive : {}),
          }}
          onClick={confirmMulti}
          disabled={checked.length === 0 || done}
        >
          {done
            ? "✓ Submitted"
            : checked.length > 0
              ? `✅ Continue with ${checked.length} selected`
              : confirmLabel || "✅ Continue"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📅  CALENDLY CTA CARD  ─ shown after contact form, before overlay opens
// ─────────────────────────────────────────────────────────────────────────────
function CalendlyCTACard({ url, message, onOpen }) {
  return (
    <div style={styles.ctaCard}>
      <p style={styles.ctaMsg}>{message || "Pick a time that works for you — it's completely free!"}</p>
      <button style={styles.ctaBtn} onClick={() => onOpen(url)}>
        📅 Schedule My Free Call
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅  BOOKING CONFIRMED CARD  ─ shown after Calendly postMessage fires
// ─────────────────────────────────────────────────────────────────────────────
function BookingConfirmedCard({ email }) {
  return (
    <div style={styles.bcCard}>
      <div style={styles.bcIcon}>🎉</div>
      <div style={styles.bcTitle}>Meeting Confirmed!</div>
      <div style={styles.bcSub}>
        Confirmation sent to<br />
        <strong style={{ color: "#F0EEF8" }}>{email || "your email"}</strong>
      </div>
      <a href="https://www.bitlancetechhub.com" target="_blank" rel="noreferrer" style={styles.bcLink}>
        Visit Our Website →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🤖  MAIN CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BitlanceChatbot({ isOpen: externalIsOpen, onToggle }) {

  // ── UI state ───────────────────────────────────────────────────────────────
  const [internalIsOpen, setInternalIsOpen] = useState(false);   // local open state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (next) => {
    if (onToggle) onToggle(next);
    setInternalIsOpen(next);
  };
  const [hasOpened, setHasOpened] = useState(false);   // first open flag
  const [isTyping, setIsTyping] = useState(false);   // show typing dots
  const [progress, setProgress] = useState(0);       // 0–100 top bar
  const [showNotif, setShowNotif] = useState(true);    // green dot on bubble
  const [confetti, setConfetti] = useState(false);   // booking confetti
  const [calUrl, setCalUrl] = useState(null);    // Calendly overlay URL
  const [inputText, setInputText] = useState("");      // footer text input
  const convoStartedRef = useRef(false);

  // ── Conversation state ─────────────────────────────────────────────────────
  // messages = array of message objects, each has a `type` key:
  //   { type:"bot",     text }
  //   { type:"user",    text }
  //   { type:"buttons", buttons, isMulti, confirmLabel, id }
  //   { type:"contactForm" }
  //   { type:"calendlyCTA", url, message }
  //   { type:"bookingConfirmed", email }
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [sessionData, setSessionData] = useState({
    selectedServices: [],
    selectedRole: "",
    selectedBudget: "",
    selectedTimeline: "",
  });
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });

  const messagesEndRef = useRef(null);
  const sessionId = useRef("session_" + Math.random().toString(36).substr(2, 9));

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Confetti auto-cleanup after 1.6s ──────────────────────────────────────
  useEffect(() => {
    if (confetti) setTimeout(() => setConfetti(false), 1600);
  }, [confetti]);

  // ── Auto-open after 5 seconds if not already opened ─────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasOpened) {
        setHasOpened(true);
        setShowNotif(false);
        setIsOpen(true);
        // TIME: +400ms → fire startConversation after widget opens
        setTimeout(startConversation, 400);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasOpened, isOpen, setIsOpen]); // Run once or whenever hasOpened changes

  // ── Add a single message to the list ─────────────────────────────────────
  const addMsg = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // ── Update progress bar ───────────────────────────────────────────────────
  const updateProgress = useCallback((step) => {
    setProgress(PROGRESS_MAP[step] || 0);
  }, []);

  // ── TOGGLE OPEN/CLOSE ─────────────────────────────────────────────────────
  // TIME: 0 ms → widget animates open via CSS transition (0.35s)
  // TIME: 400 ms → conversation starts (gives widget time to open)
  function toggleWidget() {
    const next = !isOpen;
    setIsOpen(next);

    if (next && !hasOpened) {
      setHasOpened(true);
      setShowNotif(false);
      // TIME: +400ms → fire startConversation after widget opens
      setTimeout(startConversation, 400);
    }
  }

  // ── START CONVERSATION ────────────────────────────────────────────────────
  // TIME: 0ms → show typing indicator
  //            → send { step:"welcome", message:"hi" } to webhook
  // TIME: ~500–1500ms (network) → typing removed, bot message appears
  function startConversation() {
    if (convoStartedRef.current) return;
    convoStartedRef.current = true;
    sendToWebhook({ step: "welcome", message: "hi", sessionId: sessionId.current });
  }

  // ── SEND TO WEBHOOK ───────────────────────────────────────────────────────
  // 1. showTyping() immediately → typing dots appear
  // 2. updateProgress() → bar advances
  // 3. fetch() → POST to n8n webhook
  // 4a. Success → removeTyping, handleResponse(data)
  // 4b. Failure → removeTyping, handleLocalFallback(payload)
  async function sendToWebhook(payload) {
    setIsTyping(true);
    updateProgress(payload.step);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsTyping(false);
      if (!res.ok) throw new Error("HTTP " + res.status);
      handleResponse(await res.json());
    } catch (err) {
      setIsTyping(false);
      console.warn("Webhook failed, using local fallback:", err);
      handleLocalFallback(payload);
    }
  }

  // ── HANDLE WEBHOOK RESPONSE ───────────────────────────────────────────────
  // The webhook can return:
  //   response         → bot message text
  //   nextStep         → advance currentStep
  //   buttons[]        → show option buttons
  //   multiSelect      → make buttons multi-select
  //   showContactForm  → render the contact form
  //   showCalendly     → render the Calendly CTA card
  //   calendlyUrl      → override the Calendly link
  function handleResponse(data) {
    const nextStep = data.nextStep || currentStep;
    setCurrentStep(nextStep);

    // Echo back session data from server if provided
    setSessionData((prev) => ({
      ...prev,
      ...(data.selectedServices ? { selectedServices: data.selectedServices } : {}),
      ...(data.selectedRole ? { selectedRole: data.selectedRole } : {}),
      ...(data.selectedBudget ? { selectedBudget: data.selectedBudget } : {}),
      ...(data.selectedTimeline ? { selectedTimeline: data.selectedTimeline } : {}),
    }));

    updateProgress(nextStep);

    // TIME: 0ms → bot message appears (animated in via CSS)
    if (data.response) addMsg({ type: "bot", text: data.response });

    // TIME: +300ms → buttons appear (staggered after message)
    if (data.buttons?.length) {
      setTimeout(() => addMsg({
        type: "buttons",
        buttons: data.buttons,
        isMulti: data.multiSelect || false,
        confirmLabel: data.confirmButtonLabel,
        id: Date.now(),
      }), 300);
    }

    // TIME: +400ms → contact form slides in
    if (data.showContactForm) setTimeout(() => addMsg({ type: "contactForm" }), 400);

    // TIME: +400ms → Calendly CTA card appears
    if (data.showCalendly) setTimeout(() => addMsg({
      type: "calendlyCTA",
      url: data.calendlyUrl || CALENDLY_URL,
      message: data.calendlyMessage,
    }), 400);
  }

  // ── LOCAL FALLBACK ────────────────────────────────────────────────────────
  // Mirrors handleResponse but uses LOCAL_FLOWS instead of server data.
  // Runs when webhook is down / CORS error / timeout.
  function handleLocalFallback(payload) {
    const flow = LOCAL_FLOWS[payload.step];
    if (!flow) return;

    setCurrentStep(flow.nextStep);
    updateProgress(flow.nextStep);

    // Personalise the "contact" step greeting with the collected name
    const responseText =
      payload.step === "contact"
        ? `Hi **${payload.name || "there"}**! 🙌 You're all set!\n\nClick below to pick a time — our team will show you a live demo and outline a custom solution.`
        : flow.response;

    addMsg({ type: "bot", text: responseText });

    if (flow.buttons) {
      setTimeout(() => addMsg({
        type: "buttons",
        buttons: flow.buttons,
        isMulti: flow.multiSelect || false,
        confirmLabel: flow.confirmButtonLabel,
        id: Date.now(),
      }), 300);
    }
    if (flow.showContactForm) setTimeout(() => addMsg({ type: "contactForm" }), 400);
    if (flow.showCalendly) setTimeout(() => addMsg({
      type: "calendlyCTA",
      url: CALENDLY_URL,
    }), 400);
  }

  // ── SINGLE BUTTON CLICK ───────────────────────────────────────────────────
  // TIME: 0ms → user bubble appears with button label text
  // TIME: 0ms → send full session payload to webhook
  function handleSingleClick(btn) {
    addMsg({ type: "user", text: btn.label });
    const updatedSession = {
      ...sessionData,
      ...(btn.step === "role" ? { selectedRole: btn.value } : {}),
      ...(btn.step === "budget" ? { selectedBudget: btn.value } : {}),
      ...(btn.step === "timeline" ? { selectedTimeline: btn.value } : {}),
    };
    setSessionData(updatedSession);
    sendToWebhook({
      step: btn.step,
      buttonValue: btn.value,
      sessionId: sessionId.current,
      ...updatedSession,
      ...contactInfo,
    });
  }

  // ── MULTI-SELECT CONFIRM ──────────────────────────────────────────────────
  // TIME: 0ms → user bubble shows comma-separated service labels
  // TIME: 0ms → webhook call with selectedServices array
  function handleMultiConfirm(selectedValues) {
    const labelMap = {
      ai_voice_bot: "🎙️ AI Voice Bot",
      ai_chatbot: "🤖 AI Chatbot",
      workflow_automation: "⚙️ Workflow Automation",
      crm_integration: "📊 CRM Integration",
      web_development: "🌐 Web / App Dev",
      ai_marketing: "📣 AI Marketing",
    };
    const summary = selectedValues.map((v) => labelMap[v] || v).join(", ");
    addMsg({ type: "user", text: summary });

    const updatedSession = { ...sessionData, selectedServices: selectedValues };
    setSessionData(updatedSession);

    sendToWebhook({
      step: "service",
      selectedServices: selectedValues,
      sessionId: sessionId.current,
      ...updatedSession,
      ...contactInfo,
    });
  }

  // ── CONTACT FORM SUBMIT ───────────────────────────────────────────────────
  // TIME: 0ms → user bubble shows email address
  // TIME: 0ms → webhook call with full contact info + session
  function handleContactSubmit(info) {
    setContactInfo(info);
    addMsg({ type: "user", text: `📧 ${info.email}` });
    sendToWebhook({
      step: "contact",
      sessionId: sessionId.current,
      ...info,
      ...sessionData,
    });
  }

  // ── OPEN CALENDLY OVERLAY ─────────────────────────────────────────────────
  // TIME: 0ms → overlay renders at translateY(100%) (off-screen)
  // TIME: ~16ms (rAF) → overlay transitions to translateY(0) (slides up, 0.35s)
  function openCalendly(url) {
    setCalUrl(url);
  }

  // ── CLOSE CALENDLY OVERLAY ────────────────────────────────────────────────
  function closeCalendly() {
    setCalUrl(null);
  }

  // ── BOOKING CONFIRMED ─────────────────────────────────────────────────────
  // Fired by CalendlyOverlay via postMessage listener.
  // TIME: 0ms  → overlay closes
  // TIME: 200ms → bot sends confirmation message
  // TIME: 800ms → BookingConfirmedCard appears
  // TIME: 800ms → confetti launches (32 dots, 1.6s animation)
  const handleBooked = useCallback((payload) => {
    closeCalendly();
    setProgress(100);
    setCurrentStep("booked");
    const name = contactInfo.name || "there";

    setTimeout(() => {
      addMsg({
        type: "bot",
        text: `✅ **Meeting Booked! You're all set, ${name}!**\n\nOur team at **Bitlance TechHub** is excited to speak with you. Check your email and WhatsApp for the confirmation & meeting link.`,
      });
    }, 200);

    setTimeout(() => {
      addMsg({ type: "bookingConfirmed", email: contactInfo.email });
      setConfetti(true);
    }, 800);
  }, [contactInfo, addMsg]);

  // ── TEXT INPUT SEND ───────────────────────────────────────────────────────
  function sendText() {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    addMsg({ type: "user", text });
    sendToWebhook({
      step: currentStep,
      message: text,
      sessionId: sessionId.current,
      ...sessionData,
      ...contactInfo,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🖼️  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── CSS keyframe animations injected once ── */}
      <style>{`
        :root {
          --cb-bubble-bottom: 28px;
          --cb-bubble-right: 28px;
          --cb-widget-bottom: 104px;
          --cb-widget-right: 28px;
          --cb-widget-width: 390px;
          --cb-widget-max-height: 625px;
        }
        @media (max-width: 480px) {
          :root {
            --cb-bubble-bottom: 20px;
            --cb-bubble-right: 20px;
            --cb-widget-bottom: 85px;
            --cb-widget-right: 15px;
            --cb-widget-width: calc(100% - 30px);
            --cb-widget-max-height: calc(100svh - 105px);
          }
        }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes bubbleIn   { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes pulse      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes msgIn      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce     { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes popIn      { from{transform:scale(0)} to{transform:scale(1)} }
        @keyframes confettiFall{ 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(180px) rotate(360deg);opacity:0} }
        .msg-anim   { animation: msgIn 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
        .btns-anim  { animation: msgIn 0.4s 0.1s cubic-bezier(0.34,1.3,0.64,1) both; }
        .bc-icon-anim { animation: popIn 0.5s 0.1s cubic-bezier(0.34,1.6,0.64,1) both; }
      `}</style>

      {/* ── BUBBLE BUTTON (bottom-right fixed) ── */}
      <button
        onClick={toggleWidget}
        aria-label="Open chat"
        style={{
          ...styles.bubble,
          animation: "bubbleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Green notification dot — hidden after first open */}
        {showNotif && <div style={styles.notifDot} />}

        {/* Chat icon (fades out when open) */}
        <svg style={{ ...styles.bubbleIcon, opacity: isOpen ? 0 : 1, transform: isOpen ? "scale(0.5) rotate(90deg)" : "scale(1)", transition: "all 0.3s" }}
          width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {/* Close ✕ icon (fades in when open) */}
        <svg style={{ ...styles.bubbleIcon, position: "absolute", opacity: isOpen ? 1 : 0, transform: isOpen ? "scale(1)" : "scale(0.5) rotate(-90deg)", transition: "all 0.3s" }}
          width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* ── CHAT WIDGET ── */}
      <div style={{
        ...styles.widget,
        // CSS transition: opacity + translateY animate open/close over 0.35s
        transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "all" : "none",
      }}>

        {/* Confetti layer (position:absolute inside widget) */}
        <Confetti active={confetti} />

        {/* ── HEADER ── */}
        <div style={styles.header}>
          <div style={styles.headerAvatar}>🤖</div>
          <div style={styles.headerInfo}>
            <strong style={styles.headerName}>Bitlance TechHub</strong>
            <span style={styles.headerSub}>
              <span style={styles.onlineDot} /> AI Assistant · Replies instantly
            </span>
          </div>
        </div>

        {/* ── PROGRESS BAR (advances with each step) ── */}
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* ── MESSAGE LIST ── */}
        <div style={styles.messages}>
          {messages.map((msg, i) => {
            if (msg.type === "bot") return (
              <div key={i} className="msg-anim" style={styles.msgRow}>
                <div style={styles.botAvatar}>🤖</div>
                <div style={styles.botBubble}><FormattedText text={msg.text} /></div>
              </div>
            );

            if (msg.type === "user") return (
              <div key={i} className="msg-anim" style={styles.userRow}>
                <div style={styles.userBubble}>{msg.text}</div>
              </div>
            );

            if (msg.type === "buttons") return (
              <div key={msg.id} className="btns-anim">
                <OptionButtons
                  buttons={msg.buttons}
                  isMulti={msg.isMulti}
                  confirmLabel={msg.confirmLabel}
                  onSingle={handleSingleClick}
                  onMultiConfirm={handleMultiConfirm}
                />
              </div>
            );

            if (msg.type === "contactForm") return (
              <div key={i} className="msg-anim">
                <ContactForm onSubmit={handleContactSubmit} />
              </div>
            );

            if (msg.type === "calendlyCTA") return (
              <div key={i} className="msg-anim">
                <CalendlyCTACard url={msg.url} message={msg.message} onOpen={openCalendly} />
              </div>
            );

            if (msg.type === "bookingConfirmed") return (
              <div key={i} className="msg-anim">
                <BookingConfirmedCard email={msg.email} />
              </div>
            );

            return null;
          })}

          {/* Typing indicator — shown during webhook call */}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── FOOTER TEXT INPUT ── */}
        <div style={styles.footer}>
          <input
            style={styles.footerInput}
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendText()}
          />
          <button style={styles.sendBtn} onClick={sendText} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={styles.poweredBy}>Powered by Bitlance TechHub · AI Lead Qualifier</div>

        {/* ── CALENDLY OVERLAY (slides up inside widget) ── */}
        {calUrl && (
          <CalendlyOverlay
            url={calUrl}
            onClose={closeCalendly}
            onBooked={handleBooked}
          />
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎨  STYLES  ─ all inline, matching original CSS variables exactly
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  brand: "#5B4FE8",
  brandDark: "#3D31CC",
  brandGlow: "rgba(91,79,232,0.35)",
  accent: "#00E5A0",
  bg: "#0C0B14",
  surface: "#141220",
  surface2: "#1D1A2F",
  border: "rgba(255,255,255,0.07)",
  text: "#F0EEF8",
  muted: "#7B78A0",
};

const styles = {
  // ── Bubble ──
  bubble: {
    position: "fixed", bottom: "var(--cb-bubble-bottom)", right: "var(--cb-bubble-right)",
    width: 62, height: 62, borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.brand}, ${C.brandDark})`,
    boxShadow: `0 8px 32px ${C.brandGlow}, 0 2px 8px rgba(0,0,0,0.4)`,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, border: "none",
  },
  bubbleIcon: { display: "flex", alignItems: "center", justifyContent: "center" },
  notifDot: {
    position: "absolute", top: 4, right: 4, width: 14, height: 14,
    background: C.accent, borderRadius: "50%", border: `2px solid ${C.bg}`,
    animation: "pulse 1.8s infinite",
  },
  // ── Widget ──
  widget: {
    position: "fixed", bottom: "var(--cb-widget-bottom)", right: "var(--cb-widget-right)",
    width: "var(--cb-widget-width)", maxHeight: "var(--cb-widget-max-height)",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 18,
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,79,232,0.1)",
    display: "flex", flexDirection: "column", zIndex: 9998, overflow: "hidden",
    transition: "transform 0.35s cubic-bezier(0.34,1.3,0.64,1), opacity 0.25s ease",
  },
  // ── Header ──
  header: {
    background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
    padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
    flexShrink: 0, position: "relative", overflow: "hidden",
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.2rem", border: "2px solid rgba(255,255,255,0.2)",
  },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", display: "block" },
  headerSub: { fontSize: "0.72rem", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, background: C.accent, borderRadius: "50%", animation: "pulse 2s infinite" },
  // ── Progress ──
  progressBg: { height: 3, background: "rgba(255,255,255,0.1)", flexShrink: 0 },
  progressFill: { height: "100%", background: `linear-gradient(90deg, ${C.accent}, #00c87a)`, transition: "width 0.6s ease" },
  // ── Messages ──
  messages: {
    flex: 1, overflowY: "auto", padding: "18px 16px 10px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  msgRow: { display: "flex", gap: 8, alignItems: "flex-end" },
  userRow: { display: "flex", flexDirection: "row-reverse", gap: 8, alignItems: "flex-end" },
  botAvatar: { width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.brand},${C.brandDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 },
  botBubble: { maxWidth: "82%", padding: "10px 14px", borderRadius: 16, borderBottomLeftRadius: 4, background: C.surface2, border: `1px solid ${C.border}`, fontSize: "0.875rem", lineHeight: 1.55, color: C.text, fontFamily: "DM Sans, sans-serif" },
  userBubble: { maxWidth: "82%", padding: "10px 14px", borderRadius: 16, borderBottomRightRadius: 4, background: `linear-gradient(135deg,${C.brand},${C.brandDark})`, fontSize: "0.875rem", lineHeight: 1.55, color: "#fff", fontFamily: "DM Sans, sans-serif" },
  // ── Typing dots ──
  typingDots: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, borderBottomLeftRadius: 4, padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: "50%", background: C.muted, display: "inline-block", animation: "bounce 1.2s infinite" },
  // ── Option buttons ──
  optionWrap: { display: "flex", flexDirection: "column", gap: 6 },
  optBtn: { background: "transparent", border: `1px solid rgba(91,79,232,0.35)`, color: "#c4c0f0", fontFamily: "DM Sans, sans-serif", fontSize: "0.83rem", padding: "9px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, transition: "all 0.15s" },
  optBtnSingle: {},
  optBtnMulti: { paddingRight: 40 },
  optBtnChecked: { background: "rgba(91,79,232,0.2)", borderColor: C.brand, color: "#fff" },
  checkbox: { width: 18, height: 18, border: `2px solid rgba(91,79,232,0.5)`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#fff", flexShrink: 0 },
  checkboxChecked: { background: C.brand, borderColor: C.brand },
  confirmBtn: { marginTop: 4, background: `linear-gradient(135deg,${C.brand},${C.brandDark})`, color: "#fff", fontFamily: "Syne, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "11px 18px", border: "none", borderRadius: 10, cursor: "pointer", width: "100%", opacity: 0.4, pointerEvents: "none", letterSpacing: "0.02em" },
  confirmBtnActive: { opacity: 1, pointerEvents: "all" },
  // ── Contact form ──
  contactForm: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 9 },
  cfInput: { background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", padding: "9px 12px", borderRadius: 9, outline: "none", width: "100%" },
  cfInputError: { borderColor: "#ff6b6b" },
  cfBtn: { background: `linear-gradient(135deg,${C.brand},${C.brandDark})`, color: "#fff", fontFamily: "Syne, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: 10, border: "none", borderRadius: 9, cursor: "pointer", letterSpacing: "0.02em" },
  // ── Calendly CTA ──
  ctaCard: { background: `linear-gradient(135deg,rgba(0,229,160,0.1),rgba(91,79,232,0.15))`, border: `1px solid rgba(0,229,160,0.3)`, borderRadius: 14, padding: 16, textAlign: "center" },
  ctaMsg: { fontSize: "0.82rem", color: C.muted, marginBottom: 11, lineHeight: 1.5, fontFamily: "DM Sans, sans-serif" },
  ctaBtn: { display: "inline-flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg,${C.accent},#00c87a)`, color: C.bg, fontFamily: "Syne, sans-serif", fontSize: "0.85rem", fontWeight: 700, padding: "11px 22px", borderRadius: 999, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,229,160,0.3)", letterSpacing: "0.02em" },
  // ── Calendly overlay ──
  calOverlay: { position: "absolute", inset: 0, zIndex: 100, background: C.surface, display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)" },
  calHeader: { background: `linear-gradient(135deg,${C.brandDark},${C.brand})`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  calHeaderTitle: { fontFamily: "Syne, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#fff" },
  calBackBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "0.8rem", fontWeight: 600, padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "DM Sans, sans-serif" },
  calLoading: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, position: "absolute", inset: "56px 0 0 0" },
  calSpinner: { width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.brand, animation: "spin 0.8s linear infinite" },
  calIframe: { flex: 1, width: "100%", border: "none", background: "#fff", minHeight: 0, transition: "opacity 0.3s" },
  // ── Booking confirmed ──
  bcCard: { background: "linear-gradient(135deg,rgba(0,229,160,0.12),rgba(91,79,232,0.18))", border: "1px solid rgba(0,229,160,0.35)", borderRadius: 16, padding: "22px 18px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  bcIcon: { fontSize: "2.2rem" },
  bcTitle: { fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 800, color: C.accent },
  bcSub: { fontSize: "0.82rem", color: C.muted, lineHeight: 1.5, fontFamily: "DM Sans, sans-serif" },
  bcLink: { marginTop: 6, display: "inline-block", border: "1px solid rgba(91,79,232,0.5)", color: "#a89fff", fontFamily: "Syne, sans-serif", fontSize: "0.8rem", fontWeight: 600, padding: "8px 18px", borderRadius: 999, textDecoration: "none" },
  // ── Footer ──
  footer: { padding: "12px 14px", borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 },
  footerInput: { flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 999, padding: "9px 16px", color: C.text, fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none" },
  sendBtn: { width: 38, height: 38, borderRadius: "50%", background: C.brand, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  poweredBy: { textAlign: "center", fontSize: "0.68rem", color: C.muted, padding: "5px 0 8px", opacity: 0.6, letterSpacing: "0.03em", fontFamily: "DM Sans, sans-serif" },
};
