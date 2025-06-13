def extract(data: bytes) -> str:
    """Extract plain text from binary data."""
    return data.decode(errors='ignore')