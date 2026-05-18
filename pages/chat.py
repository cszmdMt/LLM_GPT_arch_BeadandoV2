import streamlit as st
from utils.ai_client import get_ai_response
from utils.state_manager import init_session_state

st.title("💬 Dokumentum-Csevegés")

init_session_state()


if not st.session_state.get("is_processed", False):
    st.warning("⚠️ Még nincs feldolgozott dokumentum a memóriában! Kérlek, menj a 'Vezérlőpult' oldalra, és tölts fel egy PDF-et.")
    st.stop()


if "messages" not in st.session_state:
    st.session_state.messages = []


for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])


if prompt := st.chat_input("Kérdezz bármit a feltöltött dokumentummal kapcsolatban..."):
    

    st.session_state.messages.append({"role": "user", "content": prompt})
    

    with st.chat_message("user"):
        st.markdown(prompt)


    with st.chat_message("assistant"):
        with st.spinner("Gondolkodom..."):
            response = get_ai_response(prompt, st.session_state.text_chunks)
            st.markdown(response)
    

    st.session_state.messages.append({"role": "assistant", "content": response})
    
    st.rerun()