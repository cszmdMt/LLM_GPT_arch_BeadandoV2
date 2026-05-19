import os 
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Ensure .env is loaded from the correct location and overrides existing env vars
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path, override=True)

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logging.error("Nincs beállítva API-kulcs az .env fájlban!")
    return genai.Client(api_key=api_key)

async def generate_summary_async(context_chunks):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    system_instruction = "Te egy professzionális dokumentum-elemző vagy. Készíts egy átfogó, vezetői összefoglalót a megadott dokumentum kontextusából."
    full_prompt = f"Dokumentum kontextusa:\n{context_text}\n\nKérlek készíts egy összefoglalót a dokumentumból."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        return response.text
    except Exception as e:
        logging.error(f"Hiba az összefoglaló generálásakor: {str(e)}")
        return "Hiba történt az összefoglaló generálása közben."

async def generate_quiz_async(context_chunks, count=5, difficulty=2):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    difficulty_labels = {1: "könnyű (alapfogalmak)", 2: "közepes (összefüggések)", 3: "nehéz (részletek és komplex elemzés)"}
    diff_desc = difficulty_labels.get(difficulty, "közepes")

    system_instruction = (
        "Te egy oktatási szakértő vagy. Generálj egy kvízt a megadott dokumentum alapján. "
        f"A kvíz pontosan {count} kérdésből álljon, a nehézségi szintje legyen: {diff_desc}. "
        "A válasznak egy JSON listának kell lennie, ahol minden elem egy objektum a következő mezőkkel: "
        "'question', 'options' (egy tömb 5 válaszlehetőséggel), 'correct_answer' (a helyes válasz szövege), 'topic' (a kérdés témaköre)."
    )

    prompt = f"Dokumentum tartalma:\n{context_text}\n\nGenerálj {count} kérdést JSON formátumban."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        # Parse the JSON string from the response
        import json
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"Hiba a kvíz generálásakor: {str(e)}")
        raise e

async def analyze_quiz_errors_async(wrong_answers):
    client = get_client()
    
    system_instruction = (
        "Te egy mentor vagy. A hallgató elrontott néhány kérdést egy kvízben. "
        "Készíts egy támogató hangvételű, Markdown formátumú elemzést, amely segít neki megérteni, "
        "milyen területeken kell még fejlődnie. Ne csak a válaszokat add meg, hanem magyarázd el az összefüggéseket."
    )

    prompt = "A hallgató által elrontott kérdések és válaszok:\n"
    for i, item in enumerate(wrong_answers):
        prompt += f"{i+1}. Kérdés: {item['question']}\n   Választott (hibás) válasz: {item['user_answer']}\n   Helyes válasz: {item['correct_answer']}\n\n"
    
    prompt += "Kérlek elemezd ezeket a hibákat és adj tanácsot a tanuláshoz."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.5
            )
        )
        return response.text
    except Exception as e:
        logging.error(f"Hiba a kvíz elemzésekor: {str(e)}")
        return "Sajnos nem sikerült generálni az elemzést."

async def generate_mindmap_async(context_chunks):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    system_instruction = (
        "Te egy vizuális gondolkodás szakértő vagy. Készíts egy elmetérképet a dokumentum alapján. "
        "A kimenet kizárólag érvényes Mermaid.js mindmap szintaxis legyen.\n"
        "FONTOS SZABÁLYOK A SZINTAXISHOZ:\n"
        "1. Az első sor pontosan ez legyen: mindmap\n"
        "2. A második sor a gyökér csomópont:  root((Fő téma))\n"
        "3. A behúzásokat SZIGORÚAN 2 szóközzel növeld szintenként (ne használj tabulátort).\n"
        "4. A csomópontok szövegében TILOS speciális karaktereket használni (pl. kettőspont, zárójel, vessző, idézőjel, kötőjel). Csak egyszerű betűket és szóközöket használj.\n"
        "5. Ne használj Markdown kódbokszokat (```mermaid), csak a nyers kódot add vissza.\n"
        "Példa:\n"
        "mindmap\n"
        "  root((Adatbazisok))\n"
        "    Relacios\n"
        "      MySQL\n"
        "      PostgreSQL\n"
        "    NoSQL\n"
        "      MongoDB"
    )

    prompt = f"Dokumentum tartalma:\n{context_text}\n\nGenerálj elmetérképet Mermaid szintaxissal."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        # Clean potential markdown code blocks
        content = response.text.replace("```mermaid", "").replace("```", "").strip()
        logging.info(f"Generált Mermaid kód:\n{content}")
        return content
    except Exception as e:
        logging.error(f"Hiba az elmetérkép generálásakor: {str(e)}")
        return "mindmap\n  root((Hiba tortent))"

async def socratic_hint_async(context_chunks, user_question):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    system_instruction = (
        "Te egy szókratészi tanár vagy. A célod, hogy a diák magától jöjjön rá a megoldásra. "
        "A dokumentum kontextusát használva ne add meg a direkt választ a kérdésre. "
        "Ehelyett tegyél fel egy rávezető kérdést, vagy adj egy logikai tippet, ami segít neki továbblépni. "
        "Légy rövid, bátorító és intellektuálisan ösztönző."
    )

    prompt = f"Kontextus:\n{context_text}\n\nA diák kérdése/akadálya: {user_question}\n\nAdj egy szókratészi tippet."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )
        return response.text
    except Exception as e:
        logging.error(f"Hiba a szókratészi tippnél: {str(e)}")
        return "Gondolkozz el azon, mi lehet a legelső lépés ebben a folyamatban..."

async def generate_flashcards_async(context_chunks):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    system_instruction = (
        "Generálj 8-10 tanulókártyát a dokumentum alapján. "
        "Minden kártya egy JSON objektum legyen 'question' és 'answer' mezőkkel. "
        "A válaszod egy JSON lista legyen."
    )

    prompt = f"Dokumentum tartalma:\n{context_text}\n\nGenerálj tanulókártyákat JSON formátumban."

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.6,
                response_mime_type="application/json"
            )
        )
        import json
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"Hiba a tanulókártyák generálásakor: {str(e)}")
        return [{"question": "Hiba", "answer": "Nem sikerült generálni a kártyákat."}]

def stream_chat_response(prompt, context_chunks):
    client = get_client()
    context_text = "\n".join(context_chunks)
    
    system_instruction = (
        "Te egy professzionális, intelligens dokumentum-elemző asszisztens vagy. "
        "Kizárólag a megadott kontextus alapján válaszolj a kérdésekre. "
        "Ha a válasz nem derül ki a dokumentumból, mondd meg őszintén, és ne találj ki információkat."
    )

    full_prompt = f"Dokumentum kontextusa:\n{context_text}\n\nA Felhasználó kérdése: {prompt}"

    try:
        response_stream = client.models.generate_content_stream(
            model="gemini-2.5-flash-lite",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        for chunk in response_stream:
            yield chunk.text
    except Exception as e:
        logging.error(f"Hiba történt a streamelés során: {str(e)}")
        yield "Hiba történt a válasz generálása során."
