"""from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import torch
import numpy as np
import torchxrayvision as xrv
import traceback

router = APIRouter()

# Load the CheXpert model from torchxrayvision
model = xrv.models.DenseNet(weights="densenet121-res224-chex")
model.eval()
disease_labels = model.pathologies

@router.post("/classify-xray/")
async def classify_xray(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("L")  # X-rays are grayscale

        # Center crop to square
        width, height = pil_image.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        pil_image = pil_image.crop((left, top, right, bottom))

        # Resize to 224x224 as expected by the model
        pil_image = pil_image.resize((224, 224))

        # Preprocess for torchxrayvision
        img = np.array(pil_image)
        if img.max() == img.min():
            raise HTTPException(status_code=400, detail="Uploaded image is blank or corrupted.")

        img = xrv.datasets.normalize(img, 255)  # scale pixels to 0-1
        img = img[None, :, :]  # add channel dimension
        img = torch.from_numpy(img).unsqueeze(0).float()  # add batch dimension

        with torch.no_grad():
            preds = model(img)[0].numpy()
            preds = np.nan_to_num(preds, nan=0.0, posinf=1.0, neginf=0.0)  # Replace NaN with 0

        # Return top 5 predictions with their probabilities
        results = [
            {"label": disease_labels[i], "probability": float(preds[i])}
            for i in np.argsort(preds)[::-1][:5]
        ]
        return {"predictions": results}
    except Exception as e:
        print(traceback.format_exc())  # Print full error to terminal for debugging
        raise HTTPException(status_code=500, detail=str(e))"""

"""from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import torch
import numpy as np
import torchxrayvision as xrv
import traceback

router = APIRouter()

model = xrv.models.DenseNet(weights="densenet121-res224-chex")
model.eval()
disease_labels = model.pathologies

@router.post("/classify-xray/")
async def classify_xray(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("L")

        # Center crop to square
        width, height = pil_image.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        pil_image = pil_image.crop((left, top, right, bottom))

        # Resize to 224x224
        pil_image = pil_image.resize((224, 224))

        # Convert to float32 numpy array, scale to [0, 1]
        img = np.array(pil_image).astype(np.float32) / 255.0
        if img.max() == img.min():
            raise HTTPException(status_code=400, detail="Uploaded image is blank or corrupted.")

        # Normalize using torchxrayvision's method
        img = xrv.datasets.normalize(img, 1)  # Already in [0,1], so use 1

        # Add channel and batch dimensions
        img = img[None, :, :]  # (1, H, W)
        img = torch.from_numpy(img).unsqueeze(0).float()  # (1, 1, H, W)

        with torch.no_grad():
            preds = model(img)[0].numpy()
            preds = np.nan_to_num(preds, nan=0.0, posinf=1.0, neginf=0.0)

        results = [
            {"label": disease_labels[i], "probability": float(preds[i])}
            for i in np.argsort(preds)[::-1][:5]
        ]
        return {"predictions": results}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import torch
import numpy as np
import torchxrayvision as xrv
import traceback

router = APIRouter()

model = xrv.models.DenseNet(weights="densenet121-res224-chex")
model.eval()
disease_labels = model.pathologies

@router.post("/classify-xray/")
async def classify_xray(image: UploadFile = File(...)):
    try:
        import sys
        print("PYTHON:", sys.version)
        import numpy
        print("NUMPY:", numpy.__version__)
        import torch
        print("TORCH:", torch.__version__)
        import torchxrayvision
        print("TORCHXRAYVISION:", torchxrayvision.__version__)

        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("L")

        # Center crop to square
        width, height = pil_image.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        pil_image = pil_image.crop((left, top, right, bottom))

        # Resize to 224x224
        pil_image = pil_image.resize((224, 224))

        # Convert to numpy and normalize as expected by torchxrayvision
        img = np.array(pil_image)
        if img.max() == img.min():
            raise HTTPException(status_code=400, detail="Uploaded image is blank or corrupted.")

        img = xrv.datasets.normalize(img, 255)  # Use 255 as in official examples
        img = img[None, :, :]  # Add channel dimension
        img = torch.from_numpy(img).unsqueeze(0).float()  # Add batch dimension

        with torch.no_grad():
            preds = model(img)[0].numpy()
            preds = np.nan_to_num(preds, nan=0.0, posinf=1.0, neginf=0.0)
            print("Model raw preds:", preds)  # <-- ADD THIS LINE

        results = [
            {"label": disease_labels[i], "probability": float(preds[i])}
            for i in np.argsort(preds)[::-1][:5]
        ]
        return {"predictions": results}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))