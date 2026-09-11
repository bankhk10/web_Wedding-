<?php

declare(strict_types=1);

// Development values are supplied by Docker Compose. Set these environment
// variables on the production PHP host with the InfinityFree values.
define('DB_HOST', getenv('DB_HOST') ?: 'DB_HOST');
define('DB_NAME', getenv('DB_NAME') ?: 'DB_NAME');
define('DB_USER', getenv('DB_USER') ?: 'DB_USER');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'DB_PASSWORD');

date_default_timezone_set('Asia/Bangkok');

function guestbook_database(): mysqli
{
    mysqli_report(MYSQLI_REPORT_OFF);
    $database = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

    if ($database->connect_errno) {
        throw new RuntimeException('Database connection failed');
    }

    $database->set_charset('utf8mb4');
    return $database;
}
