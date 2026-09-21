# HealthSight AI

HealthSight AI is a full-stack multimodal healthcare AI assistant that analyzes prescriptions, medical documents, symptoms, audio, images, and chest X-rays using OCR, NLP, computer vision, and speech AI. The system combines a React frontend with a FastAPI backend and integrates pretrained medical and general-purpose AI models for document understanding, symptom classification, image diagnosis, speech-to-text, cough analysis, visual question answering, object detection, and X-ray pathology prediction.

> Disclaimer: HealthSight AI is a prototype for educational and decision-support use. It is not a substitute for professional medical diagnosis, treatment, or clinical judgment.


## Key Features

- Medical document OCR using Tesseract.
- Prescription and report analysis from uploaded images.
- Medical question answering from extracted document text.
- Rule-based extraction of diagnosis, advice, and medicines.
- Summarization of long medical answers.
- Zero-shot symptom classification for possible condition ranking.
- Speech-to-text transcription from recorded symptoms.
- Cough audio classification.
- Skin image classification using local image models.
- Chest X-ray analysis using TorchXRayVision.
- Visual question answering for uploaded images.
- Object detection with bounding box visualization.
- React-based user interface with FastAPI-powered backend APIs.

## Tech Stack

### Frontend

- React
- Axios
- JavaScript
- HTML/CSS
- Browser MediaRecorder API

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- Hugging Face Transformers
- PyTorch
- TorchXRayVision
- Pillow/PIL
- Tesseract OCR
- NumPy
- Requests
- Gradio Client

### AI/ML Models And Tools

- `ktrapeznikov/biobert_v1.1_pubmed_squad_v2` for medical document question answering.
- `google/pegasus-xsum` for local summarization.
- `facebook/bart-large-cnn` for hosted summarization.
- `facebook/bart-large-mnli` for zero-shot symptom classification.
- `openai/whisper-base` for speech-to-text.
- `MIT-AI-Lab/ai4covid-cough-classifier` for cough classification.
- `facebook/detr-resnet-50` for object detection.
- `Anwarkh1/Skin_Cancer-Image_Classification` for local skin image classification.
- TorchXRayVision `densenet121-res224-chex` for chest X-ray pathology prediction.
- `nandhaarul/vqa-blip` Gradio Space for visual question answering.

## System Architecture

```text
User
  -> React Frontend
  -> Axios / FormData Requests
  -> FastAPI Backend
  -> OCR / NLP / CV / Audio Model Pipelines
  -> JSON Response
  -> Real-Time Results Display
```

## Main Workflow

1. The user uploads a prescription, medical report, image, X-ray, or audio recording.
2. The React frontend sends the input to the FastAPI backend.
3. The backend preprocesses the input using PIL, Tesseract OCR, or audio file handling.
4. The appropriate AI model is selected based on the task.
5. The backend returns model predictions, extracted text, summaries, or structured fields as JSON.
6. The frontend displays results such as diagnosis hints, medicines, summaries, transcripts, detections, or X-ray predictions.

## Example Use Cases

### Prescription Analysis

Input:

```text
Uploaded prescription image
Question: What medicines are prescribed?
```

Output:

```text
Extracted Text: OCR text from prescription
Medicines Extracted: Cetirizine, Cherry Cough Syrup
DocQA Answer: Medicine names found in the document
```

### Symptom Classification

Input:

```text
I have cold, cough, sneezing, and mild fever.
```

Output:

```text
Possible Conditions:
Common cold
Flu
Allergy
COVID-19
Sinusitis
```

### X-Ray Analysis

Input:

```text
Uploaded chest X-ray image
```

Output:

```text
Top predicted pathologies with probability scores.
```

## Backend API Endpoints

| Endpoint | Purpose |
|---|---|
| `/pipeline/` | Main OCR, QA, summarization, extraction, and VQA workflow |
| `/ocr/` | Extract text from uploaded image |
| `/docqa/` | Answer questions from text context |
| `/summarize/` | Summarize text |
| `/zero-shot-classify/` | Rank possible conditions from symptom text |
| `/classify-image/` | Hosted image classification |
| `/classify-image-local/` | Local image classification |
| `/classify-xray/` | Chest X-ray pathology prediction |
| `/transcribe-audio/` | Speech-to-text transcription |
| `/classify-cough/` | Cough audio classification |
| `/detect-objects/` | Object detection |
| `/vqa/` | Visual question answering |

## Setup Instructions

### 1. Clone The Repository

```bash
git clone https://github.com/Nandhaarul/Healthsight-AI.git
cd Healthsight-AI
```

### 2. Backend Setup

Create and activate a Python virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install the required Python dependencies based on the imports used by the backend:

```bash
pip install fastapi uvicorn python-multipart requests pillow pytesseract transformers torch torchvision torchaudio torchxrayvision gradio_client numpy pydantic
```

Set your Hugging Face API key:

```bash
set HF_API_KEY=your_hugging_face_token_here
```

For PowerShell:

```powershell
$env:HF_API_KEY="your_hugging_face_token_here"
```

Run the backend:

```bash
uvicorn backend.app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

```bash
cd healthsight-frontend
npm install
npm start
```

Frontend will run at:

```text
http://localhost:3000
```

## Environment Variables

Create a local `.env` file or set the variable directly in your terminal:

```text
HF_API_KEY=your_hugging_face_token_here
```

Do not commit real API keys. The repository includes `.env.example` as a safe template.

## Security Notes

- API keys should be stored in environment variables, not source code.
- `.env`, virtual environments, Python cache files, and `node_modules` should not be committed.
- This project is a prototype and does not implement production-grade healthcare compliance controls such as authentication, audit logging, encryption policy, consent management, or HIPAA-compliant infrastructure.

## Limitations

- The project uses pretrained and externally fine-tuned models; it does not train models from scratch.
- No formal clinical accuracy evaluation is included.
- OCR quality depends on image clarity.
- Model outputs should be treated as AI-generated suggestions, not final medical decisions.
- A production version would require validation with medical datasets, expert review, authentication, logging, monitoring, and secure deployment.

## Future Improvements

- Add secure user authentication and role-based access.
- Add Docker support for easier deployment.
- Add a backend `requirements.txt`.
- Add database storage for reports and user sessions.
- Improve OCR preprocessing for scanned documents.
- Add confidence thresholds and explainability for model outputs.
- Add formal evaluation using task-specific metrics such as F1, ROUGE, WER, AUC, sensitivity, specificity, and mAP.
- Separate symptom input from document question input for better UX.

## Project Type

Full-stack AI / Machine Learning / Healthcare AI / Multimodal AI / FastAPI / React / Hugging Face Transformers
