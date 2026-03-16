
(function() {
// Add CSS
const style = document.createElement('style');
style.innerHTML = '\n  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n\n  :root {\n    --brand:       #5B4FE8;\n    --brand-dark:  #3D31CC;\n    --brand-glow:  rgba(91,79,232,0.35);\n    --accent:      #00E5A0;\n    --bg:          #0C0B14;\n    --surface:     #141220;\n    --surface2:    #1D1A2F;\n    --border:      rgba(255,255,255,0.07);\n    --text:        #F0EEF8;\n    --muted:       #7B78A0;\n    --radius:      18px;\n    --widget-w:    390px;\n  }\n\n  \n\n  \n  \n  \n  \n  \n  \n\n  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }\n\n  /* ── BUBBLE ── */\n  #chat-bubble {\n    position: fixed; bottom: 28px; right: 28px;\n    width: 62px; height: 62px; border-radius: 50%;\n    background: linear-gradient(135deg, var(--brand), var(--brand-dark));\n    box-shadow: 0 8px 32px var(--brand-glow), 0 2px 8px rgba(0,0,0,0.4);\n    cursor: pointer; display: flex; align-items: center; justify-content: center;\n    z-index: 9999; border: none;\n    transition: transform 0.2s, box-shadow 0.2s;\n    animation: bubbleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;\n  }\n  #chat-bubble:hover { transform: scale(1.1); box-shadow: 0 12px 40px var(--brand-glow); }\n  #chat-bubble svg { transition: transform 0.3s, opacity 0.3s; }\n  #chat-bubble.open .icon-chat { opacity: 0; transform: scale(0.5) rotate(90deg); }\n  #chat-bubble.open .icon-close { opacity: 1; transform: scale(1) rotate(0deg); }\n  #chat-bubble .icon-close { position: absolute; opacity: 0; transform: scale(0.5) rotate(-90deg); }\n  .notif-dot { position: absolute; top: 4px; right: 4px; width: 14px; height: 14px; background: var(--accent); border-radius: 50%; border: 2px solid var(--bg); animation: pulse 1.8s infinite; }\n  @keyframes bubbleIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }\n\n  /* ── WIDGET ── */\n  #chat-widget {\n    position: fixed; bottom: 104px; right: 28px;\n    width: var(--widget-w); max-height: 640px;\n    background: var(--surface); border: 1px solid var(--border);\n    border-radius: var(--radius);\n    box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,79,232,0.1);\n    display: flex; flex-direction: column; z-index: 9998; overflow: hidden;\n    transform: translateY(20px) scale(0.95); opacity: 0; pointer-events: none;\n    transition: transform 0.35s cubic-bezier(0.34,1.3,0.64,1), opacity 0.25s ease;\n  }\n  #chat-widget.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }\n\n  /* Header */\n  .widget-header {\n    background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%);\n    padding: 16px 18px; display: flex; align-items: center; gap: 12px;\n    flex-shrink: 0; position: relative; overflow: hidden;\n  }\n  .widget-header::after { content:\'\'; position:absolute; right:-20px; top:-20px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.06); }\n  .header-avatar { width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;border:2px solid rgba(255,255,255,0.2); }\n  .header-info { flex:1; }\n  .header-info strong { font-family:\'Syne\',sans-serif;font-size:0.95rem;font-weight:700;display:block;color:#fff; }\n  .header-info span { font-size:0.72rem;color:rgba(255,255,255,0.7);display:flex;align-items:center;gap:5px; }\n  .online-dot { width:6px;height:6px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite; }\n\n  /* Progress */\n  .progress-bar { height:3px;background:rgba(255,255,255,0.1);flex-shrink:0; }\n  .progress-fill { height:100%;background:linear-gradient(90deg,var(--accent),#00c87a);width:0%;transition:width 0.6s ease; }\n\n  /* Messages */\n  .widget-messages { flex:1;overflow-y:auto;padding:18px 16px 10px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;scrollbar-color:var(--surface2) transparent; }\n  .widget-messages::-webkit-scrollbar { width:4px; }\n  .widget-messages::-webkit-scrollbar-thumb { background:var(--surface2);border-radius:4px; }\n\n  .msg { display:flex;gap:8px;align-items:flex-end;animation:msgIn 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }\n  @keyframes msgIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n  .msg.bot { flex-direction:row; }\n  .msg.user { flex-direction:row-reverse; }\n  .msg-avatar { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--brand),var(--brand-dark));display:flex;align-items:center;justify-content:center;font-size:0.75rem;flex-shrink:0; }\n  .msg-bubble { max-width:82%;padding:10px 14px;border-radius:16px;font-size:0.875rem;line-height:1.55; }\n  .msg.bot .msg-bubble { background:var(--surface2);border:1px solid var(--border);border-bottom-left-radius:4px;color:var(--text); }\n  .msg.user .msg-bubble { background:linear-gradient(135deg,var(--brand),var(--brand-dark));border-bottom-right-radius:4px;color:#fff; }\n  .msg-bubble strong { font-weight:600; }\n\n  /* Typing */\n  .typing-bubble { display:flex;gap:8px;align-items:flex-end; }\n  .typing-dots { background:var(--surface2);border:1px solid var(--border);border-radius:16px;border-bottom-left-radius:4px;padding:12px 16px;display:flex;gap:5px;align-items:center; }\n  .typing-dots span { width:7px;height:7px;border-radius:50%;background:var(--muted);animation:bounce 1.2s infinite; }\n  .typing-dots span:nth-child(2){animation-delay:0.15s}\n  .typing-dots span:nth-child(3){animation-delay:0.3s}\n  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }\n\n  /* ── MULTI-SELECT BUTTONS ── */\n  .multi-select-wrap { display:flex;flex-direction:column;gap:6px;animation:msgIn 0.4s 0.1s cubic-bezier(0.34,1.3,0.64,1) both; }\n\n  .btn-option {\n    background: transparent;\n    border: 1px solid rgba(91,79,232,0.35);\n    color: #c4c0f0;\n    font-family: \'DM Sans\', sans-serif;\n    font-size: 0.83rem;\n    padding: 9px 14px;\n    border-radius: 10px;\n    cursor: pointer;\n    text-align: left;\n    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.12s;\n    display: flex; align-items: center; justify-content: space-between; gap: 8px;\n    position: relative;\n  }\n  .btn-option:hover { background:rgba(91,79,232,0.15);border-color:var(--brand);color:#fff; }\n\n  /* Single-select style */\n  .btn-option.single:hover { transform: translateX(3px); }\n  .btn-option.single:active { transform:scale(0.97); }\n  .btn-option.single.selected { background:rgba(91,79,232,0.25);border-color:var(--brand);color:#fff;pointer-events:none; }\n\n  /* Multi-select style — checkbox feel */\n  .btn-option.multi { padding-right: 40px; }\n  .btn-option.multi::after {\n    content: \'\';\n    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);\n    width: 18px; height: 18px;\n    border: 2px solid rgba(91,79,232,0.5);\n    border-radius: 5px;\n    background: transparent;\n    transition: background 0.15s, border-color 0.15s;\n  }\n  .btn-option.multi.checked { background:rgba(91,79,232,0.2);border-color:var(--brand);color:#fff; }\n  .btn-option.multi.checked::after { background:var(--brand);border-color:var(--brand);background-image:url("data:image/svg+xml,%3Csvg width=\'12\' height=\'9\' viewBox=\'0 0 12 9\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 4L4.5 7.5L11 1\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center; }\n\n  /* Confirm button */\n  .confirm-btn {\n    margin-top: 4px;\n    background: linear-gradient(135deg, var(--brand), var(--brand-dark));\n    color: #fff;\n    font-family: \'Syne\', sans-serif;\n    font-size: 0.85rem;\n    font-weight: 700;\n    padding: 11px 18px;\n    border: none; border-radius: 10px;\n    cursor: pointer; width: 100%;\n    transition: opacity 0.2s, transform 0.15s;\n    letter-spacing: 0.02em;\n    opacity: 0.4;\n    pointer-events: none;\n  }\n  .confirm-btn.active { opacity: 1; pointer-events: all; }\n  .confirm-btn.active:hover { transform: translateY(-1px); opacity: 0.9; }\n\n  /* Contact form */\n  .contact-form { background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:9px;animation:msgIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both; }\n  .contact-form input { background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:\'DM Sans\',sans-serif;font-size:0.85rem;padding:9px 12px;border-radius:9px;outline:none;transition:border-color 0.2s;width:100%; }\n  .contact-form input:focus { border-color:var(--brand); }\n  .contact-form input::placeholder { color:var(--muted); }\n  .contact-form button { background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;font-family:\'Syne\',sans-serif;font-size:0.85rem;font-weight:700;padding:10px;border:none;border-radius:9px;cursor:pointer;transition:opacity 0.2s,transform 0.15s;letter-spacing:0.02em; }\n  .contact-form button:hover { opacity:0.9;transform:translateY(-1px); }\n\n  /* Calendly CTA */\n  .calendly-cta { background:linear-gradient(135deg,rgba(0,229,160,0.1),rgba(91,79,232,0.15));border:1px solid rgba(0,229,160,0.3);border-radius:14px;padding:16px;text-align:center;animation:msgIn 0.4s cubic-bezier(0.34,1.3,0.64,1) both; }\n  .calendly-cta p { font-size:0.82rem;color:var(--muted);margin-bottom:11px;line-height:1.5; }\n  .calendly-cta a { display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--accent),#00c87a);color:#0C0B14;font-family:\'Syne\',sans-serif;font-size:0.85rem;font-weight:700;padding:11px 22px;border-radius:999px;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 20px rgba(0,229,160,0.3);letter-spacing:0.02em; }\n  .calendly-cta a:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,229,160,0.4); }\n\n  /* ── Calendly open button ── */\n  .cal-open-btn {\n    display: inline-flex; align-items: center; gap: 7px;\n    background: linear-gradient(135deg, var(--accent), #00c87a);\n    color: #0C0B14; font-family: \'Syne\', sans-serif;\n    font-size: 0.85rem; font-weight: 700;\n    padding: 11px 22px; border-radius: 999px; border: none;\n    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;\n    box-shadow: 0 4px 20px rgba(0,229,160,0.3); letter-spacing: 0.02em;\n  }\n  .cal-open-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,229,160,0.4); }\n  .cal-spinner {\n    display: inline-block; width: 14px; height: 14px;\n    border: 2px solid rgba(0,0,0,0.3); border-top-color: #0C0B14;\n    border-radius: 50%; animation: spin 0.7s linear infinite;\n    vertical-align: middle;\n  }\n\n  /* ── Calendly overlay inside widget ── */\n  #cal-overlay {\n    position: absolute; inset: 0; z-index: 100;\n    background: var(--surface);\n    display: flex; flex-direction: column;\n    transform: translateY(100%);\n    transition: transform 0.35s cubic-bezier(0.32,0.72,0,1);\n    border-radius: var(--radius);\n    overflow: hidden;\n  }\n  #cal-overlay.visible { transform: translateY(0); }\n  .cal-overlay-header {\n    background: linear-gradient(135deg, var(--brand-dark), var(--brand));\n    padding: 14px 16px;\n    display: flex; align-items: center; justify-content: space-between;\n    flex-shrink: 0;\n  }\n  .cal-overlay-header span { font-family:\'Syne\',sans-serif; font-size:0.9rem; font-weight:700; color:#fff; }\n  .cal-overlay-header button {\n    background: rgba(255,255,255,0.15); border: none; color: #fff;\n    font-size: 0.8rem; font-weight: 600; padding: 5px 12px;\n    border-radius: 999px; cursor: pointer;\n    transition: background 0.15s; font-family:\'DM Sans\',sans-serif;\n  }\n  .cal-overlay-header button:hover { background: rgba(255,255,255,0.25); }\n  .cal-loading {\n    flex: 1; display: flex; flex-direction: column;\n    align-items: center; justify-content: center; gap: 14px;\n    color: var(--muted); font-size: 0.85rem; position: absolute;\n    inset: 56px 0 0 0; pointer-events: none;\n  }\n  .cal-loading-spinner {\n    width: 32px; height: 32px; border-radius: 50%;\n    border: 3px solid var(--border);\n    border-top-color: var(--brand);\n    animation: spin 0.8s linear infinite;\n  }\n  @keyframes spin { to { transform: rotate(360deg); } }\n  #calendly-iframe { flex: 1; width: 100%; border: none; background: #fff; min-height: 0; }\n\n  /* ── Booking confirmed card ── */\n  .booking-confirmed-card {\n    background: linear-gradient(135deg, rgba(0,229,160,0.12), rgba(91,79,232,0.18));\n    border: 1px solid rgba(0,229,160,0.35);\n    border-radius: 16px; padding: 22px 18px;\n    text-align: center; animation: msgIn 0.5s cubic-bezier(0.34,1.4,0.64,1) both;\n    display: flex; flex-direction: column; align-items: center; gap: 8px;\n  }\n  .bc-icon { font-size: 2.2rem; animation: popIn 0.5s cubic-bezier(0.34,1.6,0.64,1) both; }\n  @keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }\n  .bc-title { font-family: \'Syne\', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--accent); }\n  .bc-subtitle { font-size: 0.82rem; color: var(--muted); line-height: 1.5; }\n  .bc-subtitle strong { color: var(--text); }\n  .bc-btn-outline {\n    margin-top: 6px; display: inline-block;\n    border: 1px solid rgba(91,79,232,0.5); color: #a89fff;\n    font-family: \'Syne\', sans-serif; font-size: 0.8rem; font-weight: 600;\n    padding: 8px 18px; border-radius: 999px; text-decoration: none;\n    transition: background 0.15s, color 0.15s;\n  }\n  .bc-btn-outline:hover { background: rgba(91,79,232,0.2); color: #fff; }\n\n  /* ── Confetti dots ── */\n  .confetti-dot {\n    position: absolute; top: 30%; border-radius: 2px;\n    pointer-events: none; z-index: 99999;\n    animation: confettiFall linear both;\n  }\n  @keyframes confettiFall {\n    0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }\n    100% { transform: translateY(180px) rotate(360deg); opacity: 0; }\n  }\n\n  /* Footer */\n  .widget-footer { padding:12px 14px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0;display:flex;align-items:center;gap:8px; }\n  .footer-input { flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:9px 16px;color:var(--text);font-family:\'DM Sans\',sans-serif;font-size:0.85rem;outline:none;transition:border-color 0.2s; }\n  .footer-input:focus { border-color:var(--brand); }\n  .footer-input::placeholder { color:var(--muted); }\n  .footer-send { width:38px;height:38px;border-radius:50%;background:var(--brand);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s,transform 0.15s;flex-shrink:0; }\n  .footer-send:hover { background:var(--brand-dark);transform:scale(1.05); }\n  .powered-by { text-align:center;font-size:0.68rem;color:var(--muted);padding:5px 0 8px;opacity:0.6;letter-spacing:0.03em; }\n\n  @media (max-width: 440px) {\n    :root { --widget-w: calc(100vw - 24px); }\n    #chat-widget { right:12px;bottom:96px; }\n    #chat-bubble { right:16px;bottom:20px; }\n  }\n';
document.head.appendChild(style);

// Add HTML
const container = document.createElement('div');
container.innerHTML = '<!-- CHAT BUBBLE -->\n\n<button id="chat-bubble" onclick="toggleWidget()" aria-label="Open chat">\n  <div class="notif-dot"></div>\n  <svg class="icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\n  <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\n</button>\n\n\n<!-- CHAT WIDGET -->\n\n<div id="chat-widget">\n  <div class="widget-header">\n    <div class="header-avatar">🤖</div>\n    <div class="header-info">\n      <strong>Bitlance TechHub</strong>\n      <span><span class="online-dot"></span> AI Assistant · Replies instantly</span>\n    </div>\n  </div>\n  <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>\n  <div class="widget-messages" id="messages"></div>\n  <div class="widget-footer">\n    <input class="footer-input" id="footer-input" type="text" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\')sendText()"/>\n    <button class="footer-send" onclick="sendText()" aria-label="Send">\n      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>\n    </button>\n  </div>\n  <div class="powered-by">Powered by Bitlance TechHub · AI Lead Qualifier</div>\n</div>\n\n';
document.body.appendChild(container);

// Run Logic
// ── CONFIG ───────────────────────────────────────────────────────────────
const WEBHOOK_URL  = 'https://bitlancetechhub.app.n8n.cloud/webhook/lead-chatbot';
const CALENDLY_URL = 'https://calendly.com/YOUR_CALENDLY_LINK'; // ← Replace
const SESSION_ID   = 'session_' + Math.random().toString(36).substr(2, 9);

// ── STATE ────────────────────────────────────────────────────────────────
let isOpen = false, hasOpened = false;
let currentStep = 'welcome';
let selectedServices = [];   // multi-select array
let sessionData = {};
let contactInfo = { name: '', email: '', phone: '' };

const progressMap = { welcome:5, service:22, role:44, budget:66, timeline:85, contact:95, booked:100, end:100 };

// ── TOGGLE ───────────────────────────────────────────────────────────────
function toggleWidget() {
  isOpen = !isOpen;
  document.getElementById('chat-widget').classList.toggle('open', isOpen);
  document.getElementById('chat-bubble').classList.toggle('open', isOpen);
  if (isOpen && !hasOpened) {
    hasOpened = true;
    const dot = document.querySelector('.notif-dot');
    if (dot) { dot.style.animation='none'; setTimeout(()=>dot.remove(),300); }
    setTimeout(() => startConversation(), 400);
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────
function setProgress(step) {
  document.getElementById('progress-fill').style.width = (progressMap[step]||0) + '%';
}
function scrollToBottom() {
  const el = document.getElementById('messages');
  setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 80);
}
function fmt(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g,'<br/>');
}

// ── ADD MESSAGES ─────────────────────────────────────────────────────────
function addBotMessage(text, delay=0) {
  return new Promise(resolve => setTimeout(() => {
    const msgs = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble">${fmt(text)}</div>`;
    msgs.appendChild(div); scrollToBottom(); resolve();
  }, delay));
}
function addUserMessage(text) {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  msgs.appendChild(div); scrollToBottom();
}
function showTyping() {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'typing-bubble'; div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div); scrollToBottom();
}
function removeTyping() { const t=document.getElementById('typing-indicator'); if(t) t.remove(); }

// ── RENDER BUTTONS ───────────────────────────────────────────────────────
function addButtons(buttons, isMulti = false, confirmLabel = '✅ Continue') {
  const msgs = document.getElementById('messages');
  const wrap = document.createElement('div');
  wrap.className = 'multi-select-wrap';
  wrap.id = 'btn-options';

  if (isMulti) {
    // Multi-select: checkboxes + confirm button
    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'btn-option multi';
      b.textContent = btn.label;
      b.dataset.value = btn.value;
      b.dataset.step = btn.step;
      b.onclick = () => toggleMultiSelect(b, btn, confirmBtn);
      wrap.appendChild(b);
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirm-btn';
    confirmBtn.textContent = confirmLabel;
    confirmBtn.onclick = () => submitMultiSelect(buttons[0].step, wrap, confirmBtn);
    wrap.appendChild(confirmBtn);
  } else {
    // Single-select: normal buttons
    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'btn-option single';
      b.textContent = btn.label;
      b.onclick = () => handleSingleClick(btn, wrap);
      wrap.appendChild(b);
    });
  }

  msgs.appendChild(wrap); scrollToBottom();
}

