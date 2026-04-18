import { supabaseAdmin } from '../config/supabaseClient.js';
import { google } from 'googleapis';

const db = supabaseAdmin;

function dateStr(daysAgo = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
}

/**
 * Build an OAuth2 client from the user's stored Google tokens.
 * Reuses the same google_oauth_tokens table as the Google Sheets integration.
 * Tokens auto-refresh and are saved back to DB.
 */
async function buildGscAuth(userId) {
    const { data, error } = await db
        .from('google_oauth_tokens')
        .select('access_token, refresh_token, expiry_date')
        .eq('user_id', userId)
        .single();

    if (error || !data?.refresh_token) {
        throw new Error('Google account not connected. Please connect your Google account first.');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expiry_date,
    });

    // Auto-save refreshed tokens back to DB
    oauth2Client.on('tokens', async (tokens) => {
        const update = {};
        if (tokens.access_token) update.access_token = tokens.access_token;
        if (tokens.expiry_date)  update.expiry_date  = tokens.expiry_date;
        if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;
        if (Object.keys(update).length) {
            await db
                .from('google_oauth_tokens')
                .upsert({ user_id: userId, ...update }, { onConflict: 'user_id' });
        }
    });

    return oauth2Client;
}

// GET /api/seo/rank-data?siteUrl=<url>&days=<28>
export const getRankData = async (req, res) => {
    try {
        const { siteUrl, days = 28 } = req.query;
        if (!siteUrl) {
            return res.status(400).json({ success: false, error: 'siteUrl query param is required' });
        }

        const auth = await buildGscAuth(req.user.id);
        const webmasters = google.webmasters({ version: 'v3', auth });

        const period    = parseInt(days, 10) || 28;
        const endDate   = dateStr(3);
        const startDate = dateStr(3 + period);
        const prevStart = dateStr(3 + period * 2);
        const prevEnd   = dateStr(3 + period + 1);

        const query = (start, end) =>
            webmasters.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate: start,
                    endDate: end,
                    dimensions: ['query', 'page'],
                    rowLimit: 100,
                    dataState: 'final',
                },
            });

        const [curRes, prevRes] = await Promise.all([
            query(startDate, endDate),
            query(prevStart, prevEnd),
        ]);

        const toMap = (rows = []) =>
            Object.fromEntries(rows.map(r => [`${r.keys[0]}|||${r.keys[1]}`, r]));

        const curMap  = toMap(curRes.data.rows);
        const prevMap = toMap(prevRes.data.rows);

        const merged = Object.entries(curMap).map(([key, cur]) => {
            const prev = prevMap[key];
            const posChange = prev ? parseFloat((prev.position - cur.position).toFixed(1)) : null;
            return {
                keyword:      cur.keys[0],
                page:         cur.keys[1],
                position:     parseFloat(cur.position.toFixed(1)),
                prevPosition: prev ? parseFloat(prev.position.toFixed(1)) : null,
                posChange,
                clicks:       cur.clicks,
                impressions:  cur.impressions,
                ctr:          parseFloat((cur.ctr * 100).toFixed(2)),
            };
        });

        merged.sort((a, b) => b.impressions - a.impressions);

        const drops = merged.filter(r => r.posChange !== null && r.posChange < -3);

        res.json({
            success: true,
            siteUrl,
            period: { startDate, endDate, days: period },
            rows: merged,
            drops,
            dropCount: drops.length,
        });
    } catch (err) {
        const msg = err.message || 'Failed to fetch GSC data';
        const status = msg.includes('not connected') ? 400 : 500;
        res.status(status).json({ success: false, error: msg });
    }
};

// GET /api/seo/sites — list GSC properties the user has access to
export const getSites = async (req, res) => {
    try {
        const auth = await buildGscAuth(req.user.id);
        const webmasters = google.webmasters({ version: 'v3', auth });
        const resp = await webmasters.sites.list();
        const sites = (resp.data.siteEntry || []).map(s => ({
            url:             s.siteUrl,
            permissionLevel: s.permissionLevel,
        }));
        res.json({ success: true, sites });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
