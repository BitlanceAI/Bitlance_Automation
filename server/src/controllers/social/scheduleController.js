import { supabase } from '../../config/supabaseClient.js';
import axios from 'axios';

// Create a new scheduled post
export const schedulePost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId; // From auth middleware
        const userId = req.user.id;
        const { text, platforms, profileIds, scheduledAt, mediaUrl, mediaCategory, timezone } = req.body;

        if (!text || !platforms || !profileIds || !scheduledAt) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('scheduled_social_posts')
            .insert({
                workspace_id: workspaceId,
                user_id: userId,
                text,
                platforms,
                profile_ids: profileIds,
                scheduled_at: scheduledAt,
                timezone: timezone || 'UTC',
                media_url: mediaUrl,
                media_category: mediaCategory,
                status: 'pending_approval',
                approver_phone: req.body.approverPhone || req.user?.user_metadata?.phone // default to user phone
            })
            .select()
            .single();

        if (error) throw error;

        // Trigger WhatsApp Approval Request
        if (data.approver_phone) {
            const whatsappService = (await import('../../services/social/whatsappService.js')).default;
            const cleanText = data.text.replace(/[\n\t\r]/g, ' ').replace(/\s{2,}/g, ' ');
            const preview = `New Post Scheduled for ${new Date(data.scheduled_at).toLocaleString()}: "${cleanText}"`;
            const waResult = await whatsappService.sendApprovalTemplate(userId, data.approver_phone, preview, data.id, data.media_url);
            
            if (waResult.success) {
                await supabase.from('scheduled_social_posts').update({ whatsapp_message_id: waResult.messageId }).eq('id', data.id);
            } else {
                console.warn('[ScheduleController] Failed to send WhatsApp approval:', waResult.error);
            }
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('[ScheduleController] Error scheduling post:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all scheduled posts for a workspace
export const getScheduledPosts = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;

        const { data, error } = await supabase
            .from('scheduled_social_posts')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[ScheduleController] Error fetching scheduled posts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel a scheduled post
export const cancelScheduledPost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('scheduled_social_posts')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[ScheduleController] Error cancelling post:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reschedule a post
export const reschedulePost = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;
        const { scheduledAt, timezone } = req.body;

        if (!scheduledAt) {
            return res.status(400).json({ success: false, message: 'Missing scheduledAt field' });
        }

        const { data, error } = await supabase
            .from('scheduled_social_posts')
            .update({ 
                scheduled_at: scheduledAt, 
                timezone: timezone || 'UTC',
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[ScheduleController] Error rescheduling post:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Resend WhatsApp Approval
export const resendApproval = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('scheduled_social_posts')
            .select('*')
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, message: 'Post not found' });

        if (data.status !== 'pending_approval') {
            return res.status(400).json({ success: false, message: 'Post is not in pending_approval status' });
        }

        if (!data.approver_phone) {
            return res.status(400).json({ success: false, message: 'No approver phone number found' });
        }

        console.log(`[ScheduleController] Resending WhatsApp approval for post ${id} to ${data.approver_phone}`);

        const whatsappService = (await import('../../services/social/whatsappService.js')).default;
        const cleanText = data.text.replace(/[\n\t\r]/g, ' ').replace(/\s{2,}/g, ' ');
        const preview = `New Post Scheduled for ${new Date(data.scheduled_at).toLocaleString()}: "${cleanText}"`;
        const waResult = await whatsappService.sendApprovalTemplate(req.user.id, data.approver_phone, preview, data.id, data.media_url);
        
        if (waResult.success) {
            await supabase.from('scheduled_social_posts').update({ whatsapp_message_id: waResult.messageId }).eq('id', data.id);
            res.status(200).json({ success: true, message: 'Approval request resent successfully' });
        } else {
            console.error('[ScheduleController] Failed to resend WhatsApp approval:', waResult.error);
            res.status(500).json({ success: false, message: 'Failed to send WhatsApp message', error: waResult.error });
        }
    } catch (error) {
        console.error('[ScheduleController] Error resending approval:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get AI optimal time suggestions
export const suggestOptimalTimes = async (req, res) => {
    try {
        const { niche, platforms, timezone } = req.body;
        
        // Ensure Gemini API key is available
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Gemini API key is not configured' });
        }

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
            You are a social media expert. The user wants to schedule a post.
            Niche/Industry: ${niche || 'General Business'}
            Platforms: ${platforms.join(', ')}
            User Timezone: ${timezone || 'UTC'}
            
            Based on general social media best practices and high engagement windows for these platforms, 
            suggest 3 specific optimal times in the next 7 days for the user to post.
            
            Return ONLY a valid JSON array of objects with this structure (no markdown formatting or backticks):
            [
              {
                "timeSlot": "2024-05-15T09:00:00", // ISO string format for the suggested time
                "label": "Tomorrow Morning", // Friendly name
                "reason": "Mid-morning on weekdays typically sees peak engagement on LinkedIn." // Brief explanation
              }
            ]
        `;

        const result = await model.generateContent(prompt);
        let textResult = result.response.text().trim();
        
        // Clean up potential markdown formatting from Gemini
        if (textResult.startsWith('```json')) {
            textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (textResult.startsWith('```')) {
            textResult = textResult.replace(/```/g, '').trim();
        }

        const suggestions = JSON.parse(textResult);

        res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
        console.error('[ScheduleController] Error suggesting times:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
