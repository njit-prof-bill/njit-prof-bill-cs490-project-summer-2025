from flask import Blueprint, request, jsonify
from db import biography_collection

# Max File Size
MAX_FILE_SIZE = 15 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "md", "odt"}

# Define the Blueprint
upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload():
    # Checks if the user submitted a file or a biography text
    file = request.files.get("file")
    biography_text = request.form.get("biography")

    # If neither were submitted error
    if not file and not biography_text:
        return jsonify({"error": "No file or biography text provided"}), 400

    doc = {}

    # If a file was submitted
    if file:
        filename = file.filename

        # Check file extensions
        extension = filename.rsplit(".", 1)[-1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type"}), 400
        
        # Check file size
        file.seek(0,2)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 15MB)"}), 400
        
        # Read file content
        file_content = file.read()

        # Check empty file
        if not file_content:
            return jsonify({"error": "Uploaded file is empty"}), 400
        
        # Save file into doc
        doc["filename"] = filename
        doc["file_type"] = extension
        doc["file_content"] = file_content

    # If a biography text was submitted
    if biography_text:
        doc["biography_text"] = biography_text.strip()

    # The data being submitted
    try:
        result = biography_collection.insert_one(doc)
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    # Success
    return jsonify({"message": "Upload successful", "id": str(result.inserted_id)}), 200