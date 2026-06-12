import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL", "https://paskzwoegduhzehkxoyu.supabase.co")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDQ4OSwiZXhwIjoyMDc3MTM2NDg5fQ.r8X-0gnfI7zseMzo4yENBqL1ezbBUcnBdPn20UB6wI8")

supabase = create_client(url, key)
res = supabase.table("user_credits").select("user_id, balance").limit(1).execute()
if res.data:
    print(res.data[0])
else:
    print("No users found.")
