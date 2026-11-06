# backend/app/routes/ocr.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import pytesseract
import io
import os
tesseract_path = os.getenv("TESSERACT_CMD")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
router = APIRouter()

@router.post("/ocr/")
async def extract_text_from_image(file: UploadFile = File(...)):
    try:
        # Read uploaded file into memory
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Perform OCR using Tesseract
        extracted_text = pytesseract.image_to_string(image)

        return {"text": extracted_text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
print("Tesseract CMD path set to:", pytesseract.pytesseract.tesseract_cmd)
