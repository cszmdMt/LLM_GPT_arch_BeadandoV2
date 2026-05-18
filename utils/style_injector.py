import streamlit as st

def inject_custom_css():
    
    custom_css = """
    <style>
        /* Alapértelmezett Streamlit menü, header és footer elrejtése */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        
        /* Fő gombok stílusának felülírása */
        .stButton>button {
            background-color: #2e6bc6;
            color: white;
            border-radius: 8px;
            border: none;
            padding: 10px 24px;
            font-weight: 600;
            transition: all 0.3s ease 0s;
        }
        .stButton>button:hover {
            background-color: #1a4f9c;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        /* Információs kártyák finomítása */
        div.stAlert {
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border-left: 5px solid #2e6bc6;
        }
    </style>
    """
    st.markdown(custom_css, unsafe_allow_html=True)