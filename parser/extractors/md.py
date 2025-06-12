# File: resume_parser/extractors/md.py

from typing import Union
from pathlib import Path
from parser.extractors.txt import extract as extract_txt

def extract(data: bytes) -> str:
    return extract_txt(data)