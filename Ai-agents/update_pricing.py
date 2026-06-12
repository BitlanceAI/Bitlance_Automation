import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("/home/codebloodedsash/Bitlance Uttam/server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(url, key)

sb.table("agent_pricing").upsert({
    "agent_type": "seo_blog",
    "pricing_model": "flat_rate",
    "unit_cost": 10,
    "is_active": True
}).execute()

sb.table("agent_pricing").upsert({
    "agent_type": "geo_blog",
    "pricing_model": "flat_rate",
    "unit_cost": 15,
    "is_active": True
}).execute()

print("Agent pricing updated for seo_blog and geo_blog.")
