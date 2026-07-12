from firebase_admin import credentials
import firebase_admin

from app.core.config import FIREBASE_CREDENTIALS

cred = credentials.Certificate(FIREBASE_CREDENTIALS)
firebase_admin.initialize_app(cred)