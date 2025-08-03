from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
import pytesseract
import io
import requests

DOCQA_API_URL = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
SUMMARIZATION_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
HUGGINGFACE_API_KEY = "***REMOVED***"

router = APIRouter()

@router.post("/pipeline/")
async def pipeline_endpoint(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        extracted_text = pytesseract.image_to_string(image)

        headers = {
            "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        docqa_payload = {
            "inputs": {
                "question": question,
                "context": extracted_text
            }
        }
        docqa_response = requests.post(DOCQA_API_URL, headers=headers, json=docqa_payload, timeout=30)
        docqa_response.raise_for_status()
        docqa_answer = docqa_response.json().get("answer", "")

        summarize_payload = {"inputs": docqa_answer}
        summarize_response = requests.post(SUMMARIZATION_API_URL, headers=headers, json=summarize_payload, timeout=30)
        summarize_response.raise_for_status()
        summary = summarize_response.json()[0].get("summary_text", "")
        print("Extracted Text:", extracted_text.strip())
        print("DocQA Answer:", docqa_answer)
        print("Summary:", summary)
        return {
            "extracted_text": extracted_text.strip(),
            "docqa_answer": docqa_answer,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))