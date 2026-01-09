<?php
include("logic/levelCode.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST["save"] ?? '') === "true" && isset($_SESSION["level_data"])) {

    $sendResult = "";
    $success = true;

    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $checkAgree = $_POST["checkAgree"] ?? "";

    // Validate input
    if ($name === "") {
        $success = false;
        $sendResult .= "<div class=\"alert alert-danger\">Please enter your name.</div>";
    }

    if ($checkAgree !== "on") {
        $success = false;
        $sendResult .= "<div class=\"alert alert-danger\">Please accept the conditions.</div>";
    }

    if ($success) {
        // Generate XML
        $xmlContent = getLevelCode($name);

        // Parse XML
        $xml = simplexml_load_string($xmlContent);
        if ($xml === false) {
            die("<div class=\"alert alert-danger\">Error parsing XML.</div>");
        }

        // Normalize whitespace in attributes
        $normalizeString = function($str) {
            return trim(preg_replace('/\s+/', ' ', $str));
        };

        // Build payload
        $payload = [
            'name'     => (string) $xml['author'] ?? $name,
            'email'    => $email ?: null,
            'color'    => $normalizeString((string) $xml['color']),
            'modifier' => $normalizeString((string) $xml['modifier']),
            'solution' => (string) $xml['solution'],
        ];

        // Convert to JSON
        $jsonPayload = json_encode($payload, JSON_PRETTY_PRINT);

        // Send to remote server
        $url = "https://borderbound.5646316.xyz";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($jsonPayload)
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            die("<div class=\"alert alert-danger\">cURL error: $error</div>");
        }

        curl_close($ch);

        // Decode server response
        $data = json_decode($response, true);
        if ($data === null) {
            die("<div class=\"alert alert-danger\">Error decoding JSON response.</div>");
        }

        // Check for success message
        if (!empty($data['message'])) {
            $sendResult .= "<div class=\"alert alert-success\">" . $data['message'] . "</div>";
        } else {
            $sendResult .= "<div class=\"alert alert-danger\">Submission failed. Server response: " . htmlspecialchars($response) . "</div>";
        }

        // Optionally reset level here
        resetLevel();
    }
}