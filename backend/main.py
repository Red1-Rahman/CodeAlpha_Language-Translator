from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import translate, languages

app = FastAPI(
    title="Language Translation Tool",
    description="Translate text using Azure Translator and Google(unofficial) Translate",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate.router)
app.include_router(languages.router)

@app.get("/")
async def root():
    return {"message": "Translation API is running"}
