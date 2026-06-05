"""
Blog AI Service
Handles all AI-powered generation via Perplexity (sonar-pro), OpenAI fallback (GPT-4o),
and Google Gemini Imagen 3 for image generation.
Ported from Node.js: perplexityService.js + openAIService.js

Research tasks (topic discovery, keyword research, plagiarism checking) are
handled by LangChain SERP tools (serp_tools.py) backed by SerpAPI.
Perplexity / OpenAI remain as fallback when SERP_API_KEY is not set.
"""

import os
import json
import requests
from typing import Optional


PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")

try:
    from openai import OpenAI
    _OPENAI_SDK_AVAILABLE = True
    _openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    _OPENAI_SDK_AVAILABLE = False
    _openai_client = None


# Import SERP tools — will be None if the module fails to load
try:
    from app.services.serp_tools import (
        trending_topics_tool,
        keyword_research_tool,
        plagiarism_check_tool,
    )
    _SERP_AVAILABLE = bool(os.getenv("SERP_API_KEY"))
except Exception as _serp_import_err:  # pragma: no cover
    print(f"serp_tools import failed, SERP disabled: {_serp_import_err}")
    _SERP_AVAILABLE = False

PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions"
OPENAI_CHAT_URL     = "https://api.openai.com/v1/chat/completions"


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _perplexity_call(user_prompt: str, system_msg: str = "You are an expert.", max_tokens: int = 4000, model: str = "sonar-pro") -> str:
    """Make a single call to Perplexity and return the text content."""
    if not PERPLEXITY_API_KEY:
        raise RuntimeError("PERPLEXITY_API_KEY is not set")

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "n": 1,
    }
    res = requests.post(PERPLEXITY_BASE_URL, headers=headers, json=payload, timeout=120)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


