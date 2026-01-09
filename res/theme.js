document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    // Load saved theme
    const savedTheme = localStorage.getItem("themeMode") || "light";
    applyTheme(savedTheme);

    toggle.addEventListener("click", () => {
        const current = document.body.classList.contains("dark-mode") ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem("themeMode", next);
    });
});

function applyTheme(theme) {
    const body = document.body;
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    body.classList.remove("dark-mode", "light-mode");
    body.classList.add(theme + "-mode");

    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
