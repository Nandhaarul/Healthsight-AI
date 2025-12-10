from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import pipeline
from PIL import Image
import io

router = APIRouter()

# Load the object detection pipeline once
detector = pipeline("object-detection", model="facebook/detr-resnet-50")

@router.post("/detect-objects/")
async def detect_objects(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = detector(pil_image)
        # Each result: {'score': float, 'label': str, 'box': {'xmin': int, 'ymin': int, 'xmax': int, 'ymax': int}}
        return {"detections": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))