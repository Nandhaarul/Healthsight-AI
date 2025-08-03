import requests

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
HUGGINGFACE_API_KEY = "***REMOVED***"  # replace this securely
SUMMARIZATION_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
ASR_API_URL = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self"

def classify_image(image_bytes: bytes):
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "image/png"  # Change to "image/jpeg" if needed
    }
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

def transcribe_audio(audio_bytes):
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
    return response.json()

def summarize_text(text):
    print("summarize_text called with:", text)
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
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