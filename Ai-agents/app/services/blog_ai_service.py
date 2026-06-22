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

def get_post_generation_enhancement_layer(brand_context=None, mode="SEO", interlinks=None, author_name=None, author_metadata=None):
    if not brand_context:
        brand_context = {
            "company_name": "Bitlance Automation (Bitlance Tech Hub)",
            "services": "Custom AI Agent Development, AI Voice Bot Implementation, Business Process Automation, Enterprise Web App Development, Digital Marketing Pipelines",
            "products": "GEO & SEO AI Blog Engine, Meta Ads Automation Platform, Bitlance Email Agent, Social Media & Graphics AI, Real Estate Reel Generator, HR Bitlance, WhatsApp Automation CRM",
            "target_audience": "Digital Marketing Agencies, B2B SaaS, Real Estate Firms, HR Teams, Professional Services",
            "industries": "Technology, Real Estate, Healthcare, Education, Local Services",
            "usp": "We build 2026-standard elite AI automation pipelines that eliminate manual workflows."
        }
    
    company_name = brand_context.get("company_name", "Bitlance Automation")
    short_name = company_name.split(" ")[0] if company_name else "Bitlance"
        
    faq_rule = "\n- 1 FAQ section" if mode == "GEO" else ""
    faq_item = "* FAQ\n" if mode == "GEO" else ""
    
    other_details = []
    for k, v in brand_context.items():
        if k not in ['company_name', 'services', 'target_audience', 'industries', 'usp', 'products']:
            other_details.append(f"{k.replace('_', ' ').title()}: {v}")
    
    other_details_str = (" | " + " | ".join(other_details)) if other_details else ""
    
    cluster_links_rule = ""
    # Build the Related Guides block from REAL provided links only for both SEO and GEO
    if interlinks:
        real_guide_lines = []
        for lnk in interlinks[:15]:  # cap at 15 for token budget
            if isinstance(lnk, dict) and lnk.get("link") and lnk.get("title"):
                anchor = lnk.get("recommendedAnchor") or lnk["title"]
                real_guide_lines.append(f'- [{anchor}]({lnk["link"]})')
        if real_guide_lines:
            guides_block = "\n".join(real_guide_lines)
            cluster_links_rule = f"""
8. TOPICAL AUTHORITY LAYER & CLUSTER LINKS
At the VERY END of the article, add an H2: ## Related Guides
Copy these EXACT Markdown links below — do NOT change the URLs or anchor text:
{guides_block}
Do NOT invent new links. Use ONLY the links listed above.
"""
        else:
            cluster_links_rule = ""
    else:
        cluster_links_rule = ""

    if mode == "SEO":
        footer_text = f"**Written By:** {author_name or (brand_context.get('company_name','Bitlance') + ' Expert Editorial Board')} | **Fact-Checked & Reviewed By:** The Technical Content Team at {brand_context.get('company_name','Bitlance Automation')} | **Last Updated:** June 2026"
    else:
        footer_text = f"**Content Attribution:** {author_name or (brand_context.get('company_name','Bitlance') + ' Editorial Team')} | **Authority & Verification:** Published by {brand_context.get('company_name','Bitlance Automation')} | **Last Updated:** June 2026"

    # Multi-tenant author block
    KNOWN_AUTHORS = {
        "anurag dhole": {
            "author_title": "CEO & Founder",
            "author_company": "Bitlance",
            "author_bio": "Anurag Dhole is the CEO and Founder of Bitlance, specializing in AI-driven automation, business process optimization, and enterprise agentic workflows.",
            "author_linkedin": "https://www.linkedin.com/in/anurag-dhole-532046124/"
        }
    }

    meta = author_metadata or {}
    name_key = (meta.get("author_name") or author_name or "").strip().lower()
    known_meta = KNOWN_AUTHORS.get(name_key, {})

    if meta.get("author_name") or author_name:
        _aname  = meta.get("author_name") or author_name
        _atitle = meta.get("author_title") or known_meta.get("author_title") or "Content Specialist"
        _acomp  = meta.get("author_company") or known_meta.get("author_company") or brand_context.get("company_name", "Bitlance Automation")
        _abio   = meta.get("author_bio") or known_meta.get("author_bio") or f"{_aname} is a subject-matter expert at {_acomp} specializing in AI automation and digital publishing."
        _ali    = meta.get("author_linkedin") or known_meta.get("author_linkedin") or ""
        _linkedin_line = f"\n[LinkedIn Profile]({_ali})" if _ali else ""
        author_block = f"""## About the Author

**{_aname}** — *{_atitle}* at **{_acomp}**

{_abio}{_linkedin_line}"""
    else:
        _pub = brand_context.get("company_name", "Bitlance Automation")
        author_block = f"""## About the Publisher

This article was researched, written, and editorially reviewed by the content team at **{_pub}**. All claims are fact-checked against publicly available sources and proprietary internal benchmarks."""

    return f"""
══ ENHANCEMENT LAYER ══
BRAND: {brand_context.get('company_name','Bitlance')} | Services: {brand_context.get('services','')} | USP: {brand_context.get('usp','')}{other_details_str}

[A] BRAND SECTION (H2 — min 300 words)
- Dedicated section: how {brand_context.get('company_name','Bitlance')} solves this topic.
- MUST include one formatted case study:
  Client: [Industry] | Problem: [Pain Point] | Solution: [{short_name} tool/workflow] | Result: [Hard numbers]
- Audience: {brand_context.get('target_audience','')} | Industries: {brand_context.get('industries','')}
- Ensure any specific products, services, or custom facts from the brand context above are naturally woven into the article.

[B] INTENT ALIGNMENT
- Informational → add Enterprise Readiness Framework or Governance Checklist
- Commercial → add Buyer's Guide
- Transactional → add Solution Comparison + CTA

[C] MANDATORY CONTENT ELEMENTS
- Statistics block with real numbers. Format: `Source: [Report Name](https://url)` under each bullet.
- One proprietary data point: `Source: {brand_context.get('company_name','Bitlance')} Internal Benchmark`
- Comparison Table (Markdown)
- Expert Insight blockquote
{faq_item}- Fact Box
- 5-15 knowledge graph entities (companies, frameworks, orgs)
- Contrarian viewpoint + future prediction

[D] CITATION RULES
- NO [1][2][3] numbered references. Cite inline: "According to McKinsey...", "Gartner reports..."
- Every source citation, statistical reference, report reference, or database fact MUST be placed on a separate, brand new line (separated by a blank line or double newline), NEVER appended to the end of a sentence or paragraph on the same line.
  ✗ BAD: "...routing. Source: Stanford AI Index 2024"
  ✓ GOOD: "...routing.\n\nSource: [Stanford AI Index 2024](https://aiindex.stanford.edu/report/)"
- Every source MUST include a real URL format: `Source: [Report Name](https://real-url.org)`
{cluster_links_rule}
[E] TITLE & LINKS
- H1: Clickable, no keyword stuffing. Use semantic variants, not exact-match repeats.
- Internal links: 8-12 Markdown hyperlinks [Anchor](URL). Use ONLY URLs from provided list. NEVER invent URLs.
- Natural anchor text only — never forced exact-match spam.

[F] AUTHOR BYLINE (end of article — before Related Guides)
---
{footer_text}
---

[G] ABOUT THE AUTHOR / PUBLISHER (mandatory — place at the very end)
{author_block}

⚠️ OUTPUT QUALITY GATE:
- Article MUST be COMPLETE. Never end abruptly. Never truncate paragraphs.
- If missing 5+ entities OR 3+ citations OR stats block{faq_rule}, append: `SEO_AUDIT_REQUIRED = TRUE`

⚠️ FORBIDDEN OUTPUT — NEVER include under any circumstances:
- AUTHOR_ID, COMM_LOGS, SHARE_LOG, ID_NAME, PAYLOAD, USER_ID, SESSION_ID
- DATABASE_FIELDS, DEBUG_DATA, SYSTEM_PROMPT, RAW_METADATA, INTERNAL_NOTES
- "Generated by AI" as visible text
- Raw JSON, CMS fields, or internal metadata
- Output ONLY clean Markdown article content.
"""

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT CLEANER
# ─────────────────────────────────────────────────────────────────────────────

import re as _re

_GARBAGE_PATTERNS = [
    r'\bAUTHOR_ID\b',
    r'\bCOMM_LOGS\b',
    r'\bSHARE_LOG\b',
    r'\bID_NAME\b',
    r'\bPAYLOAD\b',
    r'\bSYSTEM TOKENS\b',
    r'\bDEBUG DATA\b',
    r'\bRAW JSON\b',
    r'Generated by AI',
    r'\busr\b',
    r'SEO_AUDIT_REQUIRED\s*=\s*TRUE',  # remove quality gate flag from output
]

def clean_blog_output(text: str) -> str:
    """Strip internal system artifacts, academic bracket citations, and footer garbage from AI-generated blog text."""
    # Strip bracket citations like [1], [2], [10] etc.
    text = _re.sub(r'\s*\[\d+\]', '', text)
    
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        # Drop any line that contains a garbage pattern
        if any(_re.search(pattern, stripped, _re.IGNORECASE) for pattern in _GARBAGE_PATTERNS):
            continue
        cleaned.append(line)
    return '\n'.join(cleaned).strip()


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

