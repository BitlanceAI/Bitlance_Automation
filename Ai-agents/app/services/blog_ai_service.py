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
            }, timeout=5).json()
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
6. FAQ SECTION  (H2: "Frequently Asked Questions About {{primary_keyword}}")
   - Add EXACTLY 5 Q&A pairs.
   - Each question targets a "People Also Ask" query for this topic.{paa_instructions}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
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

1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Make it compelling and click-worthy (use a number, power word, or promise).
   - 50–65 characters.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >) 
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

3. INTRODUCTION (120–160 words)
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.
   - Open with a striking statistic, question, or provocative statement.
   - State exactly what the reader will learn and why it matters to them.
   - End with a smooth transition into the Table of Contents.

4. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

5. MAIN BODY — 5 to 7 H2 SECTIONS
   Each section MUST:
   a) Open with a sentence that naturally contains a keyword variation or LSI term.
   b) Deliver ONE clear, actionable insight — no generic observations.
   c) Include at least ONE of: a numbered step list, a bullet list, a data point,
      a comparison table, a real-world example, or a pro tip callout.
   d) Use H3 subsections (2–3 per H2) for complex topics to create a clear hierarchy.
   e) Paragraphs: 2–4 sentences max. No walls of text.
   f) Bold the most important phrase or takeaway in each paragraph.

   REQUIRED SECTIONS (adapt headings to the topic, keep substance):
   - "What Is [Primary Keyword] and Why It Matters" (definition + context)
   - "How [Primary Keyword] Works" (mechanism / technical deep-dive)
   - "Key Benefits / Advantages" (data-backed benefits, use bullet list)
   - "Step-by-Step Guide / How to [Primary Keyword]" (numbered steps, 5–8 steps)
   - "Common Mistakes to Avoid" (3–5 pitfalls with brief explanations)
   - "[Primary Keyword] Best Practices" (expert-level tips)
   - "Real-World Examples / Case Studies" (concrete results with numbers)
{faq_section}
7. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - Restate the primary keyword naturally.
   - End with a strong, specific call-to-action (not generic "let us know below").

══ KEYWORD PLACEMENT — CRITICAL FOR RANKING ══
- Primary keyword appears in: H1, first sentence of intro, at least 2 H2 headings,
  the conclusion, AND the meta description block.
- Keyword density: 1.0–1.5% — natural usage only, never forced.
- Distribute secondary/LSI keywords across body paragraphs (not clustered).
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T SIGNALS (Google's quality framework) ══
- Write as a clear subject-matter expert: cite specific numbers, studies, or tools.
- Include first-person insights where natural ("In my experience...", "I've seen...").
- Add at least ONE comparison (tool A vs tool B, approach X vs approach Y).
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
- Use comparison tables (Markdown) where two or more options are compared.
- Do NOT use horizontal rules (---) between sections — use heading hierarchy instead.

⚠️ ABSOLUTE RULES (any violation = full rejection):
- Do NOT include [1], [2], or any academic-style citation numbers.
- Do NOT use filler phrases: "In conclusion, as we have seen", "It goes without saying",
  "In today's fast-paced world", "In the digital age", "Without further ado".
- {"ONLY use the internal links listed above — add NO other external URLs anywhere." if interlinks else "Do NOT add any external links or URLs anywhere in the content."}
- Every sentence must add value — delete any sentence that could be cut without loss.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary, no "Here is your article:".
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
            }, timeout=5).json()
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
        You MUST naturally embed ALL of the following internal links into the article to scale on Google search engines.
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
6. FAQ SECTION  (H2: "Frequently Asked Questions About {{primary_keyword}}")
   - Add EXACTLY 5 Q&A pairs.
   - Each question targets a "People Also Ask" query for this topic.{paa_instructions}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
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

1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.
   - Make it compelling and click-worthy (use a number, power word, or promise).
   - 50–65 characters.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >)
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

3. INTRODUCTION (120–160 words)
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.
   - Open with a striking statistic, question, or provocative statement.
   - State exactly what the reader will learn and why it matters to them.
   - End with a smooth transition into the Table of Contents.

4. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

5. MAIN BODY — 5 to 7 H2 SECTIONS
   Each section MUST:
   a) Open with a sentence that naturally contains a keyword variation or LSI term.
   b) Deliver ONE clear, actionable insight — no generic observations.
   c) Include at least ONE of: a numbered step list, a bullet list, a data point,
      a comparison table, a real-world example, or a pro tip callout.
   d) Use H3 subsections (2–3 per H2) for complex topics to create a clear hierarchy.
   e) Paragraphs: 2–4 sentences max. No walls of text.
   f) Bold the most important phrase or takeaway in each paragraph.

   REQUIRED SECTIONS (adapt headings to the topic, keep substance):
   - "What Is [Primary Keyword] and Why It Matters" (definition + context)
   - "How [Primary Keyword] Works" (mechanism / technical deep-dive)
   - "Key Benefits / Advantages" (data-backed benefits, use bullet list)
   - "Step-by-Step Guide / How to [Primary Keyword]" (numbered steps, 5–8 steps)
   - "Common Mistakes to Avoid" (3–5 pitfalls with brief explanations)
   - "[Primary Keyword] Best Practices" (expert-level tips)
   - "Real-World Examples / Case Studies" (concrete results with numbers)
{faq_section}
7. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - Restate the primary keyword naturally.
   - End with a strong, specific call-to-action (not generic "let us know below").

