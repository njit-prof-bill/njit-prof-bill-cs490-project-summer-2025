import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path='.env.local')

# Key name expected in environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')