def generate_title_and_keywords(industry: str, mode: str = "SEO", location: str = None, goal: str = None) -> dict:
    """
    Auto-generate a blog topic + keyword list for a given industry.
    Uses a Topic Scoring Engine to evaluate candidate topics based on Search Intent,
    Commercial Intent, Competition, GEO Potential, Industry Relevance.
    Returns JSON with topics, traffic_score, revenue_score, difficulty, etc.
    """
    
    geo_rules = ""
    if mode == "GEO":
        geo_rules = """
LAYER 5: GEO OPTIMIZATION (CRITICAL FOR THIS REQUEST)
These topics are designed for ChatGPT, Gemini, Claude, and Perplexity. They love:
- Comparisons (e.g., 'GPT-5 vs Claude 4 for Enterprise Automation')
- Frameworks (e.g., 'AI Agent Architecture for Customer Support Teams')
- Playbooks (e.g., 'How We Built an AI Lead Qualification System Using OpenAI Agents')
- Case Studies (e.g., 'How a Marketing Agency Reduced Response Time by 80% Using AI Agents')
Ensure candidate topics lean heavily into these structures.
"""

    prompt = (
        f'Act as an Elite Content Strategist and SEO/GEO Expert. '
        f'Your task is to generate a highly competitive, long-tail blog topic for the "{industry}" industry.\n\n'
        f'AVOID GENERIC TOPICS:\n'
        f'Instead of: "AI Marketing Tools" or "AI Email Automation"\n'
        f'Generate: "Best AI Marketing Tools for Real Estate Agencies in Dubai" or "How SaaS Companies Use AI Email Automation to Reduce Churn"\n'
        f'Structure must generally be: Industry + Problem + Persona + Outcome.\n\n'
        f'AVOID repetitive keyword stuffing and overly long, robotic titles.\n'
        f'Instead of "How Agencies Generate 100 SEO Articles Per Month Using AI Automation HR & Recruitment", use semantic variations and natural phrasing like "How HR Agencies Scale to 100 SEO Articles Per Month Using AI Automation" or "AI Content Automation for HR Agencies: The 100-Article SEO Framework".\n'
        f'Instead of generic targets like "100 SEO articles per month", generate highly specific long-tail targets like "How Recruitment Agencies Generate 100 SEO Articles Per Month for Healthcare Hiring" or "How Staffing Agencies Automate SEO Content for Remote Developer Hiring".\n\n'
        f'LAYER 1: COMPETITION CHECK\n'
        f'Avoid extremely competitive short-tail keywords like: "AI tools", "SEO tools", "Marketing tools", "CRM software", "Chatbot software".\n\n'
        f'LAYER 2: COMMERCIAL INTENT\n'
        f'Prefer these formats: "How to", "Best for", "Case Study", "Workflow", "Implementation Guide", "Comparison", "Cost Analysis" over generic definitions.\n\n'
        f'LAYER 3: INDUSTRY TARGETING\n'
        f'Ensure the topic is deeply tailored to {industry} (e.g., Real Estate, Healthcare, Insurance, HR, Recruitment, E-commerce, SaaS, Marketing Agencies, Education, Legal Firms).\n\n'
        f'LAYER 4: LONG-TAIL EXPANSION\n'
        f'Convert generic concepts (e.g., "AI Agents") into hyper-specific use cases (e.g., "How AI Agents Qualify Real Estate Leads on WhatsApp").\n'
        f'{(f"LOCATION FOCUS: Ensure topics are highly relevant to {location} (either explicitly naming it or implicitly addressing its unique market dynamics)." if location and location.lower() != "global" else "")}\n'
        f'{(f"BUSINESS GOAL: The primary goal for these topics is {goal}. Optimize topics to attract an audience that converts for this goal." if goal else "")}\n'
        f'{geo_rules}\n'
        f'OPPORTUNITY SCORING ENGINE:\n'
        f'Internally generate and score candidate topics based on these two separate scores:\n'
        f'- Traffic Score (0-100): Based on search volume potential, broad appeal, and organic CTR.\n'
        f'- Revenue Score (0-100): Based on commercial intent, {goal if goal else "conversion"} potential, and bottom-of-funnel readiness.\n'
        f'- Difficulty: "Low", "Medium", or "High" based on keyword competition.\n\n'
        f'Select the TOP 10 BEST topics that score high on both metrics.\n\n'
        f'Format exactly as a JSON object with a single "topics" key containing a list of 10 objects:\n'
        f'{{\n'
        f'  "topics": [\n'
        f'    {{\n'
        f'      "topic": "The exact highest scoring title of the blog post",\n'
        f'      "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",\n'
        f'      "traffic_score": 92,\n'
        f'      "revenue_score": 96,\n'
        f'      "difficulty": "Medium",\n'
        f'      "scoring_breakdown": "Traffic: High search volume for long-tail. Revenue: Strong commercial intent.",\n'
        f'      "search_intent": "Informational/Commercial"\n'
        f'    }}\n'
        f'  ]\n'
        f'}}'
    )
    
    system = "You are an Elite SEO/GEO Content Strategist."
    try:
        raw = _perplexity_call(prompt, system, max_tokens=2500)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
        print(f"generate_title_and_keywords: Generated {len(result.get('topics', []))} topics")
        return result
    except Exception as e:
        print(f"Perplexity topic generation error: {e}")
        try:
            raw = _openai_chat_call(prompt, system, max_tokens=2500)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
            print(f"generate_title_and_keywords (fallback): Generated {len(result.get('topics', []))} topics")
            return result
        except Exception as e2:
            print(f"OpenAI fallback error: {e2}")
            return {
                "topics": [
                    {
                        "topic": f"Advanced {industry} Strategy Guide: Implementation and Workflows",
                        "keywords": [f"{industry} workflow", f"{industry} implementation guide", f"best practices for {industry}"],
                        "traffic_score": 75,
                        "revenue_score": 80,
                        "difficulty": "Medium",
                        "scoring_breakdown": "Fallback generation",
                        "search_intent": "Informational"
                    }
                ]
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
        f'You are an SEO keyword research expert. For the topic "{topic}", generate 8–12 hyper-niche, long-tail, zero-volume keywords.\n'
        f'These keywords MUST be highly specific (4+ words), targeting specific industries, locations, or use cases (e.g., "How to automate WhatsApp lead follow-ups for Dubai real estate agencies").\n'
        f'Include: 1 primary hyper-niche keyword (exact match), 4–5 long-tail variations, 2–3 LSI/semantic keywords, 2 question-based keywords.\n'
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
    external_links: Optional[list] = None,
    max_attempts: int = 1,
    mode: str = "SEO",
    brand_context: dict = None,
    author_name: str = None,
    author_metadata: dict = None,
) -> dict:
    """
    Generate full blog content using Perplexity sonar-pro.
    Retries until word count reaches length_num (up to max_attempts).
    author_metadata supports: author_name, author_title, author_company, author_bio, author_linkedin
    Returns: {"blogText": str, "wordCount": int}
    """
    interlinks = interlinks or []
    brand_context = brand_context or {}
    company_name = brand_context.get("company_name", "Bitlance")
    short_name = company_name.split(" ")[0] if company_name else "Our Company"
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
        links_list = []
        for lnk in interlinks:
            if isinstance(lnk, dict) and lnk.get("link"):
                anchor = lnk.get("recommendedAnchor", lnk["title"])
                links_list.append(f'- Target: "{lnk["title"]}"\n  URL: {lnk["link"]}\n  Recommended Anchor Text: "{anchor}"')
        links_str = "\n\n".join(links_list)

        if mode == "GEO":
            interlink_instructions = f"""
        ══ 10. INTERNAL LINKING LAYER (GEO) ══
        When mentioning related concepts, articles, guides, workflows, or tools, you MUST naturally embed the following highly relevant internal links.
        This is critical so that AI search engines (Perplexity, ChatGPT, Gemini) recognize these links as high-authority sources.

        RULES (violating any rule = rejection):
        1. Generate 8-12 contextual internal links from the list below.
        2. Format every link strictly as a Markdown hyperlink: [Anchor Text](URL). Do not output plain text references.
        3. You MUST use the EXACT "Recommended Anchor Text" provided below for each link.
        4. Frame the link naturally within a full sentence, making it sound like a reference to an authoritative source on your site (e.g., "As detailed in our analysis on [anchor text](URL)...").
        5. Include: Minimum 1 Pillar Link, 5 Supporting Article Links, 2 Related Conversion Links.
        6. Do not mention related articles without linking them. Spread links evenly.

        Links to embed as Citations:
        {links_str}
        ══════════════════════════════════════════════════════════
        """
        else:
            interlink_instructions = f"""
        ══ 10. INTERNAL LINKING LAYER (SEO) ══
        When mentioning related concepts, articles, guides, workflows, or tools, you MUST naturally embed the following highly relevant internal links into the article.
        These links have been pre-selected by our Backlink Intelligence Layer to build a powerful Topical Cluster.
        
        RULES (violating any rule = rejection):
        1. Generate 8-12 contextual internal links from the list below.
        2. Format every link strictly as a Markdown hyperlink: [Anchor Text](URL). Do not output plain text references.
        3. You MUST use the EXACT "Recommended Anchor Text" provided below for each link.
        4. Embed them seamlessly into the content flow. Only use natural anchor text. Avoid exact-match keyword stuffing.
        5. Include: Minimum 1 Pillar Link, 5 Supporting Article Links, 2 Related Conversion Links.
        6. Do not mention related articles without linking them.
        
        Links to embed:
        {links_str}
        ══════════════════════════════════════════════════════════
        """

    external_link_instructions = ""
    if external_links:
        ext_list = []
        for lnk in external_links:
            if isinstance(lnk, dict) and lnk.get("link"):
                anchor = lnk.get("recommendedAnchor", lnk["title"])
                ext_list.append(f'- Target: "{lnk["title"]}"\n  URL: {lnk["link"]}\n  Recommended Anchor Text: "{anchor}"')
        ext_str = "\n\n".join(ext_list)
        
        external_link_instructions = f"""
        ══ EXTERNAL AUTHORITY CITATIONS ══
        You MUST naturally embed the following high-authority EXTERNAL links as citations to build EEAT.
        
        RULES:
        1. Format every link as a Markdown hyperlink: [anchor text](URL).
        2. Do not use [1], [2], [3] style numbered references anywhere in the article.
        3. Instead, cite sources naturally inline:
           - "According to Salesforce research..."
           - "Stanford AI Index reports..."
           - "McKinsey research found..."
        4. You MUST use the EXACT "Recommended Anchor Text" provided below.
        
        External Links to embed:
        {{ext_str}}
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
            expert_persona = (
                "You are an elite GEO, SEO, EEAT, technical writing, and editorial publishing specialist. "
                "Your article must be immediately publication-ready — optimized for Google Search, Google AI Overviews, "
                "ChatGPT, Claude, Gemini, Perplexity, Copilot, and Enterprise RAG Systems. "
                "NEVER end abruptly. NEVER truncate. NEVER output placeholders. Output ONLY the complete final article."
            )
        else:
            expert_persona = (
                "You are an elite Generative Engine Optimization (GEO) and editorial publishing specialist. "
                "Your ONLY goal is to produce content that gets cited by Perplexity, ChatGPT, Gemini, Claude, and Copilot. "
                "You create memorable, quotable named frameworks, dense proprietary benchmarks, and modular structured knowledge "
                "that AI systems extract and attribute by name. "
                "NEVER end abruptly. NEVER truncate. NEVER output placeholders. Output ONLY the complete final article."
            )

        faq_section = ""
        if mode == "GEO":
            faq_section = f"""
