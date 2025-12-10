from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import pipeline

router = APIRouter()

clf_pipe = None

def get_clf_pipe():
    global clf_pipe
    if clf_pipe is None:
        clf_pipe = pipeline("audio-classification", model="MIT-AI-Lab/ai4covid-cough-classifier")
    return clf_pipe

@router.post("/classify-cough/")
async def classify_cough(audio: UploadFile = File(...)):
    try:
        clf = get_clf_pipe()
        audio_bytes = await audio.read()
        with open("temp.wav", "wb") as f:
            f.write(audio_bytes)
        result = clf("temp.wav")
        return {"label": result[0]['label'], "score": result[0]['score']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))