import React, { useState } from 'react';
import { Mail, Search, CheckCircle2, Zap, Loader2, Send, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const EmailAutomationPage = () => {
    // Scraping Form
    const [scrapeForm, setScrapeForm] = useState({ genre: 'Technology', limit: 10 });
    const [scraping, setScraping] = useState(false);
    
    // Results
    const [scrapedLeads, setScrapedLeads] = useState([]);
    
    // Campaign Form
    const [campaignSubject, setCampaignSubject] = useState('Exclusive Partnership with {company}');
    const [campaignPrompt, setCampaignPrompt] = useState(
`Hi {first_name},

I noticed the amazing work {company} is doing in the {industry} sector.

We help companies like yours scale their operations efficiently. Let me know if you are open to a quick chat this week.

Best regards,
Bitlance Team`
    );
    const [sending, setSending] = useState(false);

    // ── Scrape CEOs ──────────────────────────────────────────────────────────
    const handleScrapeCeos = async (e) => {
        e.preventDefault();
        setScraping(true);
        setScrapedLeads([]);
        try {
            const res = await fetch(`http://localhost:8001/api/email-agent/scrape-ceos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scrapeForm),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Successfully scraped & verified ${data.data.length} emails!`);
                setScrapedLeads(data.data);
            } else {
                toast.error(data.detail || 'Scraping failed');
            }
        } catch { 
            toast.error('Cannot reach AI Agent server (make sure it is running on port 8001)'); 
        } finally { 
            setScraping(false); 
        }
    };

    // ── Export to Excel ──────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (scrapedLeads.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(scrapedLeads.map(lead => ({
            "Full Name": lead.full_name,
            "First Name": lead.first_name,
            "Company": lead.company,
            "Industry": lead.industry,
            "Email": lead.email
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CEOs");
        XLSX.writeFile(workbook, "Scraped_CEOs.xlsx");
        toast.success("Exported successfully!");
    };

    // ── Send Campaign ────────────────────────────────────────────────────────
    const handleSendCampaign = async (e) => {
        e.preventDefault();
        if (scrapedLeads.length === 0) {
            return toast.error('No verified emails to send to! Scrape some CEOs first.');
        }
        setSending(true);
        try {
            const res = await fetch(`http://localhost:8001/api/email-agent/send-campaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: scrapedLeads,
                    subject: campaignSubject,
                    html_content: campaignPrompt
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'Campaign sent successfully!');
                setScrapedLeads([]); // clear after sending
            } else {
                toast.error(data.detail || 'Failed to send campaign');
            }
        } catch { 
            toast.error('Cannot reach AI Agent server'); 
        } finally { 
            setSending(false); 
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-3">
                        <Mail className="text-[#26cece]" size={24} />
                        Email Campaign Console
                    </h2>
                    <p className="mt-1 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
                        Scrape targeted CEOs, verify emails, and launch personalized campaigns instantly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: SCRAPING */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2px] shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Search className="w-5 h-5 text-[#26cece]" />
                            <h2 className="text-[14px] font-bold text-slate-900 font-['Space_Grotesk'] tracking-widest uppercase">1. Find & Verify Target Audience</h2>
                        </div>
                        <form onSubmit={handleScrapeCeos} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">Genre / Industry</label>
                                <input type="text" value={scrapeForm.genre} required
                                    onChange={e => setScrapeForm(p => ({ ...p, genre: e.target.value }))}
                                    placeholder="e.g. Technology, Real Estate, Finance"
                                    className="w-full px-4 py-3 rounded-[2px] border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#26cece] transition-colors font-mono text-[13px] placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">Number of Emails to Scrape</label>
                                <input type="number" min="1" max="500" required value={scrapeForm.limit}
                                    onChange={e => setScrapeForm(p => ({ ...p, limit: parseInt(e.target.value) || 10 }))}
                                    placeholder="e.g. 50, 100"
                                    className="w-full px-4 py-3 rounded-[2px] border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#26cece] transition-colors font-mono text-[13px]"
                                />
                            </div>
                            <button type="submit" disabled={scraping}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-[2px] bg-[#26cece] text-white text-[12px] font-bold font-mono tracking-widest uppercase hover:bg-[#20afaf] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#333] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" fill="currentColor" />}
                                {scraping ? 'Scraping & Verifying...' : 'Scrape & Verify CEOs'}
                            </button>
                        </form>
                    </div>
                </div>

                    {/* RIGHT COLUMN: CAMPAIGN CONFIG */}
                    <div className="bg-white rounded-[2px] shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Send className="w-5 h-5 text-[#26cece]" />
                            <h2 className="text-[14px] font-bold text-slate-900 font-['Space_Grotesk'] tracking-widest uppercase">2. Compose & Launch Campaign</h2>
                        </div>
                        <form onSubmit={handleSendCampaign} className="flex-1 flex flex-col space-y-5">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">Email Subject</label>
                                <input type="text" value={campaignSubject} required
                                    onChange={e => setCampaignSubject(e.target.value)}
                                    placeholder="Subject line..."
                                    className="w-full px-4 py-3 rounded-[2px] border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#26cece] transition-colors font-mono text-[13px] placeholder:text-slate-400"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">Available tags: {'{first_name}'}, {'{company}'}, {'{industry}'}</p>
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">Email Body (Plain Text)</label>
                                <textarea required value={campaignPrompt}
                                    onChange={e => setCampaignPrompt(e.target.value)}
                                    className="w-full flex-1 min-h-[300px] px-4 py-3 rounded-[2px] border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#26cece] transition-colors font-mono text-[13px] resize-none leading-relaxed placeholder:text-slate-400"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">Available tags: {'{first_name}'}, {'{full_name}'}, {'{company}'}, {'{industry}'}</p>
                            </div>

                            <button type="submit" disabled={sending || scrapedLeads.length === 0}
                                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-[2px] bg-[#26cece] text-white text-[12px] font-bold font-mono tracking-widest uppercase hover:bg-[#20afaf] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" fill="currentColor" />}
                                {sending ? 'Deploying Campaign...' : 'Launch Campaign'}
                            </button>
                        </form>
                    </div>

                    {/* SCRAPED LEADS PREVIEW */}
                    {scrapedLeads.length > 0 && (
                        <div className="bg-white rounded-[2px] shadow-sm border border-slate-200 overflow-hidden col-span-1 lg:col-span-2 mt-6">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-[14px] font-bold text-slate-900 font-['Space_Grotesk'] tracking-widest uppercase">Verified Contacts</h2>
                                    <span className="px-2 py-1 rounded-[2px] bg-emerald-100 text-emerald-700 text-[10px] font-bold font-mono tracking-widest">
                                        {scrapedLeads.length} Found
                                    </span>
                                </div>
                                <button onClick={handleExportExcel}
                                    className="px-4 py-2 rounded-[2px] bg-white border border-slate-200 text-slate-600 text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                                    <Download className="w-4 h-4" /> Export CSV / Excel
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-200">
                                            <th className="px-6 py-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">CEO Name</th>
                                            <th className="px-6 py-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Company</th>
                                            <th className="px-6 py-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {scrapedLeads.map((lead, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-900 font-['Space_Grotesk']">{lead.full_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-700 text-sm font-sans">{lead.company}</span>
                                                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{lead.industry || scrapeForm.genre}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[#26cece] text-[12px] font-mono">{lead.email}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[2px] text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 inline-flex">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
        </div>
    );
};

export default EmailAutomationPage;
