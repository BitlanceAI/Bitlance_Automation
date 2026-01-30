
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { google } from 'googleapis';
import axios from 'axios';
import { encryptData, decryptData } from './utils/encryption.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

const API_KEY = process.env.RETELL_API_KEY;

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to create a web call
app.post('/api/create-web-call', async (req, res) => {
    try {
        const { user_phone } = req.body;
        // 1. Get the list of agents
        console.log('Fetching agents from Retell AI...');
        const agentsResponse = await fetch('https://api.retellai.com/list-agents', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        // Check if response is OK before parsing
        if (!agentsResponse.ok) {
            const errorText = await agentsResponse.text();
            console.error('Agents API Error:', agentsResponse.status, errorText);
            return res.status(agentsResponse.status).json({
                error: `Failed to fetch agents: ${agentsResponse.status} ${agentsResponse.statusText}`,
                details: errorText.substring(0, 200)
            });
        }

        // Check content type before parsing
        const contentType = agentsResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await agentsResponse.text();
            console.error('Unexpected content type:', contentType);
            console.error('Response body:', errorText.substring(0, 200));
            return res.status(500).json({
                error: 'Unexpected response format from Retell API',
                details: 'Expected JSON but received: ' + contentType
            });
        }

        const agents = await agentsResponse.json();

        if (!Array.isArray(agents) || agents.length === 0) {
            console.error('Agents response:', JSON.stringify(agents));
            return res.status(404).json({ error: 'No agents found or invalid response from Retell.' });
        }

        const agentId = agents[0].agent_id;
        console.log(`Starting call with Agent ID: ${agentId}`);

        // 2. Create the web call
        console.log('Creating web call...');
        const callResponse = await fetch('https://api.retellai.com/v2/create-web-call', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agent_id: agentId,
                metadata: {
                    user_phone: user_phone
                }
            }),
        });

        // Check if response is OK before parsing
        if (!callResponse.ok) {
            const errorText = await callResponse.text();
            console.error('Create call API Error:', callResponse.status, errorText);
            return res.status(callResponse.status).json({
                error: `Failed to create web call: ${callResponse.status} ${callResponse.statusText}`,
                details: errorText.substring(0, 200)
            });
        }

        // Check content type before parsing
        const callContentType = callResponse.headers.get('content-type');
        if (!callContentType || !callContentType.includes('application/json')) {
            const errorText = await callResponse.text();
            console.error('Unexpected content type:', callContentType);
            console.error('Response body:', errorText.substring(0, 200));
            return res.status(500).json({
                error: 'Unexpected response format from Retell API',
                details: 'Expected JSON but received: ' + callContentType
            });
        }

        const callData = await callResponse.json();
        console.log('Web call created successfully:', callData.call_id);

        res.json(callData);

    } catch (error) {
        console.error('Error creating web call:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to create a phone call
app.post('/api/create-phone-call', async (req, res) => {
    try {
        const { to_number } = req.body;

        if (!to_number) {
            return res.status(400).json({ error: 'To number is required' });
        }

        // 1. Get the list of agents to find the specific one
        console.log('Fetching agents from Retell AI...');
        const agentsResponse = await fetch('https://api.retellai.com/list-agents', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!agentsResponse.ok) throw new Error('Failed to fetch agents');
        const agents = await agentsResponse.json();

        // 2. Find "Conversation Flow Agent" or default to first
        let agent = agents.find(a => a.agent_name === 'Conversation Flow Agent');
        if (!agent && agents.length > 0) {
            console.log('Specific agent not found, using first available.');
            agent = agents[0];
        }

        if (!agent) {
            return res.status(404).json({ error: 'No agents found.' });
        }

        console.log(`Selected Agent: ${agent.agent_name} (${agent.agent_id})`);

        // 3. Get the list of phone numbers
        console.log('Fetching phone numbers from Retell AI...');
        const numbersResponse = await fetch('https://api.retellai.com/list-phone-numbers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!numbersResponse.ok) throw new Error('Failed to fetch phone numbers');
        const numbers = await numbersResponse.json();

        // 4. Select a valid number (assuming first one is valid for outbound)
        if (!numbers || numbers.length === 0) {
            return res.status(404).json({ error: 'No phone numbers found in Retell account.' });
        }

        const fromNumber = numbers[0].phone_number;
        console.log(`Using From Number: ${fromNumber}`);

        // 5. Create the phone call
        console.log(`Initiating phone call to ${to_number}...`);
        const callResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_number: fromNumber,
                to_number: to_number,
                agent_id: agent.agent_id,
            }),
        });

        if (!callResponse.ok) {
            const errorText = await callResponse.text();
            throw new Error(`Failed to create call: ${callResponse.status} ${errorText}`);
        }

        const callData = await callResponse.json();
        console.log('Phone call created successfully:', callData.call_id);

        res.json(callData);

    } catch (error) {
        console.error('Error creating phone call:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve call details
app.get('/api/call/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        console.log(`Fetching call details for: ${callId}`);

        const response = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Get call API Error:', response.status, errorText);
            return res.status(response.status).json({
                error: `Failed to fetch call: ${response.status} ${response.statusText}`,
                details: errorText.substring(0, 200)
            });
        }

        const callData = await response.json();
        res.json(callData);

    } catch (error) {
        console.error('Error fetching call:', error);
        res.status(500).json({ error: error.message });
    }
});

