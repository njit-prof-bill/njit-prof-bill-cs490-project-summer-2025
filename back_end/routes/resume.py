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
    
@resume_bp.route("/resume/<resume_id>/update_objective", methods=["POST"])
def update_career_objective(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        if not data or "career_objective" not in data:
            return jsonify({"error": "Missing 'career_objective' field in request"}), 400
        
        career_objective = data["career_objective"].strip()
        if not career_objective:
            return jsonify({"error": "Career objective cannot be empty"}), 400
        
        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.career_objective": career_objective}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({"message": "Career objective updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/update_skills", methods=["POST"])
def update_skills(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        if not data or "skills" not in data:
            return jsonify({"error": "Missing 'skills' field in request"}), 400
        
        skills = data["skills"]

        if not isinstance(skills, dict) or not skills:
            return jsonify({"error": "Skills must be a non-empty object"}), 400
        
        for category, items in skills.items():
            if not isinstance(category, str) or not isinstance(items, list):
                return jsonify({"error": f"Invalid entry in skills: {category}"}), 400
            for skill in items:
                if not isinstance(skill, str) or not skill.strip():
                    return jsonify({"error": f"Invalid skill '{skill}' in category '{category}'"}), 400
        
        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.skills": skills}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({"message": "Skills updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/update_job/<int:index>", methods=["POST"])
def update_job_entry(resume_id, index):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        if not data or "updatedJob" not in data:
            return jsonify({"error": "Missing 'updatedJob' in request body"}), 400
        
        job = data["updatedJob"]
        required_fields = ["title", "company", "location", "start_date", "end_date", "role_summary", "responsibilities", "accomplishments"]

        for field in required_fields:
            if field not in job:
                return jsonify({"error": f"Missing field: {field}"}), 400

        if not isinstance(job["responsibilities"], list) or not isinstance(job["accomplishments"], list):
            return jsonify({"error": "Responsibilities and accomplishments must be lists"}), 400

        # Replace the job at the given index
        resume = biography_collection.find_one({"_id": ObjectId(resume_id)})

        if not resume:
            return jsonify({"error": "Resume not found"}), 404

        jobs = resume.get("parse_result", {}).get("jobs", [])
        if index < 0 or index >= len(jobs):
            return jsonify({"error": "Job index out of range"}), 400

        update_path = f"parse_result.jobs.{index}"
        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {update_path: job}}
        )

        return jsonify({"message": "Job updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/add_job", methods=["POST"])
def add_job_entry(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        if not data or "newJob" not in data:
            return jsonify({"error": "Missing 'newJob' in request"}), 400

        new_job = data["newJob"]

        # Basic validation
        required_fields = ["title", "company", "location", "start_date", "end_date", "role_summary", "responsibilities", "accomplishments"]
        for field in required_fields:
            if field not in new_job:
                return jsonify({"error": f"Missing field: {field}"}), 400

        if not isinstance(new_job["responsibilities"], list) or not isinstance(new_job["accomplishments"], list):
            return jsonify({"error": "Responsibilities and accomplishments must be lists"}), 400

        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$push": {"parse_result.jobs": new_job}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({"message": "Job added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/set_jobs", methods=["POST"])
def set_all_jobs(resume_id):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        data = request.get_json()
        jobs = data.get("jobs")
        if not isinstance(jobs, list):
            return jsonify({"error": "Jobs must be a list"}), 400
        
        required_fields = [
            "title", "company", "location", "start_date", "end_date",
            "role_summary", "responsibilities", "accomplishments"
        ]

        for idx, job in enumerate(jobs):
            for field in required_fields:
                if field not in job:
                    return jsonify({"error": f"Job {idx+1} missing field: {field}"}), 400
            if not isinstance(job["responsibilities"], list) or not isinstance(job["accomplishments"], list):
                return jsonify({"error": f"Job {idx+1}: Responsibilities and accomplishments must be lists"}), 400
            if not isinstance(job["title"], str) or not job["title"].strip():
                return jsonify({"error": f"Job {idx+1} has invalid or empty title"}), 400
            if not isinstance(job["company"], str) or not job["company"].strip():
                return jsonify({"error": f"Job {idx+1} has invalid or empty company"}), 400

        result = biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.jobs": jobs}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Resume not found"}), 404
        
        return jsonify({"message": "Job order updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/resume/<resume_id>/delete_job/<int:index>", methods=["DELETE"])
def delete_job_entry(resume_id, index):
    try:
        if not ObjectId.is_valid(resume_id):
            return jsonify({"error": "Invalid resume ID"}), 400
        
        doc = biography_collection.find_one({"_id": ObjectId(resume_id)})
        if not doc:
            return jsonify({"error": "Resume not found"}), 404
        
        jobs = doc.get("parse_result", {}).get("jobs", [])
        if index < 0 or index >= len(jobs):
            return jsonify({"error": "Invalid job index"}), 400
        
        jobs.pop(index)
        biography_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"parse_result.jobs": jobs}}
        )
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@resume_bp.route("/resume/<resume_id>/add_education", methods=["POST"])
def add_education(resume_id):
    if not ObjectId.is_valid(resume_id):
        return jsonify({"error": "Invalid resume ID"}), 400
    data = request.get_json() or {}
    newEdu = data.get("newEdu")
    if not isinstance(newEdu, dict):
        return jsonify({"error": "Missing newEdu payload"}), 400

    doc = biography_collection.find_one({"_id": ObjectId(resume_id)})
    if not doc:
        return jsonify({"error": "Resume not found"}), 404

    educations = doc.get("parse_result", {}).get("educations", [])
    educations.append(newEdu)

    biography_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {"parse_result.educations": educations}}
    )
    return jsonify({"success": True}), 200



