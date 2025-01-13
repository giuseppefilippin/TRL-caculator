let respostas = {}; // Objeto global para armazenar respostas
let nivelAtual = 0; // Controla o nível atual exibido

// Função para carregar perguntas de um arquivo JSON
async function carregarPerguntas() {
  try {
    const response = await fetch('scripts/perguntas.json'); // Carrega o arquivo JSON
    if (!response.ok) {
      throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar as perguntas. Verifique o console para mais detalhes.");
    return [];
  }
}

// Função para exibir um nível de perguntas por vez
async function exibirNivel(nivel) {
  const perguntas = await carregarPerguntas();
  const nivelSelecionado = perguntas[nivel];
  const questionsTable = document.getElementById("questionsTable");
  questionsTable.innerHTML = ""; // Limpa a tabela antes de adicionar o novo nível

  // Adicionar perguntas à tabela
  nivelSelecionado.perguntas.forEach((pergunta) => {
    const row = document.createElement("tr");

    // Porcentagem
    const percentCell = document.createElement("td");
    percentCell.textContent = "0%";
    row.appendChild(percentCell);

    // Pergunta
    const questionCell = document.createElement("td");
    questionCell.textContent = `${nivelSelecionado.nivel}: ${pergunta}`;
    row.appendChild(questionCell);

    // Resposta
    const answerCell = document.createElement("td");
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option>`;
    // Carregar resposta salva, se existir
    if (respostas[pergunta]) {
      select.value = respostas[pergunta];
    }
    select.onchange = () => {
      respostas[pergunta] = select.value; // Salvar a resposta
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

  atualizarProgresso(); // Atualizar progresso ao carregar o nível
}

// Função para calcular o progresso
function atualizarProgresso() {
  const progressoPorNivel = {};
  const perguntas = document.querySelectorAll("tr");

  perguntas.forEach((row) => {
    const nivelCell = row.querySelector("td:nth-child(2)");
    const select = row.querySelector("select");

    if (nivelCell && select) {
      const nivelTexto = nivelCell.textContent.split(":")[0].trim(); // Extrai o nível TRL
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

  // Atualizar a tabela com os percentuais
  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const nivelCell = row.querySelector("td:nth-child(2)");
    const percentCell = row.querySelector("td:nth-child(1)");

    if (nivelCell && percentCell) {
      const nivelTexto = nivelCell.textContent.split(":")[0].trim(); // Extrai o nível TRL
      const progresso = progressoPorNivel[nivelTexto];

      if (progresso) {
        const porcentagem = Math.round((progresso.sim / progresso.total) * 100);
        percentCell.textContent = `${porcentagem}%`;
      }
    }
  });
}

// Navegação entre níveis
document.getElementById("prevButton").onclick = () => {
  if (nivelAtual > 0) {
    nivelAtual--;
    exibirNivel(nivelAtual);
  }
};

document.getElementById("nextButton").onclick = () => {
  if (nivelAtual < 8) { // Total de níveis é 9 (0 a 8)
    nivelAtual++;
    exibirNivel(nivelAtual);
  }
};

// Calcular o TRL ao final
document.getElementById("submitButton").onclick = async () => {
  const perguntas = await carregarPerguntas(); // Carrega todas as perguntas
  let nivelCalculado = 0;

  for (let i = 0; i < perguntas.length; i++) {
    const nivel = perguntas[i];
    const todasSim = nivel.perguntas.every((pergunta) => respostas[pergunta] === "sim");

    if (todasSim) {
      nivelCalculado = i + 1; // O TRL começa em 1
    } else {
      break; // Para o cálculo se um nível não estiver completo
    }
  }

  alert(`O nível TRL calculado é: ${nivelCalculado}`);
};

// Inicializar com o primeiro nível
document.addEventListener("DOMContentLoaded", () => exibirNivel(nivelAtual));
