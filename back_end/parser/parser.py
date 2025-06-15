import json
from openai import OpenAI
from parser.config import OPENAI_API_KEY

class ResumeParser:
    """
    Wrap OpenAI chat API to parse resume text into structured JSON.
    """
    def __init__(self, api_key: str = None):
        key = api_key or OPENAI_API_KEY
        if not key:
            raise ValueError("OpenAI API key must be set in OPENAI_API_KEY")
        self.client = OpenAI(api_key=key)

    def parse(self, text: str) -> dict:
        resp = self.client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Return JSON with the following keys:\n\n"
                        "- name: string\n"
                        "- contact: object with:\n"
                        "- emails: a list of strings. The first email in the list should be the primary email.\n"
                        "- phones: a list of strings. The first phone number in the list should be the primary phone number\n"
                        "- career_objective: string (if present)\n"
                        "- skills: an object where keys are skill categories and values are lists of strings\n"
                        "- education: object with degree, institution, graduation_date, GPA\n"
                        "- jobs: list of job objects. Each job has title, company, location (optional), duration (optional), and responsibilities (list of strings)\n\n"
                        "Output only valid JSON. Do not include any explanations or comments."
                    )
                },
                {"role": "user", "content": text},
            ],
            temperature=0.0,
        )
        return json.loads(resp.choices[0].message.content)

#{"role": "system", "content": "Return JSON with keys: name, contact, skills, education, jobs."},