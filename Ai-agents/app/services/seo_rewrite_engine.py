import os
import sys
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Add parent directories to path so app package can be resolved
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

# Load environment variables
load_dotenv()
server_env = os.path.join(os.path.dirname(__file__), "../../../server/.env")
if os.path.exists(server_env):
    load_dotenv(server_env)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials for Rewrite Engine")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger = logging.getLogger(__name__)

# Import the perplexity/openai caller from blog_ai_service
from app.services.blog_ai_service import _perplexity_call, format_markdown_to_html

def fetch_flagged_articles():
    """Fetch articles across all tables that have the SEO_AUDIT_REQUIRED flag."""
    flagged = []
    for table in ["articles", "company_articles"]:
        try:
            res = supabase.table(table).select("*").ilike("content", "%SEO_AUDIT_REQUIRED%").execute()
            if res.data:
                for article in res.data:
                    article['__table_name'] = table
                    flagged.append(article)
        except Exception as e:
            print(f"Error fetching from {table}: {e}")
    return flagged

def rewrite_article(article):
    """
    Push the article back through the AI to aggressively fix its entities, 
    statistics, and authority references.
    """
    topic = article.get("topic", "Unknown Topic")
    original_text = article.get("content", "")
    
    print(f"🔄 Rewriting Article: '{topic}'")
    
    system_msg = "You are an elite SEO Rewrite Auditor and Post-Publication Editor. Your job is to rescue thin content and elevate it to 2026 GEO standards."
    prompt = f"""
The following article was flagged for failing its automated SEO Audit because it lacks sufficient entity density, hard statistics, and authoritative citations.

TOPIC: {topic}

YOUR TASK:
Aggressively rewrite and expand the article to fix these specific flaws:
1. Inject 5-15 specific, highly relevant entities (Companies, Frameworks, Standards, etc.).
2. Add a dedicated "Statistics" block with hard quantitative data (percentages, multipliers).
3. Embed at least 3 authoritative citations (e.g. "According to Gartner...", "Research by MIT shows...").
4. Ensure the article has a high-quality Markdown Comparison Table.
5. Ensure there is a standalone "AI OVERVIEW" block summarizing the thesis.
6. Do NOT include the SEO_AUDIT_REQUIRED flag in your output.
7. Return ONLY the fully rewritten Markdown article. No conversational preamble.

ORIGINAL CONTENT:
{original_text}
"""

    # Call AI to rewrite the article
    try:
        new_markdown = _perplexity_call(prompt, system_msg=system_msg, max_tokens=8000)
    except Exception as e:
        print(f"❌ Failed to rewrite {topic}: {e}")
        return False
        
    # Format to HTML (as required by the DB schema 'content' column)
    new_html = format_markdown_to_html(new_markdown)
    
    # Update Supabase
    table = article['__table_name']
    try:
        supabase.table(table).update({
            "content": new_html
        }).eq("id", article["id"]).execute()
        print(f"✅ Successfully rewrote and updated: '{topic}'")
        return True
    except Exception as e:
        print(f"❌ Database update failed for {topic}: {e}")
        return False

def run_auditor():
    print("=" * 60)
    print("🔍 RUNNING SEO REWRITE ENGINE (PHASE 2)")
    print("=" * 60)
    
    articles = fetch_flagged_articles()
    if not articles:
        print("🎉 Clean Database! No articles currently flagged for SEO Audit.")
        return
        
    print(f"⚠️ Found {len(articles)} flagged article(s). Commencing rewrites...")
    
    for idx, art in enumerate(articles):
        print(f"\n[{idx+1}/{len(articles)}]")
        rewrite_article(art)
        
    print("\n✅ Rewrite Engine cycle complete.")

if __name__ == "__main__":
    run_auditor()
