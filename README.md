# CsizIskola - Intelligens Oktatási Platform

A **CsizIskola** egy modern, AI-alapú webes alkalmazás, amely dokumentumok (PDF) elemzésével és interaktív tanulási módszerekkel segíti a hallgatókat a tananyag elsajátításában. A rendszer a Google Gemini (2.5-flash-lite) modelljét használja a szövegértelmezéshez és generáláshoz.

---

## Főbb Funkciók és Oldalak

### 1. Vezérlőpult (Chat & Feltöltés)
Ez az alkalmazás központi egysége.
- **Dokumentum feltöltés:** PDF fájlok tallózása és feltöltése. A rendszer kinyeri a szöveget és memóriában tárolja a feldolgozáshoz.
- **Interaktív Chat:** Kérdések feltevése a feltöltött dokumentummal kapcsolatban. A válaszok szépen formázott Markdown formátumban érkeznek.
- **Fájllista:** A feltöltött dokumentumok esztétikus, listázott megjelenítése.

### 2. Intelligens Elemzés
- **Vezetői összefoglaló:** Az AI egy átfogó, strukturált összefoglalót készít a dokumentum tartalmából, kiemelve a legfontosabb pontokat.
- **Markdown Megjelenítés:** Professzionális tipográfia a könnyű olvashatóság érdekében.

### 3. Tanulórendszer (Kvíz)
- **Dinamikus Kvízgenerálás:** Választható kérdésszám és nehézségi szint (Bemelegítés, Felkészültem, Dolgozatszint).
- **Interaktív Felület:** Egyenként megjelenő kérdések, azonnali vizuális visszajelzés (zöld/piros háttérragyogás).
- **AI Mentorálás:** A rontott kérdések alapján a rendszer egyedi elemzést és tanulási tanácsokat ad.
- **Eredménytörténet:** Az elért pontszámok mentése és listázása egy sötét glassmorphism "buborékban".

### 4. Tanulást segítő módszerek
Három speciális eszköz a hatékonyabb tanuláshoz:
- **Dinamikus Gondolattérkép:** Mermaid.js alapú vizuális fa-struktúra, amely nagyítható és mozgatható (pan & zoom).
- **Szókratészi Súgó:** Egy rávezető asszisztens, amely nem a választ adja meg, hanem logikai tippekkel segíti a hallgatót.
- **Intelligens Tanulókártyák:** 3D-ben átforduló digitális kártyák a fogalmak memorizálásához.

---

## Technológiai Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion (animációk), Lucide React (ikonok), React Router Dom (navigáció).
- **Backend:** FastAPI (Python), Uvicorn.
- **AI:** Google GenAI SDK (Gemini 2.5-flash-lite modell).
- **Adatbázis:** SQLite + SQLAlchemy a teszteredmények tárolásához.
- **Dokumentumkezelés:** PyMuPDF (fitz), LangChain Text Splitters.

---

## Fájlstruktúra és Fájlok Feladata

### Gyökérkönyvtár
- `main.py`: A backend belépési pontja, az API végpontok (CORS, útvonalak) definíciója.
- `.env`: Környezeti változók (API kulcs, adatbázis URL).
- `requirements.txt`: Python függőségek listája.

### Backend (`/backend`)
- `utils/ai_client.py`: A Gemini AI-val való kommunikáció (promptok, streamelés, JSON mód).
- `utils/pdf_processor.py`: PDF szöveg kinyerése és darabolása (chunking).
- `utils/db.py`: Adatbázis modellek és kapcsolat kezelése.
- `knowledge_base.db`: A helyi SQLite adatbázis fájl.

### Frontend (`/frontend/src`)
- `App.jsx`: A fő komponens, itt található a routing (útvonalválasztó) és a globális állapotkezelés.
- `main.jsx`: React alkalmazás inicializálása.
- `index.css`: Globális stílusok, Tailwind importok és egyedi "glass-panel" effektek.

#### Komponensek (`/frontend/src/components`)
- `Navbar.jsx`: A futurisztikus, rögzített navigációs sáv a CsizIskola logóval.

#### Nézetek (`/frontend/src/views`)
- `ChatView.jsx`: A vezérlőpult, fájlfeltöltő és a chat interfész.
- `AnalysisView.jsx`: A dokumentum elemzését megjelenítő oldal.
- `QuizView.jsx`: A kvíz interfész, az eredmények és a korábbi tesztek listája.
- `LearningMethodsView.jsx`: A tanulást segítő három módszer (Mindmap, Socratic, Flashcards) gyűjtőhelye és al-felületei.

### Dokumentáció (`/Docs`)
- `tesztek_eredmenyek.md`: Részletes jelentés a legutóbbi rendszertesztelésről és javításokról.

---

## Telepítés és Indítás

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

A CsizIskola platform alapértelmezetten a [http://localhost:5173](http://localhost:5173) címen érhető el.