function toggleMultiSelect(btn, data, confirmBtn) {
  const val = btn.dataset.value;
  if (btn.classList.contains('checked')) {
    btn.classList.remove('checked');
    selectedServices = selectedServices.filter(s => s !== val);
  } else {
    btn.classList.add('checked');
    selectedServices.push(val);
  }
  // Enable confirm button only when at least 1 selected
  if (selectedServices.length > 0) {
    confirmBtn.classList.add('active');
    confirmBtn.textContent = `✅ Continue with ${selectedServices.length} selected`;
  } else {
    confirmBtn.classList.remove('active');
    confirmBtn.textContent = '✅ Continue';
  }
}

function submitMultiSelect(nextStep, wrap, confirmBtn) {
  if (selectedServices.length === 0) return;

  // Disable all
  wrap.querySelectorAll('.btn-option').forEach(b => b.style.pointerEvents='none');
  confirmBtn.style.pointerEvents = 'none';
  confirmBtn.textContent = '✓ Submitted';

  // Show user summary
  const serviceLabels = {
    ai_voice_bot:'🎙️ AI Voice Bot', ai_chatbot:'🤖 AI Chatbot', workflow_automation:'⚙️ Workflow Automation',
    crm_integration:'📊 CRM Integration', web_development:'🌐 Web / App Dev', ai_marketing:'📣 AI Marketing'
  };
  const summary = selectedServices.map(s => serviceLabels[s]||s).join(', ');
  addUserMessage(summary);

  sessionData.selectedServices = [...selectedServices];

  sendToWebhook({
    step: nextStep,
    selectedServices: [...selectedServices],
    selectedRole:     sessionData.selectedRole     || '',
    selectedBudget:   sessionData.selectedBudget   || '',
    selectedTimeline: sessionData.selectedTimeline || '',
    sessionId: SESSION_ID,
    ...contactInfo
  });
}

