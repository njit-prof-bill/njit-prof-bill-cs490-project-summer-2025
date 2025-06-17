import sys
import os
import json
import re
import pdfplumber
import docx

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    elif ext == ".docx":
        doc = docx.Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    else:
        raise ValueError("Unsupported file type")

def parse_resume(text):
    structure = {
        "contact": {},
        "objectives": "",
        "skills": [],
        "jobs": [],
        "education": []
    }

    email_match = re.search(r"[\w.-]+@[\w.-]+\.\w+", text)
    phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    if email_match:
        structure["contact"]["email"] = email_match.group(0)
    if phone_match:
        structure["contact"]["phone"] = phone_match.group(0)

    lines = text.splitlines()
    for i, line in enumerate(lines):
        lower = line.lower()
        if "objective" in lower:
            structure["objectives"] = lines[i + 1] if i + 1 < len(lines) else ""
        elif "skills" in lower:
            structure["skills"] = re.split(r",|\s{2,}", lines[i + 1])
        elif "education" in lower:
            structure["education"].append({"raw": " ".join(lines[i+1:i+4])})
        elif "experience" in lower or "employment" in lower:
            structure["jobs"].append({"raw": " ".join(lines[i+1:i+4])})
    return structure

if __name__ == "__main__":
    filepath = sys.argv[1]
    text = extract_text(filepath)
    data = parse_resume(text)

    json_path = os.path.join("public", "parsed", os.path.basename(filepath) + ".json")
    os.makedirs(os.path.dirname(json_path), exist_ok=True)

    with open(json_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Parsed and saved to {json_path}")
