from ocr_reader import extract_text
from brand_classifier import predict_brand
from cleaner import clean_text

def test_ocr_pipeline(image_path: str, expected_brand: str) -> None:
    """
    Test the OCR pipeline by extracting text from an image and predicting the brand.

    Args:
        image_path (str): Path to the image file.
        expected_brand (str): Expected brand name for validation.

    Returns:
        None
    """
    # Extract text from the image
    extracted_text = extract_text(image_path)
    
    # Clean the extracted text
    cleaned_text = clean_text(extracted_text)
    
    # Predict the brand
    predicted_brand = predict_brand(cleaned_text)
    
    # Validate the prediction
    assert predicted_brand == expected_brand, f"Expected {expected_brand}, but got {predicted_brand}"
    
    print(f"Test passed! Extracted text: {cleaned_text}, Predicted brand: {predicted_brand}")

test_ocr_pipeline("/src/image.jpg")