@resume_bp.route("/resume/<resume_id>/update_education/<int:index>", methods=["POST"])
def update_education(resume_id, index):
    if not ObjectId.is_valid(resume_id):
        return jsonify({"error": "Invalid resume ID"}), 400
    data = request.get_json() or {}
    updatedEdu = data.get("updatedEdu")
    if not isinstance(updatedEdu, dict):
        return jsonify({"error": "Missing updatedEdu payload"}), 400

    doc = biography_collection.find_one({"_id": ObjectId(resume_id)})
    if not doc:
        return jsonify({"error": "Resume not found"}), 404

    educations = doc.get("parse_result", {}).get("educations", [])
    if index < 0 or index >= len(educations):
        return jsonify({"error": "Invalid education index"}), 400

    educations[index] = updatedEdu

    biography_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {"parse_result.educations": educations}}
    )
    return jsonify({"success": True}), 200



@resume_bp.route("/resume/<resume_id>/delete_education/<int:index>", methods=["DELETE"])
def delete_education(resume_id, index):
    if not ObjectId.is_valid(resume_id):
        return jsonify({"error": "Invalid resume ID"}), 400

    doc = biography_collection.find_one({"_id": ObjectId(resume_id)})
    if not doc:
        return jsonify({"error": "Resume not found"}), 404

    educations = doc.get("parse_result", {}).get("educations", [])
    if index < 0 or index >= len(educations):
        return jsonify({"error": "Invalid education index"}), 400

    educations.pop(index)

    biography_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {"parse_result.educations": educations}}
    )
    return jsonify({"success": True}), 200



@resume_bp.route("/resume/<resume_id>/set_educations", methods=["POST"])
def set_educations(resume_id):
    if not ObjectId.is_valid(resume_id):
        return jsonify({"error": "Invalid resume ID"}), 400
    data = request.get_json() or {}
    newList = data.get("educations")
    if not isinstance(newList, list):
        return jsonify({"error": "Missing or invalid educations payload"}), 400

    biography_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {"parse_result.educations": newList}}
    )
    return jsonify({"success": True}), 200

@resume_bp.route("/resume/<resume_id>", methods=["GET"])
def get_resume(resume_id):
    # …
    doc = biography_collection.find_one({"_id": ObjectId(resume_id)})
    # …
    result = {
        # other fields…
        "education": doc.get("parse_result", {}).get("educations", []),
    }
    return jsonify(result), 200
