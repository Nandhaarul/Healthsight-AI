from fastapi import APIRouter, File, UploadFile
from backend.app.utils.ocr_utils import extract_text_from_image

router = APIRouter()

@router.post("/ocr/")
async def ocr_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    text = extract_text_from_image(image_bytes)
    return {"extracted_text": text}