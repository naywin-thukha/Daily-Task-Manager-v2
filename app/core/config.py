from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")