def _openai_chat_call(user_prompt: str, system_msg: str = "You are an expert.", max_tokens: int = 4000) -> str:
    """Make a single call to OpenAI GPT-4o and return the text content."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "n": 1,
    }
    res = requests.post(OPENAI_CHAT_URL, headers=headers, json=payload, timeout=120)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


# ─────────────────────────────────────────────────────────────────────────────
# PERPLEXITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def generate_title_and_keywords(industry: str) -> dict:
    """
    Auto-generate a blog topic + keyword list for a given industry.
    Uses SerpAPI (real Google data) when SERP_API_KEY is set,
    falls back to Perplexity sonar-pro otherwise.
    Returns: {"topic": str, "keywords": str}
    """
    if _SERP_AVAILABLE:
        try:
            result = trending_topics_tool.run(industry)
            # tool returns a dict; BaseTool.run may stringify it
            if isinstance(result, str):
                result = json.loads(result)
            print(f"generate_title_and_keywords: used SerpAPI for '{industry}'")
            return result
        except Exception as e:
            print(f"SerpAPI trending topics failed, falling back to Perplexity: {e}")

    prompt = (
        f'Act as an SEO expert. For the industry "{industry}", suggest a high-potential, '
        f'trending blog post Topic (Title) and a list of 5 relevant Keywords that would rank well.\n'
        f'Format exactly as JSON:\n'
        f'{{"topic": "The exact title of the blog post", "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5"}}'
    )
    try:
        raw = _perplexity_call(prompt, "You are an SEO expert.", max_tokens=500)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"Perplexity industry idea error: {e}")
        return {
            "topic": f"Top trends in {industry}",
            "keywords": f"{industry}, trends, news, update, guide",
        }


def generate_keywords(topic: str) -> str:
    """
    Return a comma-separated list of SEO keywords for the given topic.
    Uses SerpAPI (real related searches + PAA) when SERP_API_KEY is set,
    falls back to Perplexity sonar-pro otherwise.
    """
    if _SERP_AVAILABLE:
        try:
            result = keyword_research_tool.run(topic)
            print(f"generate_keywords: used SerpAPI for '{topic}'")
            return result
        except Exception as e:
            print(f"SerpAPI keyword research failed, falling back to Perplexity: {e}")

    prompt = (
        f'You are an SEO keyword research expert. For the topic "{topic}", generate 8–12 high-value keywords.\n'
        f'Include: 1 primary keyword (exact match), 3–4 long-tail variations (3+ words), 2–3 LSI/semantic keywords, 1–2 question-based keywords (e.g. "how to...", "what is...").\n'
        f'Return ONLY a comma-separated list of keywords. No explanations, no numbering, no headers.'
    )
    return _perplexity_call(prompt, "You are an SEO expert.", max_tokens=200)


def generate_blog_content(
    topic: str,
    keywords: str,
    language: str,
    audience: str,
    style: str,
    length_num: int,
    interlinks: Optional[list] = None,
    max_attempts: int = 1,
    mode: str = "SEO",
) -> dict:
    """
    Generate full blog content using Perplexity sonar-pro.
    Retries until word count reaches length_num (up to max_attempts).
    Returns: {"blogText": str, "wordCount": int}
    """
    interlinks = interlinks or []
    blog_text = ""
    word_count = 0
    current_attempts = 0

    # Fetch real-time People Also Ask questions
    real_questions = []
    try:
        api_key = os.getenv("SERP_API_KEY") or os.getenv("SERPAPI_API_KEY")
        if api_key:
            search_data = requests.get("https://serpapi.com/search.json", params={
                "api_key": api_key, "q": topic, "hl": "en", "gl": "us", "num": 5
            }, timeout=60).json()
            paa_list = search_data.get("related_questions", [])
            real_questions = [q.get("question") for q in paa_list if q.get("question")]
    except Exception as e:
        print(f"PAA fetch failed: {e}")

    paa_instructions = ""
    if real_questions:
        paa_instructions = f"\n   You MUST use these EXACT real-world Google search questions for your FAQs:\n   " + "\n   ".join([f"- {q}" for q in real_questions])

    # Build interlinking instructions
    interlink_instructions = ""
    if interlinks:
        links_str = "\n".join(
            f'- "{lnk["title"]}" → {lnk["link"]}'
            for lnk in interlinks
            if isinstance(lnk, dict) and lnk.get("link")
        )
        if mode == "GEO":
            interlink_instructions = f"""
        ══ GENERATIVE ENGINE OPTIMIZATION (GEO) CITATION LINKING ══
        You MUST naturally embed ALL of the following internal links into the article as AUTHORITATIVE CITATIONS.
        This is critical so that AI search engines (Perplexity, ChatGPT, Gemini) recognize these links as high-authority sources.

        RULES (violating any rule = rejection):
        1. Format every link as a Markdown hyperlink: [keyword-rich anchor text](URL).
        2. Frame the link as an authoritative reference or data source.
        3. Examples of GEO-optimized framing: 
           - "According to recent industry analysis on [AI lead qualification systems](https://example.com/ai-leads)..."
           - "As detailed in the comprehensive guide on [automating social media workflows](https://example.com/social)..."
           - "Research highlights that [predictive real estate models](https://example.com/models) have increased..."
        4. Place each citation naturally inside a full sentence within a body paragraph.
        5. Spread links evenly — no two consecutive links in the same paragraph.
        6. ONLY use the links listed below — add NO other external URLs.

        Links to embed as Citations:
        {links_str}
        ══════════════════════════════════════════════════════════
        """
        else:
            interlink_instructions = f"""
        ══ SEO INTERNAL LINKING ══
        You MUST naturally embed ALL of the following internal links into the article to scale on Google search engines.
        Use natural anchor text within the body of the article. Do not cluster them together.
        
        Links to embed:
        {links_str}
        ══════════════════════════════════════════════════════════
        """

    while word_count < length_num and current_attempts < max_attempts:
        current_attempts += 1
        continuation = (
            f"Continue strictly from where the previous draft ended: '{blog_text[-120:].strip()}'"
            if blog_text
            else "Start from the very beginning of the article."
        )

        kw_list        = [k.strip() for k in keywords.split(",") if k.strip()] if keywords else [topic]
        primary_keyword = kw_list[0]
        secondary_kws   = ", ".join(kw_list[1:6]) if len(kw_list) > 1 else ""
        lsi_note        = f"Secondary/LSI keywords to weave in naturally: {secondary_kws}" if secondary_kws else ""

        if mode == "SEO":
            expert_persona = "You are a world-class SEO content strategist. Your ONLY goal is to produce a blog post that scales and ranks on the first page of Google Search."
        else:
            expert_persona = "You are a Generative Engine Optimization (GEO) expert. Your ONLY goal is to produce content optimized for LLM citations, Perplexity, and AI search engines."

        faq_section = ""
        if mode == "GEO":
            faq_section = f"""
11. FAQ SECTION  (H2: "Frequently Asked Questions About {primary_keyword}")
   - Add EXACTLY 5 Q&A pairs directly related to '{primary_keyword}'.
   - {paa_instructions if paa_instructions else f"Generate 5 highly relevant 'People Also Ask' style questions specifically about {primary_keyword}."}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
