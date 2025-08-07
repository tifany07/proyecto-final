<?php
header('Content-Type: application/json');

$host = "localhost";
$dbname = "tifa";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error conexión BD: " . $e->getMessage()
    ]);
    exit;
}

$page = isset($_GET['page']) && is_numeric($_GET['page']) && $_GET['page'] > 0 ? (int)$_GET['page'] : 1;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$productora = isset($_GET['productora']) ? trim($_GET['productora']) : '';
$sort = isset($_GET['sort']) ? strtolower($_GET['sort']) : '';

$itemsPerPage = 10;
$offset = ($page - 1) * $itemsPerPage;

$whereClauses = [];
$params = [];

if ($search !== '') {
    $whereClauses[] = "p.titulo LIKE :search";
    $params['search'] = "%$search%";
}

if ($productora !== '') {
    $whereClauses[] = "p.casa_productora = :productora";
    $params['productora'] = $productora;
}

$whereSQL = '';
if (count($whereClauses) > 0) {
    $whereSQL = "WHERE " . implode(' AND ', $whereClauses);
}

$orderSQL = "";
if ($sort === 'asc') {
    $orderSQL = "ORDER BY p.presupuesto ASC";
} elseif ($sort === 'desc') {
    $orderSQL = "ORDER BY p.presupuesto DESC";
} else {
    $orderSQL = "ORDER BY p.id ASC";
}

try {
    // Total películas
    $countSql = "SELECT COUNT(*) FROM peliculas p $whereSQL";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalPeliculas = (int)$countStmt->fetchColumn();

    $totalPages = max(1, ceil($totalPeliculas / $itemsPerPage));

    // Obtener películas con join a directores para nombre
    $sql = "SELECT 
                p.id,
                p.titulo,
                p.presupuesto,
                d.nombre AS director,
                p.casa_productora,
                p.año_lanzamiento,
                p.genero
            FROM peliculas p
            LEFT JOIN directores d ON p.director_id = d.id
            $whereSQL
            $orderSQL
            LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);

    foreach ($params as $key => $val) {
        $stmt->bindValue(":$key", $val);
    }
    $stmt->bindValue(':limit', (int)$itemsPerPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

    $stmt->execute();
    $peliculas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener productoras únicas
    $prodStmt = $pdo->query("SELECT DISTINCT casa_productora FROM peliculas ORDER BY casa_productora ASC");
    $productoras = $prodStmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "success" => true,
        "peliculas" => $peliculas,
        "totalPages" => $totalPages,
        "totalPeliculas" => $totalPeliculas,
        "productoras" => $productoras
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en consulta BD: " . $e->getMessage()
    ]);
}
