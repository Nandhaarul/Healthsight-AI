"""from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import io

router = APIRouter()

# Load model and processor once at startup
#comment out the first 2 the 3rd one is the main one
model_name = "akhaliq/dermnet_vit_base_patch16_224"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)

model_name = "Jayanth2002/dinov2-base-finetuned-SkinDisease"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)

model_name = "google/vit-base-patch16-224"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)

@router.post("/classify-image-local/")
async def classify_image_local(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            predicted_class_idx = logits.argmax(-1).item()
            label = model.config.id2label[predicted_class_idx]
            score = torch.softmax(logits, dim=1)[0, predicted_class_idx].item()
        return {
            "diagnosis": label,
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""


"""from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import io

router = APIRouter()

model = None
processor = None

def get_model():
    global model, processor
    if model is None or processor is None:
        model_name = "google/vit-base-patch16-224"
        processor = ViTImageProcessor.from_pretrained(model_name)
        model = ViTForImageClassification.from_pretrained(model_name)
    return processor, model

@router.post("/classify-image-local/")
async def classify_image_local(image: UploadFile = File(...)):
    try:
        processor, model = get_model()
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            predicted_class_idx = logits.argmax(-1).item()
            label = model.config.id2label[predicted_class_idx]
            score = torch.softmax(logits, dim=1)[0, predicted_class_idx].item()
        return {
            "diagnosis": label,
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import io

router = APIRouter()

model = None
processor = None

def get_model():
    global model, processor
    if model is None or processor is None:
        model_name = "Anwarkh1/Skin_Cancer-Image_Classification"
        processor = AutoImageProcessor.from_pretrained(model_name)
        model = AutoModelForImageClassification.from_pretrained(model_name)
    return processor, model

@router.post("/classify-image-local/")
async def classify_image_local(image: UploadFile = File(...)):
    try:
        processor, model = get_model()
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            predicted_class_idx = logits.argmax(-1).item()
            label = model.config.id2label[predicted_class_idx]
            score = torch.softmax(logits, dim=1)[0, predicted_class_idx].item()
        return {
            "diagnosis": label,
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))