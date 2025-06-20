from pathlib import Path
from typing import Union
from parser.extractors import pdf, txt, md, docx, odt

class UnsupportedFileTypeError(Exception):
    """Raised when an unsupported file extension is encountered."""
    pass


def extract_text(src: Union[str, Path, bytes]) -> str:
    """
    Dispatch to the appropriate extractor based on file extension.
    """

    # raw bytes → try PDF
    if isinstance(src, (bytes, bytearray)):
        return pdf.extract(src)

    path = Path(src)
    data = path.read_bytes()
    ext = path.suffix.lower().lstrip('.')
    mapping = {
        'pdf': pdf.extract,
        'txt': txt.extract,
        'md': md.extract,
        'docx': docx.extract,
        'odt': odt.extract,
    }
    if ext not in mapping:
        raise UnsupportedFileTypeError(f"Unsupported file extension: .{ext}")
    return mapping[ext](data if ext in ('pdf', 'txt', 'md') else path)