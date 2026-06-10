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

def get_post_generation_enhancement_layer(brand_context=None):
    if not brand_context:
        brand_context = {
            "company_name": "Bitlance Automation (Bitlance Tech Hub)",
            "services": "Custom AI Agent Development, AI Voice Bot Implementation, Business Process Automation, Enterprise Web App Development, Digital Marketing Pipelines",
            "products": "GEO & SEO AI Blog Engine, Meta Ads Automation Platform, Bitlance Email Agent, Social Media & Graphics AI, Real Estate Reel Generator, HR Bitlance, WhatsApp Automation CRM",
            "target_audience": "Digital Marketing Agencies, B2B SaaS, Real Estate Firms, HR Teams, Professional Services",
            "industries": "Technology, Real Estate, Healthcare, Education, Local Services",
            "usp": "We build 2026-standard elite AI automation pipelines that eliminate manual workflows."
        }
    
    return f"""
══ POST-GENERATION ENHANCEMENT LAYER ══
Before finalizing any article, ensure the following layers are deeply integrated into the content:

1. BRAND AUTHORITY CHECK
Include:
* Real implementation examples
* Workflow examples
* Industry-specific applications
* Customer pain points
* Service relevance

You MUST include at least ONE "Mini-Case Study" explicitly formatted as:
> **Case Study**
> **Challenge:** [Description]
> **Solution:** [{brand_context.get('company_name', 'Bitlance')} deployed...]
> **Outcome:** [Measurable result]

Use the following BRAND_CONTEXT to avoid generic examples:
Company Name: {brand_context.get('company_name', '')}
Services: {brand_context.get('services', '')}
Products: {brand_context.get('products', '')}
Target Audience: {brand_context.get('target_audience', '')}
Industries: {brand_context.get('industries', '')}
Unique Selling Proposition: {brand_context.get('usp', '')}

2. REVENUE ALIGNMENT CHECK
Classify the keyword intent silently and adapt the structure:
* If informational: Pivot to B2B decision-makers. Add an "Enterprise Readiness Framework", "Governance Checklist", or "How Businesses Can Assess Risk". Do NOT just write for students.
* If commercial: Add a "Buyer's Guide" section.
* If transactional: Add a "Solution Comparison" and a "Natural CTA".

3. UNIQUENESS CHECK
Ensure the article contains:
* Original insights
* Contrarian viewpoints
* Industry observations
* Future predictions
Avoid reproducing common competitor structures.

4. REWRITE READINESS & QUALITY FLAG
If the generated content has fewer than:
- 5 entities
- 3 authority references
- 1 statistics block
- 1 FAQ section
append this exact text at the very bottom of the article:
`SEO_AUDIT_REQUIRED = TRUE`

5. AI VISIBILITY OPTIMIZATION
Ensure the article explicitly contains:
* AI Overview: A standalone block right after the intro (titled "AI OVERVIEW") with a 2-3 sentence dense summary.
* Quick Answer (Direct answer block)
* Statistics Block: MUST contain real numbers (e.g., 75%, 2.3 billion, 4x faster) in a dedicated bullet list. Underneath each bullet, you MUST use the exact format: `Source: [Name of Report/Index]`.
* Comparison Table: MUST include a strict Markdown table (e.g., Risk | Today | 2030 or Option A | Option B).
* Expert Insight
* FAQ
* Fact Box

6. KNOWLEDGE GRAPH EXPANSION
Automatically identify and include 5-15 specific entities from:
* Companies
* Products
* Frameworks
* Research Organizations
* Standards
* Industry Reports
* Open Source Projects

7. BUSINESS CONVERSION LAYER
Include:
* Practical implementation section
* Solution recommendations
* Natural CTA (without aggressive selling)

8. TOPICAL AUTHORITY LAYER
At the very end of the article, output a Markdown comment block (`<!-- ... -->`) containing:
* Parent Topic
* Cluster Category
* Related Articles
* Suggested Internal Links
* Supporting Content Opportunities

9. AUTHORITY SOURCE LAYER & PROPRIETARY DATA
Include explicit references and citations from highly authoritative sources when relevant (e.g., OpenAI, Google, Gartner, McKinsey, Stanford).

When mentioning statistics, research findings, industry trends, or benchmarks, attribute the source directly underneath the bullet point like this:
- [Statistic]
  *Source: Stanford AI Index 2025*
- [Statistic]
  *Source: WEF Future of Jobs Report*

Crucially, you MUST invent or structure at least ONE proprietary data point formatted as:
*Source: {brand_context.get('company_name', 'Bitlance')} Internal Benchmark*
OR
*Source: {brand_context.get('company_name', 'Bitlance')} Customer Analysis*

10. TITLE & LINKING RULES (CRITICAL)
* H1 Title: Must be highly clickable, avoid awkward/academic phrasing (e.g., "the mankind"), and include the year where relevant (e.g., "Risks, Facts & Future Outlook (2026)").
* Internal Linking: NEVER use forced, exact-match keyword anchors. Integrate links using natural, partial-match, or semantic phrasing that flows conversationally.

11. AUTHOR BYLINE (EEAT REQUIREMENT)
At the very bottom of the article, you MUST append this exact author box, replacing the company name:
***
**Author:** Rahul Saini  
**Reviewed By:** {brand_context.get('company_name', 'Bitlance Automation')} Team  
**Last Updated:** June 2026  
***
"""

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

