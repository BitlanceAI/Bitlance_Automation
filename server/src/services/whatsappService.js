import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { decryptData } from '../../utils/encryption.js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Meta WhatsApp Business API
const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

const whatsappService = {
    // ──────────────────────────────────────────
    // Get Meta credentials from meta_connections table
    // ──────────────────────────────────────────
    getMetaCredentials: async (userId) => {
        const { data: connection, error } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !connection) {
            throw new Error('No active Meta connection found. Please connect your Meta account first.');
        }

        const accessToken = decryptData(connection.access_token);
        if (!accessToken) {
            throw new Error('Failed to decrypt Meta access token. Please reconnect your account.');
        }

        return {
            accessToken,
            pages: connection.pages || [],
            adAccounts: connection.ad_accounts || [],
            // WhatsApp Phone Number ID and WABA ID will come from meta_connections
            // or from whatsapp_config stored alongside the connection
            whatsappPhoneId: connection.whatsapp_phone_id || null,
            wabaId: connection.waba_id || null
        };
    },

    // ──────────────────────────────────────────
    // Phone Number Validation (E.164)
    // ──────────────────────────────────────────
    validateNumber: (phone) => {
        let cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            return { valid: false, reason: 'Invalid length' };
        }

        if (!phone.startsWith('+')) {
            cleanPhone = '+' + cleanPhone;
        } else {
            cleanPhone = '+' + cleanPhone;
        }

        return { valid: true, formatted: cleanPhone };
    },

    // ──────────────────────────────────────────
    // Send Template Message via Meta Cloud API
    // ──────────────────────────────────────────
    sendTemplateMessage: async (userId, to, templateName, language = 'en', variables = []) => {
        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.whatsappPhoneId) {
            console.warn('[WhatsApp] WhatsApp Phone ID not configured. Simulating send.');
            return { success: true, simulated: true, messageId: 'wamid_SIM_' + Date.now() };
        }

        const components = [];
        if (variables && variables.length > 0) {
            components.push({
                type: 'body',
                parameters: variables.map(val => ({ type: 'text', text: String(val) }))
            });
        }

        const formattedPhone = to.replace('+', '');

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: language },
                ...(components.length > 0 && { components })
            }
        };

        try {
            const response = await axios.post(
                `${META_API_BASE}/${creds.whatsappPhoneId}/messages`,
                payload,
                { headers: { 'Authorization': `Bearer ${creds.accessToken}`, 'Content-Type': 'application/json' } }
            );
            return { success: true, messageId: response.data.messages?.[0]?.id };
        } catch (error) {
            const errData = error.response?.data?.error;
            console.error('[WhatsApp] Send Error:', errData || error.message);
            return { success: false, error: errData?.message || error.message, errorCode: errData?.code };
        }
    },

    // ──────────────────────────────────────────
    // Send Free-Form Text Message (within 24hr window)
    // ──────────────────────────────────────────
    sendTextMessage: async (userId, to, text) => {
        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.whatsappPhoneId) {
            console.warn('[WhatsApp] Phone ID missing. Simulating send.');
            return { success: true, simulated: true };
        }

        const formattedPhone = to.replace('+', '');

        try {
            const response = await axios.post(
                `${META_API_BASE}/${creds.whatsappPhoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: formattedPhone,
                    type: 'text',
                    text: { preview_url: false, body: text }
                },
                { headers: { 'Authorization': `Bearer ${creds.accessToken}`, 'Content-Type': 'application/json' } }
            );
            return { success: true, messageId: response.data.messages?.[0]?.id };
        } catch (error) {
            const errData = error.response?.data?.error;
            console.error('[WhatsApp] Text Error:', errData || error.message);
            return { success: false, error: errData?.message || error.message };
        }
    },

    // ──────────────────────────────────────────
    // Send Media Message (image/video/document)
    // ──────────────────────────────────────────
    sendMediaMessage: async (userId, to, mediaUrl, mediaType = 'image', caption = '') => {
        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.whatsappPhoneId) {
            console.warn('[WhatsApp] Phone ID missing. Simulating send.');
            return { success: true, simulated: true };
        }

        const formattedPhone = to.replace('+', '');
        const mediaPayload = {};
        if (mediaType === 'image') mediaPayload.image = { link: mediaUrl, caption };
        else if (mediaType === 'video') mediaPayload.video = { link: mediaUrl, caption };
        else if (mediaType === 'document') mediaPayload.document = { link: mediaUrl, caption, filename: 'document' };

        try {
            const response = await axios.post(
                `${META_API_BASE}/${creds.whatsappPhoneId}/messages`,
                { messaging_product: 'whatsapp', recipient_type: 'individual', to: formattedPhone, type: mediaType, ...mediaPayload },
                { headers: { 'Authorization': `Bearer ${creds.accessToken}`, 'Content-Type': 'application/json' } }
            );
            return { success: true, messageId: response.data.messages?.[0]?.id };
        } catch (error) {
            const errData = error.response?.data?.error;
            console.error('[WhatsApp] Media Error:', errData || error.message);
            return { success: false, error: errData?.message || error.message };
        }
    },

    // ──────────────────────────────────────────
    // Fetch Templates from Meta Cloud API
    // ──────────────────────────────────────────
    fetchMetaTemplates: async (userId) => {
        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.wabaId) {
            console.warn('[WhatsApp] WABA ID missing. Cannot fetch templates.');
            return [];
        }

        try {
            const response = await axios.get(
                `${META_API_BASE}/${creds.wabaId}/message_templates`,
                {
                    headers: { 'Authorization': `Bearer ${creds.accessToken}` },
                    params: { limit: 100 }
                }
            );
            return response.data.data || [];
        } catch (error) {
            console.error('[WhatsApp] Fetch Templates Error:', error.response?.data || error.message);
            return [];
        }
    },

    // ──────────────────────────────────────────
    // Fetch WhatsApp Phone Numbers for the WABA
    // ──────────────────────────────────────────
    fetchPhoneNumbers: async (userId) => {
        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.wabaId) {
            return [];
        }

        try {
            const response = await axios.get(
                `${META_API_BASE}/${creds.wabaId}/phone_numbers`,
                { headers: { 'Authorization': `Bearer ${creds.accessToken}` } }
            );
            return response.data.data || [];
        } catch (error) {
            console.error('[WhatsApp] Fetch Phone Numbers Error:', error.response?.data || error.message);
            return [];
        }
    },

    // ──────────────────────────────────────────
    // Database Operations (Supabase)
    // ──────────────────────────────────────────
    createBroadcast: async (name, templateName, recipients, createdBy) => {
        const { data, error } = await supabase
            .from('whatsapp_broadcasts')
            .insert({
                name,
                template_id: null,
                status: 'QUEUED',
                total_recipients: recipients.length,
                created_by: createdBy
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getTemplates: async () => {
        const { data, error } = await supabase
            .from('whatsapp_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    createTemplate: async (templateData) => {
        const { data, error } = await supabase
            .from('whatsapp_templates')
            .insert({ ...templateData, status: 'PENDING' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getHistory: async (userId) => {
        const { data, error } = await supabase
            .from('whatsapp_broadcasts')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Sync templates from Meta API → local DB
    syncTemplatesFromMeta: async (userId) => {
        const metaTemplates = await whatsappService.fetchMetaTemplates(userId);

        for (const mt of metaTemplates) {
            const bodyComponent = mt.components?.find(c => c.type === 'BODY');
            const headerComponent = mt.components?.find(c => c.type === 'HEADER');
            const footerComponent = mt.components?.find(c => c.type === 'FOOTER');

            await supabase
                .from('whatsapp_templates')
                .upsert({
                    name: mt.name,
                    category: mt.category,
                    language: mt.language,
                    status: mt.status,
                    header_text: headerComponent?.text || null,
                    body_text: bodyComponent?.text || '',
                    footer_text: footerComponent?.text || null
                }, { onConflict: 'name' });
        }

        return metaTemplates.length;
    },

    // Save WhatsApp Business Config (Phone ID + WABA ID)
    saveWhatsAppConfig: async (userId, whatsappPhoneId, wabaId) => {
        const { error } = await supabase
            .from('meta_connections')
            .update({
                whatsapp_phone_id: whatsappPhoneId,
                waba_id: wabaId,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
        return { success: true };
    }
};

export default whatsappService;
