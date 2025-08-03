from fastapi import FastAPI
# from app.routes import ocr, classify  # import classify route
# from app.routes.asr import router as asr_router
# from app.routes.summarize import router as summarize_router

from backend.app.routes import ocr, classify
from backend.app.routes.asr import router as asr_router
from backend.app.routes.summarize import router as summarize_router
from backend.app.routes.docq import router as docqa_router
from backend.app.routes.pipeline import router as pipeline_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(docqa_router)
app.include_router(ocr.router)
app.include_router(classify.router)  # include the classify router
app.include_router(asr_router)
app.include_router(summarize_router)
app.include_router(pipeline_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
