import express from 'express';
import axios from 'axios';

const router = express.Router();

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

router.post('/generate-faq', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/api/geo/generate-faq`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying to Python API:', error.message);
        res.status(500).json({ success: false, error: 'Failed to communicate with AI Engine' });
    }
});

export default router;
