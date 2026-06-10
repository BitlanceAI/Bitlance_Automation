import re
from datetime import datetime, timezone
from urllib.parse import urlparse
from app.api.v1.schemas import StandardArticleResponse, FAQItem

def extract_structured_article(raw_markdown: str, seo_title: str, topic: str, keywords_str: str) -> StandardArticleResponse:
    # 1. Title
    title_match = re.search(r'^#\s+(.+)$', raw_markdown, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else (seo_title or topic)

    # 2. Meta description
    meta_match = re.search(r'>\s*\*\*Meta:\*\*\s*(.+)', raw_markdown, re.IGNORECASE)
    meta_desc = meta_match.group(1).strip() if meta_match else f"Comprehensive guide on {topic}."

    # 3. Slug
    slug_base = seo_title or topic or "article"
    slug = re.sub(r'[^a-z0-9]+', '-', slug_base.lower()).strip('-')

    # 4. FAQ
    faqs = []
    faq_section_match = re.search(r'##\s+Frequently Asked Questions(.*?)((##)|$)', raw_markdown, re.IGNORECASE | re.DOTALL)
    if faq_section_match:
        faq_text = faq_section_match.group(1)
        q_matches = re.finditer(r'###\s+(.+?)\n+(.*?)(?=###|$)', faq_text, re.DOTALL)
        for m in q_matches:
            q = m.group(1).strip()
            a = m.group(2).strip()
            if q and a:
                faqs.append(FAQItem(question=q, answer=a))

    # 5. Links & Citations
    internal_links = []
    external_sources = []
    citations = []
    
    link_matches = re.findall(r'\[([^\]]+)\]\((http[s]?://[^\)]+)\)', raw_markdown)
    for text, url in link_matches:
        domain = urlparse(url).netloc
        if 'bitlancetechhub.com' in domain or 'localhost' in domain:
            internal_links.append(url)
        else:
            external_sources.append(url)
            citations.append(f"{text}: {url}")

    # 6. Entities (Mock simple extraction: capitalized terms)
    entities_set = set()
    entity_matches = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b', raw_markdown)
    for e in entity_matches:
        if len(e) > 3:
            entities_set.add(e)
    entities = list(entities_set)[:15]

    # 7. Keywords
    keywords = [k.strip() for k in (keywords_str or "").split(',') if k.strip()]

    # 8. Schema Markup (JSON-LD)
    generated_time = datetime.now(timezone.utc).isoformat()
    schema_markup = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": seo_title,
        "description": meta_desc,
        "datePublished": generated_time,
        "author": {
            "@type": "Organization",
            "name": "Bitlance"
        }
    }
    if faqs:
        faq_schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f.answer
                    }
                } for f in faqs
            ]
        }
        schema_markup["faqSchema"] = faq_schema

    return StandardArticleResponse(
        title=title,
        meta_title=seo_title or title,
        meta_description=meta_desc,
        slug=slug,
        content=raw_markdown,
        faq=faqs,
        internal_links=list(set(internal_links)),
        external_sources=list(set(external_sources)),
        entities=entities,
        schema_markup=schema_markup,
        keywords=keywords,
        citations=list(set(citations)),
        generated_at=generated_time
    )
