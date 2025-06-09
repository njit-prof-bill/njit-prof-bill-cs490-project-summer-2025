import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils.file_utils import allowed_file
from firebase_client import db

# Create Blueprint for upload routes
upload_bp = Blueprint('upload_bp', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'error': 'No file provided'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500
    
    biography = request.form.get('biography', '').strip()

    try:
        db.collection('submissions').add({
            'filename': filename,
            'file_saved_locally': True,
            'biography': biography
        })
    except Exception as e:
        return jsonify({'error': f'Failed to save to Firestore: {str(e)}'}), 500
    
    return jsonify({
        'message': 'File and biography saved successfully',
        'filename': filename,
        'file_saved_locally': True,
        'biography': biography
    })