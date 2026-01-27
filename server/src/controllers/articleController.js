import PerplexityService from '../services/perplexityService.js';
import OpenAIService from '../services/openAIService.js';
import { supabase } from '../config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

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
            image_option = 'auto', // 'auto', 'custom', 'none'
            custom_image_url
        } = req.body;

        const userId = req.user.id; // From Auth Middleware
        const token = req.token;

        // Create scoped Supabase client for RLS
        const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        // 1. Check Credits
        const CREDIT_COST = 5;
        const { data: creditData, error: creditError } = await scopedSupabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (creditError && creditError.code !== 'PGRST116') {
            console.error('Credit check error:', creditError);
            return res.status(500).json({ success: false, error: 'Failed to check credits' });
        }

        const currentBalance = creditData?.balance || 0;
        if (currentBalance < CREDIT_COST) {
            return res.status(402).json({ success: false, error: 'Insufficient credits', required: CREDIT_COST, balance: currentBalance });
        }

        console.log('Credits check passed. Balance:', currentBalance);

        // 2. Keyword Research
        console.log('Starting keyword research...');
        let generatedKeywords = keywords;
        if (!keywords || keywords.trim() === '') {
            generatedKeywords = await PerplexityService.generateKeywords(topic);
        }
        console.log('Keywords:', generatedKeywords);

        // 3. Generate Blog Content
        console.log('Generating blog content...');
        const lengthMapping = {
            "Short (300-500 words)": 300,
            "Medium (500-1000 words)": 500,
            "Long (1000-2000 words)": 1000,
        };
        const lengthNum = lengthMapping[length] || 500;

        const { blogText, wordCount } = await PerplexityService.generateBlogContent(
            topic,
            generatedKeywords,
            language,
            audience,
            style,
            lengthNum,
            0,
            3,
            variants
        );
        console.log('Blog content generated. Words:', wordCount);

        // 4. Generate SEO Title
        console.log('Generating SEO Title...');
        const seoTitle = await PerplexityService.generateSeoTitle(blogText, topic);

        // 5. Plagiarism Check
        console.log('Checking plagiarism...');
        const plagiarismCheck = await PerplexityService.checkPlagiarism(blogText);

        // 6. Generate Image
        console.log('Handling Image option:', image_option);
        let imageUrl = null;

        if (image_option === 'auto') {
            console.log('Generating AI Image...');
            const imageText = await PerplexityService.generateImageText(blogText, topic);
            imageUrl = await OpenAIService.generateImage(topic, imageText);
            console.log('AI Image generated:', imageUrl);
        } else if (image_option === 'custom') {
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
                .replace(/\n{2,}/g, '</p><p>')
                .replace(/^/, '<p>')
                .concat('</p>');
        };
        const blogHTML = formatBlogToHTML(blogText);

        // 8. Deduct Credits
        const { error: deductError } = await scopedSupabase
            .from('user_credits')
            .update({
                balance: currentBalance - CREDIT_COST,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (deductError) {
            console.error('Failed to deduct credits after generation:', deductError);
        }

        // 9. Prepare New Fields
        const slug = custom_slug ? generateSlug(custom_slug) : generateSlug(seoTitle || topic) + '-' + Math.floor(Math.random() * 1000);
        const estimatedReadTime = calculateReadTime(wordCount);
        const finalAuthorName = author_name || 'AI Agent';

        // 10. Save Article
        console.log('Saving article...');
        const { data: savedArticle, error: saveError } = await scopedSupabase
            .from('articles')
            .insert({
                user_id: userId,
                topic,
                keywords: generatedKeywords,
                content: blogHTML,
                seo_title: seoTitle,
                image_url: imageUrl,
                word_count: wordCount,
                plagiarism_check: plagiarismCheck,
                language,
                audience,
                style,
                // New Fields
                slug: slug,
                featured_image: imageUrl, // Reuse the generated image as featured
                category: category || 'Technology', // Default or passed
                tags: tags,
                author_name: finalAuthorName,
                author_bio: author_bio || 'Generated by AI',
                publish_date: is_published ? new Date().toISOString() : null,
                is_published: is_published,
                estimated_read_time: estimatedReadTime,
                seo_description: `Read about ${topic}. ${wordCount} words.`, // Simple auto-desc
                social_share_enabled: true,
                comments_enabled: true
            })
            .select()
            .single();

        if (saveError) {
            console.error('Save article error:', saveError);
        }

        res.json({
            success: true,
            article: blogHTML,
            seoTitle,
            imageUrl,
            wordCount,
            plagiarismCheck,
            id: savedArticle?.id,
            slug: savedArticle?.slug,
            newFieldsPopulated: true
        });

    } catch (error) {
        console.error('Article Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
