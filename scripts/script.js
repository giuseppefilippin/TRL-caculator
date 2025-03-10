let respostas = {}; // Objeto global para armazenar respostas
let comentarios = {}; // Armazena comentários
let nivelAtual = 0; // Controla o nível atual exibido

// Função auxiliar para atribuir pesos às perguntas dinamicamente
function getPesosPergunta(nivel, pergunta) {
  // Pesos baseados no nível TRL
  const pesosPorNivel = {
    "TRL 1": 1.5,  // Peso base para perguntas do TRL 1
    "TRL 2": 1.6,  // Peso base aumenta conforme o nível
    "TRL 3": 1.7,
    "TRL 4": 1.8,
    "TRL 5": 1.9,
    "TRL 6": 2.0,
    "TRL 7": 2.1,
    "TRL 8": 2.2,
    "TRL 9": 2.3
  };

  // Pegar o número do TRL do início da string do nível
  const trlNum = nivel.split(":")[0].trim();
  const pesoBase = pesosPorNivel[trlNum] || 1.0;

  // Ajustar peso baseado em palavras-chave importantes na pergunta
  let pesoAjustado = pesoBase;
  
  const palavrasChave = {
    alto: ["crítico", "crítica", "essencial", "fundamental", "segurança", "legal", "regulamentação", "LGPD", "produção"],
    medio: ["teste", "validação", "documentação", "requisito", "funcionalidade", "desempenho"],
    baixo: ["identificado", "levantado", "definido", "iniciado"]
  };

  // Aumenta peso para palavras-chave importantes
  if (palavrasChave.alto.some(palavra => pergunta.toLowerCase().includes(palavra))) {
    pesoAjustado *= 1.3;
  } else if (palavrasChave.medio.some(palavra => pergunta.toLowerCase().includes(palavra))) {
    pesoAjustado *= 1.1;
  } else if (palavrasChave.baixo.some(palavra => pergunta.toLowerCase().includes(palavra))) {
    pesoAjustado *= 0.9;
  }

  return Math.round(pesoAjustado * 100) / 100; // Arredonda para 2 casas decimais
}

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

  // Salvar os dados no localStorage
  localStorage.setItem("nomeTecnologia", nomeTecnologia);
  localStorage.setItem("nomeResponsavel", nomeResponsavel);
  localStorage.setItem("dataAvaliacao", dataAvaliacao);

  // Trocar de tela (de step1 para step2)
  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.add("active");

  // Iniciar a exibição do nível atual
  exibirNivel(nivelAtual);
}

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
  const perguntas = await carregarPerguntas();
  const nivelSelecionado = perguntas[nivel];
  const questionsTable = document.getElementById("questionsTable");
  questionsTable.innerHTML = "";

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
      const [nivel, pergunta] = nivelCell.textContent.split(":");
      const resposta = select.value;

      if (!progressoPorNivel[nivel]) {
        progressoPorNivel[nivel] = { 
          somaPesos: 0, 
          somaPontos: 0 
        };
      }

      const peso = getPesosPergunta(nivel, pergunta);
      progressoPorNivel[nivel].somaPesos += peso;
      
      if (resposta === "sim") {
        progressoPorNivel[nivel].somaPontos += peso;
      }
    }
  });

  // Atualiza as porcentagens na interface
  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const nivelCell = row.querySelector("td:nth-child(2)");
    const percentCell = row.querySelector("td:nth-child(1)");

    if (nivelCell && percentCell) {
      const nivel = nivelCell.textContent.split(":")[0].trim();
      const progresso = progressoPorNivel[nivel];

      if (progresso) {
        const porcentagem = Math.round((progresso.somaPontos / progresso.somaPesos) * 100);
        percentCell.textContent = `${porcentagem}%`;
      }
    }
  });
}

// Função para calcular o TRL com média ponderada
async function calcularTRL() {
  const perguntas = await carregarPerguntas();
  let nivelTRL = 0;
  const threshold = 0.8; // 80% como threshold padrão

  // Itera sobre cada nível TRL
  for (let i = 0; i < perguntas.length; i++) {
    const nivel = perguntas[i];
    let somaPesos = 0;
    let somaPontos = 0;

    // Calcula a média ponderada para o nível atual
    nivel.perguntas.forEach((pergunta) => {
      const peso = getPesosPergunta(nivel.nivel, pergunta);
      somaPesos += peso;
      
      if (respostas[pergunta] === "sim") {
        somaPontos += peso;
      }
    });

    const mediaPonderada = somaPontos / somaPesos;

    // Verifica se atingiu o threshold para este nível
    if (mediaPonderada >= threshold) {
      nivelTRL = i + 1;
    } else {
      break;
    }
  }

  console.log("Nota TRL:", nivelTRL);
  alert(`O nível TRL calculado é: ${nivelTRL}`);
  salvarDadosNoBanco(nivelTRL);
}
/*
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
*/
// Event Listeners
document.getElementById("startButton").onclick = iniciarAvaliacao;
document.getElementById("submitButton").onclick = calcularTRL;

document.getElementById("prevButton").onclick = () => {
  if (nivelAtual > 0) nivelAtual--;
  exibirNivel(nivelAtual);
};

document.getElementById("nextButton").onclick = async () => {
  const perguntas = await carregarPerguntas();
  if (nivelAtual < perguntas.length - 1) nivelAtual++;
  exibirNivel(nivelAtual);
};

document.getElementById("homeLink").onclick = (event) => {
  console.log("funciona porra");
  event.preventDefault(); // Impede a navegação padrão do link
  document.getElementById("step1").classList.add("active");
  document.getElementById("step2").classList.remove("active");
  window.location.href = "index.html"; // Ou o caminho correto para voltar ao menu
};

document.getElementById("viewResultsButton").onclick = () => {
  window.location.href = "database/resultados.php";
};

// Inicializar a página
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("step1").classList.add("active");
});