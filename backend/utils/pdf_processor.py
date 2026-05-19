import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

async def extract_text_from_pdf(pdf_files):
    """
    Extracts text from a list of FastAPI UploadFile objects using PyMuPDF.
    """
    text = ""
    for pdf_file in pdf_files:
        content = await pdf_file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
    return text

def create_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 10000,
        chunk_overlap = 1000
    )

    chunks = text_splitter.split_text(text)
    return chunks