══ KEYWORD PLACEMENT — CRITICAL FOR RANKING ══
- Primary keyword appears in: H1, first sentence of intro, at least 2 H2 headings,
  the conclusion, AND the meta description block.
- Keyword density: 1.0–1.5% — natural usage only, never forced.
- Distribute secondary/LSI keywords across body paragraphs (not clustered).
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T SIGNALS (Google's quality framework) ══
- Write as a clear subject-matter expert: cite specific numbers, studies, or tools.
- Include first-person insights where natural ("In my experience...", "I've seen...").
- Add at least ONE comparison (tool A vs tool B, approach X vs approach Y).
- Demonstrate depth: go beyond surface-level explanations into the "why" and "how".

══ FEATURED SNIPPET OPTIMISATION ══
- Include ONE paragraph directly below an H2 that answers "What is {primary_keyword}?"
  in 40–60 words in plain, declarative language — targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.
- The FAQ section targets PAA (People Also Ask) snippets.

{interlink_instructions}

══ FORMATTING RULES ══
- Use **bold** for key terms (first occurrence) and critical takeaways.
- Use *italic* for emphasis only — sparingly (max 3 per section).
- Use > blockquotes for expert quotes, pro tips, or key statistics.
- Use comparison tables (Markdown) where two or more options are compared.
- Do NOT use horizontal rules (---) between sections.

⚠️ ABSOLUTE RULES (any violation = full rejection):
- Do NOT include [1], [2], or any academic-style citation numbers.
- Do NOT use filler phrases: "In conclusion, as we have seen", "It goes without saying",
  "In today's fast-paced world", "In the digital age", "Without further ado".
- {"ONLY use the internal links listed above — add NO other external URLs anywhere." if interlinks else "Do NOT add any external links or URLs anywhere in the content."}
- Every sentence must add value — delete any sentence that could be cut without loss.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary.
    """

    blog_text = _openai_chat_call(
        prompt,
        "You are a world-class SEO content strategist. Follow the brief exactly.",
        max_tokens=8000,
    )
    return {"blogText": blog_text.strip(), "wordCount": len(blog_text.split())}


def generate_image(topic: str, image_text: str) -> str:
    """
    Generate a blog header image.
    Strategy (mirrors Graphic-agents image_service.py):
      1. OpenAI gpt-image-2  — SDK call, b64_json response
      2. OpenAI dall-e-3     — SDK call, url response (wider account support)
      3. Solid-colour placeholder base64 PNG
    Returns a data:image/png;base64,... string or a temporary URL.
    """
    import base64
    import io

    dalle_prompt = (
        f"Professional, text-free blog header image about: {topic}. "
        f"Modern landscape design, clean and photorealistic. "
        f"CRITICAL: No text, no words, no letters, no typography, no watermarks, no signs, no logos."
    )

    if _OPENAI_SDK_AVAILABLE and _openai_client:
        # ── 1. gpt-image-2-2026-04-21 (primary) ────────────────────────────────────
        try:
            result = _openai_client.images.generate(
                model="gpt-image-2-2026-04-21",
                prompt=dalle_prompt,
                size="1024x1024",
                quality="low",
                n=1,
            )
            img_data = result.data[0]
            if hasattr(img_data, "b64_json") and img_data.b64_json:
                print(f"Image generated via gpt-image-2-2026-04-21 for: {topic}")
                return f"data:image/png;base64,{img_data.b64_json}"
            elif hasattr(img_data, "url") and img_data.url:
                print(f"Image generated via gpt-image-2-2026-04-21 (url) for: {topic}")
                return img_data.url
        except Exception as e:
            print(f"OpenAI gpt-image-2-2026-04-21 failed: {type(e).__name__}: {e}")

        # ── 2. dall-e-3 fallback (b64_json) ────────────────────────────────────────
        try:
            result = _openai_client.images.generate(
                model="dall-e-3",
                prompt=dalle_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            img_data = result.data[0]
            if hasattr(img_data, "b64_json") and img_data.b64_json:
                print(f"Image generated via dall-e-3 for: {topic}")
                return f"data:image/png;base64,{img_data.b64_json}"
            elif hasattr(img_data, "url") and img_data.url:
                return img_data.url
        except Exception as e:
            print(f"OpenAI dall-e-3 failed: {type(e).__name__}: {e}")

    # ── 3. Solid-colour placeholder ───────────────────────────────────────────
    print("All image generation methods failed. Returning placeholder.")
    from PIL import Image as _PILImage
    img = _PILImage.new("RGB", (1280, 720), (30, 58, 138))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"



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
