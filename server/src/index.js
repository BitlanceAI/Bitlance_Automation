// ⚠️  Must be set BEFORE any imports — ES module imports are hoisted and
// supabaseClient.js initialises its fetch client at import time.
// Setting this via .env (dotenv.config) is too late.
// In production, do NOT disable TLS verification.
// If you truly need this (e.g. debugging a bad certificate chain), set `INSECURE_TLS=true`.
if (process.env.INSECURE_TLS === 'true' || process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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
// ── CORS ── allow origins from env var (comma-separated) or localhost in dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'https://automation-dashboard-ten.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());

// Routes will be imported here

import creditRoutes from './routes/creditRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import googleSheetsRoutes from './routes/googleSheetsRoutes.js';
import retellRoutes from './routes/retellRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import designRoutes from './routes/designRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';

import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import linkedinRoutes from './routes/linkedinRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import geminiRoutes from './routes/gemini.js';

// Mount routes
app.use('/api/auth', authRoutes);

app.use('/api/credits', creditRoutes);
app.use('/api/user/settings', settingsRoutes);
app.use('/api/google-sheets', googleSheetsRoutes);
app.use('/api', retellRoutes); // Mount at root /api to match /api/create-web-call etc.
app.use('/api/meetings', meetingRoutes);
app.use('/api/design', designRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/track', trackingRoutes);


app.use('/api/admin', adminRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api', articleRoutes); // blog generation + CRUD + public blog routes
app.use('/api/gemini', geminiRoutes); // Gemini AI endpoints

// Meta Webhooks (no /api prefix as Meta expects direct path)
import webhookRoutes from './routes/webhookRoutes.js';
app.use('/webhooks/meta', webhookRoutes);

import autoBlogRoutes from './routes/autoBlogRoutes.js';
app.use('/api/admin/auto-blog', autoBlogRoutes);


import whatsappRoutes from './routes/whatsappRoutes.js';
app.use('/api/whatsapp', whatsappRoutes);

import leadsRoutes from './routes/leadsRoutes.js';
app.use('/api/leads', leadsRoutes);



import pushRoutes from './routes/pushRoutes.js';
app.use('/api/push', pushRoutes);



// Legacy routes handling
app.use('/api/add-to-google-sheet', googleSheetsRoutes);


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Serve built React assets and root files if enabled
const serveFrontend = process.env.SERVE_FRONTEND === 'true';

if (serveFrontend) {
    const distPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(distPath));
    app.use('/assets', express.static(path.join(distPath, 'assets')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        const indexPath = path.join(__dirname, '../../client/dist/index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error sending index.html:', err.message);
                res.status(500).send('Frontend build not found. Please run "npm run build" in the root directory.');
            }
        });
    });
} else {
    // API fallback for standalone backend
    app.use((req, res) => {
        res.status(404).json({ error: 'Not Found' });
    });
}

// Start server
import { startPostScheduler } from './services/scheduler.js';

// Start Scheduler Service
import SchedulerService from './services/scheduler/SchedulerService.js';
import { startReminderCron } from './services/reminderCron.js';
// Pass a default MetaService or handle inside Scheduler
const scheduler = new SchedulerService();
scheduler.start();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start the background scheduler
    startPostScheduler();

    // Start 24h reminder cron
    startReminderCron();
});

export default app;