## Frequently Asked Questions About [Topic] (adapt phrasing)
   - Add EXACTLY 5 Q&A pairs directly related to '{primary_keyword}'.
   - {paa_instructions if paa_instructions else f"Generate 5 highly relevant 'People Also Ask' style questions specifically about {primary_keyword}."}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
"""

        if mode == "SEO":
            mandatory_structure = f"""
SEO ARTICLE STRUCTURE — Human-First Reading Flow (SEO=80%, GEO=20%)
Target: Google Search, Google Featured Snippets, Human Readers

TOKEN BUDGET RULE: If you are approaching your output limit, immediately skip to and
complete: Key Takeaways -> Conclusion -> About the Author. Never stop mid-article.
Shorten body sections if needed, but ALWAYS finish with those three.

SECTION ORDER (follow exactly):

1.  ARTICLE METADATA BLOCK — Output as a highlighted Markdown blockquote at the very top:
    > 📌 **Meta Title:** [50–60 chars, primary keyword near front, high-CTR]
    > 📝 **Meta Description:** [140–160 chars, primary keyword + clear benefit + action word]
    > 🔗 **URL Slug:** `[url-slug-here]`
    > ⏱ **Reading Time:** [X min read]  |  📅 **Last Updated:** June 2026

2.  # H1 — Compelling title. Primary keyword within first 3 words. No stuffing.

3.  **Introduction** (150–200 words)
    - First sentence bolds **{primary_keyword}**.
    - Hook: open with a surprising stat, real problem, or bold claim — no generic openers.
    - Briefly preview what the reader will learn (implicit promise).
    - End with a smooth transition into the first section.

