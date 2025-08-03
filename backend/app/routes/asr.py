from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.utils.hf_inference import transcribe_audio

router = APIRouter()

@router.post("/transcribe-audio/")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        result = transcribe_audio(audio_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))