import easyocr

reader = easyocr.Reader(['en'], gpu=False)

def extract_text(image_path: str) -> str:
    """
    Extract text from an image using EasyOCR.

    Args:
        image_path (str): Path to the image file.

    Returns:
        str: Extracted text from the image.
    """
    result = reader.readtext(image_path, detail=0)
    return ' '.join(result)