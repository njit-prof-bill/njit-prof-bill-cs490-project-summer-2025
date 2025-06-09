import firebase_admin
from firebase_admin import credentials, firestore, storage

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'resume-maker-9e312.appspot.com'
})

# Create Firestore client
db = firestore.client()