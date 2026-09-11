<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

function guestbook_admin_response(bool $success, string $message, array $data = [], int $status = 200, bool $include_data = false, ?int $count = null)
{
    http_response_code($status);
    $payload = ['success' => $success, 'message' => $message];
    if ($include_data) {
        $payload['data'] = $data;
    }
    if ($count !== null) {
        $payload['count'] = $count;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function guestbook_admin_is_authenticated(): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    return !empty($_SESSION['guestbook_admin_authenticated']);
}

function guestbook_admin_require_auth(): void
{
    if (!guestbook_admin_is_authenticated()) {
        guestbook_admin_response(false, 'ไม่ได้เข้าสู่ระบบ', [], 401);
    }
}

function guestbook_admin_validate_status(string $status): bool
{
    return in_array($status, ['approved', 'hidden'], true);
}

try {
    $database = guestbook_database();
} catch (Throwable $error) {
    guestbook_admin_response(false, 'ไม่สามารถดำเนินการได้ในขณะนี้', [], 503);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    guestbook_admin_require_auth();

    $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);
    $limit = $limit === false || $limit === null ? 20 : max(1, min($limit, 20));

    $offset = filter_input(INPUT_GET, 'offset', FILTER_VALIDATE_INT);
    $offset = $offset === false || $offset === null ? 0 : max(0, min($offset, 10000));

    $requestedStatus = trim((string) ($_GET['status'] ?? ''));
    if ($requestedStatus !== 'pending') {
        $database->close();
        guestbook_admin_response(false, 'status ไม่ถูกต้อง', [], 400);
    }

    $countStatement = $database->prepare('SELECT COUNT(*) FROM guestbook WHERE status = ?');
    if (!$countStatement) {
        $database->close();
        guestbook_admin_response(false, 'ไม่สามารถดึงคำอวยพรได้', [], 500);
    }

    $countStatus = 'pending';
    $countStatement->bind_param('s', $countStatus);
    $countStatement->execute();
    $countStatement->bind_result($total);
    $countStatement->fetch();
    $countStatement->close();

    $statement = $database->prepare(
        'SELECT id, name, message, created_at
         FROM guestbook
         WHERE status = ?
         ORDER BY created_at DESC, id DESC
         LIMIT ? OFFSET ?'
    );

    if (!$statement) {
        $database->close();
        guestbook_admin_response(false, 'ไม่สามารถดึงคำอวยพรได้', [], 500);
    }

    $status = 'pending';
    $statement->bind_param('sii', $status, $limit, $offset);
    if (!$statement->execute()) {
        $statement->close();
        $database->close();
        guestbook_admin_response(false, 'ไม่สามารถดึงคำอวยพรได้', [], 503);
    }

    $statement->bind_result($id, $name, $message, $created_at);
    $messages = [];
    while ($statement->fetch()) {
        $messages[] = [
            'id' => $id,
            'name' => $name,
            'message' => $message,
            'created_at' => $created_at,
        ];
    }
    $statement->close();
    $database->close();

    guestbook_admin_response(true, 'ดึงคำอวยพรสำเร็จ', $messages, 200, true, (int) $total);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $database->close();
    guestbook_admin_response(false, 'ไม่รองรับคำขอนี้', [], 405);
}

$body = file_get_contents('php://input');
$payload = json_decode($body ?: '', true);

if (!is_array($payload)) {
    $database->close();
    guestbook_admin_response(false, 'ข้อมูลไม่ถูกต้อง', [], 400);
}

$action = trim((string) ($payload['action'] ?? ''));

if ($action === 'login') {
    $password = trim((string) ($payload['password'] ?? ''));
    $adminPassword = getenv('GUESTBOOK_ADMIN_PASSWORD');

    if ($adminPassword === false || $adminPassword === '' || !hash_equals($adminPassword, $password)) {
        $database->close();
        guestbook_admin_response(false, 'รหัสผ่านไม่ถูกต้อง', [], 401);
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION['guestbook_admin_authenticated'] = true;
    $database->close();
    guestbook_admin_response(true, 'เข้าสู่ระบบสำเร็จ');
}

if ($action === 'logout') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    $database->close();
    guestbook_admin_response(true, 'ออกจากระบบสำเร็จ');
}

guestbook_admin_require_auth();

$id = filter_var($payload['id'] ?? null, FILTER_VALIDATE_INT);
if ($id === false || $id === null || $id <= 0) {
    $database->close();
    guestbook_admin_response(false, 'ไอดีไม่ถูกต้อง', [], 400);
}

$status = trim((string) ($payload['status'] ?? ''));
if (!guestbook_admin_validate_status($status)) {
    $database->close();
    guestbook_admin_response(false, 'status ไม่ถูกต้อง', [], 400);
}

$checkStatement = $database->prepare('SELECT id FROM guestbook WHERE id = ? LIMIT 1');
if (!$checkStatement) {
    $database->close();
    guestbook_admin_response(false, 'ไม่สามารถดำเนินการได้', [], 500);
}

$checkStatement->bind_param('i', $id);
$checkStatement->execute();
$checkStatement->store_result();
$exists = $checkStatement->num_rows > 0;
$checkStatement->close();

if (!$exists) {
    $database->close();
    guestbook_admin_response(false, 'ไม่พบคำอวยพรนี้', [], 404);
}

$updateStatement = $database->prepare('UPDATE guestbook SET status = ? WHERE id = ? AND status = ?');
if (!$updateStatement) {
    $database->close();
    guestbook_admin_response(false, 'ไม่สามารถดำเนินการได้', [], 500);
}

$oldStatus = 'pending';
$updateStatement->bind_param('sis', $status, $id, $oldStatus);
if (!$updateStatement->execute()) {
    $updateStatement->close();
    $database->close();
    guestbook_admin_response(false, 'ไม่สามารถดำเนินการได้', [], 503);
}

$affectedRows = $updateStatement->affected_rows;
$updateStatement->close();
$database->close();

if ($affectedRows !== 1) {
    guestbook_admin_response(false, 'ไม่สามารถเปลี่ยนสถานะได้', [], 409);
}

guestbook_admin_response(true, 'เปลี่ยนสถานะสำเร็จ');
