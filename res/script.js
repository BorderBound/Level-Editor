// =========================
// CONSTANTS & GLOBAL VARIABLES
// =========================

// Cell types
const TYPE_EMPTY = 0; // Empty tile that can optionally hold a preset stone
const TYPE_FLOW = 1; // Flow tile, part of a puzzle path or color chain
const TYPE_LIMIT = 2; // Tile that restricts movement or rotation
const TYPE_DISABLED = 3; // Inaccessible/disabled tile (acts as a placeholder)
const TYPE_BOMB = 4; // Explosive tile, clears surrounding area or triggers special logic

// Colors
const COLOR_RED = 1;
const COLOR_GREEN = 2;
const COLOR_BLUE = 3;
const COLOR_YELLOW = 4;
const COLOR_BLACK = 5;

// Mapping numeric color IDs to asset names
const COLOR_MAP = {
	1: "red",
	2: "green",
	3: "blue",
	4: "yellow",
	5: "black",
};

// Short codes for XML export
const COLOR_CODE = {
	1: "r", // red
	2: "g", // green
	3: "b", // blue
	4: "y", // yellow
	5: "k", // black
};

// Board dimensions
let ROWS = 6; // Default number of rows
let COLS = 5; // Default number of columns

// Core level data structure: 2D array representing each cell
let level = [];

// Track currently selected cell for editing
let selectedR = 0;
let selectedC = 0;

// =========================
// LEVEL INITIALIZATION
// =========================

// Create a fresh board or resize the current one
function initLevel(rows = ROWS, cols = COLS) {
	ROWS = rows;
	COLS = cols;

	level = []; // Reset level array

	for (let r = 0; r < ROWS; r++) {
		level[r] = [];
		for (let c = 0; c < COLS; c++) {
			level[r][c] = {
				type: TYPE_EMPTY, // Default: empty tile
				dest_color: COLOR_RED, // Default target color
				preset_color: -1, // Default: no prefilled stone
				direction: "up", // Default direction (used for LIMIT type)
			};
		}
	}
}

// Start a new level with optional custom dimensions
function startNewLevel(rows = 6, cols = 5) {
	initLevel(rows, cols);
	updateBoardHeader();
	saveLevel();
	showEditor();
	renderBoard();
}

// =========================
// LOAD / SAVE LEVEL
// =========================

// Load level from localStorage if it exists; otherwise, initialize a new one
function loadLevel() {
	const saved = localStorage.getItem("borderBoundLevel");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed) && parsed.length > 0) {
				ROWS = parsed.length;
				COLS = parsed[0].length;
				level = parsed;
			} else {
				initLevel(); // fallback to default
			}
		} catch (e) {
			console.error("Error parsing saved level:", e);
			initLevel();
		}
	} else {
		initLevel();
	}
	updateBoardHeader();
}

// Persist current level to localStorage
function saveLevel() {
	localStorage.setItem("borderBoundLevel", JSON.stringify(level));
	console.log("Level saved.");
}

// Clear localStorage and reset the board
function clearLevel() {
	console.log("Clearing level from localStorage...");
	localStorage.removeItem("borderBoundLevel");
	initLevel();
	renderBoard();
	location.reload();
}

// =========================
// BOARD RENDERING
// =========================

// Render the level editor as an HTML table
function renderBoard() {
	let html = `<table class="mx-auto">`;
	for (let r = 0; r < ROWS; r++) {
		html += "<tr>";
		for (let c = 0; c < COLS; c++) {
			const cell = level[r][c];
			const selected = r === selectedR && c === selectedC;

			html += `<td><div class="field" onclick="selectCell(${r},${c})">`;

			// Render cell based on type
			switch (cell.type) {
				case TYPE_EMPTY:
					html += `<img src="./drawable/level_box_dest_color_${COLOR_MAP[cell.dest_color]}.png">`;
					if (cell.preset_color && cell.preset_color !== -1) {
						html += `<img src="./drawable/level_box_stone_${COLOR_MAP[cell.preset_color]}.png">`;
					}
					break;
				case TYPE_FLOW:
					html += `<img src="./drawable/level_box_color_${COLOR_MAP[cell.dest_color]}.png">`;
					html += `<img src="./drawable/level_box_type_flow.png">`;
					break;
				case TYPE_BOMB:
					html += `<img src="./drawable/level_box_color_${COLOR_MAP[cell.dest_color]}.png">`;
					html += `<img src="./drawable/level_box_type_bomb.png">`;
					break;
				case TYPE_LIMIT:
					html += `<img src="./drawable/level_box_color_${COLOR_MAP[cell.dest_color]}.png">`;
					let limitImg = `level_box_type_limit_${cell.direction}.png`;
					html += `<img src="./drawable/${limitImg}">`;
					break;
				case TYPE_DISABLED:
					html += `<img src="./drawable/level_nothing.png">`;
					break;
			}

			// Highlight currently selected cell
			if (selected) html += `<img src="./drawable/highlight.png">`;

			html += `</div></td>`;
		}
		html += "</tr>";
	}
	html += "</table>";
	document.getElementById("boardContainer").innerHTML = html;
}

// Update header text to display current grid size
function updateBoardHeader() {
	document.getElementById("boardHeader").textContent = `Game board (${COLS}×${ROWS})`;
}

// =========================
// CELL SELECTION & EDITING
// =========================

// Update selected cell coordinates and re-render
function selectCell(r, c) {
	selectedR = r;
	selectedC = c;
	renderBoard();
}

// Change type of selected cell
function setType(type) {
	level[selectedR][selectedC].type = type;
	if (type !== TYPE_EMPTY) level[selectedR][selectedC].preset_color = -1;
	renderBoard();
	saveLevel();
}

