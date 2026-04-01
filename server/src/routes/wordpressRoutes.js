import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { decryptData, encryptData } from '../utils/encryption.js';

const router = express.Router();

/**
 * GET /api/wordpress/profiles
 * Returns all saved WordPress profiles for the authenticated user.
 */
router.get('/profiles', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabaseAdmin
            .from('wordpress_profiles')
            .select('id, name, wp_url, wp_username, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, profiles: data || [] });
    } catch (error) {
        console.error('[WordPress] Fetch profiles error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/wordpress/profiles
 * Saves a new WordPress profile (URL, username, encrypted app password).
 */
router.post('/profiles', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, wp_url, wp_username, wp_app_password } = req.body;

        if (!name || !wp_url || !wp_username || !wp_app_password) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const encryptedPassword = encryptData(wp_app_password);

        const { data, error } = await supabaseAdmin
            .from('wordpress_profiles')
            .insert({
                user_id: userId,
                name,
                wp_url: wp_url.replace(/\/+$/, ''),
                wp_username,
                wp_app_password: encryptedPassword,
            })
            .select('id, name, wp_url, wp_username, created_at')
            .single();

        if (error) throw error;
        res.json({ success: true, profile: data });
    } catch (error) {
        console.error('[WordPress] Save profile error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/wordpress/profiles/:id
 * Deletes a saved WordPress profile (only the owner can delete).
 */
router.delete('/profiles/:id', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('wordpress_profiles')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('[WordPress] Delete profile error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/wordpress/upload
 * Uploads an article to WordPress.
 * Accepts either profileId (saved profile) or direct credentials (wpUrl, wpUser, wpPassword).
 */
router.post('/upload', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, content, imageUrl, profileId, wpUrl, wpUser, wpPassword } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'title and content are required' });
        }

        let baseUrl, authHeader;

        if (profileId) {
            // Use saved profile
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('wordpress_profiles')
                .select('wp_url, wp_username, wp_app_password')
                .eq('id', profileId)
                .eq('user_id', userId)
                .single();

            if (profileError || !profile) {
                return res.status(400).json({
                    success: false,
                    error: 'WordPress profile not found. Please add a profile first.'
                });
            }

            baseUrl = profile.wp_url.replace(/\/+$/, '');
            const decryptedPassword = decryptData(profile.wp_app_password);
            authHeader = 'Basic ' + Buffer.from(`${profile.wp_username}:${decryptedPassword}`).toString('base64');
        } else if (wpUrl && wpUser && wpPassword) {
            // Direct credentials (from SEO Agent page)
            baseUrl = wpUrl.replace(/\/+$/, '');
            authHeader = 'Basic ' + Buffer.from(`${wpUser}:${wpPassword}`).toString('base64');
        } else {
            return res.status(400).json({ success: false, error: 'Provide either profileId or wpUrl/wpUser/wpPassword' });
        }

        console.log(`[WordPress] Uploading post for user ${userId} → ${baseUrl}`);

        // Optionally upload featured image
        let featuredMediaId = null;
        if (imageUrl) {
            try {
                console.log('[WordPress] Downloading image:', imageUrl);
                const imgRes = await fetch(imageUrl);
                const imgBuffer = await imgRes.arrayBuffer();
                const contentType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
                const ext = contentType.split('/')[1] || 'jpg';
                const filename = `blog-image-${Date.now()}.${ext}`;

                const mediaRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
                    method: 'POST',
                    headers: {
                        Authorization: authHeader,
                        'Content-Type': contentType,
                        'Content-Disposition': `attachment; filename="${filename}"`,
                    },
                    body: Buffer.from(imgBuffer),
                });

                if (mediaRes.ok) {
                    const mediaData = await mediaRes.json();
                    featuredMediaId = mediaData.id;
                    console.log('[WordPress] Image uploaded, media ID:', featuredMediaId);
                } else {
                    console.warn('[WordPress] Image upload failed:', await mediaRes.text());
                }
            } catch (imgErr) {
                console.warn('[WordPress] Image upload error (continuing without image):', imgErr.message);
            }
        }

        // Create the WordPress post as Published
        const postData = {
            title,
            content,
            status: 'publish',
            excerpt: content.replace(/<[^>]*>/g, '').substring(0, 200),
            ...(featuredMediaId ? { featured_media: featuredMediaId } : {}),
        };

        const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!wpRes.ok) {
            const errText = await wpRes.text();
            throw new Error(`WordPress API ${wpRes.status}: ${errText.substring(0, 300)}`);
        }

        const postResult = await wpRes.json();
        console.log('[WordPress] Post published:', postResult.link);

        res.json({
            success: true,
            postId: postResult.id,
            link: postResult.link,
            editLink: `${baseUrl}/wp-admin/post.php?post=${postResult.id}&action=edit`,
        });

    } catch (error) {
        console.error('[WordPress] Upload error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
