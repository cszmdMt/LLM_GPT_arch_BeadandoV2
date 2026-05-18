import os 
import logging

from google import genai
from google.genai import types


def get_ai_response(prompt, context_chunks):

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key or api_key is None:
        logging.error("Nincs beállítva API-kulcs az .env fájlban!")

    client = genai.Client(api_key=api_key)

    context_text = "\n".join(context_chunks)

    system_instruction = (
        "Te egy professzionális, intelligens dokumentum-elemző asszisztens vagy. "
        "Kizárólag a megadott kontextus alapján válaszolj a kérdésekre. "
        "Ha a válasz nem derül ki a dokumentumból, mondd meg őszintén, és ne találj ki információkat."
    )

    full_prompt = f"Dokumentum kontextusa:\n{context_text}\n\nA Felhasználó kérdése: {prompt}"

    try:
        response = client.models.generate_content(
            model = "gemini-2.5-flash",
            contents = full_prompt,
            config  = types.GenerateContentConfig(
                system_instruction = system_instruction,
                temperature = 0.3
            )
        )

        return response.text
    
    except Exception as e:
        logging.error(f"Hiba történt a válasz generálás során: {str(e)}")