def generate_title_and_keywords(industry: str, mode: str = "SEO") -> dict:
    """
    Auto-generate a blog topic + keyword list for a given industry.
    Uses a Topic Scoring Engine to evaluate 5 candidate topics based on Search Intent,
    Commercial Intent, Competition, GEO Potential, Industry Relevance, and Internal Linking Potential.
    Returns: {"topic": str, "keywords": str, "score": int, "scoring_breakdown": str}
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
        f'LAYER 1: COMPETITION CHECK\n'
        f'Avoid extremely competitive short-tail keywords like: "AI tools", "SEO tools", "Marketing tools", "CRM software", "Chatbot software".\n\n'
        f'LAYER 2: COMMERCIAL INTENT\n'
        f'Prefer these formats: "How to", "Best for", "Case Study", "Workflow", "Implementation Guide", "Comparison", "Cost Analysis" over generic definitions.\n\n'
        f'LAYER 3: INDUSTRY TARGETING\n'
        f'Ensure the topic is deeply tailored to {industry} (e.g., Real Estate, Healthcare, Insurance, HR, Recruitment, E-commerce, SaaS, Marketing Agencies, Education, Legal Firms).\n\n'
        f'LAYER 4: LONG-TAIL EXPANSION\n'
        f'Convert generic concepts (e.g., "AI Agents") into hyper-specific use cases (e.g., "How AI Agents Qualify Real Estate Leads on WhatsApp").\n'
        f'{geo_rules}\n'
        f'TOPIC SCORING ENGINE:\n'
        f'Internally generate 5 candidate topics and score them out of 100 based on this rubric:\n'
        f'- Search Intent (25%)\n'
        f'- Commercial Intent (20%)\n'
        f'- Competition (20% - lower competition = higher score)\n'
        f'- GEO Potential (15%)\n'
        f'- Industry Relevance (10%)\n'
        f'- Internal Linking Potential (10%)\n\n'
        f'Select the BEST topic that scores 75 or higher.\n\n'
        f'Format exactly as JSON:\n'
        f'{{\n'
        f'    "topic": "The exact highest scoring title of the blog post",\n'
        f'    "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",\n'
        f'    "score": 85,\n'
        f'    "scoring_breakdown": "Search Intent: 22/25, Commercial Intent: 18/20, ..."\n'
        f'}}'
    )
    
    system = "You are an Elite SEO/GEO Content Strategist."
    try:
        raw = _perplexity_call(prompt, system, max_tokens=1500)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(cleaned)
        print(f"generate_title_and_keywords: Scored {result.get('score')} - {result.get('topic')}")
        return result
    except Exception as e:
        print(f"Perplexity topic generation error: {e}")
        try:
            raw = _openai_chat_call(prompt, system, max_tokens=1500)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
            print(f"generate_title_and_keywords (fallback): Scored {result.get('score')} - {result.get('topic')}")
            return result
        except Exception as e2:
            print(f"OpenAI fallback error: {e2}")
            return {
                "topic": f"Advanced {industry} Strategy Guide: Implementation and Workflows",
                "keywords": f"{industry} workflow, {industry} implementation guide, best practices for {industry}",
                "score": 75,
                "scoring_breakdown": "Fallback generation"
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
        3. Frame the link naturally within a full sentence, making it sound like a reference to an authoritative source on your site (e.g., "As detailed in our analysis on [anchor text](URL)...").
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
   - Use dynamic, natural, and highly compelling phrasing.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >)
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

3. QUICK DEFINITION & WHY IT MATTERS
   - Start directly with a bolded introductory paragraph covering the "Quick Definition" of the topic.
   - Follow with a paragraph explaining "Why {primary_keyword} Matters Today".
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.

4. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

5. ADOPTION STATISTICS BLOCK
   - Add a bolded H2: "{primary_keyword} Adoption Statistics" (or similar title adapted to topic).
   - Provide 4-6 fast, scannable standalone statistics using bullet points (•) and real hard data/percentages. 
   - Example: "• 96% of top 1 million servers run Linux", "• 90%+ cloud workloads use Linux". Google loves standalone statistics sections.

6. MAIN BODY — EDITORIAL & CONTRARIAN SECTIONS
   - Do NOT use generic headings. Structure the body using exactly these types of editorial sections:
      a. How {primary_keyword} Evolved
      b. 7 Reasons Modern {primary_keyword} Is Better / Works Better
      c. Real Benchmarks and Performance Numbers (Include exact numbers, examples like "120 FPS vs 55 FPS", specific workload comparisons, RTX vs GTX, etc.)
      d. When Traditional/Older Options Still Make Sense (A Contrarian Section for balanced analysis, e.g. budget constraints, legacy software)
      e. {primary_keyword} Buying Guide or Implementation Strategy
      f. Future of {primary_keyword}
   - Strong Entity Coverage: You MUST explicitly mention major knowledge graph entities relevant to the topic (e.g., NVIDIA Hopper, Blackwell, CUDA, PyTorch, OpenAI, AWS, Intel Arc, AMD ROCm).
   - Deep Technical Citations & Expert Sources: You MUST cite highly authoritative sources, including specific whitepapers, benchmark reports (e.g., MLPerf), architecture documentation, and the Stanford AI Index. Do NOT just say "According to vendors..." - be specific (e.g., "According to NVIDIA's Hopper architecture documentation...").
   - Keyword Usage: Do NOT force keywords. Google understands synonyms. Mix up your terms (e.g., instead of repeating "Modern GPU", use "GPU architecture evolution", "Modern graphics processors", "AI-enabled hardware").

7. MYTH VS FACT & EXPERT INSIGHT
   - Include a Markdown Comparison Table of "Myth vs Reality" for the topic.
   - Include an "Expert Insight" or "Industry Insight" blockquote (using >) that provides a deep, non-obvious take on the industry.

8. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - End with a strong, specific call-to-action.
"""
        else:
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >) 
   - 140–155 characters.

