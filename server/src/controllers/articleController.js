import PerplexityService from '../services/perplexityService.js';
import OpenAIService from '../services/openAIService.js';
import { supabase, supabaseAdmin } from '../config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import CreditLedgerService from '../services/creditLedgerService.js';
import { sendPushNotification } from '../services/pushService.js';

const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';

const getTableName = (req) => {
    const userId = req.user.id;
    if (userId === ADMIN_ID) {
        if (req.body?.target_table === 'articles') {
            return 'articles';
        }
        return 'company_articles';
    }
    return 'articles';
};

const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const calculateReadTime = (wordCount) => {
    const WORDS_PER_MINUTE = 200;
    return Math.ceil(wordCount / WORDS_PER_MINUTE);
};

export const generateArticle = async (req, res) => {
    try {
        const {
            topic,
            keywords = "",
            language = "English",
            style = "conversational",
            length = "Medium (500-1000 words)",
            audience = "general public",
            variants = 1,
            // New fields overrides (optional)
            custom_slug,
            category,
            tags = [],
            author_name,
            author_bio,
            is_published = false,
            image_option: reqImageOption = 'auto', // Rename to avoid conflict
            custom_image_url,
            author_profile_id,
            author_details,
            wp_url
        } = req.body;

        const userId = req.user.id; // From Auth Middleware
        const token = req.token;
        const tableName = getTableName(userId);

        // Create scoped Supabase client for RLS
        const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        if (!topic && !req.body.industry) {
            return res.status(400).json({ success: false, error: 'Topic or Industry is required' });
        }

        // 1. Pre-flight Credit Check (UPDATED FOR FLAT RATE)
        // With flat_rate model, we validate for 1 unit of usage
        const usageAmount = 1;

        const lengthMapping = {
            "Short (300-500 words)": 300,
            "Medium (500-1000 words)": 500,
            "Long (1000-2000 words)": 1000,
        };

        const creditCheck = await CreditLedgerService.validateCreditsAvailable(
            userId,
            'blog',
            usageAmount
        );

        if (!creditCheck.hasEnough && userId !== ADMIN_ID) {
            return res.status(402).json({
                success: false,
                error: 'Insufficient credits',
                required: creditCheck.creditsNeeded,
                balance: creditCheck.currentBalance,
                deficit: creditCheck.deficit
            });
        }

        if (userId === ADMIN_ID) {
            console.log('👑 Admin access: Bypassing credit check');
        } else {
            console.log(`✅ Credit pre-check passed: ${creditCheck.creditsNeeded} credits required`);
        }

        // 1.5 Handle Industry Mode (Auto-generate Topic/Keywords)
        let finalTopic = topic;
        let generatedKeywords = keywords;

        if (!finalTopic && req.body.industry) {
            console.log(`Industry mode selected: ${req.body.industry}. Generating topic...`);
            const idea = await PerplexityService.generateTitleAndKeywords(req.body.industry);
            finalTopic = idea.topic;
            generatedKeywords = idea.keywords;
            console.log(`Auto-generated Topic: ${finalTopic}`);
        }

        if (!finalTopic) {
            return res.status(400).json({ success: false, error: 'Topic is required (or provide industry)' });
        }

        // 2. Keyword Research (if still needed)
        console.log('Starting keyword research...');
        if (!generatedKeywords || generatedKeywords.trim() === '') {
            try {
                generatedKeywords = await PerplexityService.generateKeywords(finalTopic);
            } catch (kError) {
                console.warn('Perplexity Keyword Gen failed, trying OpenAI...', kError.message);
                generatedKeywords = await OpenAIService.generateKeywords(finalTopic);
            }
        }
        console.log('Keywords:', generatedKeywords);

        // 3. Generate Blog Content
        console.log('Generating blog content...');
        const lengthNum = lengthMapping[length] || 500;

        // 2.5 Fetch Interlinks (if wp_url provided)
        let interlinks = [];
        if (wp_url) {
            try {
                console.log(`Fetching recent posts from ${wp_url} for interlinking...`);
                let baseUrl = wp_url;
                if (!baseUrl.startsWith('http')) {
                    baseUrl = `https://${baseUrl}`;
                }
                // Remove trailing slash
                baseUrl = baseUrl.replace(/\/$/, '');

                const wpApiUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=10`;
                const wpRes = await axios.get(wpApiUrl);

                if (wpRes.data && Array.isArray(wpRes.data)) {
                    interlinks = wpRes.data.map(post => ({
                        title: post.title.rendered,
                        link: post.link
                    }));
                    console.log(`Found ${interlinks.length} potential interlinks.`);
                }
            } catch (wpError) {
                console.warn('Failed to fetch WordPress posts for interlinking:', wpError.message);
            }
        }

        let contentResult;
        try {
            contentResult = await PerplexityService.generateBlogContent(
                finalTopic,
                generatedKeywords,
                language,
                audience,
                style,
                lengthNum,
                0,
                3,
                variants,
                interlinks
            );
        } catch (cError) {
            console.warn('Perplexity Blog Gen failed, trying OpenAI...', cError.message);
            contentResult = await OpenAIService.generateBlogContent(
                finalTopic,
                generatedKeywords,
                language,
                audience,
                style,
                lengthNum,
                0,
                3,
                variants,
                interlinks
            );
        }
        const { blogText, wordCount } = contentResult;
        console.log('Blog content generated. Words:', wordCount);

        // 4. Generate SEO Title
        console.log('Generating SEO Title...');
        const seoTitle = await PerplexityService.generateSeoTitle(blogText, finalTopic);

        // 5. Plagiarism Check
        console.log('Checking plagiarism...');
        const plagiarismCheck = await PerplexityService.checkPlagiarism(blogText);

        // 6. Generate Image
        console.log('Handling Image option:', reqImageOption);
        let imageUrl = null;

        if (reqImageOption === 'auto') {
            console.log('Generating AI Image...');
            const imageText = await PerplexityService.generateImageText(blogText, finalTopic);
            imageUrl = await OpenAIService.generateImage(finalTopic, imageText);
            console.log('AI Image generated:', imageUrl);
        } else if (reqImageOption === 'custom') {
            console.log('Using Custom Image URL');
            imageUrl = custom_image_url;
        } else {
            console.log('No image requested (None)');
        }

        // 6.1 Persist Image to Supabase Storage
        if (imageUrl && !imageUrl.startsWith('http')) {
            // Handle potential placeholder
        } else if (imageUrl) {
            try {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                const fileName = `blog-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;

                const { data: uploadData, error: uploadError } = await scopedSupabase
                    .storage
                    .from('blog-images')
                    .upload(fileName, buffer, {
                        contentType: 'image/png',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Supabase Storage Upload Error:', uploadError);
                } else {
                    const { data: publicUrlData } = scopedSupabase
                        .storage
                        .from('blog-images')
                        .getPublicUrl(fileName);

                    if (publicUrlData && publicUrlData.publicUrl) {
                        imageUrl = publicUrlData.publicUrl;
                    }
                }
            } catch (storageError) {
                console.error('Image persistence failed:', storageError);
            }
        }

        // 7. Format Content
        const formatBlogToHTML = (text) => {
            return text
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>')
                .replace(/\n{2,}/g, '</p><p>')
                .replace(/^/, '<p>')
                .concat('</p>');
        };
        const blogHTML = formatBlogToHTML(blogText);

        // 8. Save Article FIRST (for ledger reference)
        console.log(`Saving article to ${tableName}...`);
        const slug = custom_slug ? generateSlug(custom_slug) : generateSlug(seoTitle || finalTopic) + '-' + Math.floor(Math.random() * 1000);
        const estimatedReadTime = calculateReadTime(wordCount);
        const finalAuthorName = author_name || 'AI Agent';

        const { data: savedArticle, error: saveError } = await scopedSupabase
            .from(tableName)
            .insert({
                user_id: userId,
                topic: finalTopic,
                keywords: generatedKeywords,
                content: blogHTML,
                seo_title: seoTitle,
                image_url: imageUrl,
                word_count: wordCount,
                plagiarism_check: plagiarismCheck,
                language,
                audience,
                style,
                slug: slug,
                featured_image: imageUrl,
                category: category || 'Technology',
                tags: tags,
                author_name: finalAuthorName,
                author_bio: author_bio || 'Generated by AI',
                author_profile_id: author_profile_id || null,
                author_details: author_details || null,
                publish_date: is_published ? new Date().toISOString() : null,
                is_published: is_published,
                estimated_read_time: estimatedReadTime,
                seo_description: `Read about ${finalTopic}. ${wordCount} words.`,
                social_share_enabled: true,
                comments_enabled: true
            })
            .select()
            .single();

        if (saveError) {
            console.error('Save article error:', saveError);
            throw saveError;
        }

        // 9. Deduct Credits via Ledger (NEW SYSTEM)
        let ledgerResult;
        try {
            ledgerResult = await CreditLedgerService.deductCreditsWithLedger({
                userId,
                agentType: 'blog',
                referenceId: savedArticle.id,
                referenceTable: tableName,
                usageQuantity: 1, // Flat rate: 1 unit per blog post
                metadata: {
                    topic: finalTopic,
                    language,
                    style,
                    model: 'sonar-pro',
                    category: category || 'Technology',
                    actual_word_count: wordCount // Store actual word count in metadata for analytics
                }
            });

            console.log(`💰 Ledger entry created: ${ledgerResult.ledger_id}`);
            console.log(`📊 Credits deducted: ${ledgerResult.credits_deducted} (Balance: ${ledgerResult.new_balance})`);

        } catch (ledgerError) {
            console.error('⚠️ CRITICAL: Article saved but credits not deducted!', ledgerError);
            // Article is saved, but credit deduction failed
            // Log this for manual reconciliation
            // In production, send alert to monitoring service
        }

        // 10. Trigger Push Notification (NEW)
        try {
            console.log('Sending push notification to subscribers...');
            await sendPushNotification({
                title: `New Article: ${finalTopic}`,
                body: `Check out our latest post on "${finalTopic}"!`,
                image: imageUrl,
                data: {
                    slug: savedArticle.slug,
                    type: 'new_blog'
                }
            });
            console.log('✅ Push notification queue initiated.');
        } catch (pushErr) {
            console.warn('⚠️ Failed to send push notification:', pushErr.message);
            // Don't fail the request, just log it
        }

        // 11. Return Response

        res.json({
            success: true,
            article: blogHTML,
            seoTitle,
            imageUrl,
            wordCount,
            plagiarismCheck,
            id: savedArticle?.id,
            slug: savedArticle?.slug,
            topic: finalTopic,
            creditsUsed: ledgerResult?.credits_deducted || wordCount * 5,
            newBalance: ledgerResult?.new_balance,
            ledgerId: ledgerResult?.ledger_id
        });

    } catch (error) {
        console.error('Article Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
