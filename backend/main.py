from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import json
import os
from sqlalchemy.orm import Session

from utils.pdf_processor import extract_text_from_pdf, create_text_chunks
from utils.ai_client import (
    generate_summary_async, 
    stream_chat_response, 
    generate_quiz_async, 
    analyze_quiz_errors_async,
    generate_mindmap_async,
    socratic_hint_async,
    generate_flashcards_async
)
from utils.db import get_db, QuizResult as QuizResultModel

load_dotenv()

app = FastAPI(title="LLM RAG API - Backend")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory storage for document chunks
document_chunks = []
STORAGE_PATH = "storage/document_state.json"

def save_state():
    global document_chunks
    with open(STORAGE_PATH, "w", encoding="utf-8") as f:
        json.dump(document_chunks, f, ensure_ascii=False)

def load_state():
    global document_chunks
    if os.path.exists(STORAGE_PATH):
        try:
            with open(STORAGE_PATH, "r", encoding="utf-8") as f:
                document_chunks = json.load(f)
                print(f"State betöltve: {len(document_chunks)} chunks")
        except Exception as e:
            print(f"Hiba az állapotfájl betöltésekor: {e}")

# Load state on startup
load_state()

class ChatRequest(BaseModel):
    prompt: str

class SocraticRequest(BaseModel):
    question: str

class QuizRequest(BaseModel):
    count: int = 5
    difficulty: int = 2

class QuizAnalysisRequest(BaseModel):
    wrong_answers: List[dict]

class QuizResultSave(BaseModel):
    topic: str
    difficulty: int
    score: int
    total_questions: int

@app.get("/status")
async def get_status():
    global document_chunks
    return {
        "is_active": len(document_chunks) > 0,
        "chunks_count": len(document_chunks)
    }

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    global document_chunks
    print(f"Feltöltés megkezdve: {len(files)} fájl")
    try:
        extracted_text = await extract_text_from_pdf(files)
        print(f"Szöveg kinyerve, hossza: {len(extracted_text)} karakter")
        
        if not extracted_text.strip():
            print("Hiba: Üres szöveg")
            raise HTTPException(status_code=400, detail="No readable text found in the provided PDFs.")
            
        document_chunks = create_text_chunks(extracted_text)
        print(f"Chunks létrehozva: {len(document_chunks)} db")
        
        save_state()
        
        return {"message": "Sikeres feldolgozás", "chunks_count": len(document_chunks)}
    except Exception as e:
        print(f"Hiba a feltöltés során: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analyze")
async def get_analysis():
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    
    summary = await generate_summary_async(document_chunks)
    return {"summary": summary}

@app.post("/quiz-results")
async def save_quiz_result(result: QuizResultSave, db: Session = Depends(get_db)):
    try:
        db_result = QuizResultModel(**result.model_dump())
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quiz-results")
async def get_quiz_results(db: Session = Depends(get_db)):
    try:
        results = db.query(QuizResultModel).order_by(QuizResultModel.created_at.desc()).all()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-mindmap")
async def get_mindmap():
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    try:
        mindmap_code = await generate_mindmap_async(document_chunks)
        return {"code": mindmap_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/socratic-hint")
async def get_socratic_hint(request: SocraticRequest):
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    try:
        hint = await socratic_hint_async(document_chunks, request.question)
        return {"hint": hint}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-flashcards")
async def get_flashcards():
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    try:
        flashcards = await generate_flashcards_async(document_chunks)
        return flashcards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quiz")
async def get_quiz(request: QuizRequest):
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    
    try:
        quiz = await generate_quiz_async(document_chunks, request.count, request.difficulty)
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quiz-analysis")
async def get_quiz_analysis(request: QuizAnalysisRequest):
    try:
        analysis = await analyze_quiz_errors_async(request.wrong_answers)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_document(request: ChatRequest):
    global document_chunks
    if not document_chunks:
        raise HTTPException(status_code=400, detail="Előbb tölts fel egy dokumentumot!")
    
    def event_generator():
        try:
            for text_chunk in stream_chat_response(request.prompt, document_chunks):
                data = json.dumps({"text": text_chunk})
                yield f"data: {data}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
