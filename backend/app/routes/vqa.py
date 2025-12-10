from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from gradio_client import Client, handle_file
import tempfile

router = APIRouter()

@router.post("/vqa/")
async def vqa_endpoint(
    image: UploadFile = File(...),
    question: str = Form(...)
):
    try:
        # Save the uploaded image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(await image.read())
            tmp_path = tmp.name

        # Use gradio_client to call your Space
        client = Client("nandhaarul/vqa-blip")
        result = client.predict(
            image=handle_file(tmp_path),
            question=question,
            api_name="/predict"
        )
        return {"answer": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))