from fastapi import FastAPI
#from routes import pipeline
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.ocr import router as ocr_router
from backend.app.routes.summarize import router as summarize_router
from backend.app.routes.docq import router as docqa_router
from backend.app.routes.med_pipeline import router as pipeline_router
from backend.app.routes.vqa import router as vqa_router
from backend.app.routes.classify import router as classify_router
from backend.app.routes.local_skin_classifier import router as local_skin_router
from backend.app.routes.audio_asr import router as audio_asr_router
from backend.app.routes.audio_classify import router as audio_classify_router
from backend.app.routes.object_detect import router as object_detect_router
from backend.app.routes.xray import router as xray_router
from backend.app.routes import zero_shot


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register each router once
app.include_router(docqa_router)
app.include_router(ocr_router)
app.include_router(classify_router)
app.include_router(summarize_router)
app.include_router(pipeline_router)
app.include_router(vqa_router)
app.include_router(local_skin_router)
app.include_router(audio_asr_router)
app.include_router(audio_classify_router)
app.include_router(object_detect_router)
app.include_router(xray_router)
app.include_router(zero_shot.router) 

