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