// Set destination color of selected cell
function setColor(color) {
	level[selectedR][selectedC].dest_color = color;
	renderBoard();
	saveLevel();
}

// Set prefilled stone color for EMPTY cells
function setPreset(color) {
	if (level[selectedR][selectedC].type === TYPE_EMPTY) {
		level[selectedR][selectedC].preset_color = color;
		renderBoard();
		saveLevel();
	}
}

// Set direction for LIMIT tiles
function setDirection(dir) {
	level[selectedR][selectedC].direction = dir;
	renderBoard();
	saveLevel();
}

// Show/hide toolbox controls depending on selected type
function showToolbox(tool) {
	const items = document.querySelectorAll(".toolbox-item");
	items.forEach((i) => (i.style.display = "none"));

	switch (tool) {
		case "empty":
			document.querySelector(".toolbox-item-empty").style.display = "block";
			break;
		case "flow":
			document.querySelector(".toolbox-item-flow").style.display = "block";
			break;
		case "bomb":
			document.querySelector(".toolbox-item-bomb").style.display = "block";
			break;
		case "limit":
			document.querySelector(".toolbox-item-limit").style.display = "block";
			break;
	}
}

// =========================
// HELPER FUNCTIONS
// =========================

// Convert cell properties into a compact character for XML export
function getModifierChar(cell) {
	switch (cell.type) {
		case TYPE_EMPTY:
			return "0";
		case TYPE_FLOW:
			return "F";
		case TYPE_LIMIT:
			const mapping = {
				up: "U",
				down: "D",
				left: "L",
				right: "R",
				rotate_up: "u",
				rotate_down: "d",
				rotate_left: "l",
				rotate_right: "r",
			};
			return mapping[cell.direction] || "0";
		case TYPE_BOMB:
			return "B";
		case TYPE_DISABLED:
			return "0";
	}
	return "0";
}

// =========================
// SUBMIT LEVEL (JSON + TOAST)
// =========================

$(document).ready(function () {
	let previewData = {};

	function submitLevel() {
		let colorStr = "";
		let modifierStr = "";

		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const cell = level[r][c];
				const color = cell.preset_color !== -1 ? cell.preset_color : cell.dest_color;
				colorStr += COLOR_CODE[color] || "g";
				modifierStr += getModifierChar(cell);
			}
			if (r !== ROWS - 1) {
				colorStr += " ";
				modifierStr += " ";
			}
		}

		previewData = { color: colorStr, modifier: modifierStr };
		$("#xmlOutput").text(JSON.stringify(previewData, null, 2));
		$("#submitLevelModal").modal("show");
	}

	$("#submitFinalBtn").on("click", function () {
		const name = $("#submitName").val().trim();
		const email = $("#submitEmail").val().trim();
		const agreed = $("#agreeCheck").is(":checked");

		if (!name) return showToast("Name is required.", "warning");
		if (!agreed) return showToast("You must agree to publish.", "warning");

		const payload = { name, email, ...previewData };

		fetch("https://borderbound.5646316.xyz", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
			.then(async (res) => {
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Submission failed");
				return data;
			})
			.then((data) => {
				showToast(data.message || "Level submitted!", "success");
				$("#submitLevelModal").modal("hide");
			})
			.catch((err) => {
				showToast(err.message || "Failed to submit level.", "danger");
			});
	});

	window.submitLevel = submitLevel;
});

// =========================
// PAGE DISPLAY
// =========================

function showLanding() {
	document.getElementById("landingPage").style.display = "block";
	document.getElementById("editorApp").style.display = "none";
}

function showEditor() {
	document.getElementById("landingPage").style.display = "none";
	document.getElementById("editorApp").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
	loadLevel();
	localStorage.getItem("borderBoundLevel") ? (showEditor(), renderBoard()) : showLanding();
});

// ============================
// THEME TOGGLE (Dark / Light)
// ============================

function applyTheme(theme) {
	if (theme === "dark") {
		document.body.classList.add("dark-mode");
		document.body.classList.remove("light-mode");
		document.getElementById("themeToggle").textContent = "☀️"; // switch icon to sun
	} else {
		document.body.classList.add("light-mode");
		document.body.classList.remove("dark-mode");
		document.getElementById("themeToggle").textContent = "🌙"; // switch icon to moon
	}
}

// Load theme from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
	let savedTheme = localStorage.getItem("themeMode") || "light";
	applyTheme(savedTheme);

	// Toggle button click handler
	document.getElementById("themeToggle").addEventListener("click", () => {
		let currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
		let newTheme = currentTheme === "dark" ? "light" : "dark";
		applyTheme(newTheme);
		localStorage.setItem("themeMode", newTheme);
	});
});

// ==========================
// TOAST NOTIFICATIONS
// =========================
function showToast(message, type = "info", duration = 3000) {
	const toastEl = document.getElementById("appToast");
	const toastBody = document.getElementById("appToastBody");
	const toastIcon = document.getElementById("toastIcon");

	// Set message
	toastBody.textContent = message;

	// Reset toast classes
	toastEl.classList.remove("toast-success", "toast-info", "toast-warning", "toast-danger");

	// Apply type class and icon
	switch (type) {
		case "success":
			toastEl.classList.add("toast-success");
			toastIcon.textContent = "✔";
			break;
		case "danger":
			toastEl.classList.add("toast-danger");
			toastIcon.textContent = "❌";
			break;
		case "warning":
			toastEl.classList.add("toast-warning");
			toastIcon.textContent = "⚠️";
			break;
		default:
			toastEl.classList.add("toast-info");
			toastIcon.textContent = "ℹ️";
			break;
	}

	// Initialize and show Bootstrap toast
	const bsToast = new bootstrap.Toast(toastEl, { delay: duration });
	bsToast.show();
}
