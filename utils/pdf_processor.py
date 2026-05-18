import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_text_from_pdf(pdf_files):
    """
    Extracts text from a list of PDF files using PyMuPDF.
    
    Args:
        pdf_files: A list of file-like objects (e.g., from st.file_uploader).
        
    Returns:
        A string containing all extracted text.
    """
    text = ""
    for pdf_file in pdf_files:
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
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

