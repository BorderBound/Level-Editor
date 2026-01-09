<div class="container p-3">
    <?php
        // Display messages
        if (!empty($sendResult)) {
            echo $sendResult;
        }
    ?>

    <div id="landingPage" class="container text-center py-5">
        <div class="intro-container">
            <h1>BorderBound Level Creator</h1>
            <p>Create and share custom levels for BorderBound!</p>
            <div class="d-grid gap-3 col-12 col-md-6 mx-auto">
                <?php
                    // Define levels as array: [rows, cols, btn-class, label]
                    $levels = [
                        [6, 5, 'btn-dark', 'Create 6x5 Level'],
                        [6, 6, 'btn-secondary', 'Create 6x6 Level'],
                        [7, 5, 'btn-warning', 'Create 7x5 Level'],
                        [7, 6, 'btn-info', 'Create 7x6 Level'],
                        [8, 5, 'btn-success', 'Create 8x5 Level'],
                        [8, 6, 'btn-danger', 'Create 8x6 Level'],
                    ];

                    foreach ($levels as $level) {
                        [$rows, $cols, $class, $label] = $level;
                        echo "<a href=\"?cols={$cols}&rows={$rows}&r=0&c=0&action=edit\" class=\"btn {$class} btn-lg\">{$label}</a>";
                    }
                ?>
            </div>
        </div>
    </div>
</div>