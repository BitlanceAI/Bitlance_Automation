import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("/home/codebloodedsash/Bitlance Uttam/server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(url, key)

ADMIN_ID = "0d396440-7d07-407c-89da-9cb93e353347"

# Give admin 48930 credits for display purposes
sb.table("user_credits").update({"balance": 48930}).eq("user_id", ADMIN_ID).execute()
print(f"Set balance to 48930 for ADMIN {ADMIN_ID}")