function handleSingleClick(btn, wrap) {
  wrap.querySelectorAll('.btn-option').forEach(b => { b.disabled=true; });
  const clicked = Array.from(wrap.querySelectorAll('.btn-option')).find(b=>b.textContent===btn.label);
  if (clicked) clicked.classList.add('selected');
  addUserMessage(btn.label);

  // Store the button value in sessionData keyed by the step it belongs to
  if (btn.step === 'role')     sessionData.selectedRole     = btn.value;
  if (btn.step === 'budget')   sessionData.selectedBudget   = btn.value;
  if (btn.step === 'timeline') sessionData.selectedTimeline = btn.value;

  sendToWebhook({
    step: btn.step,
    buttonValue: btn.value,
    sessionId: SESSION_ID,
    // ── always send full session state ──
    selectedServices: sessionData.selectedServices || [],
    selectedRole:     sessionData.selectedRole     || '',
    selectedBudget:   sessionData.selectedBudget   || '',
    selectedTimeline: sessionData.selectedTimeline || '',
    ...contactInfo
  });
}

// ── CONTACT FORM ─────────────────────────────────────────────────────────
function addContactForm() {
  const msgs = document.getElementById('messages');
  const form = document.createElement('div');
  form.className = 'contact-form'; form.id = 'contact-form';
  form.innerHTML = `
    <input id="cf-name"  type="text"  placeholder="Your full name *" required/>
    <input id="cf-email" type="email" placeholder="Email address *"  required/>
    <input id="cf-phone" type="tel"   placeholder="WhatsApp number (e.g. +91...)"/>
    <button onclick="submitContact()">🚀 Book My Free Strategy Call</button>
  `;
  msgs.appendChild(form); scrollToBottom();
}

