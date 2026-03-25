from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services import azure_translate, google_translate

router = APIRouter(prefix="/translate", tags=["translate"])

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str
    provider: str

class TranslationResponse(BaseModel):
    translated_text: str
    provider: str

@router.post("/", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if request.source_lang == request.target_lang:
        raise HTTPException(status_code=400, detail="Source and target languages must be different")

    try:
        if request.provider == "azure":
            result = await azure_translate.translate_text(
                request.text,
                request.source_lang,
                request.target_lang
            )
        elif request.provider == "google":
            result = await google_translate.translate_text(
                request.text,
                request.source_lang,
                request.target_lang
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid provider. Use 'azure' or 'google'")

        return TranslationResponse(translated_text=result, provider=request.provider)

    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))