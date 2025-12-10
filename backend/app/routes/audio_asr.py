from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import pipeline

router = APIRouter()

asr_pipe = None

def get_asr_pipe():
    global asr_pipe
    if asr_pipe is None:
        asr_pipe = pipeline("automatic-speech-recognition", model="openai/whisper-base")
    return asr_pipe

@router.post("/transcribe-audio/")
async def transcribe_audio(audio: UploadFile = File(...)):
    print("audio file received:", audio.filename)
    try:
        asr = get_asr_pipe()
        audio_bytes = await audio.read()
        with open("temp.wav", "wb") as f:
            f.write(audio_bytes)
        result = asr("temp.wav")
        return {"transcript": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))