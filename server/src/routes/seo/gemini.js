import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not defined in the environment variables.');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to call Gemini
const generateContent = async (req, res, systemInstruction, prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ success: true, text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate content' });
    }
};

// Route: /api/gemini/text
router.post('/text', async (req, res) => {
    const { topic, tone, format, length, keywords } = req.body;

    if (!topic) {
        return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const systemInstruction = "You are an expert copywriter and content creator. Create high-quality, engaging content based on the user's instructions.";
    let prompt = `Write content about the following topic: "${topic}".\n`;
    if (tone) prompt += `Tone: ${tone}\n`;
    if (format) prompt += `Format: ${format}\n`;
    if (length) prompt += `Length: ${length}\n`;
    if (keywords) prompt += `Keywords to include: ${keywords}\n`;

    await generateContent(req, res, systemInstruction, prompt);
});

// Route: /api/gemini/email
router.post('/email', async (req, res) => {
    const { purpose, recipient, tone, details } = req.body;

    if (!purpose || !recipient) {
        return res.status(400).json({ success: false, error: 'Purpose and recipient are required' });
    }

    const systemInstruction = "You are an expert email marketer and communicator. Write clear, compelling, and professional emails tailored to the specific recipient and goal.";
    let prompt = `Write an email with the following purpose: "${purpose}".\n`;
    prompt += `Recipient: ${recipient}\n`;
    if (tone) prompt += `Tone: ${tone}\n`;
    if (details) prompt += `Additional details: ${details}\n`;

    await generateContent(req, res, systemInstruction, prompt);
});

export default router;
