"""from fastapi import APIRouter, Body, HTTPException
from backend.app.utils.hf_inference import summarize_text

router = APIRouter()

@router.post("/summarize/")
async def summarize_endpoint(text: str = Body(...)):
    try:
        result = summarize_text(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.utils.hf_inference import summarize_text

router = APIRouter()

class SummarizeRequest(BaseModel):
    text: str

@router.post("/summarize/")
async def summarize_endpoint(request: SummarizeRequest):
    try:
        result = summarize_text(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))