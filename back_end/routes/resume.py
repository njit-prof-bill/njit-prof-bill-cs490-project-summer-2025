from flask import Blueprint, request, jsonify
from bson import ObjectId
import re
import sys
from db import biography_collection

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_REGEX = re.compile(r"^\d{3}-\d{3}-\d{4}$")

resume_bp = Blueprint("resume", __name__)

@resume_bp.route("/resume/<resume_id>/update_contact", methods=["POST"])
def update_contact(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400
        
        emails = data.get("emails")
        if emails is None:
            return jsonify({"error": "Missing 'emails' field in request"}), 400


        if not isinstance(emails, list) or not emails:
            return jsonify({"error": "At least one email is required"}), 400
        
        for email in emails:
            if not isinstance(email, str) or not EMAIL_REGEX.match(email.strip()):
                return jsonify({"error": f"Invalid email: {email}"}), 400
        
        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.contact.emails": emails}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({"message": "Emails updated successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/update_phone", methods=["POST"])
def update_phone(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400

        data = request.get_json()
        if not data or "phones" not in data:
            return jsonify({"error": "Phone numbers not provided"}), 400

        phones = data["phones"]
        if not isinstance(phones, list) or not phones:
            return jsonify({"error": "At least one phone number is required"}), 400

        for phone in phones:
            if not isinstance(phone, str) or not PHONE_REGEX.match(phone.strip()):
                return jsonify({"error": f"Invalid phone: {phone}"}), 400

        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.contact.phones": phones}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404

        return jsonify({"message": "Phone numbers updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500