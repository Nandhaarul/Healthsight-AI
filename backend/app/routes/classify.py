"""from fastapi import APIRouter, UploadFile, File, HTTPException
import requests  # <---- ADD THIS
from backend.app.utils.hf_inference import classify_image

router = APIRouter()

@router.post("/classify-image/")
async def classify_image_endpoint(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = classify_image(image_bytes)
        return result
    except requests.HTTPError as http_err:
        raise HTTPException(status_code=500, detail=f"Hugging Face API error: {http_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

"""import base64
from fastapi import APIRouter, File, UploadFile
import requests

router = APIRouter()

HF_API_URL = "https://api-inference.huggingface.co/models/shashankbhat/dermnet-skin-disease-classifier-vit-base-patch16-224"
HF_API_KEY = os.getenv("HF_API_KEY")

@router.post("/classify-image/")
async def classify_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "inputs": image_b64
    }
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}"
    }
    response = requests.post(HF_API_URL, headers=headers, json=payload)
    try:
        response.raise_for_status()
        result = response.json()
        # result is a list of dicts with 'label' and 'score'
        diagnosis = result[0]['label'] if isinstance(result, list) and result else "Unknown"
    except Exception as e:
        return {"error": str(e)}
    return {"diagnosis": diagnosis}"""

"""import base64  # (optional, can be removed)
from fastapi import APIRouter, File, UploadFile, HTTPException
import requests

router = APIRouter()

HF_API_URL = "https://api-inference.huggingface.co/models/shashankbhat/dermnet-skin-disease-classifier-vit-base-patch16-224"
HF_API_KEY = os.getenv("HF_API_KEY")

@router.post("/classify-image/")
async def classify_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}"
    }
    try:
        # Send raw bytes (preferred)
        resp = requests.post(HF_API_URL, headers=headers, data=image_bytes, timeout=45)
        resp.raise_for_status()
        result = resp.json()
        if not isinstance(result, list):
            raise HTTPException(status_code=500, detail=f"Unexpected response: {result}")
        top = result[0]
        return {
            "diagnosis": top.get("label", "Unknown"),
            "score": top.get("score"),
            "raw": result
        }
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"HuggingFace request failed: {e}")"""


"""import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
import requests

router = APIRouter()
logger = logging.getLogger(__name__)

HF_API_URL = "https://api-inference.huggingface.co/models/shashankbhat/dermnet-skin-disease-classifier-vit-base-patch16-224"
HF_API_KEY = os.getenv("HF_API_KEY")

@router.post("/classify-image/")
async def classify_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    try:
        resp = requests.post(HF_API_URL, headers=headers, data=image_bytes, timeout=60)
        resp.raise_for_status()
        result = resp.json()
        if not isinstance(result, list) or not result:
            raise HTTPException(status_code=500, detail=f"Unexpected response: {result}")
        top = result[0]
        return {
            "diagnosis": top.get("label", "Unknown"),
            "score": top.get("score"),
            "raw": result
        }
    except requests.exceptions.RequestException as e:
        logger.error("HF request failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Hugging Face request failed: {e}")"""

"""import logging
import time
from fastapi import APIRouter, File, UploadFile, HTTPException
import requests

router = APIRouter()
logger = logging.getLogger(__name__)

HF_API_KEY = os.getenv("HF_API_KEY")

# Try one of these; start with the beans model to verify end‑to‑end, then switch.
MODEL_NAME = "nateraw/vit-base-beans"  # change to "akhaliq/dermnet_vit_base_patch16_224" after test
HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def _call_hf(image_bytes: bytes):
    resp = requests.post(HF_API_URL, headers=HEADERS, data=image_bytes, timeout=60)
    if resp.status_code == 503:
        # Model loading – wait briefly and retry once
        time.sleep(3)
        resp = requests.post(HF_API_URL, headers=HEADERS, data=image_bytes, timeout=60)
    if resp.status_code == 404:
        raise HTTPException(
            status_code=502,
            detail=f"HuggingFace: model '{MODEL_NAME}' not found or not enabled for inference."
        )
    try:
        resp.raise_for_status()
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"HuggingFace error {resp.status_code}: {resp.text}") from e
    return resp.json()

@router.post("/classify-image/")
async def classify_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    result = _call_hf(image_bytes)
    if not isinstance(result, list):
        raise HTTPException(status_code=500, detail=f"Unexpected response shape: {result}")
    top = result[0]
    return {
        "model": MODEL_NAME,
        "diagnosis": top.get("label", "Unknown"),
        "score": top.get("score"),
        "raw": result
    }"""


"""import logging
import time
from fastapi import APIRouter, File, UploadFile, HTTPException
import requests

