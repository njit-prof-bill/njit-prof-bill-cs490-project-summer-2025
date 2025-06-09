import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils.file_utils import allowed_file
from firebase_client import db
from firebase_admin import storage

# Create Blueprint for upload routes
upload_bp = Blueprint('upload_bp', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    biography = request.form.get('biography', '').strip()

    # Validation
    if not file or file.filename == '':
        return jsonify({'error': 'No file provided'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    filename = secure_filename(file.filename)
    
    # Upload file to Firebase Storage
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f'resumes/{filename}')
        
        # Upload file content to storage
        blob.upload_from_file(file.stream, content_type=file.content_type)
        blob.make_public()

        file_url = blob.public_url

    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500
    
    # Save metadata to Firestore
    try:
        db.collection('submissions').add({
            'filename': filename,
            'biography': biography,
            'file_url': file_url
        })
    except Exception as e:
        return jsonify({'error': f'Failed to save to Firestore: {str(e)}'}), 500
    
    return jsonify({
        'message': 'File and biography saved successfully',
        'filename': filename,
        'file_url': file_url,
        'biography': biography
    })