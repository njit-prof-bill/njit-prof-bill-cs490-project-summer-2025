#!/usr/bin/env python3
"""
usage: parse_resume.py <file> [notes]
supports: .pdf .txt .md .docx .odt
"""

import sys, os, json
from io import BytesIO
from pathlib import Path

import pdfplumber
import pdfminer.high_level as pdfminer
import docx2txt
from odf import text as odf_text
from odf import teletype
from odf.opendocument import load
from dotenv import load_dotenv
from openai import OpenAI


def _pdf(data: bytes) -> str:
    try:
        t = pdfminer.extract_text(BytesIO(data))
        if t and t.strip():
            return t
    except Exception:
        pass
    with pdfplumber.open(BytesIO(data)) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)


def _txt(data: bytes) -> str:
    return data.decode(errors="ignore")


_extract_md = _txt


def _docx(path: Path) -> str:
    return docx2txt.process(path)


def _odt(path: Path) -> str:
    d = load(str(path))
    return "\n".join(teletype.extractText(n) for n in d.getElementsByType(odf_text.P))


_DISPATCH = {
    ".pdf":  lambda p, b: _pdf(b),
    ".txt":  lambda p, b: _txt(b),
    ".md":   lambda p, b: _extract_md(b),
    ".docx": lambda p, b: _docx(p),
    ".odt":  lambda p, b: _odt(p),
}


def extract_text(src) -> str:
    if isinstance(src, (bytes, bytearray)):
        return _pdf(src)
    p = Path(src)
    with p.open("rb") as f:
        b = f.read()
    if p.suffix.lower() not in _DISPATCH:
        raise ValueError(f"unsupported type {p.suffix}")
    return _DISPATCH[p.suffix.lower()](p, b)


def ask_model(text: str, client: OpenAI) -> dict:
    r = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system",
             "content": "Return JSON with keys: name, contact, skills, education, jobs."},
            {"role": "user", "content": text},
        ],
        temperature=0.0,
    )
    return json.loads(r.choices[0].message.content)


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: parse_resume.py <file> [notes]")
    file_path = sys.argv[1]
    notes = sys.argv[2] if len(sys.argv) > 2 else ""

    load_dotenv(dotenv_path=".env.local")
    client = OpenAI(api_key=os.getenv("openAPIKey") or sys.exit("set openAPIKey in .env"))

    corpus = extract_text(file_path) + ("\n\n" + notes if notes else "")
    print(json.dumps(ask_model(corpus, client), indent=2))


if __name__ == "__main__":
    main()
