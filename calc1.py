import streamlit as st # type: ignore

# Lista de perguntas e critérios
perguntas = [
    "Os princípios básicos da tecnologia foram observados?",
    "O conceito tecnológico foi formulado?",
    "Foi realizada uma prova de conceito experimental?",
    "A tecnologia foi validada em ambiente de laboratório?",
    "A tecnologia foi validada em ambiente relevante?",
    "A tecnologia foi demonstrada em ambiente relevante?",
    "O protótipo foi demonstrado em ambiente operacional?",
    "A tecnologia está qualificada e pronta para uso?",
    "A tecnologia foi comprovada em operações reais?"
]

# Página inicial
st.title("Calculadora TRL (versão beta)")
st.write("Responda às perguntas abaixo para determinar o nível de prontidão tecnológica (TRL).")

# Controle de progresso
indice = st.session_state.get("indice", 0)
trl = st.session_state.get("trl", 0)

# Exibir pergunta atual
if indice < len(perguntas):
    st.subheader(perguntas[indice])
    
    # Botões de resposta
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Sim"):
            st.session_state["trl"] = trl + 1
            st.session_state["indice"] = indice + 1
    with col2:
        if st.button("Não"):
            st.session_state["indice"] = len(perguntas)  # Finaliza as perguntas
else:
    # Exibir resultado final
    st.success(f"O nível TRL calculado é: {trl}")
    if st.button("Reiniciar"):
        st.session_state["indice"] = 0
        st.session_state["trl"] = 0
