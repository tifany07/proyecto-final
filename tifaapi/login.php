<?php
// NO headers CORS aquí, están en .htaccess
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tifa";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

// Obtener datos JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correo = $data['correo'] ?? '';
    $contraseña = $data['contraseña'] ?? '';
    
    if (empty($correo) || empty($contraseña)) {
        echo json_encode(['success' => false, 'message' => 'Correo y contraseña son requeridos']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($contraseña, $user['contraseña'])) {
            unset($user['contraseña']);
            echo json_encode(['success' => true, 'user' => $user, 'message' => 'Login exitoso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>