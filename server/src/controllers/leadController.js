import { supabaseAdmin } from '../config/supabaseClient.js';
import axios from 'axios';
import { sendRemarketingEmail } from '../services/onesignalService.js';
import { PDF_DELIVERY_TEMPLATE, BOOKING_CONFIRMATION_TEMPLATE } from '../constants/emailTemplates.js';
import twilio from 'twilio';

// =============================================
// TWILIO HELPERS (WhatsApp)
// =============================================

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || process.env.FROM_NUMBER;

// Helper: Send WhatsApp Message via Twilio
const sendWhatsApp = async (to, message) => {
    if (!twilioClient) {
        console.warn('⚠️ Twilio config missing. Skipping WhatsApp message to:', to);
        return;
    }

    try {
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+91' + to}`;
        const formattedFrom = TWILIO_FROM.startsWith('whatsapp:') ? TWILIO_FROM : `whatsapp:${TWILIO_FROM}`;

        const response = await twilioClient.messages.create({
            body: message,
            from: formattedFrom,
            to: formattedTo
        });
        console.log(`✅ WhatsApp sent to ${formattedTo}. SID: ${response.sid}`);
    } catch (error) {
        console.error(`❌ Failed to send WhatsApp to ${to}:`, error.message);
    }
};

// Helper to convert "02:00 PM" -> "14:00" for Date generation
function convertTo24Hour(time12h) {
    if (!time12h) return "00:00";
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes}`;
}


// =============================================
// BOOK AUDIT CONTROLLER (WhatsApp + Email Nurture)
// =============================================
export const bookAudit = async (req, res) => {
    try {
        const { leadData, booking } = req.body;

        if (!leadData || !booking || !booking.date || !booking.time) {
            return res.status(400).json({ error: 'Missing lead or booking details.' });
        }

        const { name, email, whatsapp, revenue, lead_volume, marketing_spend, real_estate_type } = leadData;
        const auditDateTime = new Date(`${booking.date.split('T')[0]}T${convertTo24Hour(booking.time)}:00.000Z`);

        console.log(`\n📅 New AI Audit Booked by ${name} (${whatsapp}) for ${auditDateTime}`);

        // --- 1. IMMEDIATE ACTIONS ---

        // A) Send WhatsApp Confirmation
        const whatsappMsg = `Hi ${name}, your AI Growth Audit is confirmed for ${booking.time} on ${new Date(booking.date).toLocaleDateString()}. \n\nWe look forward to showing you how AI can reduce your CAC. Talk soon!`;
        await sendWhatsApp(whatsapp, whatsappMsg);

        // B) Send Email 1 (Confirmation)
        const email1Subject = 'Booking Confirmed: Your Real Estate AI Audit';
        const email1Html = `
            <h3>Hi ${name},</h3>
            <p>Your AI Growth Audit has been successfully scheduled.</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time} (IST)</p>
            <br/>
            <p>Please come prepared with your current lead costs and CRM metrics so we can dive straight into identifying automation opportunities.</p>
            <p>See you then!</p>
        `;
        await sendRemarketingEmail([email], email1Subject, email1Html);


        // --- 2. SCHEDULED NURTURE ACTIONS ---
        const now = new Date();
        const timeUntilAudit = auditDateTime.getTime() - now.getTime();

        // C) Schedule Email 2 (Case Study) -> 24 hours from now
        const delay24h = 24 * 60 * 60 * 1000;
        if (timeUntilAudit > delay24h) {
            console.log(`🕒 Scheduling Email 2 (Case Study) for ${name} in 24 hours...`);
            setTimeout(() => {
                const email2Subject = 'Case Study: How we dropped CAC by 40% for a luxury builder';
                const email2Html = `
                    <h3>Hi ${name},</h3>
                    <p>Before our call, I wanted to share a quick case study of how another Real Estate developer implemented AI voice agents to follow up with leads within 5 minutes, resulting in a 40% decrease in Customer Acquisition Cost.</p>
                    <p>[Link to PDF Case Study]</p>
                    <p>We'll discuss how similar strategies apply to your ${real_estate_type} projects.</p>
                `;
                sendRemarketingEmail([email], email2Subject, email2Html);
            }, delay24h);
        }

        // D) Schedule Email 3 (Reminder) -> 1 hour before audit
        const delay1hBefore = timeUntilAudit - (60 * 60 * 1000);
        if (delay1hBefore > 0) {
            console.log(`🕒 Scheduling Email 3 (Reminder) for ${name} at ${new Date(now.getTime() + delay1hBefore).toLocaleString()}...`);
            setTimeout(() => {
                const email3Subject = 'Reminder: Your AI Audit is in 1 hour';
                const email3Html = `
                    <h3>Hi ${name},</h3>
                    <p>Just a quick reminder that our AI Growth Audit is starting in exactly 1 hour.</p>
                    <p>Here's the link to join: [Zoom/Google Meet Link]</p>
                    <p>See you shortly!</p>
                `;
                sendRemarketingEmail([email], email3Subject, email3Html);
            }, delay1hBefore);
        }

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Booking confirmed and nurture sequence initiated.'
        });

    } catch (error) {
        console.error('Error booking audit:', error);
        return res.status(500).json({ error: 'Internal server error during booking.' });
    }
};


// =============================================
// SUPABASE LEAD MANAGEMENT CONTROLLERS
// =============================================

// @desc    Create a new lead (Landing Page submission)
// @route   POST /api/leads
// @access  Public
export const createLead = async (req, res) => {
    try {
        const {
            name, email, phone, businessType, monthlyBudget, readyToAutomate, action,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid, referrer
        } = req.body;

        let tag = 'New Lead';
        if (action === 'download') tag = 'Downloaded Guide';
        else if (action === 'book') tag = 'Booked Demo';
        else if (action === 'disqualified') tag = 'Not Eligible';
        else if (action === 'pending') tag = 'Audit Started';

        const insertData = {
            name,
            email,
            phone,
            business_type: businessType,
            monthly_budget: monthlyBudget,
            ready_to_automate: readyToAutomate,
            source: 'Meta Ad',
            tag,
            booked: action === 'book',
            reminder_sent: false,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            fbclid,
            referrer
        };

        // Manual Upsert: Check if lead exists by email
        const { data: existingLead } = await supabaseAdmin
            .from('leads')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        let lead, error;
        if (existingLead) {
            // Update existing record
            const { data, error: updateError } = await supabaseAdmin
                .from('leads')
                .update(insertData)
                .eq('id', existingLead.id)
                .select()
                .single();
            lead = data;
            error = updateError;
        } else {
            // Insert new record
            const { data, error: insertError } = await supabaseAdmin
                .from('leads')
                .insert([insertData])
                .select()
                .single();
            lead = data;
            error = insertError;
        }

        if (error) {
            console.error('Supabase save error:', error);
            return res.status(500).json({ success: false, message: 'Failed to save lead' });
        }

        // Trigger PDF Delivery Immediately if Path A (download)
        if (action === 'download') {
            try {
                await sendRemarketingEmail(
                    [email],
                    'Your CRM Automation Guide inside 📦',
                    PDF_DELIVERY_TEMPLATE(lead)
                );
            } catch (emailError) {
                console.error('Failed to send PDF delivery email:', emailError);
                // Don't crash lead creation if email fails
            }
        }

        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update lead to booked status
// @route   PUT /api/leads/:id/book
// @access  Public
export const markLeadAsBooked = async (req, res) => {
    try {
        const { eventUri } = req.body;
        let bookingStartTime = null;
        let bookingEndTime = null;

        // Optionally fetch exact times if Calendly URI provided
        if (eventUri && process.env.CALENDLY_PERSONAL_TOKEN) {
            try {
                const calendlyRes = await axios.get(eventUri, {
                    headers: { Authorization: `Bearer ${process.env.CALENDLY_PERSONAL_TOKEN}` }
                });
                if (calendlyRes.data.resource) {
                    bookingStartTime = new Date(calendlyRes.data.resource.start_time).toISOString();
                    bookingEndTime = new Date(calendlyRes.data.resource.end_time).toISOString();
                }
            } catch (fetchErr) {
                console.error("Failed to fetch Calendly event details:", fetchErr.message);
            }
        }

        const updates = { tag: 'Booked Demo', booked: true };
        if (bookingStartTime && bookingEndTime) {
            updates.booking_start_time = bookingStartTime;
            updates.booking_end_time = bookingEndTime;
        }

        const { data: lead, error } = await supabaseAdmin
            .from('leads')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Send booking confirmation email
        try {
            let formattedTime = null;
            if (bookingStartTime) {
                formattedTime = new Date(bookingStartTime).toLocaleString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                });
            }
            await sendRemarketingEmail(
                [lead.email],
                'Your Strategy Session is Confirmed! ✅',
                BOOKING_CONFIRMATION_TEMPLATE(lead.name, formattedTime)
            );
        } catch (emailError) {
            console.error('Failed to send booking confirmation email:', emailError);
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all leads (with filtering, search, pagination)
// @route   GET /api/leads
// @access  Private (Admin)
export const getLeads = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        // Filters
        if (req.query.tag) {
            const tags = req.query.tag.split(',');
            query = query.in('tag', tags);
        }
        if (req.query.monthlyBudget) {
            const budgets = req.query.monthlyBudget.split(',');
            query = query.in('monthly_budget', budgets);
        }
        if (req.query.businessType) {
            const types = req.query.businessType.split(',');
            query = query.in('business_type', types);
        }
        // Text search on name or email
        if (req.query.search) {
            query = query.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
        }

        const { data: leads, count, error } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch leads' });
        }

        res.status(200).json({
            success: true,
            count: leads.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            page,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Public
export const getLeadById = async (req, res) => {
    try {
        const { data: lead, error } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/leads/stats
// @access  Private (Admin)
export const getStats = async (req, res) => {
    try {
        // Total leads
        const { count: totalLeads, error: totalError } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        // Downloaded Guide count
        const { count: downloadedGuide, error: dlError } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('tag', 'Downloaded Guide');

        if (dlError) throw dlError;

        // Booked Demo count
        const { count: bookedDemo, error: bookError } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('tag', 'Booked Demo');

        if (bookError) throw bookError;

        // Calculate simple conversion rate (Booked / Total)
        const conversionRate = totalLeads === 0 ? 0 : ((bookedDemo / totalLeads) * 100).toFixed(2);

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                downloadedGuide,
                bookedDemo,
                conversionRate,
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Confirm booking via Calendly widget postMessage (finds lead by email)
// @route   POST /api/leads/confirm-booking
// @access  Public
export const confirmBooking = async (req, res) => {
    try {
        const { email, eventUri } = req.body;
        console.log('\n🔔 [confirmBooking] Called with:', { email, hasEventUri: !!eventUri, eventUri });

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        let bookingStartTime = null;
        let bookingEndTime = null;

        const hasToken = !!process.env.CALENDLY_PERSONAL_TOKEN;
        console.log(`[confirmBooking] CALENDLY_PERSONAL_TOKEN set: ${hasToken}`);

        // Try to fetch actual times from Calendly API using the event URI
        if (eventUri && hasToken) {
            console.log(`[confirmBooking] Fetching event from Calendly API: ${eventUri}`);
            try {
                const calendlyRes = await axios.get(eventUri, {
                    headers: { Authorization: `Bearer ${process.env.CALENDLY_PERSONAL_TOKEN}` }
                });
                console.log('[confirmBooking] Calendly API raw response keys:', Object.keys(calendlyRes.data || {}));
                const resource = calendlyRes.data.resource;
                if (resource) {
                    console.log('[confirmBooking] resource.start_time:', resource.start_time);
                    console.log('[confirmBooking] resource.end_time:', resource.end_time);
                    bookingStartTime = new Date(resource.start_time).toISOString();
                    bookingEndTime = new Date(resource.end_time).toISOString();
                    console.log(`📅 Times fetched — Start: ${bookingStartTime}, End: ${bookingEndTime}`);
                } else {
                    console.warn('[confirmBooking] calendlyRes.data.resource is null/undefined');
                }
            } catch (fetchErr) {
                console.error('[confirmBooking] Calendly API fetch failed:', fetchErr.message);
                console.error('[confirmBooking] API error status:', fetchErr.response?.status, fetchErr.response?.data);
            }
        } else {
            if (!eventUri) console.warn('[confirmBooking] No eventUri received from client');
            if (!hasToken) console.warn('[confirmBooking] CALENDLY_PERSONAL_TOKEN is not set — cannot fetch times');
        }

        // Build the update object — ONLY use columns that exist in your Supabase table
        const updates = {
            booked: true,
            tag: 'Booked Demo',
        };
        if (bookingStartTime) updates.booking_start_time = bookingStartTime;
        if (bookingEndTime) updates.booking_end_time = bookingEndTime;

        console.log('[confirmBooking] Supabase update payload:', JSON.stringify(updates));

        const { data: lead, error } = await supabaseAdmin
            .from('leads')
            .update(updates)
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.error('[confirmBooking] ❌ Supabase error:', JSON.stringify(error));
            return res.status(500).json({ success: false, message: 'Supabase error', error });
        }
        if (!lead) {
            console.warn('[confirmBooking] ⚠️ No lead found for email:', email);
            return res.status(404).json({ success: false, message: 'Lead not found for email: ' + email });
        }

        console.log(`[confirmBooking] ✅ Lead updated:`, {
            id: lead.id,
            email: lead.email,
            booked: lead.booked,
            booking_start_time: lead.booking_start_time,
            booking_end_time: lead.booking_end_time,
        });

        // Send confirmation email
        try {
            const formattedTime = bookingStartTime
                ? new Date(bookingStartTime).toLocaleString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                })
                : null;
            await sendRemarketingEmail(
                [lead.email],
                'Your Strategy Session is Confirmed! ✅',
                BOOKING_CONFIRMATION_TEMPLATE(lead.name, formattedTime)
            );
        } catch (emailError) {
            console.error('[confirmBooking] Failed to send confirmation email:', emailError.message);
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error('[confirmBooking] Unexpected error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Handle Calendly webhook for invitee.created
// @route   POST /api/leads/calendly
// @access  Public
export const handleCalendlyWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('Calendly Webhook Received:', JSON.stringify(event, null, 2));

        // Check if the event is a new booking
        if (event.event === "invitee.created") {
            const payload = event.payload;

            // Calendly v2 payload structure:
            // payload.email, payload.name — invitee contact info
            // payload.scheduled_event.start_time / end_time — the actual booking times
            const email = payload.email || payload.invitee?.email;
            const name = payload.name || payload.invitee?.name;

            // Extract start/end times — check all known Calendly payload locations
            const startTime =
                payload.scheduled_event?.start_time ||  // Calendly v2 (most common)
                payload.event?.start_time ||             // some embed variants
                payload.start_time ||                    // flat payload
                new Date().toISOString();

            const endTime =
                payload.scheduled_event?.end_time ||
                payload.event?.end_time ||
                payload.end_time ||
                new Date(Date.now() + 30 * 60000).toISOString();

            console.log(`📅 Booking times — Start: ${startTime}, End: ${endTime}, Email: ${email}`);

            // Update lead in Supabase
            const { data, error } = await supabaseAdmin
                .from('leads')
                .update({
                    booked: true,
                    tag: "Booked Demo",
                    booking_start_time: startTime,
                    booking_end_time: endTime
                })
                .eq('email', email)
                .select();

            if (error) {
                console.error("Supabase Update Error (Webhook):", error);
            } else {
                console.log(`✅ Lead updated via webhook: ${email}`, data?.[0]?.id);
            }
        }

        res.status(200).send("Webhook received");
    } catch (error) {
        console.error("Calendly Webhook Error:", error);
        res.status(500).send("Error processing webhook");
    }
};

// @desc    Track email link click — update lead record when user arrives via reminder email
// @route   POST /api/leads/track-click
// @access  Public
export const trackClick = async (req, res) => {
    try {
        const { email, name, phone, lid } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        console.log(`🔗 Email link clicked — email: ${email}, lid: ${lid}`);

        // Build update payload
        const updateData = {
            email_clicked: true,
            clicked_at: new Date().toISOString(),
            tag: 'Clicked Reminder', // upgrade stage
        };
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        // Find by ID if available, fallback by email
        let query = supabaseAdmin.from('leads').update(updateData).select();
        if (lid) {
            query = query.eq('id', lid);
        } else {
            query = query.eq('email', email);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ trackClick Supabase error:', error);
            // Still return success so client-side prefill works
        } else {
            console.log(`✅ Lead click tracked:`, data?.[0]?.id);
        }

        return res.status(200).json({ success: true, message: 'Click tracked' });
    } catch (error) {
        console.error('trackClick error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
