import sys
import os
import pdfplumber
import docx

if len(sys.argv) != 3:
    print("Usage: extract_text.py <input_path> <output_txt_path>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

ext = os.path.splitext(input_path)[1].lower()
text = ""

try:
    if ext == ".pdf":
        with pdfplumber.open(input_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    elif ext == ".docx":
        doc = docx.Document(input_path)
        text = "\n".join(p.text for p in doc.paragraphs)
    else:
        raise ValueError("Unsupported file format")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text.strip())
except Exception as e:
    print(f"Error extracting text: {e}")
    sys.exit(1)

print(f"Text extracted to {output_path}")
