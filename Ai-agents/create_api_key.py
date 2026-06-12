import os
import secrets
import string
from supabase import create_client

# Keep this safe
url = os.environ.get("SUPABASE_URL", "https://paskzwoegduhzehkxoyu.supabase.co")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDQ4OSwiZXhwIjoyMDc3MTM2NDg5fQ.r8X-0gnfI7zseMzo4yENBqL1ezbBUcnBdPn20UB6wI8")
supabase = create_client(url, key)

def generate_new_api_key(user_email, plan_type="enterprise"):
    # 1. Look up the user ID based on email
    print(f"Looking up user: {user_email}")
    # Note: Using admin API to get users
    users_resp = supabase.auth.admin.list_users()
    target_user = None
    for u in users_resp:
        if u.email == user_email:
            target_user = u
            break
            
    if not target_user:
        # Fallback to the first user if email not found
        print(f"Email {user_email} not found! Defaulting to the primary admin account.")
        target_user = users_resp[0]
        
    user_id = target_user.id
    
    # 2. Generate a secure random API key
    alphabet = string.ascii_letters + string.digits
    random_str = ''.join(secrets.choice(alphabet) for _ in range(48))
    new_key = f"sk_live_{random_str}"
    
    # 3. Insert into the database
    key_payload = {
        "user_id": user_id,
        "api_key": new_key,
        "status": "active",
        "plan": plan_type
    }
    
    res = supabase.table("api_keys").insert(key_payload).execute()
    
    if res.data:
        print("\n✅ SUCCESS! API Key Generated.")
        print("-" * 50)
        print(f"Firm Account: {target_user.email}")
        print(f"Plan Type:    {plan_type.capitalize()}")
        print(f"API Key:      {new_key}")
        print("-" * 50)
        print("Share this key securely with the firm. They can use it in the 'Authorization: Bearer <KEY>' header.")
    else:
        print("❌ Failed to generate key.")

if __name__ == "__main__":
    # Change this to the email of the firm/user you want to create a key for
    firm_email = "uttamrajsingh423@gmail.com" 
    
    # Plans available: starter (10/min), growth (30/min), agency (60/min), enterprise (120/min)
    plan_type = "enterprise"
    
    generate_new_api_key(firm_email, plan_type)