3. QUICK ANSWER BLOCK (Critical for AI Retrieval)
   - Add a bolded H2: "Quick Answer"
   - Write a dense, 3-4 sentence direct answer to the core topic/keyword. 

4. AI OVERVIEW SUMMARY
   - Add a bolded H2: "AI Overview Summary"
   - Provide a comprehensive, modular summary of the entire article (e.g., covering pros/cons, comparisons, and core value). Make it highly extractable for AI summarization engines.

5. FAST FACTS
   - Add a bolded H2: "{primary_keyword} Fast Facts"
   - Provide 4-6 fast, scannable facts using checkmarks (✓).

6. STATISTICS BLOCK
   - Add a bolded H2: "{primary_keyword} Statistics"
   - Provide 4-6 standalone statistics using bullet points (•) and real hard data/percentages. (e.g., "• 96% of top web servers run Linux").

7. MAIN CONTENT — EDITORIAL SECTIONS
   - Create highly specific, relevant H2 sections covering:
      a. How {primary_keyword} Evolved
      b. Why {primary_keyword} Works / Is Better
      c. Real Benchmarks and Performance Numbers (Exact metrics, workload comparisons)
      d. Buying/Implementation Guide
      e. Future Outlook
   - High Entity Density: You MUST explicitly mention specific industry-standard hardware, software, organizations (e.g., Docker, CNCF, GitHub, GitLab, Red Hat OpenShift, Terraform, Ansible, Linux Foundation, AWS, Azure).
   - Research Source Layer: You MUST cite highly authoritative academic or institutional sources and documentation. Use explicit phrasing like "According to the Linux Foundation..." or "According to CNCF...".
   - Natural Keyword Usage: Use synonyms and variations. Do not repeat the primary keyword unnaturally.

8. COMPARISON TABLE
   - You MUST include a highly detailed Markdown Comparison Table explicitly comparing features or "Myth" vs "Reality" for the topic.

9. CONTRARIAN SECTION
    - Add a bolded H2: "When Traditional/Older Options Make Sense"
    - Provide balanced analysis of counter-arguments or edge cases.

10. EXPERT INSIGHTS
    - Add exactly TWO separate "Expert Insight" blockquotes (using >) offering deep, non-obvious takes. Format as:
      > **Expert Insight #1:** ...
      > **Expert Insight #2:** ...

{faq_section}
12. FACT BOX
    - Add a bolded H2: "{primary_keyword} Fact Box"
    - Provide a final quick-reference list of core attributes (e.g. ✓ Open Source, ✓ No Licensing Fees).

