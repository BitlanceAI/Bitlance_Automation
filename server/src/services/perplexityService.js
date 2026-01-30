import axios from 'axios';

class PerplexityService {
    constructor() {
        this.apiKey = process.env.PERPLEXITY_API_KEY;
        this.baseUrl = 'https://api.perplexity.ai/chat/completions';

        if (!this.apiKey) {
            console.warn('⚠️ PERPLEXITY_API_KEY is not set. Blog generation features will fail.');
        }
    }

    async generateTitleAndKeywords(industry) {
        try {
            const prompt = `Act as an SEO expert. For the industry "${industry}", suggest a high-potential, trending blog post Topic (Title) and a list of 5 relevant Keywords that would rank well. 
            Format exactly as JSON:
            {
               "topic": "The exact title of the blog post",
               "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5"
            }`;

            const response = await axios.post(
                this.baseUrl,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an SEO expert." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 500,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const content = response.data.choices?.[0]?.message?.content || "";
            // Clean markdown json blocks if any
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);

        } catch (error) {
            console.error('Perplexity Industry Idea Error:', error.message);
            // Fallback
            return {
                topic: `Top trends in ${industry}`,
                keywords: `${industry}, trends, news, update, guide`
            };
        }
    }

    async generateKeywords(topic) {
        try {
            const prompt = `Generate relevant keywords for "${topic}" as comma-separated list.`;
            const response = await axios.post(
                this.baseUrl,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an SEO expert." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 500,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data.choices?.[0]?.message?.content || "";
        } catch (error) {
            console.error('Perplexity Keyword Error:', error.response?.data || error.message);
            throw new Error('Failed to generate keywords');
        }
    }

    async generateBlogContent(topic, keywords, language, audience, style, lengthNum, attempts, maxAttempts, variants, interlinks = []) {
        let blogText = "";
        let wordCount = 0;
        let generatedKeywords = keywords;

        let currentAttempts = 0;

        while (wordCount < lengthNum && currentAttempts < maxAttempts) {
            currentAttempts++;

            // Build Interlinking Instructions
            let interlinkInstructions = "";
            if (interlinks && interlinks.length > 0) {
                interlinkInstructions = `
                MANDATORY INTERLINKING RULES:
                1. You MUST include links to the following articles within the content.
                2. Do NOT list them at the end. Do NOT show the raw URL.
                3. You MUST use relevant keywords or phrases as the anchor text for the link.
                4. The link must flow naturally in the sentence.
                
                Example:
                Good: "For more details on [market trends](URL), check our guide."
                Bad: "Check this link: URL" or "Read more: [Title](URL)"
                
                Articles to integrate:
                ${interlinks.map(link => `- Link to "${link.title}" (${link.link})`).join('\n')}
                `;
            }

            // Construct the Advanced Prompt
            const prompt = `
            You are a professional human blogger who writes helpful, experience-driven real estate articles in first person.
            Write an engaging blog for ${audience} in ${language} on "${topic}". 
            
            Keywords to include: ${generatedKeywords || "none"}.
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
            - ${blogText ? "Continue strictly from previous text: " + blogText.substring(blogText.length - 100) : "Start from the beginning."}
            `;

            try {
                const n_variants = parseInt(variants, 10);
                const safe_n = (!isNaN(n_variants) && n_variants > 0) ? n_variants : 1;
                console.log('Generating blog with n=', safe_n, '(from variants:', variants, ')');

                const response = await axios.post(
                    this.baseUrl,
                    {
                        model: "sonar-pro",
                        messages: [
                            { role: "system", content: "You are an expert content writer." },
                            { role: "user", content: prompt + "\n\nOutput valid Markdown." },
                        ],
                        max_tokens: 4000,
                        n: 1, // sonar-pro only supports n=1
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.apiKey}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const newContent = response.data.choices?.[0]?.message?.content || "";
                blogText += "\n\n" + newContent;
                wordCount = blogText.split(/\s+/).length;

            } catch (error) {
                console.error('Perplexity Blog Gen Error:', error.response?.data || error.message);
                throw new Error('Failed to generate blog content');
            }
        }

        return { blogText, wordCount };
    }

    async generateSeoTitle(blogText, topic) {
        try {
            const prompt = `Based on this blog content, generate the best SEO-friendly title (max 60 characters) that is catchy and optimized for search engines:
            ${blogText.substring(0, 1200)}
            Topic: ${topic}
            Return only the title, nothing else.`;

            const response = await axios.post(
                this.baseUrl,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are an expert SEO copywriter." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 50,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.choices?.[0]?.message?.content?.trim() || topic;
        } catch (error) {
            console.error('Perplexity SEO Title Error:', error.message);
            return topic; // Fallback
        }
    }

    async checkPlagiarism(blogText) {
        try {
            console.log('🔍 Starting plagiarism check...');

            if (!blogText || blogText.trim() === '') {
                console.warn('⚠️ Empty blog text provided to plagiarism checker');
                return "Plagiarism check skipped - empty content";
            }

            const prompt = `Check for plagiarism in this article. Reply "No plagiarism detected" if original, otherwise summarize detected parts:\n\n${blogText.substring(0, 3000)}`; // Truncate for token limits if needed

            const response = await axios.post(
                this.baseUrl,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are a plagiarism checker." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 500,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log('✅ Plagiarism check API response received');

            let result = response.data?.choices?.[0]?.message?.content;

            if (!result || result.trim() === '') {
                console.warn('⚠️ Empty response from plagiarism API, using fallback');
                result = "No plagiarism detected";
            }

            result = result.trim();

            if (!result.toLowerCase().includes("no plagiarism")) {
                result += " ⚠️ Could not fully eliminate plagiarism, but the article is returned to user.";
            }

            console.log('✅ Plagiarism check result:', result.substring(0, 100) + '...');
            return result;
        } catch (error) {
            console.error('❌ Perplexity Plagiarism Error:', error.response?.data || error.message);
            return "Plagiarism check unavailable - service error";
        }
    }

    async generateImageText(blogText, topic) {
        try {
            const prompt = `Based on this blog content, create a short, simplest, small and catchy headline or phrase (maximum 3 words) that would look good on a blog header image. Make it engaging and relevant to the content:
            ${blogText.substring(0, 1000)}
            Topic: ${topic}
            Return only the headline text, nothing else.`;

            const response = await axios.post(
                this.baseUrl,
                {
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are a marketing copywriter expert at creating catchy headlines." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 100,
                    n: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let text = response.data.choices?.[0]?.message?.content?.trim() || topic;
            // Clean up
            return text.replace(/^["']|["']$/g, '').replace(/[^\w\s-]/g, '').trim();
        } catch (error) {
            console.error('Perplexity Image Text Error:', error.message);
            return topic;
        }
    }
}

export default new PerplexityService();
