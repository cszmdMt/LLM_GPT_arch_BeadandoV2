import streamlit as st

from utils.style_injector import inject_custom_css

st.set_page_config(
    page_title="Intelligens-Dokumentum-Elemző",
    page_icon="🐕",
    layout="wide"
)

inject_custom_css()

dashboard_page = st.Page(
    "pages/dashboard.py",
    title="Vezérlőpult",
    icon="⚙️"
)

analysis_page = st.Page(
    "pages/analysis.py",
    title="Elemzés és Eredmények",
    icon="📉"
)

chat_page = st.Page(
    "pages/chat.py",
    title="Dobby",
    icon="🧝"
)

pg = st.navigation([dashboard_page, analysis_page, chat_page])

pg.run()
