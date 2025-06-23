from flask import Blueprint, jsonify, request
from db import biography_collection
from bson import ObjectId
from parser.extractors import extract_text
from parser.parser import ResumeParser
import tempfile
import os

# Max File Size
MAX_FILE_SIZE = 15 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "md", "odt"}

# Define the Blueprint
upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    biography_text = request.form.get("biography")

    if not file and not biography_text:
        return jsonify({"error": "No file or biography text provided"}), 400

    doc = {}

    # If file submitted
    if file:
        filename = file.filename
        extension = filename.rsplit(".", 1)[-1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type"}), 400

        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 15MB)"}), 400

        file_content = file.read()

        if not file_content:
            return jsonify({"error": "Uploaded file is empty"}), 400

        doc["filename"] = filename
        doc["file_type"] = extension
        doc["file_content"] = file_content

    # If biography text submitted
    if biography_text:
        doc["biography_text"] = biography_text.strip()

    # Store data first
    try:
        result = biography_collection.insert_one(doc)
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    # Prepare corpus for parsing
    corpus = []

    # Extract text from file if present
    if "file_content" in doc and "filename" in doc:
        suffix = os.path.splitext(doc["filename"])[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(doc["file_content"])
            tmp_path = tmp.name
        try:
            extracted = extract_text(tmp_path)
            corpus.append(extracted)
        except Exception as e:
            os.remove(tmp_path)
            return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500
        finally:
            os.remove(tmp_path)

    # Append freeform biography text if present
    if "biography_text" in doc:
        corpus.append(doc["biography_text"])

    if not corpus:
        return jsonify({"error": "No file or biography text to parse"}), 400

    # Combine all parts into one string
    full_text = "\n\n".join(corpus)

    # ---- Minimal change: store raw_text in DB ----
    biography_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"raw_text": full_text}}
    )

    # 2. Parse with LLM
    parser = ResumeParser()
    try:
        parse_result = parser.parse(full_text)
    except Exception as e:
        return jsonify({"error": f"LLM parsing failed: {str(e)}"}), 500

    # 3. Save parse result into document
    biography_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"parse_result": parse_result}}
    )

    # 4. Return the parse result
    return jsonify({
        "message": "Upload and parsing successful",
        "id": str(result.inserted_id),
        "parse_result": parse_result
    }), 200

@upload_bp.route("/resume/<id>", methods=["GET"])
def get_data(id):
    try:
        doc = biography_collection.find_one({"_id": ObjectId(id)})
    except Exception as e:
        return jsonify({"error": f"Invalid ID format: {str(e)}"}), 400
    
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    
    parse_result = doc.get("parse_result")
    if not parse_result:
        return jsonify({"error": "No parse result found for this document"}), 404
    
    return jsonify({
        "id": str(doc["_id"]),
        "parse_result": parse_result
    }), 200
