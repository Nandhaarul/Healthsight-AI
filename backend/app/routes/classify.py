from fastapi import APIRouter, UploadFile, File, HTTPException
import requests  # <---- ADD THIS
from backend.app.utils.hf_inference import classify_image

router = APIRouter()

@router.post("/classify-image/")
async def classify_image_endpoint(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = classify_image(image_bytes)
        return result
    except requests.HTTPError as http_err:
        raise HTTPException(status_code=500, detail=f"Hugging Face API error: {http_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
