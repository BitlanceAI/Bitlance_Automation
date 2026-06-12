import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

res = supabase.table("company_articles").select("id, topic, optimization_mode, created_at").order("created_at", desc=True).limit(5).execute()
for r in res.data:
    print(r)
