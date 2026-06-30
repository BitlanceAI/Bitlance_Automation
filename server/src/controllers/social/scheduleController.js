import ScheduledPost from '../../models/social/ScheduledPost.js';
import { getAgenda } from '../../config/agenda.js';
import { JOB_NAME as PUBLISH_POST_JOB } from '../../jobs/social/publishPost.js';

// ── Helper: safely get agenda (may be disabled if no MONGODB_URI) ─────────────
const agenda = () => {
    try { return getAgenda(); } catch { return null; }
};

// ── Create & schedule a post ──────────────────────────────────────────────────

export const schedulePost = async (req, res) => {
    try {
        const userId      = req.user.id;
        const workspaceId = req.workspaceId || 'default_workspace';
        const {
            text, platforms, profileIds, scheduledAt,
            mediaUrl, mediaCategory, timezone, approverPhone
        } = req.body;

        if (!text || !platforms || !profileIds || !scheduledAt) {
            return res.status(400).json({ success: false, message: 'Missing required fields: text, platforms, profileIds, scheduledAt' });
        }

        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid scheduledAt date' });
        }

        const post = await ScheduledPost.create({
            userId,
            workspaceId,
            text,
            platforms,
            profile_ids:    profileIds,
            scheduled_at:   scheduledDate,
            timezone:       timezone || 'UTC',
            media_url:      mediaUrl   || null,
            media_category: mediaCategory || null,
            approver_phone: approverPhone || req.user?.user_metadata?.phone || null,
            status:         'pending_approval',
        });

        // Schedule Agenda job to fire at the post's scheduled time
        const ag = agenda();
        if (ag) {
            const job = await ag.schedule(scheduledDate, PUBLISH_POST_JOB, { postId: post._id.toString() });
            post.agenda_job_id = job.attrs._id.toString();
            await post.save();
        }

        // Send WhatsApp approval if phone present
        if (post.approver_phone) {
            try {
                const whatsappService = (await import('../../services/social/whatsappService.js')).default;
                const cleanText = post.text.replace(/[\n\t\r]/g, ' ').replace(/\s{2,}/g, ' ');
                const preview = `New Post Scheduled for ${scheduledDate.toLocaleString()}: "${cleanText}"`;
                const waResult = await whatsappService.sendApprovalTemplate(
                    userId, post.approver_phone, preview, post._id.toString(), post.media_url
                );
                if (waResult.success) {
                    post.whatsapp_message_id = waResult.messageId;
                    await post.save();
                } else {
                    console.warn('[ScheduleController] WhatsApp send failed:', waResult.error);
                }
            } catch (waErr) {
                console.warn('[ScheduleController] WhatsApp error:', waErr.message);
            }
        }

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        console.error('[ScheduleController] schedulePost:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get all scheduled posts ───────────────────────────────────────────────────

export const getScheduledPosts = async (req, res) => {
    try {
        const workspaceId = req.workspaceId || 'default_workspace';
        const { status } = req.query;

        const filter = { workspaceId };
        if (status) filter.status = status;

        const posts = await ScheduledPost.find(filter)
            .sort({ scheduled_at: 1 })
            .lean();

        res.json({ success: true, data: posts });
    } catch (err) {
        console.error('[ScheduleController] getScheduledPosts:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Cancel a post ─────────────────────────────────────────────────────────────

export const cancelScheduledPost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId || 'default_workspace';
        const { id } = req.params;

        const post = await ScheduledPost.findOneAndUpdate(
            { _id: id, workspaceId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Cancel the Agenda job so it doesn't fire
        const ag = agenda();
        if (ag && post.agenda_job_id) {
            await ag.cancel({ _id: post.agenda_job_id });
        }

        res.json({ success: true, data: post });
    } catch (err) {
        console.error('[ScheduleController] cancelScheduledPost:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Reschedule a post ─────────────────────────────────────────────────────────

export const reschedulePost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId || 'default_workspace';
        const { id } = req.params;
        const { scheduledAt, timezone } = req.body;

        if (!scheduledAt) return res.status(400).json({ success: false, message: 'scheduledAt is required' });

        const newDate = new Date(scheduledAt);
        if (isNaN(newDate.getTime())) return res.status(400).json({ success: false, message: 'Invalid date' });

        const post = await ScheduledPost.findOne({ _id: id, workspaceId });
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Cancel old Agenda job and create a new one at the new time
        const ag = agenda();
        if (ag) {
            if (post.agenda_job_id) await ag.cancel({ _id: post.agenda_job_id });
            const job = await ag.schedule(newDate, PUBLISH_POST_JOB, { postId: post._id.toString() });
            post.agenda_job_id = job.attrs._id.toString();
        }

        post.scheduled_at = newDate;
        post.timezone     = timezone || post.timezone;
        await post.save();

        res.json({ success: true, data: post });
    } catch (err) {
        console.error('[ScheduleController] reschedulePost:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Approve a post (marks it ready for Agenda to publish) ────────────────────

export const approvePost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId || 'default_workspace';
        const { id } = req.params;

        const post = await ScheduledPost.findOneAndUpdate(
            { _id: id, workspaceId, status: 'pending_approval' },
            { status: 'approved' },
            { new: true }
        );

        if (!post) return res.status(404).json({ success: false, message: 'Post not found or already processed' });

        res.json({ success: true, data: post });
    } catch (err) {
        console.error('[ScheduleController] approvePost:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Resend WhatsApp approval ──────────────────────────────────────────────────

export const resendApproval = async (req, res) => {
    try {
        const workspaceId = req.workspaceId || 'default_workspace';
        const { id } = req.params;

        const post = await ScheduledPost.findOne({ _id: id, workspaceId });
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (post.status !== 'pending_approval') {
            return res.status(400).json({ success: false, message: 'Post is not pending approval' });
        }
        if (!post.approver_phone) {
            return res.status(400).json({ success: false, message: 'No approver phone number' });
        }

        const whatsappService = (await import('../../services/social/whatsappService.js')).default;
        const cleanText = post.text.replace(/[\n\t\r]/g, ' ').replace(/\s{2,}/g, ' ');
        const preview = `New Post Scheduled for ${new Date(post.scheduled_at).toLocaleString()}: "${cleanText}"`;
        const waResult = await whatsappService.sendApprovalTemplate(
            req.user.id, post.approver_phone, preview, post._id.toString(), post.media_url
        );

        if (waResult.success) {
            post.whatsapp_message_id = waResult.messageId;
            await post.save();
            res.json({ success: true, message: 'Approval request resent' });
        } else {
            console.error('[ScheduleController] Resend failed:', waResult.error);
            res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
        }
    } catch (err) {
        console.error('[ScheduleController] resendApproval:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── AI optimal time suggestions (Gemini — no DB) ─────────────────────────────

export const suggestOptimalTimes = async (req, res) => {
    try {
        const { niche, platforms, timezone } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API key not configured' });
        }

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

        const prompt = `You are a social media expert. Suggest 3 optimal posting times for:
Niche: ${niche || 'General Business'}
Platforms: ${(platforms || []).join(', ')}
Timezone: ${timezone || 'UTC'}

Return ONLY a valid JSON array (no markdown):
[{ "timeSlot": "ISO_DATE", "label": "Friendly Label", "reason": "Brief reason" }]`;

        const result  = await model.generateContent(prompt);
        const text    = result.response.text().trim().replace(/```json|```/g, '').trim();
        const suggestions = JSON.parse(text);

        res.json({ success: true, data: suggestions });
    } catch (err) {
        console.error('[ScheduleController] suggestOptimalTimes:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