function submitContact() {
  const name  = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  if (!name||!email) {
    document.getElementById('cf-name').style.borderColor  = !name  ? '#ff6b6b':'';
    document.getElementById('cf-email').style.borderColor = !email ? '#ff6b6b':'';
    return;
  }
  contactInfo = { name, email, phone };
  const form = document.getElementById('contact-form');
  if (form) form.remove();
  addUserMessage(`📧 ${email}`);
  sendToWebhook({
    step: 'contact',
    sessionId: SESSION_ID,
    name, email, phone,
    selectedServices: sessionData.selectedServices || [],
    selectedRole:     sessionData.selectedRole     || '',
    selectedBudget:   sessionData.selectedBudget   || '',
    selectedTimeline: sessionData.selectedTimeline || ''
  });
}

// ── CALENDLY CTA + INLINE EMBED ──────────────────────────────────────────
function addCalendlyCTA(url, message) {
  const msgs = document.getElementById('messages');
  const cta = document.createElement('div');
  cta.className = 'calendly-cta';
  cta.id = 'calendly-cta-card';
  cta.innerHTML = `
    <p>${message||"Pick a time that works for you — it's completely free!"}</p>
    <button class="cal-open-btn" onclick="openCalendlyEmbed('${url}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Schedule My Free Call
    </button>
  `;
  msgs.appendChild(cta);
  scrollToBottom();
  initCalendlyListener();
}

