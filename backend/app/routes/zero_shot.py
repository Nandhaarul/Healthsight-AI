"""from fastapi import APIRouter, Body
from transformers import pipeline

router = APIRouter()
zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

@router.post("/zero-shot-classify/")
async def zero_shot_classify(
    text: str = Body(...), 
    labels: list[str] = Body(...)
):
    result = zero_shot(text, labels)
    return {"labels": result["labels"], "scores": result["scores"]}"""

from fastapi import APIRouter, Body
from transformers import pipeline

router = APIRouter()
zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

DEFAULT_LABELS = [
    "Common cold", "Flu", "COVID-19", "Sinusitis", "Allergy", "Asthma", "Bronchitis",
    "Pneumonia", "Tuberculosis", "Migraine", "Tension headache", "Cluster headache",
    "Meningitis", "Dehydration", "Stress", "Ear infection", "Dental problem",
    "Psoriasis", "Dermatitis", "Cardiomegaly"
]

@router.post("/zero-shot-classify/")
async def zero_shot_classify(
    text: str = Body(...),
    labels: list[str] = Body(DEFAULT_LABELS)
):
    use_labels = labels if labels else DEFAULT_LABELS
    result = zero_shot(text, use_labels)
    return {"labels": result["labels"], "scores": result["scores"]}