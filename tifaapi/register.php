<?php
header('Content-Type: application/json');

// Configuración de la base de datos
$host = "localhost";
$dbname = "tifa"; // Cambia al nombre de tu BD
$user = "root";    // Usuario MySQL
$pass = "";        // Contraseña MySQL (vacío por defecto en XAMPP)

try {
    // Conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error conexión BD: " . $e->getMessage()]);
    exit;
}

// Obtener datos JSON del POST
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos JSON inválidos o no enviados"]);
    exit;
}

// Validar campos
$usuario = trim($data['usuario'] ?? '');
$correo = trim($data['correo'] ?? '');
$contraseña = $data['contraseña'] ?? '';

if (strlen($usuario) < 3) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El usuario debe tener al menos 3 caracteres"]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Correo inválido"]);
    exit;
}

if (strlen($contraseña) < 3) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "La contraseña debe tener al menos 3 caracteres"]);
    exit;
}

// Verificar usuario o correo existente
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE usuario = :usuario OR correo = :correo");
    $stmt->execute(['usuario' => $usuario, 'correo' => $correo]);
    $existe = $stmt->fetchColumn();

    if ($existe) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "El usuario o correo ya existe"]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en consulta BD: " . $e->getMessage()]);
    exit;
}

// Encriptar contraseña
$hashPassword = password_hash($contraseña, PASSWORD_DEFAULT);

// Insertar nuevo usuario
try {
    $stmt = $pdo->prepare("INSERT INTO usuarios (usuario, correo, contraseña, fecha_creacion) VALUES (:usuario, :correo, :contrasena, NOW())");
    $stmt->execute([
        'usuario' => $usuario,
        'correo' => $correo,
        'contrasena' => $hashPassword
    ]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        "success" => true,
        "message" => "Usuario registrado exitosamente",
        "user" => [
            "id" => $userId,
            "usuario" => $usuario,
            "correo" => $correo
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al registrar usuario: " . $e->getMessage()]);
}
