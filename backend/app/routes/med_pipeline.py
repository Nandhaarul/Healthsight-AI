from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
from typing import Optional
from .vqa import vqa_endpoint  
import pytesseract
import io
import traceback
import re
from transformers import pipeline

# Load BioBERT fine-tuned on SQuAD2 (or another medical QA model)
qa_pipeline = pipeline(
    "question-answering",
    model="ktrapeznikov/biobert_v1.1_pubmed_squad_v2",
    tokenizer="ktrapeznikov/biobert_v1.1_pubmed_squad_v2"
)

# (Optional) Load local summarizer (Pegasus)
summarizer = pipeline("summarization", model="google/pegasus-xsum")

router = APIRouter()

def extract_fields(ocr_text):
    diagnosis = None
    advice = None
    medicines = []

    lines = ocr_text.splitlines()

    # --- Diagnosis extraction: look for a line that is exactly "Diagnosis:" ---
    for idx, line in enumerate(lines):
        if line.strip().lower() == "diagnosis:":
            # Take the next non-empty line
            for next_line in lines[idx+1:]:
                next_line = next_line.strip()
                if next_line:
                    diagnosis = next_line
                    break
            break

    # --- Advice extraction: look for "Advice" and get next non-empty line if needed ---
    for idx, line in enumerate(lines):
        if "advice" in line.lower():
            adv = line.split(":", 1)[-1].strip()
            if adv and adv.lower() != "advice":
                advice = adv
            else:
                for next_line in lines[idx+1:]:
                    next_line = next_line.strip()
                    if next_line and not next_line.lower().startswith("follow"):
                        advice = next_line
                        break
            break

    # --- Medicine extraction: lines starting with number and parenthesis ---
    for line in lines:
        med_match = re.match(r"\d+\)\s*(.+)", line)
        if med_match:
            medicines.append(med_match.group(1).strip())

    return {
        "diagnosis_extracted": diagnosis,
        "advice_extracted": advice,
        "medicine_extracted": medicines
    }

def extract_relevant_context(ocr_text, question):
    """
    Extracts a relevant section of the OCR text based on the question.
    For example, if the question is about diagnosis, return the lines after 'Diagnosis:'.
    """
    lines = ocr_text.splitlines()
    question_lower = question.lower()
    context = ocr_text  # fallback: full text

    if "diagnosis" in question_lower:
        for idx, line in enumerate(lines):
            if line.strip().lower() == "diagnosis:":
                # Return the next 3 lines after 'Diagnosis:'
                context = "\n".join(lines[idx:idx+4])
                break
    elif "medicine" in question_lower or "medication" in question_lower:
        for idx, line in enumerate(lines):
            if "medicine" in line.lower():
                context = "\n".join(lines[idx:idx+6])
                break
    elif "advice" in question_lower:
        for idx, line in enumerate(lines):
            if "advice" in line.lower():
                context = "\n".join(lines[idx:idx+4])
                break
    # Add more rules as needed

    return context

@router.post("/pipeline/")
async def pipeline(
    question: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    try:
        if file is None:
            print("No file uploaded. Skipping OCR, DocQA, summarization, and VQA.")
            return {
                "extracted_text": "",
                "docqa_answer": "",
                "summary": "No file uploaded. Please upload a document or image for analysis.",
                "vqa_answer": "",
                "is_document": False,
                "diagnosis_extracted": None,
                "advice_extracted": None,
                "medicine_extracted": []
            }

        print("Reading file...")
        image_bytes = await file.read()
        print("Opening image...")
        image = Image.open(io.BytesIO(image_bytes))
        print("Running OCR...")
        extracted_text = pytesseract.image_to_string(image)
        print(f"OCR done. Extracted text length: {len(extracted_text)}")

        # --- Rule-based extraction ---
        extracted_fields = extract_fields(extracted_text)

        # --- VQA: Only run for non-document images ---
        vqa_answer = ""
        doc_file_types = ["prescription", "report", "doc", "pdf"]
        is_document = False
        if file.filename and any(word in file.filename.lower() for word in doc_file_types):
            is_document = True
            print("Skipping VQA for document-type file.")
        else:
            file.file.seek(0)
            vqa_result = await vqa_endpoint(image=file, question=question)
            vqa_answer = vqa_result.get("answer", "")

        # If no text is found, return early with a message and VQA answer
        if not extracted_text.strip():
            print("No text extracted from image. Skipping DocQA and summarization.")
            return {
                "extracted_text": "",
                "docqa_answer": "",
                "summary": "No text found in the image.",
                "vqa_answer": vqa_answer,
                "is_document": is_document,
                **extracted_fields
            }

        # --- Local Medical DocQA (BioBERT) with improved context ---
        relevant_context = extract_relevant_context(extracted_text, question)
        print("Calling local BioBERT QA...")
        docqa_result = qa_pipeline(question=question, context=relevant_context)
        docqa_answer = docqa_result["answer"]
        print("DocQA answer:", docqa_answer)

        # Clean up: remove lines that are just a single character (like 'a')
        docqa_answer = "\n".join(
            line for line in docqa_answer.splitlines() if len(line.strip()) > 1
        )
        if not docqa_answer:
            print("No answer from DocQA. Skipping summarization.")
            return {
                "extracted_text": extracted_text.strip(),
                "docqa_answer": "",
                "summary": "No answer found for the question.",
                "vqa_answer": vqa_answer,
                "is_document": is_document,
                **extracted_fields
            }

        # --- Only summarize if the answer is long enough ---
        if len(docqa_answer.split()) < 5:
            summary = docqa_answer
        else:
            print("Calling local summarizer...")
            summary = summarizer(docqa_answer, max_length=60, min_length=10, do_sample=False)[0]['summary_text']

        print("Extracted Text:", extracted_text.strip())
        print("DocQA Answer:", docqa_answer)
        print("Summary:", summary)
        print("VQA Answer:", vqa_answer)
        return {
            "extracted_text": extracted_text.strip(),
            "docqa_answer": docqa_answer,
            "summary": summary,
            "vqa_answer": vqa_answer,
            "is_document": is_document,
            **extracted_fields
        }
    except Exception as e:
        print("Pipeline error:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    