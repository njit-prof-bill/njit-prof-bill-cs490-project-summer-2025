from odf.opendocument import load
from odf import text as odf_text
from odf import teletype


def extract(path):
    """Extract text from an ODT file path."""
    doc = load(str(path))
    paras = [teletype.extractText(n) for n in doc.getElementsByType(odf_text.P)]
    return "\n".join(paras)