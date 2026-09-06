from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests

DOCQA_API_URL = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
HUGGINGFACE_API_KEY = os.getenv("HF_API_KEY")

router = APIRouter()

class DocQARequest(BaseModel):
    context: str
    question: str

@router.post("/docqa/")
async def docqa_endpoint(request: DocQARequest):
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(status_code=500, detail="HF_API_KEY environment variable is not set.")
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": {
            "question": request.question,
            "context": request.context
        }
    }
    try:
        response = requests.post(DOCQA_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
