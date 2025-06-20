from io import BytesIO
import pdfplumber
import pdfminer.high_level as pdfminer


def extract(data: bytes) -> str:
    """Extract text from PDF bytes, trying pdfminer first then pdfplumber."""
    try:
        text = pdfminer.extract_text(BytesIO(data))
        if text and text.strip():
            return text
    except Exception:
        pass
    with pdfplumber.open(BytesIO(data)) as pdf:
        pages = [p.extract_text() or "" for p in pdf.pages]
    return "\n".join(pages)