import os
import json

from firebase_admin import credentials
import firebase_admin


firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")

cred = credentials.Certificate(
    json.loads(firebase_credentials)
)

firebase_admin.initialize_app(cred)