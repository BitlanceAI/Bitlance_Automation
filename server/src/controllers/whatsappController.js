import whatsappService from '../services/whatsappService.js';
import dotenv from 'dotenv';

dotenv.config();

const whatsappController = {
    // ──────────────────────────────────────────
    // Send Broadcast (Template or Direct via Meta API)
    // ──────────────────────────────────────────
    sendBroadcast: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, templateName, recipients: manualRecipients, variables, message, mediaUrl, mediaType, sendMode } = req.body;
            const file = req.file;

            let parsedRecipients = [];

            // 1. Parse CSV file if uploaded
            if (file) {
                const text = file.buffer.toString('utf-8');
                const lines = text.split('\n').filter(l => l.trim());
                const startIndex = lines[0].toLowerCase().includes('phone') ? 1 : 0;
                for (let i = startIndex; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    const phone = cols[0].trim().replace(/['"]/g, '');
                    if (phone && phone.length >= 7) parsedRecipients.push(phone);
                }
            }

            // 2. Merge manual recipients
            if (manualRecipients) {
                const manualList = Array.isArray(manualRecipients)
                    ? manualRecipients
                    : manualRecipients.split(',').map(p => p.trim());
                parsedRecipients = [...parsedRecipients, ...manualList];
            }

            parsedRecipients = [...new Set(parsedRecipients.filter(Boolean))];

            if (parsedRecipients.length === 0) {
                return res.status(400).json({ error: 'No recipients provided' });
            }

            // 3. Validate numbers
            const validRecipients = [];
            const invalidRecipients = [];

            parsedRecipients.forEach(phone => {
                const validation = whatsappService.validateNumber(phone);
                if (validation.valid) {
                    validRecipients.push(validation.formatted);
                } else {
                    invalidRecipients.push({ phone, reason: validation.reason });
                }
            });

            if (validRecipients.length === 0) {
                return res.status(400).json({ error: 'No valid recipients found', invalidList: invalidRecipients });
            }

            // 4. Create broadcast record
            const broadcast = await whatsappService.createBroadcast(
                name || `Broadcast ${new Date().toISOString()}`,
                templateName,
                validRecipients,
                userId
            );

            // 5. Parse variables
            let parsedVariables = [];
            try {
                parsedVariables = typeof variables === 'string' ? JSON.parse(variables) : (variables || []);
            } catch (e) {
                parsedVariables = [];
            }

            // 6. Send messages async (fire-and-forget)
            const broadcastId = broadcast.id;
            (async () => {
                let successCount = 0;
                let failCount = 0;

                for (const recipient of validRecipients) {
                    let result;

                    if (sendMode === 'template' && templateName) {
                        result = await whatsappService.sendTemplateMessage(
                            userId, recipient, templateName, 'en', parsedVariables
                        );
                    } else if (mediaUrl) {
                        result = await whatsappService.sendMediaMessage(
                            userId, recipient, mediaUrl, mediaType || 'image', message || ''
                        );
                    } else if (message) {
                        result = await whatsappService.sendTextMessage(userId, recipient, message);
                    } else {
                        result = { success: false, error: 'No message content' };
                    }

                    if (result.success) successCount++;
                    else {
                        failCount++;
                        console.error(`[Broadcast] Failed for ${recipient}:`, result.error);
                    }

                    // Rate limiting — Meta recommends max 80 msg/sec
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                // Update broadcast status
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                await supabase
                    .from('whatsapp_broadcasts')
                    .update({
                        status: failCount === 0 ? 'COMPLETED' : successCount > 0 ? 'PARTIAL' : 'FAILED',
                        successful_sends: successCount,
                        failed_sends: failCount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', broadcastId);

                console.log(`[Broadcast ${broadcastId}] Complete: ${successCount} sent, ${failCount} failed`);
            })();

            res.status(200).json({
                message: 'Broadcast started',
                broadcastId: broadcast.id,
                stats: {
                    total: parsedRecipients.length,
                    valid: validRecipients.length,
                    invalid: invalidRecipients.length,
                    invalidList: invalidRecipients
                }
            });

        } catch (error) {
            console.error('[WhatsApp Controller] Broadcast Error:', error);
            res.status(500).json({ error: error.message || 'Failed to initiate broadcast' });
        }
    },

    // ──────────────────────────────────────────
    // Get Templates (local DB)
    // ──────────────────────────────────────────
    getTemplates: async (req, res) => {
        try {
            const templates = await whatsappService.getTemplates();
            res.status(200).json(templates);
        } catch (error) {
            console.error('[WhatsApp Controller] Get Templates Error:', error);
            res.status(500).json({ error: 'Failed to fetch templates' });
        }
    },

    // ──────────────────────────────────────────
    // Create Template
    // ──────────────────────────────────────────
    createTemplate: async (req, res) => {
        try {
            const template = await whatsappService.createTemplate(req.body);
            res.status(201).json(template);
        } catch (error) {
            console.error('[WhatsApp Controller] Create Template Error:', error);
            res.status(500).json({ error: 'Failed to create template' });
        }
    },

    // ──────────────────────────────────────────
    // Sync Templates from Meta → local DB
    // ──────────────────────────────────────────
    syncTemplates: async (req, res) => {
        try {
            const userId = req.user.id;
            const count = await whatsappService.syncTemplatesFromMeta(userId);
            res.status(200).json({ message: `Synced ${count} templates from Meta` });
        } catch (error) {
            console.error('[WhatsApp Controller] Sync Error:', error);
            res.status(500).json({ error: error.message || 'Failed to sync templates' });
        }
    },

    // ──────────────────────────────────────────
    // Fetch Templates directly from Meta API
    // ──────────────────────────────────────────
    getMetaTemplates: async (req, res) => {
        try {
            const userId = req.user.id;
            const templates = await whatsappService.fetchMetaTemplates(userId);
            res.status(200).json(templates);
        } catch (error) {
            console.error('[WhatsApp Controller] Meta Templates Error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch Meta templates' });
        }
    },

    // ──────────────────────────────────────────
    // Get WhatsApp Phone Numbers
    // ──────────────────────────────────────────
    getPhoneNumbers: async (req, res) => {
        try {
            const userId = req.user.id;
            const numbers = await whatsappService.fetchPhoneNumbers(userId);
            res.status(200).json(numbers);
        } catch (error) {
            console.error('[WhatsApp Controller] Phone Numbers Error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch phone numbers' });
        }
    },

    // ──────────────────────────────────────────
    // Save WhatsApp Config (Phone ID + WABA ID)
    // ──────────────────────────────────────────
    saveConfig: async (req, res) => {
        try {
            const userId = req.user.id;
            const { whatsappPhoneId, wabaId } = req.body;

            if (!whatsappPhoneId || !wabaId) {
                return res.status(400).json({ error: 'WhatsApp Phone Number ID and WABA ID are required' });
            }

            await whatsappService.saveWhatsAppConfig(userId, whatsappPhoneId, wabaId);
            res.status(200).json({ success: true, message: 'WhatsApp configuration saved' });
        } catch (error) {
            console.error('[WhatsApp Controller] Save Config Error:', error);
            res.status(500).json({ error: error.message || 'Failed to save config' });
        }
    },

    // ──────────────────────────────────────────
    // Get Broadcast History
    // ──────────────────────────────────────────
    getHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const history = await whatsappService.getHistory(userId);
            res.status(200).json(history);
        } catch (error) {
            console.error('[WhatsApp Controller] History Error:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    }
};

export default whatsappController;