function openCalendlyEmbed(url) {
  // Mark button as active
  const btn = document.querySelector('.cal-open-btn');
  if (btn) { btn.innerHTML = '<span class="cal-spinner"></span> Loading calendar...'; btn.style.opacity='0.7'; btn.style.pointerEvents='none'; }

  // Build embed URL
  const embedUrl = url + (url.includes('?') ? '&' : '?') + 'embed_domain=' + encodeURIComponent(location.hostname || 'bitlancetechhub.com') + '&embed_type=inline&hide_landing_page_details=1&hide_gdpr_banner=1';

  // Create overlay INSIDE the widget
  const widget = document.getElementById('chat-widget');
  const existing = document.getElementById('cal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cal-overlay';
  overlay.innerHTML = `
    <div class="cal-overlay-header">
      <span>📅 Book Your Free Strategy Call</span>
      <button onclick="closeCalendlyEmbed()" title="Go back">← Back</button>
    </div>
    <div class="cal-loading" id="cal-loading">
      <div class="cal-loading-spinner"></div>
      <p>Loading calendar...</p>
    </div>
    <iframe
      id="calendly-iframe"
      src="${embedUrl}"
      frameborder="0"
      style="opacity:0;transition:opacity 0.3s"
      onload="this.style.opacity='1'; document.getElementById('cal-loading').style.display='none';"
    ></iframe>
  `;
  widget.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

function closeCalendlyEmbed() {
  const overlay = document.getElementById('cal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => overlay.remove(), 300);
  // Restore button
  const btn = document.querySelector('.cal-open-btn');
  if (btn) {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Schedule My Free Call`;
    btn.style.opacity='1'; btn.style.pointerEvents='all';
  }
}

// ── Calendly postMessage listener ────────────────────────────────────────
let calendlyListenerAttached = false;
function initCalendlyListener() {
  if (calendlyListenerAttached) return;
  calendlyListenerAttached = true;

  window.addEventListener('message', function(e) {
    // Calendly fires these events via postMessage
    if (!e.data || typeof e.data !== 'object') return;
    const eventName = e.data.event || e.data.type || '';

    // "calendly.event_scheduled" fires when booking is confirmed
    if (eventName === 'calendly.event_scheduled' || eventName === 'event_scheduled') {
      handleBookingConfirmed(e.data.payload || e.data);
    }
    // Also catch legacy string events
    if (typeof e.data === 'string' && e.data.includes('event_scheduled')) {
      handleBookingConfirmed({});
    }
  });
}

// ── BOOKING CONFIRMED HANDLER ─────────────────────────────────────────────
function handleBookingConfirmed(payload) {
  closeCalendlyEmbed();
  const cta = document.getElementById('calendly-cta-card');
  if (cta) cta.style.display = 'none';
  setProgress('booked');
  currentStep = 'booked';
  const name = contactInfo.name || 'there';
  setTimeout(() => {
    addBotMessage(`✅ **Meeting Booked! You're all set, ${name}!**\n\nOur team at **Bitlance TechHub** is excited to speak with you. Check your email and WhatsApp for the confirmation & meeting link.`);
  }, 200);
  setTimeout(() => {
    const msgs = document.getElementById('messages');
    const card = document.createElement('div');
    card.className = 'booking-confirmed-card';
    card.innerHTML = `
      <div class="bc-icon">🎉</div>
      <div class="bc-title">Meeting Confirmed!</div>
      <div class="bc-subtitle">Confirmation sent to<br/><strong>${contactInfo.email || 'your email'}</strong></div>
      <a href="https://www.bitlancetechhub.com" target="_blank" class="bc-btn-outline">Visit Our Website →</a>
    `;
    msgs.appendChild(card);
    launchConfetti();
    scrollToBottom();
  }, 800);
}

function launchConfetti() {
  const colors = ['#5B4FE8','#00E5A0','#fff','#a89fff','#00c87a'];
  const widget = document.getElementById('chat-widget');
  for (let i = 0; i < 32; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.cssText = `left:${20+Math.random()*60}%;background:${colors[Math.floor(Math.random()*colors.length)]};width:${5+Math.random()*6}px;height:${5+Math.random()*6}px;animation-delay:${Math.random()*0.5}s;animation-duration:${0.8+Math.random()*0.6}s;`;
    widget.appendChild(dot);
    setTimeout(() => dot.remove(), 1600);
  }
}

// ── TEXT INPUT ────────────────────────────────────────────────────────────
function sendText() {
  const input = document.getElementById('footer-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  sendToWebhook({ step:currentStep, message:text, sessionId:SESSION_ID, ...sessionData, ...contactInfo });
}

// ── START ─────────────────────────────────────────────────────────────────
function startConversation() {
  sendToWebhook({ step:'welcome', message:'hi', sessionId:SESSION_ID });
}

// ── SEND TO WEBHOOK ───────────────────────────────────────────────────────
async function sendToWebhook(payload) {
  showTyping(); setProgress(payload.step);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    });
    removeTyping();
    if (!res.ok) throw new Error('HTTP '+res.status);
    handleResponse(await res.json());
  } catch(err) {
    removeTyping();
    console.error('Webhook error:', err);
    handleLocalFallback(payload);
  }
}

