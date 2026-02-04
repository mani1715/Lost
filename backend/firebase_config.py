import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        # For production, use service account JSON file
        # For now, initialize with default credentials
        try:
            firebase_admin.initialize_app({
                'projectId': os.environ.get('FIREBASE_PROJECT_ID', 'your-project-id'),
                'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'your-project.appspot.com')
            })
        except Exception as e:
            print(f"Firebase initialization: {e}")

def get_firestore_client():
    initialize_firebase()
    return firestore.client()

def get_storage_bucket():
    initialize_firebase()
    return storage.bucket()