router = APIRouter()
logger = logging.getLogger(__name__)

HF_API_KEY = os.getenv("HF_API_KEY")

MODEL_NAME = "nateraw/vit-base-beans"  # test model
HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Accept": "application/json",
    "X-Wait-For-Model": "true"
}

MAX_RETRIES = 3
BACKOFF_SEC = 5
REQUEST_TIMEOUT = 120  # seconds

def call_hf(image_bytes: bytes):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("HF request attempt %s...", attempt)
            resp = requests.post(
                HF_API_URL,
                headers=HEADERS,
                data=image_bytes,
                timeout=REQUEST_TIMEOUT,
            )
            if resp.status_code == 503:
                logger.warning("Model loading (503). Waiting...")
                time.sleep(BACKOFF_SEC)
                continue
            if resp.status_code == 404:
                raise HTTPException(
                    status_code=502,
                    detail=f"Model '{MODEL_NAME}' not found or not enabled."
                )
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            logger.error("Timeout attempt %s", attempt)
            if attempt == MAX_RETRIES:
                raise HTTPException(status_code=504, detail="Upstream timeout.")
        except requests.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"HF error {resp.status_code}: {resp.text}") from e
        except requests.RequestException as e:
            logger.error("Request failure: %s", e)
            if attempt == MAX_RETRIES:
                raise HTTPException(status_code=502, detail="HF request failed.")
            time.sleep(BACKOFF_SEC)
    raise HTTPException(status_code=502, detail="HF retries exhausted.")

@router.post("/classify-image/")
async def classify_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    result = call_hf(image_bytes)
    if not isinstance(result, list) or not result:
        raise HTTPException(status_code=500, detail=f"Unexpected response: {result}")
    top = result[0]
    return {
        "model": MODEL_NAME,
        "diagnosis": top.get("label", "Unknown"),
        "score": top.get("score"),
        "raw": result
    }"""


import logging, time, os
from fastapi import APIRouter, File, UploadFile, HTTPException, Query
import requests

router = APIRouter()
log = logging.getLogger("classify")
logging.basicConfig(level=logging.INFO)

HF_API_KEY = os.getenv("HF_API_KEY")

"""FALLBACK_MODELS = [
    "nateraw/vit-base-beans",              # sanity test (should work)
    "google/vit-base-patch16-224",         # generic
    "akhaliq/dermnet_vit_base_patch16_224" # medical (may fail if no hosted inference)
]"""

FALLBACK_MODELS = [
    "nateraw/skin-conditions-vgg",
    "google/vit-base-patch16-224",
    "nateraw/vit-base-beans"
]

TIMEOUT = 90
RETRIES = 3
BACKOFF = 4

def call_model(image_bytes: bytes, model: str):
    if not HF_API_KEY:
        raise HTTPException(status_code=500, detail="HF_API_KEY environment variable is not set.")
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Accept": "application/json",
        "X-Wait-For-Model": "true",
        "Content-Type": "application/octet-stream"
    }
    for attempt in range(1, RETRIES + 1):
        try:
            log.info("Request model=%s attempt=%s", model, attempt)
            r = requests.post(url, headers=headers, data=image_bytes, timeout=TIMEOUT)
            log.info("Status=%s body=%s", r.status_code, r.text[:200])
            if r.status_code == 503:
                time.sleep(BACKOFF); continue
            if r.status_code == 404:
                raise HTTPException(status_code=502, detail=f"Model {model} not found.")
            r.raise_for_status()
            return r.json()
        except requests.exceptions.Timeout:
            if attempt == RETRIES:
                raise HTTPException(status_code=504, detail=f"Timeout contacting model {model}.")
        except requests.RequestException as e:
            if attempt == RETRIES:
                raise HTTPException(status_code=502, detail=f"HuggingFace request failed: {e}")
            time.sleep(BACKOFF)
    raise HTTPException(status_code=502, detail=f"Retries exhausted for {model}.")

@router.post("/classify-image/")
async def classify_image(
    image: UploadFile = File(...),
    model: str | None = Query(None, description="Override HF model")
):
    image_bytes = await image.read()
    models = [model] if model else FALLBACK_MODELS
    last_err = None
    for m in models:
        try:
            result = call_model(image_bytes, m)
            if not isinstance(result, list) or not result:
                raise HTTPException(status_code=500, detail=f"Unexpected response from {m}: {result}")
            top = result[0]
            return {
                "model": m,
                "diagnosis": top.get("label", "Unknown"),
                "score": top.get("score"),
                "raw": result
            }
        except HTTPException as e:
            last_err = e
            continue
    raise last_err
