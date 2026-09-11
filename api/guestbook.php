<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

function guestbook_response(bool $success, string $message, array $data = [], int $status = 200, bool $include_data = false)
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message] + ($include_data ? ['data' => $data] : []),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function guestbook_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

try {
    $database = guestbook_database();
} catch (Throwable $error) {
    guestbook_response(false, 'ไม่สามารถดำเนินการได้ในขณะนี้', [], 503);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);
    $limit = $limit === false || $limit === null ? 6 : max(1, min($limit, 20));

    $statement = $database->prepare(
        'SELECT id, name, message, created_at
         FROM guestbook
         WHERE status = ?
         ORDER BY created_at DESC
         LIMIT ?'
    );

    if (!$statement) {
        guestbook_response(false, 'ไม่สามารถดึงคำอวยพรได้', [], 500);
    }

    $status = 'approved';
    $statement->bind_param('si', $status, $limit);
    $statement->execute();
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

    guestbook_response(true, 'ดึงคำอวยพรสำเร็จ', $messages, 200, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    guestbook_response(false, 'ไม่รองรับคำขอนี้', [], 405);
}

$body = file_get_contents('php://input');
$payload = json_decode($body ?: '', true);

if (!is_array($payload)) {
    guestbook_response(false, 'ข้อมูลไม่ถูกต้อง', [], 400);
}

$name = trim((string) ($payload['name'] ?? ''));
$message = trim((string) ($payload['message'] ?? ''));

if ($name === '' || $message === '') {
    guestbook_response(false, 'กรุณากรอกชื่อและคำอวยพร', [], 422);
}

if (guestbook_length($name) > 100 || guestbook_length($message) > 2000) {
    guestbook_response(false, 'ข้อมูลยาวเกินกำหนด', [], 422);
}

$duplicate = $database->prepare(
    'SELECT id FROM guestbook
     WHERE name = ? AND message = ? AND created_at >= (CURRENT_TIMESTAMP - INTERVAL 60 SECOND)
     LIMIT 1'
);

if (!$duplicate) {
    guestbook_response(false, 'ไม่สามารถส่งคำอวยพรได้', [], 500);
}

$duplicate->bind_param('ss', $name, $message);
$duplicate->execute();
$duplicate->store_result();
$is_duplicate = $duplicate->num_rows > 0;
$duplicate->close();

if ($is_duplicate) {
    $database->close();
    guestbook_response(false, 'คำอวยพรนี้ถูกส่งไปแล้ว กรุณารอสักครู่', [], 429);
}

$status = 'pending';
$statement = $database->prepare(
    'INSERT INTO guestbook (name, message, status) VALUES (?, ?, ?)'
);

if (!$statement) {
    guestbook_response(false, 'ไม่สามารถส่งคำอวยพรได้', [], 500);
}

$statement->bind_param('sss', $name, $message, $status);
$inserted = $statement->execute();
$statement->close();
$database->close();

if (!$inserted) {
    guestbook_response(false, 'ไม่สามารถส่งคำอวยพรได้', [], 500);
}

guestbook_response(true, 'ส่งคำอวยพรเรียบร้อยแล้ว');
