import docx2txt
from pathlib import Path


def extract(path: Path) -> str:
    """Extract text from a DOCX file path."""
    return docx2txt.process(str(path))