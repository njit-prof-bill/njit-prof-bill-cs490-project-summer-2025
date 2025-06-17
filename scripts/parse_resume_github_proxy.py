import os
import sys
from openai import OpenAI

# Check CLI arguments
if len(sys.argv) != 3:
  print("Usage: python3 parse_resume_github_proxy.py <input_txt_file> <output_json_file>")
  sys.exit(1)

input_txt = sys.argv[1]
output_json = sys.argv[2]

# Load token
token = os.environ["GITHUB_TOKEN"]
if not token:
  raise EnvironmentError("GITHUB_TOKEN not set")

# Set up OpenAI client via GitHub endpoint
client = OpenAI(
  base_url="https://models.github.ai/inference",
  api_key=token,
)

# Read resume text
with open(input_txt, "r", encoding="utf-8") as f:
  resume_text = f.read()

# Build the parsing prompt
prompt = f"""
Extract the following structured information from this resume and return it as a valid JSON object with keys:
- contact: fullName, email, phone, linkedin
- objectives
- skills: list of skills
- jobs: list of job records with title, company, years, details
- education: list with degree, institution, years

### Resume:
{resume_text}

### Output format:
{{
  "contact": {{
    "fullName": "Full Name",
    "email": "email@example.com",
    "phone": "123-456-7890",
    "linkedin": "linkedin.com/in/example"
  }},
  "objectives": "Your career objective here.",
  "skills": ["Skill1", "Skill2"],
  "jobs": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "years": "Start - End",
      "details": ["Responsibility 1", "Responsibility 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "University Name",
      "years": "Start - End"
    }}
  ]
}}

Respond only with valid JSON.
"""

# Make OpenAI request
try:
  response = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "You are an expert resume parser."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.2,
    max_tokens=1500,
    model="openai/gpt-4o-mini"
  )

  structured_output = response.choices[0].message.content.strip()

  # Save the result to output file
  os.makedirs(os.path.dirname(output_json), exist_ok=True)
  with open(output_json, "w", encoding="utf-8") as out_f:
    out_f.write(structured_output)

  print(f"✅ Parsed JSON saved to {output_json}")

except Exception as e:
  print("❌ Parsing failed:", e)
  sys.exit(1)
