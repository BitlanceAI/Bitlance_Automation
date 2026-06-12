import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("/home/codebloodedsash/Bitlance Uttam/server/.env")
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found, using Supabase client to run RPC or direct query not possible without pgAdmin, but we will try.")

import sys
sys.exit(0)
