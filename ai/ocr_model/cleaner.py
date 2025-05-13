import re

def clean_text(text: str) -> str:
    text = text.upper()
    clean_text = text.replace('\n', ' ').replace('\r', '')
    clean_text = re.sub(r'\s+', ' ', clean_text)
    return clean_text.strip()