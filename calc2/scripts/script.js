let respostas = {}; // Objeto global para armazenar respostas
let comentarios = {}; // Armazena comentários por nível
let nivelAtual = 0; // Controla o nível atual exibido

// Função para exibir a etapa 2 (perguntas)
function iniciarAvaliacao() {
  const nomeTecnologia = document.getElementById("nomeTecnologia").value.trim();
  const nomeResponsavel = document.getElementById("nomeResponsavel").value.trim();
  const dataAvaliacao = document.getElementById("dataAvaliacao").value;

  // Validação dos campos obrigatórios
  if (!nomeTecnologia || !nomeResponsavel || !dataAvaliacao) {
    alert("Por favor, preencha todos os campos antes de continuar.");
    return;
  }

  // Salvar os dados no localStorage (opcional)
  localStorage.setItem("nomeTecnologia", nomeTecnologia);
  localStorage.setItem("nomeResponsavel", nomeResponsavel);
  localStorage.setItem("dataAvaliacao", dataAvaliacao);

  // Trocar de tela (de step1 para step2)
  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.add("active");

  // Iniciar a exibição do nível atual
  exibirNivel(nivelAtual);
}

// Associar a função ao botão
document.getElementById("startButton").onclick = iniciarAvaliacao;

// Inicializar a página com step1 ativo
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("step1").classList.add("active");
});

// Função para carregar perguntas de um arquivo JSON
async function carregarPerguntas() {
  try {
    const response = await fetch('scripts/perguntas.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar perguntas:", error);
    alert("Erro ao carregar perguntas. Verifique o console.");
    return [];
  }
}

// Função para exibir um nível de perguntas por vez
async function exibirNivel(nivel) {
  const perguntas = await carregarPerguntas();
  const nivelSelecionado = perguntas[nivel];
  const questionsTable = document.getElementById("questionsTable");
  questionsTable.innerHTML = "";

  nivelSelecionado.perguntas.forEach((pergunta) => {
    const row = document.createElement("tr");

    const percentCell = document.createElement("td");
    percentCell.textContent = "0%";
    row.appendChild(percentCell);

    const questionCell = document.createElement("td");
    questionCell.textContent = `${nivelSelecionado.nivel}: ${pergunta}`;
    row.appendChild(questionCell);

    const answerCell = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option>`;
    select.onchange = () => {
      respostas[pergunta] = select.value;
      atualizarProgresso();
    };
    answerCell.appendChild(select);
    row.appendChild(answerCell);

    questionsTable.appendChild(row);
  });

  const comentariosNivel = document.getElementById("comentariosNivel");
  comentariosNivel.value = comentarios[nivel] || "";
  comentariosNivel.onchange = () => {
    comentarios[nivel] = comentariosNivel.value;
  };

  atualizarProgresso();
}

// Função para atualizar o progresso
function atualizarProgresso() {
  const progressoPorNivel = {};
  const perguntas = document.querySelectorAll("tr");

  perguntas.forEach((row) => {
    const nivelCell = row.querySelector("td:nth-child(2)");
    const select = row.querySelector("select");

    if (nivelCell && select) {
      const nivelTexto = nivelCell.textContent.split(":")[0].trim();
      const resposta = select.value;

      if (!progressoPorNivel[nivelTexto]) {
        progressoPorNivel[nivelTexto] = { total: 0, sim: 0 };
      }

      progressoPorNivel[nivelTexto].total++;
      if (resposta === "sim") {
        progressoPorNivel[nivelTexto].sim++;
      }
    }
  });

  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const nivelCell = row.querySelector("td:nth-child(2)");
    const percentCell = row.querySelector("td:nth-child(1)");

    if (nivelCell && percentCell) {
      const nivelTexto = nivelCell.textContent.split(":")[0].trim();
      const progresso = progressoPorNivel[nivelTexto];

      if (progresso) {
        const porcentagem = Math.round((progresso.sim / progresso.total) * 100);
        percentCell.textContent = `${porcentagem}%`;
      }
    }
  });
}


// Função para calcular o TRL
document.getElementById("submitButton").onclick = async () => {
  const perguntas = await carregarPerguntas();
  let nivelCalculado = 0;

  perguntas.forEach((nivel, i) => {
    const todasSim = nivel.perguntas.every((pergunta) => respostas[pergunta] === "sim");
    if (todasSim) nivelCalculado = i + 1;
  });

  alert(`O nível TRL calculado é: ${nivelCalculado}`);
};

// Navegação entre níveis
document.getElementById("prevButton").onclick = () => {
  if (nivelAtual > 0) nivelAtual--;
  exibirNivel(nivelAtual);
};

document.getElementById("nextButton").onclick = async () => {
  const perguntas = await carregarPerguntas();
  if (nivelAtual < perguntas.length - 1) nivelAtual++;
  exibirNivel(nivelAtual);
};

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("step1").classList.add("active");
});