"""

        if mode == "SEO":
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Avoid unnatural or awkward phrasing like "How to utilize AI? 7 Ways".
   - Use dynamic, natural, and highly compelling phrasing (e.g., "How AI Will Shape the New Era: 7 Practical Ways to Stay Ahead").
   - 50–70 characters.

2. STATISTICS AT A GLANCE BLOCK
   - Add a bolded H2: "{primary_keyword} Facts at a Glance" (or similar title adapted to the topic).
   - Include 4-5 fast, scannable bullet points (•) with hard, highly technical facts (e.g., "Modern GPUs contain 20B+ transistors" or "AI workloads see 10–50x acceleration"). Do not scatter the statistics; keep them tightly clustered here.

3. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >)
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

4. INTRODUCTION (120–160 words)
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.
   - Open with a striking statistic, question, or provocative statement.
   - State exactly what the reader will learn and why it matters to them.
   - End with a smooth transition into the Table of Contents.

5. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

6. MAIN BODY — 5 to 7 H2 SECTIONS
   Each section MUST:
   a) Open with a sentence that naturally contains a keyword variation or LSI term.
   b) Deliver ONE clear, actionable insight — no generic observations.
   c) Include at least ONE of: a numbered step list, a bullet list, a data point,
      a comparison table, a real-world example, or a pro tip callout.
   d) Use H3 subsections (2–3 per H2) for complex topics to create a clear hierarchy.
   e) Paragraphs: 2–4 sentences max. No walls of text.
   f) Bold the most important phrase or takeaway in each paragraph.
   g) Strong Entity Coverage: You MUST explicitly mention major knowledge graph entities (e.g., OpenAI, Google DeepMind, Anthropic, NVIDIA, AWS) where relevant.
   h) Deep Technical Citations & Expert Sources: You MUST cite highly authoritative sources, including research citations, technical reports, and specific architecture references (e.g., Stanford AI Index, Gartner, Deloitte, NVIDIA architecture whitepapers) to boost EEAT.

   REQUIRED SECTIONS:
   - Dynamic, Editorial Topic Sections: DO NOT use templated headings like "Benefits", "Challenges", "Mistakes", "Future Trends", or "Conclusion".
   - Instead, create 5-7 highly specific, dynamic, editorial-style headings tailored precisely to the topic.
   - Examples of good dynamic headings: "Why AI Matters Right Now", "The AI Opportunity Gap", "The 5-Step AI Adoption Framework", "When AI Becomes Dangerous", "What Happens By 2030".
   - Ensure you cover contrarian viewpoints and deep analysis, avoiding generic surface-level observations.

7. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - Restate the primary keyword naturally.
   - End with a strong, specific call-to-action.
"""
        else:
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Make it compelling and highly clickable.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >) 
   - 140–155 characters, includes primary keyword, states clear benefit.

3. QUICK ANSWER BLOCK (Critical for AI Retrieval)
   - Add a bolded H2: "Quick Answer"
   - Write a dense, 3-4 sentence direct answer to the core topic/keyword. 
   - No fluff, highly factual, perfect for AI ingestion.

4. AI OVERVIEW SUMMARY
   - Add a bolded H2: "AI Overview Summary"
   - Summarize the entire article's thesis in a highly quotable 50-word paragraph.

5. STATISTICS BOX
   - Add a bolded H2: "{primary_keyword} Statistics"
   - Include 4-6 bullet points with hard data (e.g., "30% of tasks automatable", "8 hours saved").

6. DEDICATED FACT BOX
   - Add a bolded H2: "{primary_keyword} Facts"
   - Provide 4-5 fast, scannable facts using checkmarks (✓). Example: "✓ AI improves feedback speed".

7. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below.

8. MAIN BODY — Dynamic Topic-Specific Sections
   - DO NOT use generic templates like "Benefits", "Steps", "Mistakes".
   - Create 4-6 specific, highly relevant H2 sections tailored precisely to the topic.
   - High Entity Density (Increase by 40%): You MUST explicitly mention specific industry-standard hardware, software, organizations, and frameworks relevant to the topic (e.g., if AI: OpenAI, DeepMind; if GPUs: NVIDIA Blackwell, PyTorch; if automation: Zapier, HubSpot). Do not use generic terms.
   - Research Source Layer: You MUST cite highly authoritative academic or institutional sources (e.g., Stanford AI Index, OECD, UNESCO, Harvard Education Review, MIT Technology Review, McKinsey) to build maximum trust.

9. MYTH VS REALITY TABLE
   - You MUST include a highly detailed Markdown Comparison Table explicitly comparing "Myth" vs "Reality" for the topic.
   - Format: | Myth | Reality | Explanation |

10. CITATION MAGNETS (Expert Insights)
    - You MUST include 2 "Expert Insight" blocks (use > blockquotes).
    - Make these highly analytical, original, and controversial or deep so they get cited by LLMs.
{faq_section}
12. KEY TAKEAWAYS BLOCK
    - Add a bolded H2: "Key Takeaways"
    - Provide 5 extremely concise bullet points summarizing the core thesis of the article.

13. CONCLUSION  (H2: "Final Thoughts: {primary_keyword}")
    - 80–120 words.
    - End with a strong, specific call-to-action.
"""

        prompt = f"""
{expert_persona}

═══════════════ ASSIGNMENT ═══════════════
TOPIC            : "{topic}"
PRIMARY KEYWORD  : "{primary_keyword}"
{lsi_note}
ALL KEYWORDS     : {keywords or "none"}
TARGET AUDIENCE  : {audience}
LANGUAGE        : {language}
WRITING STYLE   : {style}
MINIMUM WORDS   : {length_num}
═══════════════════════════════════════════

══ MANDATORY ARTICLE STRUCTURE (follow exactly, in order) ══
{mandatory_structure}

══ KEYWORD PLACEMENT — CRITICAL FOR RANKING ══
- Primary keyword appears in: H1, first sentence of intro, at least 2 H2 headings,
  the conclusion, AND the meta description block.
