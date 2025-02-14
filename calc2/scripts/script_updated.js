let respostas = {}; // Objeto global para armazenar respostas
let comentarios = {}; // Armazena comentários
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
    const response = await fetch('scripts/perguntas_software.json');
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
  // Carregar perguntas e configurar a tabela
  const perguntas = await carregarPerguntas();
  const nivelSelecionado = perguntas[nivel];
  const questionsTable = document.getElementById("questionsTable");
  questionsTable.innerHTML = ""; // Limpa a tabela antes de adicionar o novo nível

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
    select.onchange = () => {
      respostas[pergunta] = select.value;
      atualizarProgresso();
    };
    answerCell.appendChild(select);
    row.appendChild(answerCell);

    // Comentários
    const commentCell = document.createElement("td");
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Adicione comentários";
    textarea.onchange = () => {
      comentarios[pergunta] = textarea.value;
    };
    commentCell.appendChild(textarea);
    row.appendChild(commentCell);

    questionsTable.appendChild(row);
  });

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
  let notaTRL = 0;

  for (let i = 0; i < perguntas.length; i++) {
    const nivel = perguntas[i];
    const todasSim = nivel.perguntas.every((pergunta) => respostas[pergunta] === "sim");

    if (todasSim) {
      notaTRL = i + 1;
    } else {
      break;
    }
  }

  console.log("Nota TRL:", notaTRL);
  
  alert(`O nível TRL calculado é: ${notaTRL}`);
  salvarDadosNoBanco(notaTRL);
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

function salvarDadosNoBanco(notaTRL) {
  const nomeTecnologia = localStorage.getItem("nomeTecnologia");
  const nomeResponsavel = localStorage.getItem("nomeResponsavel");
  const dataAvaliacao = localStorage.getItem("dataAvaliacao");
  const comentarios = document.getElementById("nivelComentarios")?.value || "";

  if (!nomeTecnologia || !nomeResponsavel || !dataAvaliacao) {
    console.error("Erro: Nome da tecnologia, responsável ou data não encontrados.");
    alert("Erro ao salvar os dados. Verifique os campos preenchidos.");
    return;
  }

  const dados = {
    nomeTecnologia,
    nomeResponsavel,
    dataAvaliacao,
    notaTRL,
    comentarios,
  };

  fetch("database/arquivos.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Resposta do servidor:", data);
      alert(data);
    })
    .catch((error) => {
      console.error("Erro ao salvar os dados:", error);
      alert("Erro ao salvar os dados no banco de dados.");
    });
}

document.getElementById("homeLink").onclick = () => {
  // Garantir que apenas a aba do formulário esteja ativa
  document.getElementById("step1").classList.add("active");
  document.getElementById("step2").classList.remove("active");
};

document.getElementById("viewResultsButton").onclick = () => {
  window.location.href = "database/resultados.php"; // Caminho para a página de resultados
};


// Pesos das perguntas por TRL
const pesosPorTRL = {
    "TRL 1": 1.5,
    "TRL 2": 1.5,
    "TRL 3": 1.5,
    "TRL 4": 1.8,
    "TRL 5": 1.8,
    "TRL 6": 2.0,
    "TRL 7": 2.0,
    "TRL 8": 2.2,
    "TRL 9": 2.5
};

// Nota mínima por TRL (80%)
const notaMinima = 0.5;

// Função para calcular o TRL usando média ponderada
function calcularTRL() {
    let respostas = {};

    document.querySelectorAll(".resposta").forEach(select => {
        const nivel = select.getAttribute("data-nivel");
        const pergunta = select.getAttribute("data-pergunta");
        const valor = parseFloat(select.value);

        if (!respostas[nivel]) respostas[nivel] = { totalPeso: 0, somaPonderada: 0, totalPerguntas: 0, respondidasSim: 0 };

        const peso = pesosPorTRL[nivel];
        respostas[nivel].totalPeso += peso;
        respostas[nivel].totalPerguntas += 1;

        if (!isNaN(valor)) {
            respostas[nivel].somaPonderada += valor * peso;
            if (valor === 1) respostas[nivel].respondidasSim += 1;
        }
    });

    let TRL_final = "TRL 1";
    Object.keys(respostas).forEach(nivel => {
        const percentualSim = respostas[nivel].respondidasSim / respostas[nivel].totalPerguntas;
        if (percentualSim >= notaMinima) {
            TRL_final = nivel;
        }
    });

    alert(`O TRL final do projeto é: ${TRL_final}`);
}
