import streamlit as st

from utils.ai_client import get_ai_response
from utils.state_manager import init_session_state


st.title("Elemzés és eredmények")
st.markdown("A rendszer automatikusan összefoglalja és analizálja a feltöltött dokumentumokat.")

init_session_state()

if not st.session_state.get("is_processed", False):
    st.warning("Jelenleg nem áll rendelkezésre feldolgozható dokumentum.")
    st.stop()

if "analysis_summary" not in st.session_state:
    with st.spinner("A dokumentum átfogó elemzése folyamatban van."):

        analysis_prompt = (
            "Kérlek, írj egy profi, lényegretörő vezetői összefoglalót (executive summary) "
            "a dokumentum tartalmáról körülbelül 4-5 mondatban. Ez alatt, egy új bekezdésben "
            "sorold fel a dokumentum 5 legfontosabb kulcsszavát vagy kifejezését bullet pontokba szedve."
        )

        response = get_ai_response(analysis_prompt, st.session_state.text_chunks)
        st.session_state.analysis_summary = response

st.subheader("Intelligens elemzés összefoglaló")
st.info(st.session_state.analysis_summary)

