import os
import requests

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
HUGGINGFACE_API_KEY = os.getenv("HF_API_KEY")
SUMMARIZATION_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
#ASR_API_URL = "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h"
#ASR_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-base"
#ASR_API_URL = "https://api-inference.huggingface.co/models/openai/whisper"
#ASR_API_URL = "https://api-inference.huggingface.co/models/jonatasgrosman/wav2vec2-large-xlsr-53-english"
#ASR_API_URL = "https://api-inference.huggingface.co/models/Xenova/whisper-tiny.en"
ASR_API_URL = "https://api-inference.huggingface.co/models/jonatasgrosman/wav2vec2-large-xlsr-53-english"

def get_hf_headers(content_type: str):
    if not HUGGINGFACE_API_KEY:
        raise RuntimeError("HF_API_KEY environment variable is not set.")
    return {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": content_type
    }

def classify_image(image_bytes: bytes):
    headers = get_hf_headers("image/png")
    response = requests.post(HUGGINGFACE_API_URL, headers=headers, data=image_bytes, timeout=30)
    print("Status code:", response.status_code)
    print("Response text:", response.text)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        raise
    return response.json()

"""def transcribe_audio(audio_bytes):
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "audio/wav"  # or "audio/mpeg" if your audio is mp3
    }
    response = requests.post(ASR_API_URL, headers=headers, data=audio_bytes, timeout=30)
    print("Status code:", response.status_code)
    print("Response text:", response.text)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        raise
    return response.json()
    return{"transcription":"API call is disbaled for debugging."}"""

"""def transcribe_audio(audio_bytes):
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "audio/wav"
    }
    response = requests.post(ASR_API_URL, headers=headers, data=audio_bytes, timeout=30)
    print("Status code:", response.status_code)
    print("Response text:", response.text)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        raise
    return response.json()"""
"""def transcribe_audio(audio_bytes):
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "audio/wav"
    }
    response = requests.post(ASR_API_URL, headers=headers, data=audio_bytes, timeout=30)
    print("Status code:", response.status_code)
    print("Response text:", response.text)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        if response.status_code == 404:
            return {"error": "ASR model not found or not available for hosted inference."}
        raise
    return response.json()"""
def transcribe_audio(audio_bytes):
    headers = get_hf_headers("audio/wav")
    try:
        response = requests.post(ASR_API_URL, headers=headers, data=audio_bytes, timeout=30)
        print("Status code:", response.status_code)
        print("Response text:", response.text)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        print("Hugging Face API timeout.")
        return {"error": "ASR model timed out. Try a shorter audio or later."}
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        if response.status_code == 404:
            return {"error": "ASR model not found or not available for hosted inference."}
        raise
    except Exception as e:
        print("Unexpected error:", str(e))
        return {"error": "Unexpected error during ASR inference."}
    return response.json()

def summarize_text(text):
    print("summarize_text called with:", text)
    headers = get_hf_headers("application/json")
    payload = {"inputs": text}
    response = requests.post(SUMMARIZATION_API_URL, headers=headers, json=payload, timeout=30)
    print("Status code:", response.status_code)
    print("Response text:", response.text)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print("Hugging Face API error:", response.text)
        raise
    return response.json()
