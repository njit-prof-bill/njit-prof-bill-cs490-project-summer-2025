import sys
import json
from dotenv import load_dotenv
from parser.extractors import extract_text
from parser.parser import ResumeParser

def main():
    if len(sys.argv) < 2:
        sys.exit("usage: parse_resume.py <file> [notes]")
    file_path = sys.argv[1]
    notes = sys.argv[2] if len(sys.argv) > 2 else ""

    load_dotenv(dotenv_path=".env.local")

    corpus = extract_text(file_path) + ("\n\n" + notes if notes else "")
    
    parser = ResumeParser()
    result = parser.parse(corpus)
    print(json.dumps(result, indent=2))



if __name__ == "__main__":
    main()