13. KEY TAKEAWAYS BLOCK
    - Provide 5 extremely concise bullet points summarizing the core thesis.

14. CONCLUSION
    - 80–120 words.
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
- Include ONE paragraph directly below an H2 that answers "What is {primary_keyword}?"
  in 40–60 words in plain, declarative language — this targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.

{interlink_instructions}
{external_link_instructions}

{get_post_generation_enhancement_layer(brand_context=brand_context)}

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
Step 3: Select exactly 13 absolute best articles to be inserted as internal backlinks.
Step 4: Identify 2-4 additional articles as "suggested" for future content silos.
Step 5: Determine the primary Topical Cluster Category (e.g., "AI Infrastructure", "Real Estate Marketing").
Step 6: Assign an Authority Score (0-100) based on how well the available articles support the target topic.
Step 7: Search the web to identify exactly 7 high-authority EXTERNAL URLs (e.g., Stanford AI Index, Gartner, McKinsey, etc.) related to this topic. Provide their real URLs and a recommended anchor text.
CRITICAL RATIO RULE: You MUST enforce a strict ratio of 65% Internal Links (13) to 35% External Links (7) in your final output.
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
   - Use dynamic, natural, and highly compelling phrasing.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >)
   - 140–155 characters, includes primary keyword, states clear benefit.
   - Format: > **Meta:** <your meta description here>

3. QUICK DEFINITION & WHY IT MATTERS (Featured Snippet Candidate)
   - Add a bolded H2: "What is {primary_keyword}?" (or highly relevant variant).
   - Answer the question directly in 40–60 words in plain, declarative language. Example: "{primary_keyword} compares formal education with real-world ability to perform tasks, solve problems, and deliver measurable results. Modern employers increasingly value both, making a hybrid approach the strongest career strategy."
   - Follow with a paragraph explaining "Why {primary_keyword} Matters Today".
   - First sentence MUST contain the primary keyword in bold: **{primary_keyword}**.

