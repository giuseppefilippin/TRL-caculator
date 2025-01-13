<?php
// Configurações do banco de dados
$servername = "localhost:3306";
$username = "root";
$password = "giuseppe123";
$dbname = "TRL";

// Conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Receber dados do POST ou JSON
$data = json_decode(file_get_contents("php://input"), true);

// Certifique-se de que os dados foram enviados corretamente
if (!$data) {
    die("Erro: Nenhum dado recebido. Certifique-se de que está enviando um JSON válido.");
}

// Extrair os dados do JSON
$nomeTecnologia = $data['nomeTecnologia'] ?? null;
$nomeResponsavel = $data['nomeResponsavel'] ?? null;
$dataAvaliacao = $data['dataAvaliacao'] ?? null;
$notaTRL = $data['notaTRL'] ?? null;
$comentarios = $data['comentarios'] ?? '';

// Validar os dados
if (!$nomeTecnologia || !$nomeResponsavel || !$dataAvaliacao || $notaTRL === null) {
    die("Erro: Dados incompletos. Certifique-se de enviar nomeTecnologia, nomeResponsavel, dataAvaliacao e notaTRL.");
}

// Inserir dados no banco de dados
$sql = "INSERT INTO trl_info (nome_tecnologia, nome_responsavel, data_avaliacao, nota_trl, comentarios)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Erro na preparação da consulta: " . $conn->error);
}

$stmt->bind_param("sssds", $nomeTecnologia, $nomeResponsavel, $dataAvaliacao, $notaTRL, $comentarios);

if ($stmt->execute()) {
    echo "Dados salvos com sucesso!";
} else {
    echo "Erro ao salvar os dados: " . $stmt->error;
}

// Fechar conexão
$stmt->close();
$conn->close();
?>
