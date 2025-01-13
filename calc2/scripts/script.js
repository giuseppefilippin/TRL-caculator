// Perguntas TRL organizadas por nível
const perguntas = [
    { nivel: "TRL 1", texto: "Os princípios básicos da tecnologia foram observados?" },
    { nivel: "TRL 1", texto: "Foram identificadas potenciais aplicações para a tecnologia?" },
    { nivel: "TRL 2", texto: "O conceito tecnológico foi formulado?" },
    { nivel: "TRL 2", texto: "Foi realizada uma prova de conceito experimental?" },
    { nivel: "TRL 3", texto: "A tecnologia foi validada em ambiente de laboratório?" }
  ];
  
  let respostas = {};
  
  // Adicionar perguntas à tabela
  const questionsTable = document.getElementById("questionsTable");
  
  perguntas.forEach((pergunta, index) => {
    const row = document.createElement("tr");
  
    // Porcentagem (placeholder por enquanto)
    const percentCell = document.createElement("td");
    percentCell.textContent = "0%";
    row.appendChild(percentCell);
  
    // Pergunta
    const questionCell = document.createElement("td");
    questionCell.textContent = `${pergunta.nivel}: ${pergunta.texto}`;
    row.appendChild(questionCell);
  
    // Resposta
    const answerCell = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option>`;
    select.onchange = () => {
      respostas[index] = select.value;
      atualizarProgresso(); // Atualizar progresso sempre que uma resposta for alterada
    };
    answerCell.appendChild(select);
    row.appendChild(answerCell);
  
    // Comentários
    const commentCell = document.createElement("td");
    const textarea = document.createElement("textarea");
    commentCell.appendChild(textarea);
    row.appendChild(commentCell);
  
    questionsTable.appendChild(row);
  });
  
  // Função para calcular o progresso
  function atualizarProgresso() {
    // Contar perguntas respondidas como "Sim"
    const progressoPorNivel = {};
    perguntas.forEach((pergunta, index) => {
      const resposta = respostas[index];
      const nivel = pergunta.nivel;
  
      if (!progressoPorNivel[nivel]) {
        progressoPorNivel[nivel] = { total: 0, sim: 0 };
      }
  
      progressoPorNivel[nivel].total++;
      if (resposta === "sim") {
        progressoPorNivel[nivel].sim++;
      }
    });
  
    // Atualizar a tabela com os percentuais
    const rows = questionsTable.querySelectorAll("tr");
    perguntas.forEach((pergunta, index) => {
      const nivel = pergunta.nivel;
      const progresso = progressoPorNivel[nivel];
      const porcentagem = Math.round((progresso.sim / progresso.total) * 100);
  
      // Atualizar a célula correspondente
      const percentCell = rows[index].querySelector("td");
      percentCell.textContent = `${porcentagem}%`;
    });
  }
  
  // Calcular TRL
  document.getElementById("submitButton").onclick = () => {
    const nivel = Object.values(respostas).filter((resposta) => resposta === "sim").length;
    alert(`O nível TRL calculado é: ${nivel}`);
  };
  