4. TABLE OF CONTENTS
   - Markdown bulleted list of every H2 section below (no H3s).
   - Format: - [Section Title](#anchor)

5. FAST FACTS / STATISTICS BLOCK
   - Add a bolded H2: "Fast Facts" or a natural variation like "Fast Facts About [Topic]". Do NOT just copy-paste the exact primary keyword if it's a clunky question.
   - Provide 4-6 fast, scannable facts using checkmarks (✓) and real statistics/data points. 

6. MAIN BODY — EDITORIAL, EXAMPLES & CONTRARIAN SECTIONS
   - Do NOT use generic headings. Structure the body using exactly these types of editorial sections (Adapt the titles so they sound natural, do NOT force exact keywords if awkward):
      a. How It Evolved / The Evolution of the Concept
      b. 7 Reasons It Works Better / Provides Better ROI
      c. Industry-Specific Examples: Explicitly apply the topic to Healthcare, Finance, Cybersecurity, Mechanical Engineering, Startups, etc., to broaden topical coverage.
      d. Real Benchmarks / Case Studies (Include exact numbers, workload comparisons, cost differences).
      e. When Traditional/Older Options Still Make Sense (A Contrarian Section for balanced analysis).
      f. Actionable Framework / Roadmap Block: Provide a step-by-step career, implementation, or technical roadmap (e.g. Student → Degree → Projects → Internships → Portfolio → Job).
      g. Future Outlook
   - Strong Entity Coverage: Explicitly mention major knowledge graph entities relevant to the topic (e.g., NVIDIA, OpenAI, AWS, Stanford, Harvard, MIT, Coursera, Udemy, Gartner, McKinsey).
   - Deep Technical Citations & Expert Sources: You MUST cite highly authoritative sources. Do NOT just say "According to vendors..." - be specific (e.g., "According to Stanford AI Index...").

7. MYTH VS FACT & DETAILED COMPARISON TABLE
   - Include a highly detailed Markdown Comparison Table explicitly comparing core concepts (e.g., Factor | Degree | Practical Skill or Factor | Cloud | On-Premise). This table is critical for SEO rankings.
   - Include an "Expert Insight" or "Industry Insight" blockquote (using >) that provides a deep, non-obvious take on the industry.

8. CONCLUSION  (H2: "Final Thoughts: [Primary Keyword]")
   - 80–120 words.
   - Summarise the 3 most important takeaways.
   - End with a strong, specific call-to-action.
"""
        else:
            mandatory_structure = f"""
1. H1 TITLE
   - Must contain the primary keyword within the first 4 words.

2. META DESCRIPTION BLOCK (immediately after H1, inside a Markdown blockquote >) 
   - 140–155 characters.

3. 30-SECOND ANSWER BLOCK (AI Citation Magnet)
   - Add a bolded H2: "30-Second Answer"
   - Provide a punchy, 2-3 sentence philosophical/strategic summary. Example: "Degrees help you get opportunities. Skills help you keep opportunities. In modern careers, the most successful professionals combine formal education with continuous practical learning."

4. QUICK ANSWER BLOCK (Critical for AI Retrieval)
   - Add a bolded H2: "Quick Answer"
   - Write a dense, 3-4 sentence direct, factual answer to the core topic/keyword. 

5. AI OVERVIEW SUMMARY
   - Add a bolded H2: "AI Overview Summary"
   - Provide a comprehensive, modular summary of the entire article (covering pros/cons, comparisons, and core value). Make it highly extractable for AI summarization engines.

6. FAST FACTS
   - Add a bolded H2: "Fast Facts" (or a natural variation. Do NOT force the exact keyword).
   - Provide 4-6 fast, scannable facts using checkmarks (✓).

7. STATISTICS BLOCK
   - Add a bolded H2: "Key Statistics" (or a natural variation).
   - Provide 4-6 standalone statistics using bullet points (•) and real hard data/percentages. (e.g., "• 96% of top web servers run Linux").

8. MAIN CONTENT — EDITORIAL SECTIONS
   - Create highly specific, relevant H2 sections covering (Adapt the titles so they sound natural, do NOT force exact keywords if awkward):
      a. How It Evolved / The Evolution of the Concept
      b. Why It Works / Is Better
      c. Real Benchmarks and Performance Numbers (Exact metrics, workload comparisons)
      d. "Who Should Choose What?" Section: Provide a highly retrieval-friendly list (e.g., "Choose Degree First If: ✓ Medicine, ✓ Law. Choose Skill First If: ✓ Web Development, ✓ AI Automation").
      e. Buying/Implementation/Career Guide
      f. Future Outlook
   - High Entity Density: You MUST explicitly mention specific industry-standard entities (e.g., Coursera, Udemy, edX, Harvard, MIT, Stanford, Google Career Certificates, Microsoft Learn, Docker, CNCF, GitHub, GitLab, Red Hat OpenShift, Terraform, Ansible, Linux Foundation, AWS, Azure).
   - Research Source Layer: You MUST cite highly authoritative academic or institutional sources and documentation. Use explicit phrasing like "According to the Linux Foundation..." or "According to Stanford...".

9. COMPARISON TABLE & DECISION MATRIX
   - You MUST include a highly detailed Markdown Comparison Table explicitly comparing features or "Myth" vs "Reality" for the topic.
   - You MUST ALSO include a "Decision Matrix" Table. (e.g., Situation | Option A | Option B. Medicine | ✅ | ❌). AI systems love decision frameworks.

10. CONTRARIAN SECTION
    - Add a bolded H2: "When Traditional/Older Options Make Sense"
    - Provide balanced analysis of counter-arguments or edge cases.

11. EXPERT INSIGHTS
    - Add exactly TWO separate "Expert Insight" blockquotes (using >) offering deep, non-obvious takes. Format as:
      > **Expert Insight #1:** ...
      > **Expert Insight #2:** ...

{faq_section}
13. FACT BOX
    - Add a bolded H2: "Fact Box" or "Key Facts Summary"
    - Provide a final quick-reference list of core attributes (e.g. ✓ Open Source, ✓ No Licensing Fees).

14. KEY TAKEAWAYS BLOCK
    - Provide 5 extremely concise bullet points summarizing the core thesis.

15. CONCLUSION
    - 80–120 words.
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
- Include ONE paragraph directly below an H2 that answers "What is {primary_keyword}?"
  in 40–60 words in plain, declarative language — targets the definition snippet.
- The step-by-step section must use a clean numbered list — targets how-to snippets.

{interlink_instructions}
{external_link_instructions}

{advanced_optimization}

{get_post_generation_enhancement_layer(brand_context=brand_context)}

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
            "size": "256x256"
        }
        print(f"Generating image with gpt-image-2 for topic: '{topic}'")
        res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload, timeout=120)
        res.raise_for_status()
        
        # gpt-image-2 returns a URL. We must download it and convert to base64.
        image_url = res.json()["data"][0].get("url", "")
        if not image_url:
            return ""
            
        img_res = requests.get(image_url, timeout=60)
        img_res.raise_for_status()
        import base64
        b64_data = base64.b64encode(img_res.content).decode("utf-8")
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
