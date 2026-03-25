#google translate api requires payment, so I will use googletrans library which is free and does not require an api key
from googletrans import Translator

async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    try:
        translator = Translator()
        result = translator.translate(text, src=source_lang, dest=target_lang)
        return result.text
    except Exception as e:
        raise RuntimeError(f"Google Translate (unofficial) failed: {e}")
