import streamlit as st

def init_session_state():

    if "pdf_text" not in st.session_state:
        st.session_state.pdf_text = ""

    if "text_chunks" not in st.session_state:
        st.session_state.text_chunks = []

    if "is_processed" not in st.session_state:
        st.session_state.is_processed = False