// ── HANDLE RESPONSE ───────────────────────────────────────────────────────
function handleResponse(data) {
  currentStep = data.nextStep || currentStep;
  // Store any session data the backend echoes back
  if (data.selectedServices) sessionData.selectedServices = data.selectedServices;
  if (data.selectedRole)     sessionData.selectedRole     = data.selectedRole;
  if (data.selectedBudget)   sessionData.selectedBudget   = data.selectedBudget;
  if (data.selectedTimeline) sessionData.selectedTimeline = data.selectedTimeline;
  setProgress(currentStep);
  if (data.response) addBotMessage(data.response);
  if (data.buttons && data.buttons.length > 0) {
    setTimeout(() => addButtons(data.buttons, data.multiSelect||false, data.confirmButtonLabel), 300);
  }
  if (data.showContactForm)  setTimeout(() => addContactForm(), 400);
  if (data.showCalendly)     setTimeout(() => addCalendlyCTA(data.calendlyUrl||CALENDLY_URL, data.calendlyMessage), 400);
}

// ── LOCAL FALLBACK ────────────────────────────────────────────────────────
function handleLocalFallback(payload) {
  const step = payload.step;
  const flows = {
    welcome: {
      response: "👋 Welcome to **Bitlance TechHub**!\n\nWe build AI Voice Bots & Business Automation solutions. Let's find how we can help — just **4 quick steps**!\n\nWhich services are you interested in? *(Select all that apply)*",
      nextStep: 'service', multiSelect: true, confirmButtonLabel: '✅ Continue with selected',
      buttons: [
        { label:'🎙️ AI Voice Bot',          value:'ai_voice_bot',        step:'service' },
        { label:'🤖 AI Chatbot / Lead Bot',  value:'ai_chatbot',          step:'service' },
        { label:'⚙️ Workflow Automation',    value:'workflow_automation', step:'service' },
        { label:'📊 CRM Integration',        value:'crm_integration',     step:'service' },
        { label:'🌐 Web / App Development',  value:'web_development',     step:'service' },
        { label:'📣 AI Marketing Automation',value:'ai_marketing',        step:'service' }
      ]
    },
    service: {
      response: `Excellent choices! 💪 We specialise in all of that.\n\nNow, what best describes your role?`,
      nextStep:'role',
      buttons:[
        { label:'👔 Business Owner / Founder',        value:'owner',          step:'role' },
        { label:'📈 Sales / Marketing Manager',        value:'sales_marketing',step:'role' },
        { label:'💻 CTO / Tech Lead',                  value:'tech_lead',      step:'role' },
        { label:'🏢 Enterprise / Corp Decision Maker', value:'enterprise',     step:'role' }
      ]
    },
    role: {
      response:"What's your approximate project budget?", nextStep:'budget',
      buttons:[
        { label:'💵 Under $500',      value:'under_500',   step:'budget' },
        { label:'💰 $500 – $2,000',   value:'500_2000',    step:'budget' },
        { label:'💎 $2,000 – $10,000',value:'2000_10000',  step:'budget' },
        { label:'🏦 $10,000+',        value:'10000_plus',  step:'budget' }
      ]
    },
    budget: {
      response:"Almost there! 🎯 When are you looking to get started?", nextStep:'timeline',
      buttons:[
        { label:'🔥 ASAP – Within 1 week', value:'asap',       step:'timeline' },
        { label:'📅 This Month',            value:'this_month', step:'timeline' },
        { label:'🗓️ Next 1–3 Months',      value:'1_3_months', step:'timeline' },
        { label:'🔮 Just Exploring',        value:'exploring',  step:'timeline' }
      ]
    },
    timeline: {
      response:"🎉 You're a great fit for **Bitlance TechHub**!\n\nShare your contact details and we'll book a strategy call for you.",
      nextStep:'contact', showContactForm:true
    },
    contact: {
      response:`Hi **${payload.name||'there'}**! 🙌 You're all set!\n\nClick below to pick a time — our team will show you a live demo and outline a custom solution.`,
      nextStep:'booked', showCalendly:true, calendlyUrl:CALENDLY_URL
    }
  };

  const flow = flows[step];
  if (!flow) return;
  currentStep = flow.nextStep;
  setProgress(currentStep);
  addBotMessage(flow.response);
  if (flow.buttons)         setTimeout(()=>addButtons(flow.buttons, flow.multiSelect||false, flow.confirmButtonLabel), 300);
  if (flow.showContactForm) setTimeout(()=>addContactForm(), 400);
  if (flow.showCalendly)    setTimeout(()=>addCalendlyCTA(flow.calendlyUrl, null), 400);
}

// Expose functions globally

window.toggleWidget = toggleWidget;

window.sendText = sendText;

window.submitContact = submitContact;

window.openCalendlyEmbed = openCalendlyEmbed;

window.closeCalendlyEmbed = closeCalendlyEmbed;

window.toggleMultiSelect = toggleMultiSelect;

window.submitMultiSelect = submitMultiSelect;

window.handleSingleClick = handleSingleClick;

})();