const lengthMapping = {
    "Short (300-500 words)": 300,
    "Medium (500-1000 words)": 500,
    "Long (1000-2000 words)": 1000,
};

function formatBlogToHTML(blogText) {
    return blogText
        .replace(/^# (.+)$/gm, '<h1>$1</h1>') // Handle H1 just in case
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        // Convert bold lines to H3 if they look like headers (standalone line)
        .replace(/^\*\*(.+?)\*\*$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^/, '<p>')
        .concat('</p>');
}

// Endpoint to generate SEO Article
app.post('/api/articles/generate', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "").trim();

        // Verify Supabase Token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.warn("Token verification failed:", authError?.message);
            return res.status(401).json({ error: "Invalid token" });
        }

        const {
            topic,
            keywords = "",
            language = "English",
            style = "conversational",
            length = "Medium (500-1000 words)",
            audience = "general public",
            variants: rawVariants = 1,
        } = req.body;

        const userId = user.id;
        const variants = parseInt(rawVariants) || 1;

        // Validations

        const lengthNum = lengthMapping[length] || 500;

        // --------- KEYWORD RESEARCH ---------
        let generatedKeywords = keywords;
        if (!keywords.trim()) {
            const keywordPrompt = `Generate relevant keywords for "${topic}" as comma-separated list.`;
            const keywordResponse = await axios.post(
                "https://api.perplexity.ai/chat/completions",
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an SEO expert." },
                        { role: "user", content: keywordPrompt },
                    ],
                    max_tokens: 500,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            generatedKeywords = keywordResponse.data.choices?.[0]?.message?.content || "";
        }

        // --------- BLOG GENERATION ---------
        let blogText = "";
        let attempts = 0;
        const maxAttempts = 3;
        let wordCount = 0;

        while (wordCount < lengthNum && attempts < maxAttempts) {
            attempts++;
            const prompt = `Write an engaging blog for ${audience} in ${language} on "${topic}". Include keywords: ${generatedKeywords || "none"}. Use ${style} style. Ensure at least ${lengthNum} words. 

FORMATTING RULES:
- Use Markdown headers for sections (e.g., ## Section Title).
- Use ### for sub-sections.
- Do NOT use # for the main title (it will be added separately).
- Use **bold** for emphasis.
- Do NOT use [1], [2] citations. Insert valid external references as clickable HTML links (<a href="..." target="_blank">text</a>).

Content:`;
            const blogResponse = await axios.post(
                "https://api.perplexity.ai/chat/completions",
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an expert content writer. Always use Markdown headers (##, ###) for structure." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 4000,
                    n: variants,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            blogText += "\n\n" + (blogResponse.data.choices?.[0]?.message?.content || "");
            wordCount = blogText.split(/\s+/).length;
        }

        // --------- AI SEO TITLE GENERATION ---------
        let seoTitle = "";
        try {
            const titlePrompt = `Based on this blog content, generate the best SEO-friendly title (max 60 characters) that is catchy and optimized for search engines:

  ${blogText.substring(0, 1200)}
  
  Topic: ${topic}

  Return only the title, nothing else.`;

            const titleResponse = await axios.post(
                "https://api.perplexity.ai/chat/completions",
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an expert SEO copywriter." },
                        { role: "user", content: titlePrompt },
                    ],
                    max_tokens: 50,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            seoTitle = titleResponse.data.choices?.[0]?.message?.content?.trim() || topic;

        } catch (err) {
            console.error("SEO title generation failed:", err.message);
            seoTitle = topic; // fallback
        }

        // --------- PLAGIARISM CHECK ---------
        let plagiarismPrompt = `Check for plagiarism in this article. Reply "No plagiarism detected" if original, otherwise summarize detected parts:\n\n${blogText}`;
        let plagiarismResponse = await axios.post(
            "https://api.perplexity.ai/chat/completions",
            {
                model: "sonar-pro",
                messages: [
                    { role: "system", content: "You are a plagiarism checker." },
                    { role: "user", content: plagiarismPrompt },
                ],
                max_tokens: 500,
                n: 1,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let plagiarismResult = plagiarismResponse.data.choices?.[0]?.message?.content || "No plagiarism detected";

        if (!plagiarismResult.toLowerCase().includes("no plagiarism")) {
            plagiarismResult += " ⚠️ Could not fully eliminate plagiarism, but the article is returned to user.";
        }

        // --------- AI GENERATES SUITABLE TEXT FOR IMAGE ---------
        let imageUrl = "";
        let imageText = "";

        try {
            // Step 1: Let AI generate suitable text for the image based on blog content
            const textPrompt = `Based on this blog content, create a short, simplest, small and catchy headline or phrase (maximum 3 words) that would look good on a blog header image. Make it engaging and relevant to the content:

${blogText.substring(0, 1000)}

Topic: ${topic}

Return only the headline text, nothing else.`;

            const textResponse = await axios.post(
                "https://api.perplexity.ai/chat/completions",
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are a marketing copywriter expert at creating catchy headlines." },
                        { role: "user", content: textPrompt },
                    ],
                    max_tokens: 100,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            imageText = textResponse.data.choices?.[0]?.message?.content?.trim() || topic;

            // Clean up the generated text (remove quotes, extra punctuation)
            imageText = imageText.replace(/^["']|["']$/g, '').replace(/[^\w\s-]/g, '').trim();

            console.log("AI-generated image text:", imageText);
            const backgroundPrompt = `Create a professional blog header image about: ${topic}.

VISUAL REQUIREMENTS:
- High-quality, modern design with relevant visual elements
- Blog header format (landscape orientation, 16:9 ratio)
- Clean, professional appearance suitable for publication

TEXT OVERLAY REQUIREMENTS:
- Include the exact text: "${imageText}"
- Text must be spelled EXACTLY as written above, character by character
- Place text prominently, readable, and well-positioned on the image
- Use clean, modern typography (sans-serif font recommended)

CRITICAL: The text "${imageText}" must appear exactly as written, with perfect spelling and clear visibility.`;
            const imageResponse = await axios.post(
                "https://api.openai.com/v1/images/generations",
                {
                    model: "dall-e-3",
                    prompt: backgroundPrompt,
                    n: 1,
                    size: "1792x1024",
                    response_format: "url"
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const backgroundUrl = imageResponse.data.data[0]?.url;

            if (backgroundUrl) {
                imageUrl = backgroundUrl;
            } else {
                throw new Error("No background image generated");
            }

        } catch (error) {
            console.error("AI text/image generation failed:", error.message);

            // Fallback: use topic as text and generate simple image
            imageText = topic;
            const encodedText = encodeURIComponent(imageText.substring(0, 50));
            imageUrl = `https://via.placeholder.com/1792x1024/2563eb/ffffff?text=${encodedText}`;
        }

        // --------- FORMAT AND SAVE ---------
        const blogHTML = formatBlogToHTML(blogText);

        // Save to Supabase 'articles' table
        const { data: insertedData, error: insertError } = await supabase
            .from('articles')
            .insert([{
                user_id: userId,
                topic,
                keywords: generatedKeywords,
                content: blogHTML, // Mapped 'article' to 'content' to match typical schema
                image_url: imageUrl,
                seo_title: seoTitle,
            }])
            .select()
            .single();

        if (insertError) {
            throw new Error(`Supabase insert error: ${insertError.message}`);
        }

        // Response
        res.status(200).json({
            success: true,
            id: insertedData.id,
            article: blogHTML,
            imageUrl,
            wordCount,
            seoTitle,
            plagiarismCheck: plagiarismResult,
        });

    } catch (error) {
        console.error("API error:", error.response?.data || error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.post('/api/upload-to-wordpress', async (req, res) => {
    try {
        const { wpUrl, wpUser, wpPassword, title, content, imageUrl } = req.body;

        if (!wpUrl || !wpUser || !wpPassword || !title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        console.log('Uploading to WordPress:', wpUrl);

        // WordPress REST API URL
        const wpApiUrl = `${wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;
        const authHeader = 'Basic ' + Buffer.from(`${wpUser}:${wpPassword}`).toString('base64');

        // Create post data
        const postData = {
            title: title,
            content: content,
            status: 'draft', // Create as draft for review
            excerpt: content.substring(0, 200).replace(/<[^>]*>/g, ''), // Extract plain text for excerpt
        };

        // Create WordPress post
        const response = await fetch(wpApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WordPress API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const postResult = await response.json();
        console.log('Post created on WordPress:', postResult.link);

        res.json({
            success: true,
            link: postResult.link,
            postId: postResult.id
        });

    } catch (error) {
        console.error('Error uploading to WordPress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Google Sheets Endpoint for WordPress Article Tracking
app.post('/api/add-to-google-sheet', async (req, res) => {
    try {
        const { niche, keywords, title, wordpressUrl, userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('📊 Adding to Google Sheets:', { niche, keywords, title, userId });

        // Fetch user's Google Sheets credentials from database
        const { data: settings, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (settingsError || !settings) {
            console.log('❌ Google Sheets not configured for user');
            return res.status(400).json({
                success: false,
                error: 'Google Sheets not configured. Please add your credentials in Settings.'
            });
        }

        if (!settings.google_sheet_id || !settings.google_service_email || !settings.google_private_key) {
            return res.status(400).json({
                success: false,
                error: 'Incomplete Google Sheets configuration. Please check your Settings.'
            });
        }

        // Decrypt the private key
        const privateKey = decryptData(settings.google_private_key);

        // Initialize Google Sheets API with user's credentials
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: settings.google_service_email,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare the row data: Niche | Keywords | Titles
        const values = [[niche, keywords, title]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: settings.google_sheet_id,
            range: 'Sheet1!A:C', // Niche, Keywords, Titles
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        console.log('✅ Successfully added to user Google Sheet');

        res.json({
            success: true,
            message: 'Data successfully added to your Google Sheet',
        });

    } catch (error) {
        console.error('❌ Error adding to Google Sheets:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========== CREDIT SYSTEM ENDPOINTS ==========

// Get User Credits
app.get('/api/credits/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        res.json({ success: true, balance: data?.balance || 0 });
    } catch (error) {
        // If row doesn't exist yet, return 0 (or create it logic if we want)
        // For new users, trigger should have created it.
        console.error('Error fetching credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Deduct Credits
app.post('/api/credits/deduct', async (req, res) => {
    try {
        const { userId, amount, action } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ success: false, error: 'User ID and amount required' });
        }

        // 1. Check current balance
        const { data: currentData, error: fetchError } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        const currentBalance = currentData?.balance || 0;

        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient credits',
                currentBalance
            });
        }

        // 2. Deduct credits
        const { data: updatedData, error: updateError } = await supabase
            .from('user_credits')
            .update({
                balance: currentBalance - amount,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select() // return updated row
            .single();

        if (updateError) throw updateError;

        console.log(`💰 Deducted ${amount} credits from user ${userId} for ${action}. New balance: ${updatedData.balance}`);

        res.json({
            success: true,
            message: 'Credits deducted successfully',
            newBalance: updatedData.balance
        });

    } catch (error) {
        console.error('Error deducting credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== USER SETTINGS ENDPOINTS ==========

// Save/Update User Google Sheets Settings
app.post('/api/user/settings', async (req, res) => {
    try {
        const { userId, googleSheetId, googleServiceEmail, googlePrivateKey } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log(`💾 Saving Google Sheets settings for user: ${userId}`);

        // Encrypt the private key before storing
        const encryptedKey = googlePrivateKey ? encryptData(googlePrivateKey) : null;

        // Upsert settings to Supabase
        const { data, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                google_sheet_id: googleSheetId,
                google_service_email: googleServiceEmail,
                google_private_key: encryptedKey,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Settings saved successfully'
        });

    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== ADMIN ENDPOINTS ==========

// Get All Users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        // Basic check - in production verify the token is from an admin
        if (!authHeader) {
            // For now we rely on Supabase Service Key being used here which has admin rights
        }

        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) throw error;

        // Fetch their credit balances too to merge
        const { data: creditsData, error: creditsError } = await supabase
            .from('user_credits')
            .select('user_id, balance');

        const creditsMap = {};
        if (creditsData) {
            creditsData.forEach(c => creditsMap[c.user_id] = c.balance);
        }

        // Map users to clean format
        const cleanUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            credits: creditsMap[u.id] || 0
        }));

        res.json({ success: true, users: cleanUsers });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
            .from('user_settings')
    .upsert({
        user_id: userId,
        google_sheet_id: googleSheetId || null,
        google_service_email: googleServiceEmail || null,
        google_private_key: encryptedKey,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id'
    })
    .select();

if (error) {
    console.error('❌ Error saving user settings:', error);
    return res.status(500).json({
        success: false,
        error: error.message
    });
}

console.log('✅ User settings saved successfully');

res.json({
    success: true,
    message: 'Google Sheets settings saved successfully'
});

    catch (error) {
    console.error('❌ Error in save settings endpoint:', error);
    res.status(500).json({
        success: false,
        error: error.message
    });
}


// Get User Google Sheets Settings
app.get('/api/user/settings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📖 Fetching settings for user: ${userId}`);

        const { data, error } = await supabase
            .from('user_settings')
            .select('google_sheet_id, google_service_email, google_private_key')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Error fetching user settings:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        if (!data) {
            return res.json({
                success: true,
                configured: false
            });
        }

        // Don't send back the private key, just confirm it exists
        res.json({
            success: true,
            configured: true,
            googleSheetId: data.google_sheet_id,
            googleServiceEmail: data.google_service_email,
            hasPrivateKey: !!data.google_private_key
        });

    } catch (error) {
        console.error('❌ Error in get settings endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete User Google Sheets Settings
app.delete('/api/user/settings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`🗑️ Deleting settings for user: ${userId}`);

        const { error } = await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error deleting user settings:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Settings deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error in delete settings endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Webhook endpoint to receive Retell AI events
app.post('/api/webhook/retell', async (req, res) => {
    try {
        const event = req.body;
        console.log('Received Retell webhook event:', event.event);
        console.log('Call ID:', event.call?.call_id);

        // Handle different event types
        switch (event.event) {
            case 'call_started':
                await handleCallStarted(event.call);
                break;
            case 'call_ended':
                await handleCallEnded(event.call);
                break;
            case 'call_analyzed':
                await handleCallAnalyzed(event.call);
                break;
            default:
                console.log('Unhandled event type:', event.event);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: error.message });
    }
});



// Function to analyze transcript for meetings detection using OpenAI
async function analyzeTranscriptForMeetings(transcript, callId) {
    try {
        if (!transcript || transcript.trim().length === 0) {
            console.log('No transcript available for analysis');
            return null;
        }

        console.log(`Analyzing transcript for call ${callId}...`);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant that analyzes call transcripts to detect if a meeting was scheduled.

Analyze the transcript and determine:
1. Was a meeting scheduled? (yes/no)
2. If yes, extract:
   - Contact person's name (the main person scheduling/attending)
   - Contact person's phone number (if mentioned)
   - Meeting title/purpose
   - Date and time (convert to ISO 8601 format, assume current year if not specified)
   - Attendees mentioned (names or roles)
   - Location (physical address or virtual meeting link/platform)
   - Any additional notes

Respond ONLY with valid JSON in this exact format:
{
  "meeting_detected": boolean,
  "meeting": {
    "contact_name": string,
    "contact_phone": string,
    "title": string,
    "description": string,
    "scheduled_date": ISO 8601 string,
    "attendees": string[],
    "location": string
  }
}

If no meeting was detected, set meeting_detected to false and meeting to null.`
                },
                {
                    role: 'user',
                    content: `Transcript:\n${transcript}`
                }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        console.log('Analysis result:', result);

        if (result.meeting_detected && result.meeting) {
            // Store meeting in database
            const { data, error } = await supabase
                .from('meetings')
                .insert({
                    call_id: callId,
                    contact_name: result.meeting.contact_name,
                    contact_phone: result.meeting.contact_phone,
                    title: result.meeting.title,
                    description: result.meeting.description,
                    scheduled_date: result.meeting.scheduled_date,
                    attendees: result.meeting.attendees || [],
                    location: result.meeting.location,
                    status: 'upcoming'
                })
                .select()
                .single();

            if (error) {
                console.error('Error storing meeting:', error);
                return null;
            }

            console.log(`Meeting created: ${data.id}`);
            return data;
        }

        return null;
    } catch (error) {
        console.error('Error analyzing transcript:', error);
        return null;
    }
}

// Endpoint to manually analyze a transcript for meetings
app.post('/api/analyze-transcript', async (req, res) => {
    try {
        const { call_id } = req.body;

        if (!call_id) {
            return res.status(400).json({ error: 'call_id is required' });
        }

        // Fetch the call from database
        const { data: call, error } = await supabase
            .from('sales_calls')
            .select('*')
            .eq('call_id', call_id)
            .single();

        if (error || !call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        if (!call.transcript) {
            return res.status(400).json({ error: 'No transcript available for this call' });
        }

        const meeting = await analyzeTranscriptForMeetings(call.transcript, call_id);

        res.json({
            success: true,
            meeting_detected: meeting !== null,
            meeting
        });

    } catch (error) {
        console.error('Error in analyze-transcript endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get all meetings
app.get('/api/meetings', async (req, res) => {
    try {
        const { start_date, end_date, status } = req.query;

        let query = supabase
            .from('meetings')
            .select('*')
            .order('scheduled_date', { ascending: true });

        if (start_date) {
            query = query.gte('scheduled_date', start_date);
        }
        if (end_date) {
            query = query.lte('scheduled_date', end_date);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get a specific meeting
app.get('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to update a meeting
app.put('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('meetings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to delete a meeting
app.delete('/api/meetings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });

    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to sync calls from Retell
app.get('/api/sync-calls', async (req, res) => {
    try {
        console.log('Syncing calls from Retell AI...');

        // 1. Fetch calls from Retell
        const response = await fetch('https://api.retellai.com/v2/list-calls', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                limit: 50,
                sort_order: 'descending'
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch calls from Retell: ${response.status} ${errorText}`);
        }

        const calls = await response.json();
        console.log(`Fetched ${calls.length} calls from Retell.`);

        // 2. Upsert into Supabase
        let syncedCount = 0;
        let errors = 0;

        for (const call of calls) {
            try {
                const durationMs = call.end_timestamp && call.start_timestamp ? call.end_timestamp - call.start_timestamp : 0;
                const durationSeconds = Math.floor(durationMs / 1000);

                // Determine Contact Name based on call type and direction
                let contactName = 'Web User';
                if (call.call_type === 'phone_call') {
                    if (call.direction === 'inbound') {
                        contactName = call.from_number || 'Unknown Caller';
                    } else if (call.direction === 'outbound') {
                        contactName = call.to_number || 'Unknown Number';
                    }
                }

                const { error } = await supabase
                    .from('sales_calls')
                    .upsert({
                        call_id: call.call_id,
                        agent_id: call.agent_id,
                        contact_name: contactName,
                        status: call.call_status === 'ended' ? 'Completed' : 'Active', // Map status roughly
                        duration_seconds: durationSeconds,
                        transcript: call.transcript || null,
                        recording_url: call.recording_url || null,
                        disconnection_reason: call.disconnection_reason || null,
                        call_summary: call.call_analysis?.call_summary || null,
                        user_sentiment: call.call_analysis?.user_sentiment || null,
                        call_successful: call.call_analysis?.call_successful || false,
                        direction: call.direction || null,
                        call_type: call.call_type || null,
                        from_number: call.from_number || null,
                        to_number: call.to_number || null,
                        created_at: new Date(call.start_timestamp).toISOString()
                    }, { onConflict: 'call_id' });

                if (error) {
                    console.error(`Error syncing call ${call.call_id}:`, error);
                    errors++;
                } else {
                    syncedCount++;
                }

            } catch (err) {
                console.error(`Exception processing call ${call.call_id}:`, err);
                errors++;
            }
        }

        console.log(`Sync complete. Synced: ${syncedCount}, Errors: ${errors}`);
        res.json({ success: true, count: syncedCount, errors });

    } catch (error) {
        console.error('Error syncing calls:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to handle call_started event
async function handleCallStarted(call) {
    try {
        console.log(`Call started: ${call.call_id}`);

        // Determine Contact Name
        let contactName = 'Web Call User';
        let fromNumber = call.from_number || null;

        if (call.call_type === 'phone_call') {
            if (call.direction === 'inbound') {
                contactName = call.from_number || 'Unknown Caller';
            } else if (call.direction === 'outbound') {
                contactName = call.to_number || 'Unknown Number';
            }
        } else if (call.call_type === 'web_call') {
            // Check metadata for phone number
            if (call.metadata?.user_phone) {
                fromNumber = call.metadata.user_phone;
                contactName = `Web User (${fromNumber})`;
            }
        }

        const { error } = await supabase
            .from('sales_calls')
            .insert({
                call_id: call.call_id,
                agent_id: call.agent_id,
                contact_name: contactName,
                status: 'Active',
                duration_seconds: 0,
                transcript: null,
                recording_url: null,
                direction: call.direction || null,
                call_type: call.call_type || null,
                from_number: fromNumber,
                to_number: call.to_number || null,
                created_at: new Date(call.start_timestamp).toISOString()
            });

        if (error) {
            console.error('Error inserting call to Supabase:', error);
        } else {
            console.log('Call record created in Supabase');
        }
    } catch (error) {
        console.error('Error handling call started:', error);
    }
}

// Helper function to handle call_ended event
async function handleCallEnded(call) {
    try {
        console.log(`Call ended: ${call.call_id}`);

        const durationMs = call.end_timestamp - call.start_timestamp;
        const durationSeconds = Math.floor(durationMs / 1000);

        const { error } = await supabase
            .from('sales_calls')
            .update({
                status: 'Completed',
                duration_seconds: durationSeconds,
                transcript: call.transcript || null,
                recording_url: call.recording_url || null,
                disconnection_reason: call.disconnection_reason || null
            })
            .eq('call_id', call.call_id);

        if (error) {
            console.error('Error updating call in Supabase:', error);
        } else {
            console.log('Call record updated in Supabase');

            // Analyze transcript for meetings if available
            if (call.transcript) {
                await analyzeTranscriptForMeetings(call.transcript, call.call_id);
            }
        }
    } catch (error) {
        console.error('Error handling call ended:', error);
    }
}

// Helper function to handle call_analyzed event
async function handleCallAnalyzed(call) {
    try {
        console.log(`Call analyzed: ${call.call_id}`);

        const analysis = call.call_analysis || {};

        const { error } = await supabase
            .from('sales_calls')
            .update({
                call_summary: analysis.call_summary || null,
                user_sentiment: analysis.user_sentiment || null,
                call_successful: analysis.call_successful || false
            })
            .eq('call_id', call.call_id);

        if (error) {
            console.error('Error updating call analysis in Supabase:', error);
        } else {
            console.log('Call analysis updated in Supabase');

            // Also analyze transcript for meetings if available
            if (call.transcript) {
                await analyzeTranscriptForMeetings(call.transcript, call.call_id);
            }
        }
    } catch (error) {
        console.error('Error handling call analyzed:', error);
    }
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook endpoint: /api/webhook/retell`);
});
