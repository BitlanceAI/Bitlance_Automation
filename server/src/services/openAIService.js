import OpenAI from 'openai';

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateImage(topic, imageText) {
        try {
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

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: backgroundPrompt,
                n: 1,
                size: "1024x1024", // DALL-E 3 standard, user asked for 1792x1024 but DALL-E 3 api usually supports 1024x1024, 1024x1792, 1792x1024. Let's use 1024x1024 standard or 1792x1024 if supported in this lib version, usually safer with square or standard landscape. Let's try standard landscape if possible or stick to square which is always safe. 
                // Actually user code used "1792x1024". I'll use "1024x1024" to be safe or "1792x1024" if I'm sure. 
                // Let's stick to safe standard first or try user's pref.
                size: "1024x1792", // Portrait? No user wanted landscape. "1792x1024" is valid for DALL-E 3.
                size: "1792x1024",
                response_format: "url"
            });

            return response.data[0]?.url;
        } catch (error) {
            console.error('OpenAI Image Gen Error:', error.message);

            // Fallback
            const encodedText = encodeURIComponent(imageText.substring(0, 50));
            return `https://via.placeholder.com/1792x1024/2563eb/ffffff?text=${encodedText}`;
        }
    }

    async generateBlogContent(topic, keywords, language, audience, style, lengthNum, attempts, maxAttempts, variants, interlinks = []) {
        try {
            // Build Interlinking Instructions
            let interlinkInstructions = "";
            if (interlinks && interlinks.length > 0) {
                interlinkInstructions = `
                MANDATORY INTERLINKING RULES:
                1. You MUST include links to the following articles within the content.
                2. Do NOT list them at the end. Do NOT show the raw URL.
                3. You MUST use relevant keywords or phrases as the anchor text for the link.
                4. The link must flow naturally in the sentence.
                
                Articles to integrate:
                ${interlinks.map(link => `- Link to "${link.title}" (${link.link})`).join('\n')}
                `;
            }

            const prompt = `
            You are a professional human blogger who writes helpful, experience-driven articles.
            Write an engaging blog for ${audience} in ${language} on "${topic}". 
            
            Keywords to include: ${keywords || "none"}.
            Style: ${style}. 
            Minimum Words: ${lengthNum}.

            CONTENT REQUIREMENTS:
            - Write in first person, sharing real-experience style insights.
            - Tone: friendly, conversational, easy to understand. Avoid jargon.
            - Structure: Hooking Introduction, 4–6 main sections, Conclusion with CTA.
            - Use Markdown format: ## for main sections, ### for subsections, **bold**, *italic*.
            
            ${interlinkInstructions}

            ⚠️ Important: 
            - Do not use [1], [2] citation numbers. 
            - Insert valid external references as clickable Markdown links if relevant.
            `;

            console.log('Generating blog content via OpenAI (GPT-4o)...');
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an expert content writer." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 4000,
                n: 1
            });

            const blogText = response.choices[0].message.content || "";
            const wordCount = blogText.split(/\s+/).length;

            return { blogText, wordCount };

        } catch (error) {
            console.error('OpenAI Blog Content Gen Error:', error.message);
            throw new Error('Failed to generate blog content via OpenAI');
        }
    }

    async generateKeywords(topic) {
        try {
            const prompt = `Generate 5-10 relevant SEO keywords for "${topic}" as a comma-separated list.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an SEO expert." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 100
            });

            return response.choices[0].message.content || "";
        } catch (error) {
            console.error('OpenAI Keyword Gen Error:', error.message);
            return ""; // Fallback
        }
    }
}

export default new OpenAIService();
