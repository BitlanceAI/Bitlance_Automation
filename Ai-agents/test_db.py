import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("/home/codebloodedsash/Bitlance Uttam/server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(url, key)

print("Agent Pricing:")
print(sb.table("agent_pricing").select("*").execute().data)

print("\nAdmin user ID:")
print("0d396440-7d07-407c-89da-9cb93e353347")
