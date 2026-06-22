import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("/home/codebloodedsash/automation bitlance/Bitlance_Automation/server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(url, key)

ADMIN_ID = "0d396440-7d07-407c-89da-9cb93e353347"

# 1. Update existing non-admin users to 500 credits
users_resp = sb.table("user_credits").select("user_id").execute()
for u in users_resp.data:
    uid = u["user_id"]
    if uid != ADMIN_ID:
        sb.table("user_credits").update({"balance": 500}).eq("user_id", uid).execute()
        print(f"Set balance to 500 for user {uid}")

# 2. Give admin 100 credits for display purposes
sb.table("user_credits").update({"balance": 100}).eq("user_id", ADMIN_ID).execute()
print(f"Set balance to 100 for ADMIN {ADMIN_ID}")

print("Successfully updated user credits!")
