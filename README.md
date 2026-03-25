<img width="1448" height="737" alt="image" src="https://github.com/user-attachments/assets/c6f69615-8f55-4f05-b2eb-ea7ccd5aa34e" />

---

A clean, fast translation tool built with FastAPI and vanilla JS. Supports 50+ languages with two translation providers — Azure Translator (primary) and Google Translate (unofficial).

---

## Features

- Translate between 50+ languages including Arabic, Bangla, Hindi, Urdu, Chinese, Japanese and more
- Two providers — switch between Azure and Google with one click
- RTL support for Arabic, Urdu, Persian, Hebrew
- Copy translation to clipboard
- Text-to-speech for translated output
- Swap source and target languages instantly
- Character counter with 5000 char limit
- Light / dark theme toggle, respects your system preference
- Ctrl+Enter to translate without touching the mouse

---

## Stack

- **Backend** — FastAPI, httpx, pydantic-settings
- **Frontend** — HTML, CSS, vanilla JS (no frameworks)
- **Translation** — Azure Cognitive Translator API, googletrans

---

## Notes

- Azure Translator is the primary provider — free tier gives 2M characters/month, no card required
- Google Translate uses the unofficial `googletrans` library — works but may occasionally be unreliable
- API keys are loaded from `.env` and never exposed to the frontend
