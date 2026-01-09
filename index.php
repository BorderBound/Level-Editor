<?php
header('Content-Type: text/html; charset=UTF-8');
session_start();

include("view/boardDrawer.php");
include("logic/utils.php");
include("logic/handleUserInput.php");

?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>BorderBound Level Editor</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="drawable/icon_web.svg">

    <!-- Bootstrap CSS (local) -->
    <link rel="stylesheet" href="res/bootstrap.min.css">

    <!-- Custom Dark Mode + Layout -->
    <link rel="stylesheet" href="res/custom.css">

    <!-- jQuery + Popper + Bootstrap JS (local) -->
    <script src="res/jquery.min.js"></script>
    <script src="res/popper.min.js"></script>
    <script src="res/bootstrap.min.js"></script>
    <script src="res/bootstrap.bundle.min.js"></script>

</head>

<body>
    <nav class="navbar px-3 theme-aware-navbar">
        <div class="container-fluid d-flex justify-content-between align-items-center">

            <!-- Left: Brand + Edit/Play -->
            <div class="d-flex align-items-center">

                <!-- Brand -->
                <a class="navbar-brand d-flex align-items-center mb-0 me-3" href="#">
                    <img src="drawable/icon_web.svg" width="30" height="30" class="me-2" alt="BorderBound!">
                    <span class="fs-6 fw-bold">BorderBound! Level Editor</span>
                </a>

                <!-- Edit / Play Buttons -->
                <div class="btn-group" role="group">
                    <!-- Theme icon -->
                    <span id="themeToggle" class="btn btn-sm btn-outline-primary">🌙</span>
                    <?php if (!empty($_SESSION["level_data"])) { ?>
                    <a class="btn btn-sm <?php echo ($_GET["action"] ?? '') === "edit" ? 'btn-primary' : 'btn-outline-primary'; ?>"
                        href="./?action=edit&r=-1&c=0">Edit</a>
                    <a class="btn btn-sm <?php echo ($_GET["action"] ?? '') === "play" ? 'btn-primary' : 'btn-outline-primary'; ?>"
                        href="./?action=play&play=restart">Play</a>
                    <?php } ; ?>
                </div>

            </div>

            <?php if (!empty($_SESSION["level_data"])) { ?>
            <!-- Right: Delete / Submit Buttons -->
            <div class="d-flex align-items-center">
                <!-- Delete button -->
                <a class="btn btn-danger me-2" onclick="return confirm('Delete the level you designed?')"
                    href="./?action=restart">Delete</a>

                <!-- Submit button: green if solved, gray if not -->
                <?php if (!empty($_SESSION["solved"])) { ?>
                <a class="btn btn-success" id="saveButton" href="./?action=source">Submit</a>
                <?php } else { ?>
                <a class="btn btn-secondary" id="saveButton" href="./?action=play&play=restart">Submit</a>
                <?php } ?>
            </div>
            <?php } ; ?>
        </div>
    </nav>
    <?php
            if (!isset($_SESSION["level_data"])) {
                include("view/createLevel.php");
            } else if (@$_GET["action"] == "source") {
                include("view/save.php");
            } else if(@$_GET["action"] == "play") {
                include("view/play.php");
            } else {
                include("view/edit.php");
            }
        ?>
    <script src="res/script.js"></script>
    <script src="res/theme.js"></script>
</body>

</html>