- Keyword density: 1.0–1.5% — natural usage only, never forced.
- Distribute secondary/LSI keywords across body paragraphs (not clustered).
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T SIGNALS (Google's quality framework) ══
- Write as a clear subject-matter expert: explicitly cite highly authoritative sources (e.g., Gartner, HubSpot, Salesforce, Deloitte, McKinsey, World Economic Forum, or their industry equivalents).
- Include original insights: Do not just explain; analyze. Include contrarian opinions, unique frameworks, and original observations (e.g., "The hidden weakness of...", "Why X might fail...", "When NOT to automate...").
- Stronger Topical Authority: Dive deep into broad subtopics (e.g., CRM, Marketing, HR, Finance, AI, Workflow). Ensure the article covers the topic holistically. Do not just skim the surface.
- Competitor Gap Coverage: Anticipate what top-ranking articles discuss and intentionally cover advanced subtopics they miss.
- Include first-person insights where natural ("In my experience...", "I've seen...").
- Demonstrate depth: go beyond surface-level explanations into the "why" and "how".

══ FEATURED SNIPPET OPTIMISATION ══
- Include ONE paragraph directly below an H2 that answers "What is {primary_keyword}?"
  in 40–60 words in plain, declarative language — this targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.
- The FAQ section targets PAA (People Also Ask) snippets.

{interlink_instructions}

══ FORMATTING RULES ══
- Use **bold** for key terms (first occurrence) and critical takeaways.
- Use *italic* for emphasis only — sparingly (max 3 per section).
- Use > blockquotes for expert quotes, pro tips, or key statistics.
- Use comparison tables (Markdown) where beneficial to compare features/ideas.
- Do NOT use horizontal rules (---) between sections — use heading hierarchy instead.

⚠️ ABSOLUTE RULES (any violation = full rejection):
- Do NOT include [1], [2], or any academic-style citation numbers.
- Do NOT use filler phrases: "In conclusion, as we have seen", "It goes without saying",
  "In today's fast-paced world", "In the digital age", "Without further ado".
- {"ONLY use the internal links listed above — add NO other external URLs anywhere." if interlinks else "Do NOT add any external links or URLs anywhere in the content."}
- Every sentence must add value — delete any sentence that could be cut without loss.
- The entire article MUST be written ONLY in {language}. Absolutely no foreign words or characters.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary, no "Here is your article:".
- NEVER output HTML tags (e.g., <h1>, <p>, <h2>, <strong>, <ul>). You MUST use ONLY pure Markdown syntax (e.g., #, ##, **, -, *).
- {continuation}
        """

        new_content = _perplexity_call(
            prompt,
            "You are a world-class SEO content strategist. Follow the brief exactly.",
            max_tokens=8000,
        )

        blog_text += "\n\n" + new_content
        word_count = len(blog_text.split())

    return {"blogText": blog_text.strip(), "wordCount": word_count}


def _clean_title(raw: str, topic: str) -> str:
    """Strip model annotations and surrounding quotes from a generated SEO title."""
    import re
    title = re.sub(r'[\(\[]\d+\s*(?:chars?|characters?)[\)\]]', '', raw, flags=re.IGNORECASE).strip()
    title = title.strip('"\'')
    return title if title else topic


def generate_seo_title(blog_text: str, topic: str) -> str:
    """Generate an SEO-optimised title from blog content.
    Primary: Perplexity sonar-pro  →  Fallback: OpenAI GPT-4o
    """
    prompt = (
        f"Based on this blog content, generate ONE perfect SEO title tag for this blog post.\n"
        f"Topic: {topic}\n\n"
        f"Content preview:\n{blog_text[:1200]}\n\n"
        f"SEO Title Rules:\n"
        f"- Return ONLY the title itself — no quotes, no explanations, no extra text.\n"
        f"- Place the PRIMARY keyword as close to the beginning of the title as possible.\n"
        f"- Keep it between 50–60 characters (search engines truncate beyond 60).\n"
        f"- Make it compelling and click-worthy — it appears as the clickable headline in Google results.\n"
        f"- Do NOT include character counts, annotations like '(37 chars)', or numbering like '1.'.\n"
        f"- Do NOT use clickbait or misleading language — accurately reflect the content.\n"
        f"- Use a power word or number if it fits naturally (e.g. 'Best', 'Complete Guide', '7 Tips')."
    )
    system = "You are an expert SEO copywriter."

    # ── Primary: Perplexity ───────────────────────────────────────────────────
    try:
        raw = _perplexity_call(prompt, system, max_tokens=60).strip()
        return _clean_title(raw, topic)
    except Exception as e:
        print(f"Perplexity SEO title error: {e}")

    # ── Fallback: OpenAI ──────────────────────────────────────────────────────
    try:
        raw = _openai_chat_call(prompt, system, max_tokens=60).strip()
        return _clean_title(raw, topic)
    except Exception as e:
        print(f"OpenAI SEO title error: {e}")

    return topic


def check_plagiarism(blog_text: str) -> str:
    """
    Check plagiarism. Returns a human-readable result string.
    Priority: SerpAPI (real Google search) → Perplexity → OpenAI → skip
    """
    if not blog_text or not blog_text.strip():
        return "Plagiarism check skipped - empty content"

    # ── Primary: SerpAPI exact-phrase search ──────────────────────────────────
    if _SERP_AVAILABLE:
        try:
            result = plagiarism_check_tool.run(blog_text)
            print("check_plagiarism: used SerpAPI exact-phrase search")
            return result
        except Exception as e:
            print(f"SerpAPI plagiarism check failed: {e}")

    prompt = (
        f'Check for plagiarism in this article. Reply "No plagiarism detected" if original, '
        f"otherwise summarize detected parts:\n\n{blog_text[:3000]}"
    )
    system = "You are a plagiarism checker."

    # ── Secondary: Perplexity ─────────────────────────────────────────────────
    try:
        result = _perplexity_call(prompt, system, max_tokens=500).strip()
        if "no plagiarism" not in result.lower():
            result += " ⚠️ Could not fully eliminate plagiarism, but the article is returned to user."
        return result
    except Exception as e:
        print(f"Perplexity plagiarism error: {e}")

    # ── Fallback: OpenAI ──────────────────────────────────────────────────────
    try:
        result = _openai_chat_call(prompt, system, max_tokens=500).strip()
        if "no plagiarism" not in result.lower():
            result += " ⚠️ Could not fully eliminate plagiarism, but the article is returned to user."
        return result
    except Exception as e:
        print(f"OpenAI plagiarism error: {e}")

    return "Plagiarism check unavailable - all services failed"


def generate_image_text(blog_text: str, topic: str) -> str:
    """Generate a short (≤3 word) catchy headline for a blog header image.
    Primary: Perplexity  →  Fallback: OpenAI
    """
    prompt = (
        f"Based on this blog content, create a short, simplest, small and catchy headline or phrase "
        f"(maximum 3 words) that would look good on a blog header image. "
        f"Make it engaging and relevant to the content:\n{blog_text[:1000]}\n"
        f"Topic: {topic}\nReturn only the headline text, nothing else."
    )
    system = "You are a marketing copywriter expert at creating catchy headlines."

    # ── Primary: Perplexity ───────────────────────────────────────────────────
    try:
        text = _perplexity_call(prompt, system, max_tokens=100).strip()
        return text.replace('"', "").replace("'", "").strip()
    except Exception as e:
        print(f"Perplexity image text error: {e}")

    # ── Fallback: OpenAI ──────────────────────────────────────────────────────
    try:
        text = _openai_chat_call(prompt, system, max_tokens=100).strip()
        return text.replace('"', "").replace("'", "").strip()
    except Exception as e:
        print(f"OpenAI image text error: {e}")

    return topic


# ─────────────────────────────────────────────────────────────────────────────
# OPENAI FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def openai_generate_keywords(topic: str) -> str:
    """Fallback keyword generation via OpenAI GPT-4o."""
    prompt = (
        f'You are an SEO keyword research expert. For the topic "{topic}", generate 8–12 high-value keywords.\n'
        f'Include: 1 primary keyword (exact match), 3–4 long-tail variations (3+ words), 2–3 LSI/semantic keywords, 1–2 question-based keywords (e.g. "how to...", "what is...").\n'
        f'Return ONLY a comma-separated list of keywords. No explanations, no numbering, no headers.'
    )
    try:
        return _openai_chat_call(prompt, "You are an SEO expert.", max_tokens=200)
    except Exception as e:
        print(f"OpenAI keyword error: {e}")
        return ""


def openai_generate_blog_content(
    topic: str,
    keywords: str,
    language: str,
    audience: str,
    style: str,
    length_num: int,
    interlinks: Optional[list] = None,
    mode: str = "SEO",
) -> dict:
    """Fallback blog content generation via OpenAI GPT-4o."""
    interlinks = interlinks or []

    # Fetch real-time People Also Ask questions
    real_questions = []
    try:
        api_key = os.getenv("SERP_API_KEY") or os.getenv("SERPAPI_API_KEY")
        if api_key:
            search_data = requests.get("https://serpapi.com/search.json", params={
                "api_key": api_key, "q": topic, "hl": "en", "gl": "us", "num": 5
            }, timeout=60).json()
            paa_list = search_data.get("related_questions", [])
            real_questions = [q.get("question") for q in paa_list if q.get("question")]
    except Exception as e:
        print(f"PAA fetch failed: {e}")

    paa_instructions = ""
    if real_questions:
        paa_instructions = f"\n   You MUST use these EXACT real-world Google search questions for your FAQs:\n   " + "\n   ".join([f"- {q}" for q in real_questions])

    interlink_instructions = ""
    if interlinks:
        links_str = "\n".join(
            f'- "{lnk["title"]}" → {lnk["link"]}'
            for lnk in interlinks
            if isinstance(lnk, dict) and lnk.get("link")
        )
        if mode == "GEO":
            interlink_instructions = f"""
        ══ GENERATIVE ENGINE OPTIMIZATION (GEO) CITATION LINKING ══
        You MUST naturally embed ALL of the following internal links into the article as AUTHORITATIVE CITATIONS.
        This is critical so that AI search engines (Perplexity, ChatGPT, Gemini) recognize these links as high-authority sources.

        RULES (violating any rule = rejection):
        1. Format every link as a Markdown hyperlink: [keyword-rich anchor text](URL).
        2. Frame the link as an authoritative reference or data source.
        3. Examples of GEO-optimized framing: 
           - "According to recent industry analysis on [AI lead qualification systems](https://example.com/ai-leads)..."
           - "As detailed in the comprehensive guide on [automating social media workflows](https://example.com/social)..."
           - "Research highlights that [predictive real estate models](https://example.com/models) have increased..."
        4. Place each citation naturally inside a full sentence within a body paragraph.
        5. ONLY use the links listed below — add NO other external URLs.

        Links to embed as Citations:
        {links_str}
        ══════════════════════════════════════════════════════════
        """
        else:
            interlink_instructions = f"""
        ══ SEO INTERNAL LINKING ══
        You MUST naturally embed 2 to 3 of the MOST RELEVANT internal links from the list below into the article.
        Do NOT embed all of them. Google prefers relevance over quantity. Select only the top 2-3 links that best fit the context.
        Use natural anchor text within the body of the article. Do not cluster them together.
        
        Links to embed:
        {links_str}
        ══════════════════════════════════════════════════════════
        """

    kw_list         = [k.strip() for k in keywords.split(",") if k.strip()] if keywords else [topic]
    primary_keyword = kw_list[0]
    secondary_kws   = ", ".join(kw_list[1:6]) if len(kw_list) > 1 else ""
    lsi_note        = f"Secondary/LSI keywords to weave in naturally: {secondary_kws}" if secondary_kws else ""

    if mode == "SEO":
        expert_persona = "You are a world-class SEO content strategist. Your ONLY goal is to produce a blog post that scales and ranks on the first page of Google Search."
    else:
        expert_persona = "You are a Generative Engine Optimization (GEO) expert. Your ONLY goal is to produce content optimized for LLM citations, Perplexity, and AI search engines."

    faq_section = ""
    if mode == "GEO":
        faq_section = f"""
11. FAQ SECTION  (H2: "Frequently Asked Questions About {primary_keyword}")
   - Add EXACTLY 5 Q&A pairs directly related to '{primary_keyword}'.
   - {paa_instructions if paa_instructions else f"Generate 5 highly relevant 'People Also Ask' style questions specifically about {primary_keyword}."}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
"""

    if mode == "SEO":
        advanced_optimization = """
══ ELITE 2026 SEO CONTENT OPTIMIZER ══
- Semantic SEO & Entities: Naturally weave in missing semantic keywords and related entities. Ensure deep topical authority by covering subtopics competitors likely mention.
- Search Intent Match: Directly address the underlying user intent within the first 100 words.
- Content Depth: Expand shallow sections. Every single section MUST provide unique value.
- Featured Snippet Potential: Format definitions and lists to trigger Google's Position Zero.
- Readability & Heading Structure: Improve all headings and subheadings. Clear H1-H2-H3 hierarchy with scannable, actionable content. Remove fluff, repetition, and AI-sounding language.
"""
    else:
        advanced_optimization = """
══ ELITE 2026 GEO (Generative Engine Optimization) SPECIALIST ══
- AI Citation Potential: Structure claims so they are highly probable to be cited by Perplexity, ChatGPT, Gemini, and Claude. Make answers direct and explicit.
- Direct Answer Quality: Provide extremely dense, fact-rich sentences. Prefer facts over storytelling.
- AI Overview Readiness: Write modular, self-contained paragraphs that an AI engine can easily extract and summarize without losing context. Create highly quotable paragraphs.
- Knowledge Graph Relevance: Add authoritative industry terms and entities explicitly.
- Retrieval-Friendly Formatting: Convert hidden answers into clear answer blocks. Use concise explanations before detailed explanations.
"""

        if mode == "SEO":
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Avoid unnatural or awkward phrasing like "How to utilize AI? 7 Ways".
   - Use dynamic, natural, and highly compelling phrasing (e.g., "How AI Will Shape the New Era: 7 Practical Ways to Stay Ahead").
   - 50–70 characters.

2. STATISTICS AT A GLANCE BLOCK
   - Add a bolded H2: "{primary_keyword} Facts at a Glance" (or similar title adapted to the topic).
   - Include 4-5 fast, scannable bullet points (•) with hard, highly technical facts (e.g., "Modern GPUs contain 20B+ transistors" or "AI workloads see 10–50x acceleration"). Do not scatter the statistics; keep them tightly clustered here.

3. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >)
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

4. INTRODUCTION (120–160 words)
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.
   - Open with a striking statistic, question, or provocative statement.
   - State exactly what the reader will learn and why it matters to them.
   - End with a smooth transition into the Table of Contents.

5. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

6. MAIN BODY — 5 to 7 H2 SECTIONS
   Each section MUST:
   a) Open with a sentence that naturally contains a keyword variation or LSI term.
   b) Deliver ONE clear, actionable insight — no generic observations.
   c) Include at least ONE of: a numbered step list, a bullet list, a data point,
      a comparison table, a real-world example, or a pro tip callout.
   d) Use H3 subsections (2–3 per H2) for complex topics to create a clear hierarchy.
   e) Paragraphs: 2–4 sentences max. No walls of text.
   f) Bold the most important phrase or takeaway in each paragraph.
   g) Strong Entity Coverage: You MUST explicitly mention major knowledge graph entities (e.g., OpenAI, Google DeepMind, Anthropic, NVIDIA, AWS) where relevant.
   h) Deep Technical Citations & Expert Sources: You MUST cite highly authoritative sources, including research citations, technical reports, and specific architecture references (e.g., Stanford AI Index, Gartner, Deloitte, NVIDIA architecture whitepapers) to boost EEAT.

   REQUIRED SECTIONS:
   - Dynamic, Editorial Topic Sections: DO NOT use templated headings like "Benefits", "Challenges", "Mistakes", "Future Trends", or "Conclusion".
   - Instead, create 5-7 highly specific, dynamic, editorial-style headings tailored precisely to the topic.
   - Examples of good dynamic headings: "Why AI Matters Right Now", "The AI Opportunity Gap", "The 5-Step AI Adoption Framework", "When AI Becomes Dangerous", "What Happens By 2030".
   - Ensure you cover contrarian viewpoints and deep analysis, avoiding generic surface-level observations.

7. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - Restate the primary keyword naturally.
   - End with a strong, specific call-to-action.
"""
        else:
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Make it compelling and highly clickable.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >) 
   - 140–155 characters, includes primary keyword, states clear benefit.

3. QUICK ANSWER BLOCK (Critical for AI Retrieval)
   - Add a bolded H2: "Quick Answer"
   - Write a dense, 3-4 sentence direct answer to the core topic/keyword. 
   - No fluff, highly factual, perfect for AI ingestion.

4. AI OVERVIEW SUMMARY
   - Add a bolded H2: "AI Overview Summary"
   - Summarize the entire article's thesis in a highly quotable 50-word paragraph.

5. STATISTICS BOX
   - Add a bolded H2: "{primary_keyword} Statistics"
   - Include 4-6 bullet points with hard data (e.g., "30% of tasks automatable", "8 hours saved").

6. DEDICATED FACT BOX
   - Add a bolded H2: "{primary_keyword} Facts"
   - Provide 4-5 fast, scannable facts using checkmarks (✓). Example: "✓ AI improves feedback speed".

7. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below.

8. MAIN BODY — Dynamic Topic-Specific Sections
   - DO NOT use generic templates like "Benefits", "Steps", "Mistakes".
   - Create 4-6 specific, highly relevant H2 sections tailored precisely to the topic.
   - High Entity Density (Increase by 40%): You MUST explicitly mention specific industry-standard hardware, software, organizations, and frameworks relevant to the topic (e.g., if AI: OpenAI, DeepMind; if GPUs: NVIDIA Blackwell, PyTorch; if automation: Zapier, HubSpot). Do not use generic terms.
   - Research Source Layer: You MUST cite highly authoritative academic or institutional sources (e.g., Stanford AI Index, OECD, UNESCO, Harvard Education Review, MIT Technology Review, McKinsey) to build maximum trust.

9. MYTH VS REALITY TABLE
   - You MUST include a highly detailed Markdown Comparison Table explicitly comparing "Myth" vs "Reality" for the topic.
   - Format: | Myth | Reality | Explanation |

10. CITATION MAGNETS (Expert Insights)
    - You MUST include 2 "Expert Insight" blocks (use > blockquotes).
    - Make these highly analytical, original, and controversial or deep so they get cited by LLMs.
{faq_section}
12. KEY TAKEAWAYS BLOCK
    - Add a bolded H2: "Key Takeaways"
    - Provide 5 extremely concise bullet points summarizing the core thesis of the article.

13. CONCLUSION  (H2: "Final Thoughts: {primary_keyword}")
    - 80–120 words.
    - End with a strong, specific call-to-action.
"""

        prompt = f"""
{expert_persona}

═══════════════ ASSIGNMENT ═══════════════
TOPIC            : "{topic}"
PRIMARY KEYWORD  : "{primary_keyword}"
{lsi_note}
ALL KEYWORDS     : {keywords or "none"}
TARGET AUDIENCE  : {audience}
LANGUAGE        : {language}
WRITING STYLE   : {style}
MINIMUM WORDS   : {length_num}
═══════════════════════════════════════════

══ MANDATORY ARTICLE STRUCTURE (follow exactly, in order) ══
{mandatory_structure}

══ KEYWORD PLACEMENT — CRITICAL FOR RANKING ══
- Primary keyword appears in: H1, first sentence of intro, at least 2 H2 headings,
  the conclusion, AND the meta description block.
- Keyword density: 1.0–1.5% — natural usage only, never forced.
- Distribute secondary/LSI keywords across body paragraphs (not clustered).
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T & CONTENT QUALITY SIGNALS ══
- Experience & Expertise: Write as a clear subject-matter expert. Explicitly cite authoritative industry sources (e.g., Gartner, HubSpot, Salesforce, Deloitte, McKinsey, World Economic Forum, or their industry equivalents).
- Original Insights & Analysis: Google rewards unique observations. Do not just explain—analyze. Include contrarian opinions, unique frameworks, and expert critiques (e.g., "The hidden weakness of...", "When NOT to automate...").
- Stronger Topical Authority: Dive deep into broad subtopics (e.g., CRM, Marketing, HR, Finance, AI, Workflow). Ensure the article covers the topic holistically. Do not just skim the surface with generic points.
- Competitor Gap Coverage: Anticipate what top competitors will write and cover the gaps. Add depth that standard AI content completely misses.
- Authoritativeness & Trustworthiness: Demonstrate depth. Add statistics when relevant. Ensure research-backed points instead of generic observations.
- Clarity & Actionability: Every paragraph must be clear and actionable. Add comparison tables (in Markdown) where beneficial to highlight differences.

══ FEATURED SNIPPET OPTIMISATION ══
- Include ONE paragraph directly below an H2 that answers "What is {primary_keyword}?"
  in 40–60 words in plain, declarative language — targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.
- The FAQ section targets PAA (People Also Ask) snippets.

{interlink_instructions}

{advanced_optimization}

══ FORMATTING RULES ══
- Use **bold** for key terms (first occurrence) and critical takeaways.
- Use *italic* for emphasis only — sparingly (max 3 per section).
- Use > blockquotes for expert quotes, pro tips, or key statistics.
- Use comparison tables (Markdown) where beneficial to compare features/ideas.
- Do NOT use horizontal rules (---) between sections.

⚠️ ABSOLUTE RULES (any violation = full rejection):
- Do NOT include [1], [2], or any academic-style citation numbers.
- Do NOT use filler phrases: "In conclusion, as we have seen", "It goes without saying",
  "In today's fast-paced world", "In the digital age", "Without further ado".
- {"ONLY use the internal links listed above — add NO other external URLs anywhere." if interlinks else "Do NOT add any external links or URLs anywhere in the content."}
- Every sentence must add value — delete any sentence that could be cut without loss.
- The entire article MUST be written ONLY in {language}. Absolutely no foreign words or characters.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary.
- NEVER output HTML tags (e.g., <h1>, <p>, <h2>, <strong>, <ul>). You MUST use ONLY pure Markdown syntax (e.g., #, ##, **, -, *).
    """

    blog_text = _openai_chat_call(
        prompt,
        "You are a world-class SEO content strategist. Follow the brief exactly.",
        max_tokens=8000,
    )
    return {"blogText": blog_text.strip(), "wordCount": len(blog_text.split())}


def generate_image(topic: str, image_text: str) -> str:
    """
    Generate a real AI image for the blog header using OpenAI DALL-E 3.
    """
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY not set, skipping image generation.")
        return ""
        
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        prompt = f"A high-quality, professional blog header image about: {topic}. Visual style: modern, clean, flat vector or 3D render. Include typography: '{image_text}'."
        payload = {
            "model": "gpt-image-2",
            "prompt": prompt,
            "n": 1,
            "size": "1792x1024",
            "quality": "auto",
        }
        print(f"Generating image with gpt-image-2 for topic: '{topic}'")
        res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload, timeout=120)
        res.raise_for_status()
        b64_data = res.json()["data"][0].get("b64_json", "")
        return f"data:image/png;base64,{b64_data}"
    except Exception as e:
        print(f"Error generating image with gpt-image-2: {e}")
        return ""



# ─────────────────────────────────────────────────────────────────────────────
# HTML FORMATTER (shared utility)
# ─────────────────────────────────────────────────────────────────────────────

def format_markdown_to_html(text: str) -> str:
    """Convert Markdown blog text to semantic HTML."""
    import re
    html = text

    # Strip any leading/trailing whitespace
    html = html.strip()

    # Headings — order matters: longest prefix first to avoid partial matches
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$',  r'<h3>\1</h3>',  html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$',   r'<h2>\1</h2>',   html, flags=re.MULTILINE)
    # H1: convert to <h1> and strip any stray leading '#' that wasn't converted
    html = re.sub(r'^# (.+)$',    r'<h1>\1</h1>',    html, flags=re.MULTILINE)

    # Inline formatting
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*',     r'<em>\1</em>',         html)

    # Hyperlinks
    html = re.sub(
        r'\[([^\]]+)\]\(([^)]+)\)',
        r'<a href="\2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">\1</a>',
        html,
    )

    # Bullet lists: convert lines starting with "- " or "* " into <ul><li> blocks
    def _replace_list_block(m):
        items = re.sub(r'^[-*] (.+)$', r'<li>\1</li>', m.group(0), flags=re.MULTILINE)
        return f'<ul>{items}</ul>'
    html = re.sub(r'(^[-*] .+$\n?)+', _replace_list_block, html, flags=re.MULTILINE)

    # Numbered lists: convert lines starting with "1. " "2. " etc.
    def _replace_ol_block(m):
        items = re.sub(r'^\d+\. (.+)$', r'<li>\1</li>', m.group(0), flags=re.MULTILINE)
        return f'<ol>{items}</ol>'
    html = re.sub(r'(^\d+\. .+$\n?)+', _replace_ol_block, html, flags=re.MULTILINE)

    # Wrap remaining plain-text blocks in <p> tags (skip lines that are already block tags)
    block_tags = re.compile(r'^<(h[1-6]|ul|ol|li|blockquote|pre|div)', re.IGNORECASE)
    lines = html.split('\n')
    result = []
    buffer = []

    def flush_buffer():
        chunk = ' '.join(buffer).strip()
        if chunk:
            result.append(f'<p>{chunk}</p>')
        buffer.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush_buffer()
        elif block_tags.match(stripped):
            flush_buffer()
            result.append(stripped)
        else:
            buffer.append(stripped)

    flush_buffer()
    return '\n'.join(result)
