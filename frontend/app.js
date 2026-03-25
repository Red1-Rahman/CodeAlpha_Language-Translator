// frontend/app.js

const API_BASE = "http://localhost:8000";

// ─── DOM refs ────────────────────────────────────────────────

const sourceText    = document.getElementById("source-text");
const outputText    = document.getElementById("output-text");
const sourceLang    = document.getElementById("source-lang");
const targetLang    = document.getElementById("target-lang");
const translateBtn  = document.getElementById("translate-btn");
const swapBtn       = document.getElementById("swap-btn");
const copyBtn       = document.getElementById("copy-btn");
const ttsBtn        = document.getElementById("tts-btn");
const clearBtn      = document.getElementById("clear-btn");
const charCount     = document.getElementById("char-count");
const statusMsg     = document.getElementById("status-msg");
const resultProvider = document.getElementById("result-provider");
const themeToggle   = document.getElementById("theme-toggle");

// ─── Theme ───────────────────────────────────────────────────

// Load saved theme or fall back to system
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    // detect effective current theme (system-aware)
    const isDark = current === "dark" ||
        (current !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
});

// ─── Load languages ──────────────────────────────────────────

async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE}/languages/`);
        if (!response.ok) throw new Error("Failed to load languages");
        const languages = await response.json();

        // sort alphabetically by name
        const sorted = Object.entries(languages).sort((a, b) =>
            a[1].localeCompare(b[1])
        );

        sorted.forEach(([code, name]) => {
            const opt1 = new Option(name, code);
            const opt2 = new Option(name, code);
            sourceLang.add(opt1);
            targetLang.add(opt2);
        });

        // sensible defaults
        sourceLang.value = "en";
        targetLang.value = "bn";

    } catch (err) {
        setStatus("Could not load languages. Is the backend running?", "error");
    }
}

// ─── Character counter ────────────────────────────────────────

sourceText.addEventListener("input", () => {
    const len = sourceText.value.length;
    charCount.textContent = `${len} / 5000`;
    charCount.classList.toggle("warning", len > 4500);
});

// ─── Swap languages ───────────────────────────────────────────

swapBtn.addEventListener("click", () => {
    const tempCode = sourceLang.value;
    const tempText = sourceText.value;

    sourceLang.value = targetLang.value;
    targetLang.value = tempCode;

    // also swap the text content if translation exists
    if (outputText.value) {
        sourceText.value = outputText.value;
        outputText.value = tempText;
        charCount.textContent = `${sourceText.value.length} / 5000`;
        setOutputState(!!outputText.value);
    }

    const rtlLanguages = ["ar", "he", "fa", "ur"];
    sourceText.dir = rtlLanguages.includes(sourceLang.value) ? "rtl" : "ltr";
    outputText.dir = rtlLanguages.includes(targetLang.value) ? "rtl" : "ltr";
});

// ─── Translate ────────────────────────────────────────────────

translateBtn.addEventListener("click", translate);

sourceText.addEventListener("keydown", (e) => {
    // Ctrl+Enter or Cmd+Enter to translate
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        translate();
    }
});

async function translate() {
    const text = sourceText.value.trim();
    if (!text) {
        setStatus("Please enter some text to translate.", "error");
        return;
    }

    if (sourceLang.value === targetLang.value) {
        setStatus("Source and target languages must be different.", "error");
        return;
    }

    const provider = document.querySelector('input[name="provider"]:checked').value;

    // UI: loading state
    translateBtn.disabled = true;
    setStatus("Translating", "loading");
    setOutputState(false);
    outputText.value = "";
    resultProvider.textContent = "";

    try {
        const response = await fetch(`${API_BASE}/translate/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                source_lang: sourceLang.value,
                target_lang: targetLang.value,
                provider,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Translation failed.");
        }

        outputText.value = data.translated_text;
        const rtlLanguages = ["ar", "he", "fa", "ur"];
        outputText.dir = rtlLanguages.includes(targetLang.value) ? "rtl" : "ltr";
        resultProvider.textContent = data.provider;
        setOutputState(true);
        setStatus("");

    } catch (err) {
        setStatus(err.message, "error");
        setOutputState(false);
    } finally {
        translateBtn.disabled = false;
    }
}

// ─── Copy ─────────────────────────────────────────────────────

copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(outputText.value);
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("success");
        setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("success");
        }, 2000);
    } catch {
        setStatus("Could not copy to clipboard.", "error");
    }
});

// ─── Text-to-speech ───────────────────────────────────────────

let speaking = false;

ttsBtn.addEventListener("click", () => {
    if (speaking) {
        window.speechSynthesis.cancel();
        ttsBtn.textContent = "Speak";
        speaking = false;
        return;
    }

    const utterance = new SpeechSynthesisUtterance(outputText.value);
    utterance.lang = targetLang.value;

    utterance.onstart = () => {
        speaking = true;
        ttsBtn.textContent = "Stop";
    };

    utterance.onend = () => {
        speaking = false;
        ttsBtn.textContent = "Speak";
    };

    utterance.onerror = () => {
        speaking = false;
        ttsBtn.textContent = "Speak";
        setStatus("Text-to-speech is not supported for this language.", "error");
    };

    window.speechSynthesis.speak(utterance);
});

// ─── Clear ────────────────────────────────────────────────────

clearBtn.addEventListener("click", () => {
    sourceText.value = "";
    outputText.value = "";
    charCount.textContent = "0 / 5000";
    charCount.classList.remove("warning");
    resultProvider.textContent = "";
    setOutputState(false);
    setStatus("");
    sourceText.focus();
});

// ─── Helpers ──────────────────────────────────────────────────

function setStatus(msg, type = "") {
    statusMsg.textContent = msg;
    statusMsg.className = type ? type : "";
}

function setOutputState(hasContent) {
    copyBtn.disabled = !hasContent;
    ttsBtn.disabled  = !hasContent;
}

// ─── Init ─────────────────────────────────────────────────────

loadLanguages();