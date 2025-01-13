// Perguntas TRL
const perguntas = [
    "Os princípios básicos da tecnologia foram observados?",
    "O conceito tecnológico foi formulado?",
    "Foi realizada uma prova de conceito experimental?",
    "A tecnologia foi validada em ambiente de laboratório?",
    "A tecnologia foi validada em ambiente relevante?",
    "A tecnologia foi demonstrada em ambiente relevante?",
    "O protótipo foi demonstrado em ambiente operacional?",
    "A tecnologia está qualificada e pronta para uso?",
    "A tecnologia foi comprovada em operações reais?"
  ];
  
  let indice = 0;
  let trl = 0;
  
  const questionElement = document.getElementById("question");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  
  // Atualizar a pergunta ou mostrar o resultado final
  function atualizarPergunta(resposta) {
    if (resposta === "sim") {
      trl++;
    }
    indice++;
  
    if (indice < perguntas.length) {
      questionElement.textContent = perguntas[indice];
    } else {
      questionElement.textContent = `O nível TRL calculado é: ${trl}`;
      yesButton.style.display = "none";
      noButton.textContent = "Reiniciar";
      noButton.onclick = reiniciar;
    }
  }
  
  // Reiniciar a calculadora
  function reiniciar() {
    indice = 0;
    trl = 0;
    questionElement.textContent = perguntas[indice];
    yesButton.style.display = "inline-block";
    noButton.textContent = "Não";
    noButton.onclick = () => atualizarPergunta("nao");
  }
  
  // Configurar eventos dos botões
  yesButton.onclick = () => atualizarPergunta("sim");
  noButton.onclick = () => atualizarPergunta("nao");
  