4.  ## Table of Contents
    Bulleted Markdown links to every H2 in the article.
    Example: - [What Is [Topic]?](#what-is)
    Improves dwell time, UX, and Google sitelinks eligibility.

5.  ## What Is [Topic]? (adapt phrasing naturally for long-tail keywords)
    - 40–60 word plain-language definition (featured-snippet target).
    - Follow with: **Why It Matters in 2026** — 2–3 sentences of business relevance.
    - Cite one authoritative source inline: "According to [Source]..."

6.  ## How [Topic] Works (adapt phrasing naturally)
    - Core mechanics explained clearly for a non-expert reader.
    - H3 subsections for each major component or stage.
    - Numbered process list or flow description where helpful.
    - No unexplained jargon.

7.  ## Key Statistics & Data Points
    4–6 real, verifiable statistics. Format each as a blockquote:
    > **[Stat with specific number]**
    > *Source: [Full Report or Organisation Name](https://real-url.org)*
    Include ONE {short_name} internal data point:
    > *"{short_name} clients achieved [specific measurable result]" — {short_name} Internal Data, 2025*
    NEVER invent statistics. Omit any you cannot verify.

8.  ## Key Benefits of [Topic]
    4–6 benefit bullets. Format:
    **[Benefit Name]:** [1–2 sentence explanation + real-world impact]
    At least 2 bullets must include an inline source reference.
    Order from most impactful to least.

9.  ## [Topic] vs Traditional Alternatives (or Similar Approaches)
    Markdown comparison table. Minimum 5 rows.
    Columns: Feature | Modern Approach | Traditional Approach | Winner
    Cover: Speed, Cost, Scalability, Accuracy, Implementation Complexity.

10. ## Popular Tools & Platforms for [Topic]
    Compare 4–5 real tools. Markdown table:
    Tool | Best For | Pricing Model | Key Strength | Limitation
    Follow with 2–3 sentences on how to pick the right tool.

11. ## Real-World Use Cases
    3–4 industry use cases (SaaS, Real Estate, HR, E-commerce, Healthcare).
    Per use case, you MUST use this EXACT format with blank lines between elements to ensure they render on separate lines:

    ### [Industry Name]

    **The Problem:** [specific pain point]

    **The Solution:** [how {primary_keyword} addresses it]

    **The Outcome:** [measurable result or improvement]

12. ## Step-by-Step Implementation Guide
    Numbered steps. Each step format:
    **Step N: [Action Title]**
    [What to do] — [Why it matters] — [Expected outcome]
    Min 6 steps. Targets how-to featured snippets.

13. ## How {short_name} Approaches [Topic]
    Min 250 words. Case study in this EXACT multi-line format (do NOT use pipe | separators):

    **Client Industry:** [Industry name]

    **The Problem:**
    [2–3 sentences. Specific pain point this client faced, not generic.]

    **Our Solution:**
    [2–3 sentences. Exact workflow, tools, or system {short_name} built for them.]

    **The Result:**
    [Hard measurable numbers: e.g. "23% higher conversion rate", "41% less manual time", "115 blogs in 60 days"]

    **Key Takeaway:**
    [1–2 sentences on what made this approach effective and repeatable.]

    Follow with 2–3 sentences analysing the broader pattern this reveals.

14. ## Common Mistakes to Avoid
    4–6 mistakes. Each:
    ### Mistake N: [Mistake Title]
    **Why it happens:** [brief explanation]
    **How to fix it:** [specific corrective action]
    This section consistently ranks for PAA and long-tail search queries.

15. ## Challenges and Limitations
    3–4 real challenges. Per challenge: **Challenge** — practical workaround or mitigation.
    Include: ### When NOT to Use [Topic]

16. ## Best Practices
    5–7 actionable best practices, numbered.
    Each: **[Practice Name]** — [explanation + evidence or source].

17. ## Expert Insights
    Two blockquotes:
    > **Expert Insight #1:** [Deep, non-obvious strategic take on {primary_keyword}]
    > **Expert Insight #2:** [Contrarian view or forward-looking prediction]
    Must be specific — no generic advice.

18. ## Future Trends in [Topic]
    3–4 predictions for the next 1–3 years.
    Each: **[Trend Name]** — [what's changing + why it matters + business impact].
    Ground in real signals: research findings, industry moves, technology shifts.

19. ## Key Takeaways
    5–7 standalone bullet points summarising the whole article.
    Each must be: actionable, self-contained, readable without context.
    Bold the core insight in each bullet.

20. ## Conclusion
    150–200 words. Cover:
    - The 3 most important points from the article.
    - Practical value for the reader.
    - Natural contextual CTA (e.g. "See how {short_name} can help" or "Book a strategy session").
    NEVER end abruptly. NEVER leave this section incomplete.

21. ## About the Author / About the Publisher
    [Enhancement layer will inject this automatically — do not skip it]

SUBHEADING RULES:
- Every H2 must be specific, benefit-driven, and scannable. NEVER generic.
  BAD: "Overview", "Details", "More Information", "Introduction"
  GOOD: "Why [Topic] Reduces Processing Time by 10x in Enterprise Workflows"
- H3s add granular, specific value under each H2. No filler headings.
- Use power words where natural: "Proven", "Step-by-Step", "Complete", "2026", "Ultimate".
- Avoid repeating the exact H1 phrase in sub-headings — use semantic variants.
- CRITICAL: Adapt headings naturally for long-tail keywords to ensure grammatically correct phrasing. NEVER generate nonsensical headings like "How Why Location Data Is the New Oil Works".
- Primary keyword density: 0.8–1.5%. Bold on FIRST body occurrence ONLY.
- Cite inline: "According to Gartner...", "McKinsey reports...", "Stanford AI Index found..."
- NO [1][2][3] numbered references anywhere.
"""
        else:
            mandatory_structure = f"""
GEO ARTICLE STRUCTURE — Built for AI Citations (Perplexity, ChatGPT, Gemini, Claude, Copilot)
Weighting: GEO=70%, SEO=30%

TOKEN BUDGET RULE: If you are approaching your output limit, immediately skip to and
complete: FAQ → Conclusion → Sources → About the Author. Shorten body sections if
needed, but ALWAYS write those four sections before stopping.

SECTION ORDER (follow exactly):

1.  ARTICLE METADATA BLOCK — Output as a highlighted Markdown blockquote at the very top:
    > 📌 **Meta Title:** [50–60 chars, primary keyword near front, high-CTR]
    > 📝 **Meta Description:** [140–155 chars, primary keyword + clear benefit + action word]
    > 🔗 **URL Slug:** `[url-slug-here]`
    > ⏱ **Reading Time:** [X min read]  |  📅 **Last Updated:** June 2026

2.  # H1 — Primary keyword near front. Compelling. No keyword stuffing.

3.  ## Quick Answer
    50–100 words. Direct. Independently understandable. AI retrieval magnet.

4.  ## AI Overview Summary
    150–200 words. Define topic + why it matters + key benefits + who it's for.

5.  ## Why This Matters in 2026
    Three developments changed this landscape in 2025–2026:
    1. [Development 1 + business impact]
    2. [Development 2 + why businesses care]
    3. [Development 3 + what this unlocks]

6.  ## Key Facts about [Topic]
    5–8 ✓ checkmark facts. Self-contained. Citation-friendly.

7.  ## Key Statistics & Benchmarks
    4–5 real stats. Format: • [Stat] *Source: [Name](URL)*
    Include 2 {short_name} proprietary benchmarks: *Source: {short_name} Internal Benchmark, 2025*
    NEVER invent statistics.

8.  ## The {short_name} Maturity Model for [Topic]
    ONE original named framework. 5 levels (Level 1 → Level 5).
    Each level: **Level N — [Name]:** [1–2 sentence description]
    This is exactly what Perplexity, ChatGPT, and Gemini extract and cite.

9.  ## How [Topic] Works (adapt phrasing naturally)
    Core components with H3 subsections. Structured for AI extraction.

10. ## Implementation Guide
    Numbered steps. Each: What to do + Why + Expected outcome.

11. ## Comparison Table
    Markdown table. Traditional vs Modern OR Myth vs Reality.

12. ## Real-World Applications
    2–3 industry use cases. Per case, you MUST use this EXACT format with blank lines between elements to ensure they render on separate lines:

    ### [Industry Name]

    **The Problem:** [2–3 sentences describing the specific challenge this industry faces]

    **The Solution:** [2–3 sentences on exactly how {primary_keyword} was applied]

    **The Outcome:** [Hard numbers: e.g. "42% reduction in X", "3x improvement in Y", "$240K saved annually"]

    **Why It Worked:** [1–2 sentences on the key insight or differentiator]

13. ## How {short_name} Implements This
    Min 250 words. Case study in this EXACT multi-line format (do NOT use pipe | separators):

    **Client Industry:** [Industry name]

    **The Problem:**
    [2–3 sentences. Specific pain point, not generic.]

    **Our Solution:**
    [2–3 sentences. Exact workflow, tools, or system {short_name} built.]

    **The Result:**
    [Hard measurable numbers: e.g. "23% higher conversion rate", "41% less manual time", "115 blogs in 60 days"]

    **Key Takeaway from This Engagement:**
    [1–2 sentences on what made this approach uniquely effective and replicable.]

    After the case study, add 2–3 follow-up sentences analysing the broader pattern.

14. ## Expert Insights
    > **Expert Insight #1:** [Non-obvious strategic take]
    > **Expert Insight #2:** [Contrarian or forward-looking take]

15. ## People Also Ask
    {paa_instructions if paa_instructions else f'Generate 5 People Also Ask questions for "{primary_keyword}".'}
    Each question uses ### H3. Answer in 50–80 words. No question without an answer.

16. ## Future Outlook
    **Short-Term (6–12 months):** [...]
    **Medium-Term (1–2 years):** [...]
    **Long-Term (3–5 years):** [...]

17. ## Key Takeaways
    5–7 standalone bullet points. Each actionable and self-contained.

18. ## Conclusion
    120–200 words. Summarize key ideas. Reinforce value. Natural CTA. NEVER truncate.

19. ## Frequently Asked Questions
    5 FAQs using ### H3. Each answer 50–100 words. AI-retrieval optimized.

20. ## Sources & References
    List real sources only (McKinsey, Gartner, WEF, IDC, Stanford AI Index, etc.).
    You MUST format each source as a Markdown link, linking directly to the real report URL or verified homepage of the organization (e.g. * [Gartner](https://www.gartner.com) - Report Name *). Every single source listed MUST be a clickable link. Do NOT output plain text sources.
    Do NOT fabricate. Do NOT invent reports.

21. ## Related Topics
    5–7 topic suggestions for internal linking (no invented URLs).

22. ## Take the Next Step
    Contextual, professional CTA. Prefer: "Assess your readiness", "Schedule a strategy session".
    AVOID: "Contact us now".

SUBHEADING RULES:
- H2 must be AI-citation-ready. LLMs quote specific named sections.
  BAD: "Overview", "How It Works"
  GOOD: "The 5 Paradigm Shifts That Redefined [Topic] in 2026"
- Each H2 must function as a standalone citable knowledge unit.
- Use numbers, outcomes, and year references in headings where natural.
- CRITICAL: Adapt headings naturally for long-tail keywords to ensure grammatically correct phrasing. NEVER generate nonsensical headings like "How Why Location Data Is the New Oil Works".

DEPTH REQUIREMENTS (CRITICAL — GEO articles must be comprehensive, not brief):
- ## Quick Answer: 80–120 words — a dense paragraph, not a one-liner.
- ## AI Overview Summary: 200–280 words. Cover: definition, importance, key benefits, who it's for, one future trend.
- ## Why This Matters in 2026: Each of the 3 developments gets 3–5 sentences of explanation, not just a label.
- ## Key Facts: 8–10 facts. Each is a complete sentence with context, not just a data point.
- ## Key Statistics: Each stat block includes the stat, source URL, AND a "Why It Matters" sentence.
- ## Maturity Model: Each of the 5 levels gets 3–4 sentences — who is at this level, what they do, what they need to advance.
- ## How It Works: Minimum 400 words. Each H3 subsection gets a full explanation paragraph (not a bullet list).
- ## Implementation Guide: Minimum 8 steps. Each step: 3–5 sentences covering what, why, and expected outcome.
- ## Real-World Applications: Each use case gets a full ### sub-section (Problem / Solution / Outcome / Why It Worked).
- ## Expert Insights: Each blockquote is 2–3 specific, non-generic sentences.
- ## People Also Ask: Each answer is 80–120 words — a full, standalone explanation.
- ## Future Outlook: Each time horizon (Short/Medium/Long-Term) gets 3–5 sentences with specific predictions.
- ## Conclusion: 200–250 words minimum. Do not rush or abbreviate it.

SOURCE CITATION RULES:
- NEVER use [1][2][3] numbered references.
- Cite inline: "According to McKinsey's State of AI 2025..."
- Every statistic, database fact, or report reference MUST have `*Source: [Full Report Name](URL)*` on a separate, brand new line (never on the same line or end of sentence).
- Minimum 3 {short_name} proprietary benchmarks with `*Source: {short_name} Internal Benchmark, 2025*` on a separate, brand new line.
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
- IMPORTANT GRAMMAR RULE: If the target keyword is grammatically incorrect (e.g. "how linux is more better than windows ?"), DO NOT repeat the exact broken phrase. Use semantic variants (e.g., "Why Linux is Better Than Windows", "Linux vs Windows Comparison") instead.
- Keyword density: 0.8%–1.5% — natural usage only, never forced. You MUST use semantic variants rather than exact-match stuffing.
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T SIGNALS (Google's quality framework) ══
- Write as a clear subject-matter expert: explicitly cite highly authoritative sources (e.g., CNCF, Kubernetes, AWS, Google Cloud, Microsoft Azure, Stack Overflow Developer Survey, GitHub Octoverse, Gartner, McKinsey, Stanford AI Index).
- Include original insights: Do not just explain; analyze. Include contrarian opinions, unique frameworks, and original observations (e.g., "The hidden weakness of...", "Why X might fail...", "When NOT to automate...").
- Stronger Topical Authority: Dive deep into broad subtopics (e.g., CRM, Marketing, HR, Finance, AI, Workflow). Ensure the article covers the topic holistically. Do not just skim the surface.
- Competitor Gap Coverage: Anticipate what top-ranking articles discuss and intentionally cover advanced subtopics they miss.
- Include first-person insights where natural ("In my experience...", "I've seen...").
- Demonstrate depth: go beyond surface-level explanations into the "why" and "how".

══ FEATURED SNIPPET OPTIMISATION ══
- Include ONE paragraph directly below an H2 that answers "What is [Topic]?"
  in 40–60 words in plain, declarative language — this targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.

{interlink_instructions}
{external_link_instructions}

{get_post_generation_enhancement_layer(brand_context=brand_context, mode=mode, interlinks=interlinks, author_name=author_name, author_metadata=author_metadata)}

══ FORMATTING RULES ══
- Use **bold** for key terms (first occurrence) and critical takeaways.
- Use *italic* for emphasis only — sparingly (max 3 per section).
- Use > blockquotes for expert quotes, pro tips, or key statistics.
- Use comparison tables (Markdown) where beneficial to compare features/ideas.
- Do NOT use horizontal rules (---) between sections — use heading hierarchy instead.

⚠️ COMPLETION MANDATE — CRITICAL:
- You MUST write EVERY section completely.
- NEVER end abruptly. NEVER truncate. NEVER leave unfinished thoughts.
- NEVER output placeholder text like "[Insert here]" or "..."
- The Conclusion, FAQs, Sources, Related Topics, CTA, and About the Author MUST ALL be present.

⚠️ ABSOLUTE RULES (any violation = full rejection):
- Do NOT include [1], [2], or any academic-style citation numbers.
- Do NOT use filler phrases: "In conclusion, as we have seen", "It goes without saying",
  "In today's fast-paced world", "In the digital age", "Without further ado".
- {"You MUST use the provided internal and external links. For statistics and sources, you MUST include real URL citations as Markdown links. Do NOT invent fake URLs." if (interlinks or external_links) else "Do NOT add ANY invented URLs. For statistics and sources, you MUST include real URL citations as Markdown links."}
- NEVER output: AUTHOR_ID, COMM_LOGS, PAYLOAD, USER_ID, SESSION_ID, DATABASE_FIELDS, DEBUG_DATA, SYSTEM_PROMPT, RAW_METADATA, INTERNAL_NOTES.
- NEVER output HTML tags (e.g., <h1>, <p>, <strong>). Use ONLY pure Markdown.
- The entire article MUST be written ONLY in {language}. Absolutely no foreign words or characters.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary, no "Here is your article:".
- {continuation}
        """

        new_content = _perplexity_call(
            prompt,
            "You are a world-class content strategist and editorial publishing specialist. Follow the brief exactly. NEVER stop before completing the Conclusion, FAQs, Sources, and Author sections.",
            max_tokens=7000,
        )

        blog_text += "\n\n" + new_content
        word_count = len(blog_text.split())

    # ── Completion validation & repair ────────────────────────────────────────
    has_conclusion = ("## conclusion" in blog_text.lower()) or ("## final thoughts" in blog_text.lower())
    if mode == "SEO":
        REQUIRED_SECTIONS = [] if has_conclusion else ["## Conclusion"]
        REQUIRED_SECTIONS.append("## About the")
    else:
        REQUIRED_SECTIONS = [] if has_conclusion else ["## Conclusion"]
        REQUIRED_SECTIONS.extend(["## Frequently Asked Questions", "## About the"])
    missing = [s for s in REQUIRED_SECTIONS if s.lower() not in blog_text.lower()]

    if missing:
        print(f"[completion-repair] Missing sections detected: {missing}")
        company_name  = brand_context.get("company_name", "Bitlance Automation") if brand_context else "Bitlance Automation"
        
        # Build dynamic author/publisher block for repair
        KNOWN_AUTHORS = {
            "anurag dhole": {
                "author_title": "CEO & Founder",
                "author_company": "Bitlance",
                "author_bio": "Anurag Dhole is the CEO and Founder of Bitlance, specializing in AI-driven automation, business process optimization, and enterprise agentic workflows.",
                "author_linkedin": "https://www.linkedin.com/in/anurag-dhole-532046124/"
            }
        }
        
        author_meta_dict = author_metadata or {}
        name_key = (author_meta_dict.get("author_name") or author_name or "").strip().lower()
        known_meta = KNOWN_AUTHORS.get(name_key, {})
        
        if author_meta_dict.get("author_name") or author_name:
            _aname  = author_meta_dict.get("author_name") or author_name
            _atitle = author_meta_dict.get("author_title") or known_meta.get("author_title") or "Content Specialist"
            _acomp  = author_meta_dict.get("author_company") or known_meta.get("author_company") or company_name
            _abio   = author_meta_dict.get("author_bio") or known_meta.get("author_bio") or f"{_aname} is a subject-matter expert at {_acomp} specializing in AI automation and digital publishing."
            _ali    = author_meta_dict.get("author_linkedin") or known_meta.get("author_linkedin") or ""
            _linkedin_line = f"\n[LinkedIn Profile]({_ali})" if _ali else ""
            author_block = f"## About the Author\n\n**{_aname}** — *{_atitle}* at **{_acomp}**\n\n{_abio}{_linkedin_line}"
        else:
            author_block = f"## About the Publisher\n\nThis article was researched, written, and editorially reviewed by the content team at **{company_name}**. All claims are fact-checked against publicly available sources and proprietary internal benchmarks."

        # Dynamically build the footer
        if mode == "SEO":
            footer_text = f"**Written By:** {author_name or (company_name + ' Expert Editorial Board')} | **Fact-Checked & Reviewed By:** The Technical Content Team at {company_name} | **Last Updated:** June 2026"
        else:
            footer_text = f"**Content Attribution:** {author_name or (company_name + ' Editorial Team')} | **Authority & Verification:** Published by {company_name} | **Last Updated:** June 2026"

        missing_prompt = (
            f"The following article is INCOMPLETE. It was cut off mid-sentence or mid-section.\n"
            f"FIRST, you MUST seamlessly finish the exact sentence, paragraph, and section where the article left off.\n"
            f"THEN, you MUST write the missing sections listed below to complete the article.\n"
            f"Pick up seamlessly where the article left off. Do NOT repeat the last words, just continue the text.\n\n"
            f"MISSING SECTIONS TO WRITE AFTER FINISHING THE CURRENT SECTION:\n" +
            "\n".join(f"- {s.lstrip('#').strip()}" for s in missing)
        )
        if "## Conclusion" in missing:
            missing_prompt += f"\n\nFor the Conclusion: 120–200 words, summarize key ideas, reinforce value, end naturally.\n"
        if "## Frequently Asked Questions" in missing:
            missing_prompt += "For Frequently Asked Questions: 5 FAQs using ### H3, each 50–100 word answer.\n"
            
        if "## About the" in missing:
            missing_prompt += f"For the Author/Publisher section: Output this EXACT block (do not modify it):\n{author_block}\n\n"
            
        # Let's also append the footer and Related Guides at the end for both SEO and GEO
        if "## About the" in missing:
            real_guide_lines = []
            if interlinks:
                for lnk in interlinks[:15]:
                    if isinstance(lnk, dict) and lnk.get("link") and lnk.get("title"):
                        anchor = lnk.get("recommendedAnchor") or lnk["title"]
                        real_guide_lines.append(f'- [{anchor}]({lnk["link"]})')
            if real_guide_lines:
                guides_block = "\n".join(real_guide_lines)
                missing_prompt += (
                    f"At the very end, after the About the Author/Publisher section, add the footer and related guides:\n"
                    f"{footer_text}\n\n"
                    f"## Related Guides\n"
                    f"{guides_block}\n\n"
                    f"Do NOT invent new links, copy these EXACT related guides."
                )
            else:
                missing_prompt += f"\nAt the very end, append this footer line:\n{footer_text}\n"

        missing_prompt += (
            f"\nARTICLE SO FAR (last 600 chars for context):\n{blog_text[-600:]}\n\n"
            f"Finish the current incomplete section seamlessly, then output the missing sections in clean Markdown. No preamble."
        )
        try:
            repair_content = _perplexity_call(
                missing_prompt,
                "You are a completion specialist. Output only the missing article sections in clean Markdown.",
                max_tokens=3000,
            )
            blog_text += "\n\n" + repair_content
            print(f"[completion-repair] Repair pass complete. Added {len(repair_content.split())} words.")
        except Exception as repair_err:
            print(f"[completion-repair] Repair pass failed: {repair_err}")

    return {"blogText": clean_blog_output(blog_text.strip()), "wordCount": len(blog_text.split())}


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
        f"- Make it HIGH-CTR and curiosity-driven. Prefer patterns like:\n"
        f"    * '[Topic]: What Actually Works in 2026?'\n"
        f"    * '[Topic] vs [Alt]: The 2026 Study'\n"
        f"    * '[Topic]: The Complete 2026 Guide'\n"
        f"    * 'How [Persona] [Verb] Using [Topic] in 2026'\n"
        f"- Include the year (2026) naturally when it fits.\n"
        f"- Do NOT use clickbait or misleading language.\n"
        f"- Do NOT include character counts, annotations like '(37 chars)', or numbering like '1.'.\n"
        f"- Avoid repeating the exact same keyword phrase multiple times in the title."
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


def generate_backlink_analysis(topic: str, keywords: str, available_links: list) -> dict:
    """
    Acts as the Backlink Intelligence Layer.
    Extracts entities, scores relevance against available database articles,
    builds a topical cluster, and selects the top 8-15 links with anchor text.
    """
    if not available_links:
        return {
            "insertedLinks": [],
            "suggestedLinks": [],
            "topicalCluster": "General",
            "authorityScore": 50
        }

    links_str = "\n".join([f'- Title: "{lnk["title"]}" | Link: {lnk["link"]}' for lnk in available_links])
    
    prompt = f"""
You are an elite SEO Backlink Intelligence Agent.
Your task is to analyze the following target topic and a database of existing articles to build a Topical Cluster and suggest the most powerful internal backlinks to boost EEAT and crawlability.
CRITICAL: The links MUST be highly topically relevant to the specific subject's semantic core. Do NOT select generic/unrelated articles just to fill the quota.
- If the topic is technical (e.g., Linux), link strictly to Cloud, Docker, Kubernetes.
- If the topic is career/education (e.g., 'Degree vs Practical Skill'), prioritize links about 'Careers', 'Skills', 'Students', 'Portfolios', and 'Learning'.
- Do NOT default to generic AI or marketing articles unless directly relevant.

TARGET TOPIC: "{topic}"
TARGET KEYWORDS: "{keywords}"

AVAILABLE DATABASE ARTICLES:
{links_str}

Step 1: Extract core entities from the target topic.
Step 2: Score the relevance of the available database articles against the target topic.
Step 3: Select exactly 7 of the BEST and most topically relevant articles to be inserted as internal backlinks. Quality over quantity — only pick articles that are genuinely relevant.
Step 4: Identify 2-3 additional articles as "suggested" for future content silos.
Step 5: Determine the primary Topical Cluster Category (e.g., "AI Infrastructure", "Real Estate Marketing").
Step 6: Assign an Authority Score (0-100) based on how well the available articles support the target topic.
Step 7: Search the web to identify exactly 3 high-authority EXTERNAL URLs from trending, elite industry publications (e.g., Gartner, McKinsey, Harvard Business Review, Forbes, TechCrunch, Stanford AI Index, etc.) related to this topic. These must be reputable, high-domain-authority websites to boost our blog's SEO. Provide their real URLs and a recommended anchor text.
CRITICAL RATIO RULE: You MUST enforce a strict ratio of 70% Internal Links (7) to 30% External Links (3). Internal links from our own database ALWAYS take priority.
WARNING FOR EXTERNAL LINKS: Do NOT hallucinate URLs. Deep links (e.g., /linux, /report-2026) often 404. If you cannot verify an exact active page URL, you MUST link only to the verified homepage of the authoritative organization (e.g., "https://www.linuxfoundation.org", "https://www.gartner.com").

Return ONLY a valid JSON object in this exact format. No markdown blocks, no text before or after.
{{
    "insertedLinks": [
        {{
            "title": "Article Title",
            "link": "https://...",
            "relevanceScore": 95,
            "recommendedAnchor": "naturally woven anchor text phrase"
        }}
    ],
    "suggestedLinks": [
        {{
            "title": "Article Title",
            "link": "https://..."
        }}
    ],
    "externalLinks": [
        {{
            "title": "External Source Title",
            "link": "https://actual-external-url.com",
            "recommendedAnchor": "naturally woven anchor text phrase"
        }}
    ],
    "topicalCluster": "Cluster Name",
    "authorityScore": 85
}}
"""
    system = "You are a programmatic SEO backlink agent. You output ONLY valid JSON."
    
    try:
        raw = _perplexity_call(prompt, system, max_tokens=1500)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"Perplexity backlink analysis error: {e}")
        try:
            raw = _openai_chat_call(prompt, system, max_tokens=1500)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e2:
            print(f"OpenAI backlink analysis error: {e2}")
            # Safe fallback
            return {
                "insertedLinks": available_links[:3],
                "suggestedLinks": available_links[3:5] if len(available_links) > 3 else [],
                "topicalCluster": "Uncategorized",
                "authorityScore": 50
            }


# ─────────────────────────────────────────────────────────────────────────────
# OPENAI FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def openai_generate_keywords(topic: str) -> str:
    """Fallback keyword generation via OpenAI GPT-4o."""
    prompt = (
        f'You are an SEO keyword research expert. For the topic "{topic}", generate 8–12 hyper-niche, long-tail, zero-volume keywords.\n'
        f'These keywords MUST be highly specific (4+ words), targeting specific industries, locations, or use cases (e.g., "How to automate WhatsApp lead follow-ups for Dubai real estate agencies").\n'
        f'Include: 1 primary hyper-niche keyword (exact match), 4–5 long-tail variations, 2–3 LSI/semantic keywords, 2 question-based keywords.\n'
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
    external_links: Optional[list] = None,
    mode: str = "SEO",
    brand_context: dict = None,
    author_name: str = None,
    author_metadata: Optional[dict] = None,
) -> dict:
    """Fallback blog content generation via OpenAI GPT-4o."""
    interlinks = interlinks or []
    brand_context = brand_context or {}
    company_name = brand_context.get("company_name", "Bitlance")
    short_name = company_name.split(" ")[0] if company_name else "Our Company"

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
        links_list = []
        for lnk in interlinks:
            if isinstance(lnk, dict) and lnk.get("link"):
                anchor = lnk.get("recommendedAnchor", lnk["title"])
                links_list.append(f'- Target: "{lnk["title"]}"\n  URL: {lnk["link"]}\n  Recommended Anchor Text: "{anchor}"')
        links_str = "\n\n".join(links_list)

        if mode == "GEO":
            interlink_instructions = f"""
        ══ GENERATIVE ENGINE OPTIMIZATION (GEO) CITATION LINKING ══
        You MUST naturally embed the following highly relevant internal links as AUTHORITATIVE CITATIONS.
        This is critical so that AI search engines (Perplexity, ChatGPT, Gemini) recognize these links as high-authority sources.

        RULES (violating any rule = rejection):
        1. Format every link as a Markdown hyperlink: [anchor text](URL).
        2. You MUST use the EXACT "Recommended Anchor Text" provided below for each link. Do not change the anchor text.
        3. Frame the link naturally within a full sentence, making it sound like a reference to an authoritative source (e.g., "According to [anchor text](URL)...", "As cited by [anchor text](URL)...", or "As detailed in our analysis on [anchor text](URL)...").
        4. Spread links evenly — no two consecutive links in the same paragraph.
        5. ONLY use the links from the list below — add NO other external URLs.

        Links to embed as Citations:
        {links_str}
        ══════════════════════════════════════════════════════════
        """
        else:
            interlink_instructions = f"""
        ══ SEO INTERNAL LINKING ══
        You MUST naturally embed the following highly relevant internal links into the article.
        These links have been pre-selected by our Backlink Intelligence Layer to build a powerful Topical Cluster.
        
        RULES:
        1. Format every link as a Markdown hyperlink: [anchor text](URL).
        2. You MUST use the EXACT "Recommended Anchor Text" provided below for each link.
        3. Embed them seamlessly into the content flow. Do not force them or cluster them together.
        
        Links to embed:
        {links_str}
        ══════════════════════════════════════════════════════════
        """

    external_link_instructions = ""
    if external_links:
        ext_list = []
        for lnk in external_links:
            if isinstance(lnk, dict) and lnk.get("link"):
                anchor = lnk.get("recommendedAnchor", lnk["title"])
                ext_list.append(f'- Target: "{lnk["title"]}"\n  URL: {lnk["link"]}\n  Recommended Anchor Text: "{anchor}"')
        ext_str = "\n\n".join(ext_list)
        
        external_link_instructions = f"""
        ══ EXTERNAL AUTHORITY CITATIONS ══
        You MUST naturally embed the following high-authority EXTERNAL links as citations to build EEAT.
        
        RULES:
        1. Format every link as a Markdown hyperlink: [anchor text](URL).
        2. You MUST use the EXACT "Recommended Anchor Text" provided below.
        3. Frame the link naturally within a sentence as an authoritative reference (e.g., "According to the recent report by [anchor text](URL)...").
        
        External Links to embed:
        {ext_str}
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
## Frequently Asked Questions About [Topic] (adapt phrasing)
   - Add EXACTLY 5 Q&A pairs directly related to '{primary_keyword}'.
   - {paa_instructions if paa_instructions else f"Generate 5 highly relevant 'People Also Ask' style questions specifically about {primary_keyword}."}
   - Format:
       ### Question text here?
       Answer in 40–80 words. Direct, factual, complete sentence. No fluff.
   - This format is eligible for AI engine parsing.
"""

    if mode == "SEO":
        advanced_optimization = """
══ SEO OPTIMIZER ══
- Address search intent in first 100 words.
- Topical depth: cover subtopics competitors miss.
- Format definitions/lists for featured snippets (Position Zero).
- Clear H1→H2→H3 hierarchy. No fluff. No AI-sounding filler.
- Semantic keywords throughout; no exact-match repetition.
"""
    else:
        advanced_optimization = """
══ GEO CITATION OPTIMIZER ══
- Every major claim must be cite-worthy: specific, attributed, and verifiable.
- Create memorable named frameworks (Maturity Models, Playbooks, Scoring Systems) that AI engines can quote by name.
- Minimum 3 {short_name} proprietary benchmarks with hard numbers.
- Source URLs required for every external statistic.
- Dense, modular paragraphs: each paragraph must stand alone and be self-sufficient if extracted.
- Build "Learn More" blocks after every 2-3 major sections using provided internal links.
"""

    if mode == "SEO":
        mandatory_structure = f"""
SEO ARTICLE STRUCTURE (follow in order — SEO=70%, GEO=30%):

1. H1 — Compelling, keyword-near-front, no stuffing.
2. > **Meta:** 140–160 chars. Keyword + benefit. (Markdown blockquote)
3. Introduction — **{primary_keyword}** bolded first use. Hook + business relevance.
4. ## What Is [Topic]? (adapt phrasing naturally) — 40-60 word snippet answer + Why It Matters 2026.
5. Table of Contents — Bulleted Markdown H2 links.
6. ## Key Statistics — 4-6 bullet stats, real numbers, `Source:` under each.
7. ## How [Topic] Evolved — Editorial, NOT generic history.
8. ## Why It Works — 5+ scannable business-focused reasons.
9. ## Step-by-Step Guide — Numbered list (how-to snippet target).
10. ## Tools & Platforms — Compare 3-5 real tools, Markdown table.
11. ## Business Applications — SaaS, Agencies, HR, B2B use cases.
12. ## How {short_name} Implements This — 300+ words. Real case study.
13. ## Challenges & How to Overcome Them — Contrarian + balanced.
14. ## Quick Answer — 3-4 sentence direct block (GEO support layer only).
15. ## Future Trends — Forward-looking predictions.
16. ## Final Thoughts — 80-120 words, 3 takeaways, natural CTA.
17. ## Sources & References — List real sources. Format each as a Markdown link (e.g. * [Gartner](https://www.gartner.com) - Report Name *). Every source MUST be a clickable link. Do NOT output plain text sources.

RULES: No AI Overview/Fact Box at top. Semantic variants. Inline citations only.

SUBHEADING QUALITY RULES (H2 & H3) — CRITICAL:
- H2 subheadings MUST be informative, benefit-driven, and specific. NEVER generic.
  ✗ BAD: "Introduction", "Overview", "Details", "More Information"
  ✓ GOOD: "Why [Topic] Cuts Operational Costs by 40% in 2026"
- H3 subheadings must add distinct, specific value under each H2. No filler.
- Use power words: "Proven", "Step-by-Step", "Complete", "2026", "How to", "Why", "Ultimate".
- Each H2/H3 must make the reader think "I need to read this section."
- Avoid repeating the exact H1 keyword phrase in every subheading — use semantic variants.
- CRITICAL: Adapt headings naturally for long-tail keywords to ensure grammatically correct phrasing. NEVER generate nonsensical headings like "How Why Location Data Is the New Oil Works".
"""
    else:
        mandatory_structure = f"""
GEO ARTICLE STRUCTURE — Built for AI Citations (Perplexity, ChatGPT, Gemini, Claude)
Weighting: GEO=70%, SEO=30%

SECTION ORDER (follow exactly):

1. H1 — Primary keyword near front. Compelling. No keyword stuffing.
2. > **Meta:** 140-155 chars. Include primary keyword + clear benefit.
3. ## Quick Answer — 3-4 dense, factual sentences. Direct answer. AI retrieval magnet.
4. ## AI Overview Summary — Modular, self-contained summary. What it is, Why it matters, Key benefits, Who it's for.
5. ## Why This Matters in 2026
   - Cover 3 specific recent developments that changed the landscape.
   - Format: Three developments changed this market in 2025–2026:
 1. [Development 1]: What happened + business impact.
 2. [Development 2]: What changed + why businesses care.
 3. [Development 3]: New capabilities + what this unlocks.
6. ## Fast Facts about [Topic] — 4-6 checkmark (✓) facts.
7. ## Key Statistics & Benchmarks
   - 4-6 real stats. EVERY stat must include source URL:
 • [Real statistic with number]
   *Source: [Full Report Name, Year](https://real-url.org)*
   - Include EXACTLY 3 {short_name} proprietary benchmarks:
 • [{short_name} finding with hard number]
   *Source: {short_name} Internal Benchmark, 2025*
8. ## NAMED FRAMEWORK (GEO Citation Magnet — REQUIRED)
   - Create ONE original {short_name}-named framework for this topic.
   - e.g., "The {short_name} [Topic] Maturity Model" or "{short_name} [Topic] Playbook"
   - Format as tiered levels. Example:
 **Level 1 — [Stage Name]:** [Description]
 **Level 2 — [Stage Name]:** [Description]
 ... up to Level 5.
   - This is what Perplexity, ChatGPT, and Gemini cite by name.
9. ## How [Topic] Evolved — Paradigm shifts, NOT generic history.
10. ## Core Components / How It Works — H3 subsections per component.
11. ## Implementation Guide — Numbered steps. How-to format.
12. ## Comparison Table — Markdown table: approaches, tools, or Myth vs Reality.
13. ## Business Applications — 3-4 industry use cases. Format per case: Problem → Solution → Outcome.
14. ## How {short_name} Implements This — 300+ words. Case study:
**Client:** [Industry] | **Problem:** [Pain point] | **Solution:** [{short_name} workflow] | **Result:** [Hard numbers]
Follow with **Learn More:** block using provided internal links.
15. ## Expert Insights — TWO blockquotes:
> **Expert Insight #1:** [Non-obvious take]
> **Expert Insight #2:** [Contrarian or forward-looking]
16. ## Challenges & How to Overcome Them — Include "When this fails" sub-section.
17. {faq_section.strip() if faq_section.strip() else f"## Frequently Asked Questions About [Topic] — 5 PAA Q&As."}
18. ## Future Outlook — 12-24 month specific predictions.
19. ## Key Takeaways — 5 concise bullets.
20. ## Conclusion — 80-120 words + natural CTA.
21. ## Sources & References — List real sources. Format each as a Markdown link (e.g. * [Gartner](https://www.gartner.com) - Report Name *). Every source MUST be a clickable link. Do NOT output plain text sources.

SUBHEADING QUALITY RULES (H2 & H3) — CRITICAL FOR GEO CITATIONS:
- H2 subheadings MUST be precise, informative, and AI-citation-ready. LLMs quote specific, named sections.
  ✗ BAD: "Introduction", "Overview", "How It Works", "Details"
  ✓ GOOD: "The 5 Paradigm Shifts That Redefined [Topic] in 2026"
- H3 subheadings must be granular, topic-specific, and self-explanatory when extracted out of context.
- Use concrete language: numbers, outcomes, named concepts, year references.
- CRITICAL: Adapt headings naturally for long-tail keywords to ensure grammatically correct phrasing. NEVER generate nonsensical headings like "How Why Location Data Is the New Oil Works".
- Each H2 must function as a standalone, citable knowledge unit when extracted by an AI engine.
- Avoid vague H2s — if a heading could apply to ANY article, rewrite it to be specific to THIS topic.

INTERNAL LINKING: 8-12 Markdown links. Add **Learn More:** blocks after every 2-3 H2s. ONLY use provided URLs. NEVER invent links.
SOURCE RULES: Inline citations only. Every stat needs URL source. Min 3 {short_name} benchmarks.
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
- IMPORTANT GRAMMAR RULE: If the target keyword is grammatically incorrect (e.g. "how linux is more better than windows ?"), DO NOT repeat the exact broken phrase. Use semantic variants (e.g., "Why Linux is Better Than Windows", "Linux vs Windows Comparison") instead.
- Keyword density: 0.8%–1.5% — natural usage only, never forced. You MUST use semantic variants rather than exact-match stuffing.
- Bold the primary keyword on FIRST occurrence in the body text only.
- Use synonyms and related terms in H3 headings to build topical authority.

══ E-E-A-T & CONTENT QUALITY SIGNALS ══
- Experience & Expertise: Write as a clear subject-matter expert. Explicitly cite authoritative industry sources (e.g., CNCF, Kubernetes, AWS, Google Cloud, Microsoft Azure, Stack Overflow Developer Survey, GitHub Octoverse, Gartner, McKinsey).
- Original Insights & Analysis: Google rewards unique observations. Do not just explain—analyze. Include contrarian opinions, unique frameworks, and expert critiques (e.g., "The hidden weakness of...", "When NOT to automate...").
- Stronger Topical Authority: Dive deep into broad subtopics (e.g., CRM, Marketing, HR, Finance, AI, Workflow). Ensure the article covers the topic holistically. Do not just skim the surface with generic points.
- Competitor Gap Coverage: Anticipate what top competitors will write and cover the gaps. Add depth that standard AI content completely misses.
- Authoritativeness & Trustworthiness: Demonstrate depth. Add statistics when relevant. Ensure research-backed points instead of generic observations.
- Clarity & Actionability: Every paragraph must be clear and actionable. Add comparison tables (in Markdown) where beneficial to highlight differences.

══ FEATURED SNIPPET OPTIMISATION ══
- Include ONE paragraph directly below an H2 that answers "What is [Topic]?"
  in 40–60 words in plain, declarative language — targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.

{interlink_instructions}
{external_link_instructions}

{advanced_optimization}

{get_post_generation_enhancement_layer(brand_context=brand_context, mode=mode, interlinks=interlinks, author_name=author_name, author_metadata=author_metadata)}

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
- {"You MUST use the provided internal and external links. For statistics and sources, you MUST include real URL citations as Markdown links. Do NOT invent fake URLs." if (interlinks or external_links) else "Do NOT add ANY invented URLs. For statistics and sources, you MUST include real URL citations as Markdown links."}
- Every sentence must add value — delete any sentence that could be cut without loss.
- The entire article MUST be written ONLY in {language}. Absolutely no foreign words or characters.
- Output ONLY clean, valid Markdown. No preamble, no meta-commentary.
- NEVER output HTML tags (e.g., <h1>, <p>, <h2>, <strong>, <ul>). You MUST use ONLY pure Markdown syntax (e.g., #, ##, **, -, *).
"""

    blog_text = _openai_chat_call(
        prompt,
        "You are a world-class SEO content strategist. Follow the brief exactly.",
        max_tokens=5500,
    )

    # ── Completion validation & repair ────────────────────────────────────────
    has_conclusion = ("## conclusion" in blog_text.lower()) or ("## final thoughts" in blog_text.lower())
    if mode == "SEO":
        REQUIRED_SECTIONS = [] if has_conclusion else ["## Conclusion"]
        REQUIRED_SECTIONS.append("## About the")
    else:
        REQUIRED_SECTIONS = [] if has_conclusion else ["## Conclusion"]
        REQUIRED_SECTIONS.extend(["## Frequently Asked Questions", "## About the"])
    missing = [s for s in REQUIRED_SECTIONS if s.lower() not in blog_text.lower()]

    if missing:
        print(f"[completion-repair-openai] Missing sections detected: {missing}")
        company_name  = brand_context.get("company_name", "Bitlance Automation") if brand_context else "Bitlance Automation"
        
        # Build dynamic author/publisher block for repair
        KNOWN_AUTHORS = {
            "anurag dhole": {
                "author_title": "CEO & Founder",
                "author_company": "Bitlance",
                "author_bio": "Anurag Dhole is the CEO and Founder of Bitlance, specializing in AI-driven automation, business process optimization, and enterprise agentic workflows.",
                "author_linkedin": "https://www.linkedin.com/in/anurag-dhole-532046124/"
            }
        }
        
        author_meta_dict = author_metadata or {}
        name_key = (author_meta_dict.get("author_name") or author_name or "").strip().lower()
        known_meta = KNOWN_AUTHORS.get(name_key, {})
        
        if author_meta_dict.get("author_name") or author_name:
            _aname  = author_meta_dict.get("author_name") or author_name
            _atitle = author_meta_dict.get("author_title") or known_meta.get("author_title") or "Content Specialist"
            _acomp  = author_meta_dict.get("author_company") or known_meta.get("author_company") or company_name
            _abio   = author_meta_dict.get("author_bio") or known_meta.get("author_bio") or f"{_aname} is a subject-matter expert at {_acomp} specializing in AI automation and digital publishing."
            _ali    = author_meta_dict.get("author_linkedin") or known_meta.get("author_linkedin") or ""
            _linkedin_line = f"\n[LinkedIn Profile]({_ali})" if _ali else ""
            author_block = f"## About the Author\n\n**{_aname}** — *{_atitle}* at **{_acomp}**\n\n{_abio}{_linkedin_line}"
        else:
            author_block = f"## About the Publisher\n\nThis article was researched, written, and editorially reviewed by the content team at **{company_name}**. All claims are fact-checked against publicly available sources and proprietary internal benchmarks."

        # Dynamically build the footer
        if mode == "SEO":
            footer_text = f"**Written By:** {author_name or (company_name + ' Expert Editorial Board')} | **Fact-Checked & Reviewed By:** The Technical Content Team at {company_name} | **Last Updated:** June 2026"
        else:
            footer_text = f"**Content Attribution:** {author_name or (company_name + ' Editorial Team')} | **Authority & Verification:** Published by {company_name} | **Last Updated:** June 2026"

        missing_prompt = (
            f"The following article is INCOMPLETE. It was cut off mid-sentence or mid-section.\n"
            f"FIRST, you MUST seamlessly finish the exact sentence, paragraph, and section where the article left off.\n"
            f"THEN, you MUST write the missing sections listed below to complete the article.\n"
            f"Pick up seamlessly where the article left off. Do NOT repeat the last words, just continue the text.\n\n"
            f"MISSING SECTIONS TO WRITE AFTER FINISHING THE CURRENT SECTION:\n" +
            "\n".join(f"- {s.lstrip('#').strip()}" for s in missing)
        )
        if "## Conclusion" in missing:
            missing_prompt += f"\n\nFor the Conclusion: 120–200 words, summarize key ideas, reinforce value, end naturally.\n"
        if "## Frequently Asked Questions" in missing:
            missing_prompt += "For Frequently Asked Questions: 5 FAQs using ### H3, each 50–100 word answer.\n"
            
        if "## About the" in missing:
            missing_prompt += f"For the Author/Publisher section: Output this EXACT block (do not modify it):\n{author_block}\n\n"
            
        # Let's also append the footer and Related Guides at the end for both SEO and GEO
        if "## About the" in missing:
            real_guide_lines = []
            if interlinks:
                for lnk in interlinks[:15]:
                    if isinstance(lnk, dict) and lnk.get("link") and lnk.get("title"):
                        anchor = lnk.get("recommendedAnchor") or lnk["title"]
                        real_guide_lines.append(f'- [{anchor}]({lnk["link"]})')
            if real_guide_lines:
                guides_block = "\n".join(real_guide_lines)
                missing_prompt += (
                    f"At the very end, after the About the Author/Publisher section, add the footer and related guides:\n"
                    f"{footer_text}\n\n"
                    f"## Related Guides\n"
                    f"{guides_block}\n\n"
                    f"Do NOT invent new links, copy these EXACT related guides."
                )
            else:
                missing_prompt += f"\nAt the very end, append this footer line:\n{footer_text}\n"

        missing_prompt += (
            f"\nARTICLE SO FAR (last 600 chars for context):\n{blog_text[-600:]}\n\n"
            f"Finish the current incomplete section seamlessly, then output the missing sections in clean Markdown. No preamble."
        )
        try:
            repair_content = _openai_chat_call(
                missing_prompt,
                "You are a completion specialist. Output only the missing article sections in clean Markdown.",
                max_tokens=3000,
            )
            blog_text += "\n\n" + repair_content
            print(f"[completion-repair-openai] Repair pass complete. Added {len(repair_content.split())} words.")
        except Exception as repair_err:
            print(f"[completion-repair-openai] Repair pass failed: {repair_err}")

    return {"blogText": clean_blog_output(blog_text.strip()), "wordCount": len(blog_text.split())}


def generate_image(topic: str, image_text: str) -> str:
    """
    Generate a real AI image for the blog header using gpt-image-2.
    Falls back to dall-e-3 if gpt-image-2 returns 401 Unauthorized.
    Returns a data URI (data:image/png;base64,...) that the Node controller
    uploads to Supabase Storage via uploadImageToSupabase().
    """
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY not set, skipping image generation.")
        return ""
        
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    # Keep image_text to max 3 words to prevent text overflow/clipping in the image
    safe_image_text = ' '.join(image_text.split()[:3])
    prompt = f"Professional blog header image for the topic \"{topic}\". Modern, clean, minimal design with a wide open area for text. Large bold sans-serif white text perfectly centered in the image: \"{safe_image_text}\". Keep the text well within the margins and ensure all text is fully visible, properly rendered, and not cut off or cropped at the edges. No extra text or logos."

    # ── Tier 1: gpt-image-2 ────────────────────────────────────────────────
    try:
        payload = {
            "model": "gpt-image-2",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "low"
        }
        print(f"Generating image with gpt-image-2 (quality=low) for topic: '{topic}'")
        res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload, timeout=120)
        res.raise_for_status()
        
        # gpt-image-2 returns b64_json, NOT a URL
        b64_data = res.json()["data"][0].get("b64_json", "")
        if b64_data:
            print(f"generate_image: gpt-image-2 success, length={len(b64_data)}")
            return f"data:image/png;base64,{b64_data}"
        print("generate_image: No b64_json in gpt-image-2 response, trying dall-e-3.")
    except Exception as e:
        print(f"gpt-image-2 failed ({type(e).__name__}): {e}. Falling back to dall-e-3.")

    # ── Tier 2: dall-e-3 fallback ──────────────────────────────────────────
    try:
        payload = {
            "model": "dall-e-3",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "standard",
            "response_format": "b64_json"
        }
        print(f"Generating image with dall-e-3 fallback for topic: '{topic}'")
        res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload, timeout=120)
        res.raise_for_status()

        b64_data = res.json()["data"][0].get("b64_json", "")
        if b64_data:
            print(f"generate_image: dall-e-3 success, length={len(b64_data)}")
            return f"data:image/png;base64,{b64_data}"
        print("generate_image: No b64_json in dall-e-3 response either.")
    except Exception as e:
        print(f"Error generating image with dall-e-3: {e}")

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
