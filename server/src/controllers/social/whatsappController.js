import whatsappService from '../../services/social/whatsappService.js';

// @desc    Send a WhatsApp template message (Reusable)
// @route   POST /api/whatsapp/send-template
// @access  Public (or could be restricted by middleware)
export const sendTemplate = async (req, res) => {
    try {
        const { phone, templateName, variables, language } = req.body;

        if (!phone || !templateName) {
            return res.status(400).json({ success: false, message: 'Phone and templateName are required' });
        }

        const result = await whatsappService.sendSystemTemplateMessage(
            phone,
            templateName,
            language || 'en',
            variables || []
        );

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error });
        }

        return res.status(200).json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('sendTemplate Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send a WhatsApp free-form text or media message
// @route   POST /api/whatsapp/send
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { to, message, type, mediaUrl } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({ success: false, message: 'to and message are required' });
        }

        let result;
        if (type === 'image' && mediaUrl) {
            result = await whatsappService.sendMediaMessage(userId, to, mediaUrl, 'image', message);
        } else {
            result = await whatsappService.sendTextMessage(userId, to, message);
        }

        console.log('[whatsappController] sendMessage result:', result);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error });
        }

        return res.status(200).json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('sendMessage Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
