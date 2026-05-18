import streamlit as st

from utils.pdf_processor import extract_text_from_pdf
from utils.pdf_processor import create_text_chunks

from utils.state_manager import init_session_state


st.title("Vezérlőpult")
st.markdown("Ide töltsd fel a dokumentumokat majd indítsd el a feldolgozást, hogy a rendszer feldolgozhassa.\n" \
            "Fontos, hogy a program csak PDF kiterjesztésű fájlokat fogad el!")

init_session_state()

uploaded_files = st.file_uploader(
    "Ide töltsd fel a PDF fájl(okat):",
    type="pdf",
    accept_multiple_files=True
)

if st.button("Feldolgozás indítása", type="primary"):
    if uploaded_files:
        with st.spinner("Dokumentumok elemzése folyamatban..."):

            raw_text = extract_text_from_pdf(uploaded_files)

            if not raw_text.strip():
                st.error("Nem sikerült kinyerni a szöveget!")
                st.session_state.is_processed = False
                st.stop()

            
            chunks = create_text_chunks(raw_text)
            
            st.session_state.pdf_text = raw_text
            st.session_state.text_chunks = chunks
            st.session_state.is_processed = True

            if "analysis_summary" in st.session_state:
                del st.session_state.analysis_summary

        st.success("A PDF feldolgozása, sikeres volt!")

    else:
        st.warning("Legalább egy PDF-et tölts fel!")

