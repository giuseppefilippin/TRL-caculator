<?php
// Configurações do banco de dados
$servername = "localhost:3306";
$username = "root"; // Substitua pelo seu usuário do banco de dados
$password = "giuseppe123"; // Substitua pela sua senha
$dbname = "TRL"; // Nome do banco de dados

// Conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Função para deletar um registro
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $id = intval($_POST['delete_id']);
    $stmt = $conn->prepare("DELETE FROM trl_info WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "<p style='color: green;'>Registro ID $id deletado com sucesso!</p>";
    } else {
        echo "<p style='color: red;'>Erro ao deletar o registro: " . $stmt->error . "</p>";
    }
    $stmt->close();
}

// Consultar dados no banco de dados
$sql = "SELECT id, nome_tecnologia, nome_responsavel, data_avaliacao, nota_trl, comentarios FROM trl_info";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultados TRL</title>
    <link rel="stylesheet" href="../styles/resultados.css">
</head>
<body>
    <h1>Resultados Salvos</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome da Tecnologia</th>
                <th>Responsável</th>
                <th>Data de Avaliação</th>
                <th>Nota TRL</th>
                <th>Comentários</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            <?php
            if ($result->num_rows > 0) {
                // Exibir os dados na tabela
                while ($row = $result->fetch_assoc()) {
                    echo "<tr>
                            <td>{$row['id']}</td>
                            <td>{$row['nome_tecnologia']}</td>
                            <td>{$row['nome_responsavel']}</td>
                            <td>{$row['data_avaliacao']}</td>
                            <td>{$row['nota_trl']}</td>
                            <td>{$row['comentarios']}</td>
                            <td>
                                <form method='POST' style='display: inline;'>
                                    <input type='hidden' name='delete_id' value='{$row['id']}'>
                                    <button type='submit' class='delete-button'>Deletar</button>
                                </form>
                            </td>
                          </tr>";
                }
            } else {
                echo "<tr><td colspan='7'>Nenhum registro encontrado</td></tr>";
            }
            ?>
        </tbody>
    </table>
    <a href="../index.html"><button>Voltar</button></a>
</body>
</html>

<?php
// Fechar conexão
$conn->close();
?>
