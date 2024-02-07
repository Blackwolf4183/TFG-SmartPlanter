from supabase import Client, create_client
from dotenv import load_dotenv
import os

load_dotenv()

def create_supabase_client():
    supabase: Client = create_client(os.environ.get("DB_URL"), os.environ.get("DB_KEY"))
    return supabase