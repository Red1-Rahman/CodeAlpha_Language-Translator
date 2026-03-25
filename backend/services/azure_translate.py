import httpx
from backend.config import settings

async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    url = "https://api.cognitive.microsoft.com/translate"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.azure_api_key,
        "Ocp-Apim-Subscription-Region": settings.azure_region,
        "Content-Type": "application/json"
    }
    params = {
        "api-version": "3.0",
        "from": source_lang,
        "to": target_lang
    }
    body = [{"text": text}]

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, params=params, json=body)
        response.raise_for_status()
        data = response.json()
        return data[0]["translations"][0]["text"]