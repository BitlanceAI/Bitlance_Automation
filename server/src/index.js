import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force IPv4 to avoid Supabase connection timeouts
dns.setDefaultResultOrder('ipv4first');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes will be imported here
import articleRoutes from './routes/articleRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import googleSheetsRoutes from './routes/googleSheetsRoutes.js';
import retellRoutes from './routes/retellRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';

import publicBlogRoutes from './routes/publicBlogRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

app.use('/api/articles', articleRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/user/settings', settingsRoutes);
app.use('/api/google-sheets', googleSheetsRoutes);
app.use('/api', retellRoutes); // Mount at root /api to match /api/create-web-call etc.
app.use('/api/meetings', meetingRoutes);

app.use('/api/public', publicBlogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profiles', profileRoutes);


// Legacy routes handling
app.use('/api/add-to-google-sheet', googleSheetsRoutes);


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Serve static files from the client build directory
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
