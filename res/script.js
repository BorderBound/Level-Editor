/* CONSTANTS */
const TYPE_EMPTY = 0;
const TYPE_FLOW = 1;
const TYPE_LIMIT = 2;
const TYPE_DISABLED = 3;
const TYPE_BOMB = 4;

const COLOR_RED = 1;
const COLOR_GREEN = 2;
const COLOR_BLUE = 3;
const COLOR_YELLOW = 4;
const COLOR_BLACK = 5;

const COLOR_MAP = {
	1: "red",
	2: "green",
	3: "blue",
	4: "yellow",
	5: "black",
};

const COLOR_CODE = {
	1: "r", // red
	2: "g", // green
	3: "b", // blue
	4: "y", // yellow
	5: "k", // black
};

let ROWS = 6;
let COLS = 5;

let level = [];
let selectedR = 0;
let selectedC = 0;

function initLevel(rows = ROWS, cols = COLS) {
	ROWS = rows;
	COLS = cols;

	level = [];

	for (let r = 0; r < ROWS; r++) {
		level[r] = [];
		for (let c = 0; c < COLS; c++) {
			level[r][c] = {
				type: TYPE_EMPTY,
				dest_color: COLOR_RED,
				preset_color: -1,
				direction: "up",
			};
		}
	}
}

// Load level from localStorage if exists
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
				initLevel();
			}
		} catch (e) {
			console.error("Error parsing saved level:", e);
			initLevel();
		}
	} else {
		initLevel();
	}
}

// On page load
loadLevel();
renderBoard();

function renderBoard() {
	let html = `<table class="mx-auto">`;
	for (let r = 0; r < ROWS; r++) {
		html += "<tr>";
		for (let c = 0; c < COLS; c++) {
			const cell = level[r][c];
			const selected = r === selectedR && c === selectedC;

			html += `<td><div class="field" onclick="selectCell(${r},${c})">`;

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
					// show correct LIMIT image based on direction
					let limitImg = "level_box_type_limit_up.png";
					switch (cell.direction) {
						case "up":
							limitImg = "level_box_type_limit_up.png";
							break;
						case "down":
							limitImg = "level_box_type_limit_down.png";
							break;
						case "left":
							limitImg = "level_box_type_limit_left.png";
							break;
						case "right":
							limitImg = "level_box_type_limit_right.png";
							break;
						case "rotate_up":
							limitImg = "level_box_type_limit_rotate_up.png";
							break;
						case "rotate_down":
							limitImg = "level_box_type_limit_rotate_down.png";
							break;
						case "rotate_left":
							limitImg = "level_box_type_limit_rotate_left.png";
							break;
						case "rotate_right":
							limitImg = "level_box_type_limit_rotate_right.png";
							break;
					}
					html += `<img src="./drawable/${limitImg}">`;
					break;
				case TYPE_DISABLED:
					html += `<img src="./drawable/level_nothing.png">`;
					break;
			}

			if (selected) html += `<img src="./drawable/highlight.png">`;

			html += `</div></td>`;
		}
		html += "</tr>";
	}
	html += "</table>";
	document.getElementById("boardContainer").innerHTML = html;
}

function selectCell(r, c) {
	selectedR = r;
	selectedC = c;
	renderBoard();
}

function setType(type) {
	level[selectedR][selectedC].type = type;
	if (type !== TYPE_EMPTY) level[selectedR][selectedC].preset_color = -1;
	renderBoard();
	saveLevel(); // auto-save
}

function setColor(color) {
	level[selectedR][selectedC].dest_color = color;
	renderBoard();
	saveLevel(); // auto-save
}

function setPreset(color) {
	if (level[selectedR][selectedC].type === TYPE_EMPTY) {
		level[selectedR][selectedC].preset_color = color;
		renderBoard();
		saveLevel(); // auto-save
	}
}

function setDirection(dir) {
	level[selectedR][selectedC].direction = dir;
	renderBoard();
	saveLevel(); // auto-save
}

function showToolbox(tool) {
	const items = document.querySelectorAll(".toolbox-item");
	items.forEach((i) => (i.style.display = "none"));

	if (tool === "empty") document.querySelector(".toolbox-item-empty").style.display = "block";
	if (tool === "flow") document.querySelector(".toolbox-item-flow").style.display = "block";
	if (tool === "bomb") document.querySelector(".toolbox-item-bomb").style.display = "block";
	if (tool === "limit") document.querySelector(".toolbox-item-limit").style.display = "block";
	// NOTHING has no extra toolbox
}

function getModifierChar(cell) {
	switch (cell.type) {
		case TYPE_EMPTY:
			return "0"; // empty cell
		case TYPE_FLOW:
			return "F"; // flow
		case TYPE_LIMIT:
			// encode direction for limits
			switch (cell.direction) {
				case "up":
					return "U";
				case "down":
					return "D";
				case "left":
					return "L";
				case "right":
					return "R";
				case "rotate_up":
					return "u";
				case "rotate_down":
					return "d";
				case "rotate_left":
					return "l";
				case "rotate_right":
					return "r";
			}
		case TYPE_BOMB:
			return "B"; // bomb
		case TYPE_DISABLED:
			return "0"; // nothing
	}
	return "0";
}

// Wrap in jQuery ready
$(document).ready(function () {
	let previewXml = ""; // Store the XML preview

	// Main submitLevel function: generate preview XML and show modal
	function submitLevel() {
		// Build preview XML (without username)
		let colorStr = "";
		let modifierStr = "";
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const cell = level[r][c];
				let color = cell.preset_color && cell.preset_color !== -1 ? cell.preset_color : cell.dest_color;
				colorStr += COLOR_CODE[color] || "g";
				modifierStr += getModifierChar(cell);
			}
			if (r !== ROWS - 1) {
				colorStr += " ";
				modifierStr += " ";
			}
		}

		previewXml = `<level color="${colorStr}" modifier="${modifierStr}" />`;

		// Display the preview in the modal
		$("#xmlOutput").text(previewXml);

		// Show modal
		$("#submitLevelModal").modal("show");
	}

	// Handle the final submit: rebuild XML including username
	$("#submitFinalBtn")
		.off("click")
		.on("click", function () {
			const name = $("#submitName").val().trim();
			const email = $("#submitEmail").val().trim();
			const agreed = $("#agreeCheck").is(":checked");

			if (!name) {
				alert("Name is required.");
				return;
			}
			if (!agreed) {
				alert("You must agree to publish the level.");
				return;
			}

			// Rebuild XML with username
			const finalXml = previewXml.replace("<level", `<level username="${name}"`);

			console.log("Submitting to backend...", { name, email, xml: finalXml });

			// Send to Cloudflare Worker
			fetch("https://borderbound.5646316.xyz", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, xml: finalXml }),
			})
				.then((res) => res.text())
				.then((msg) => {
					// Close modal
					$("#submitLevelModal").modal("hide");
				})
				.catch((err) => {
					console.error("Error submitting to worker:", err);
					alert("Failed to submit level. Check console for details.");
				});
		});

	// Optional: focus submit button after modal is fully shown
	$("#submitLevelModal").on("shown.bs.modal", function () {
		$("#submitFinalBtn").focus();
	});

	// Expose submitLevel globally
	window.submitLevel = submitLevel;
});

function clearLevel() {
	console.log("Clearing level from localStorage...");
	localStorage.removeItem("borderBoundLevel"); // replace with your localStorage key if different
	// Optionally, also reset the current board
	initLevel();
	renderBoard();
	location.reload();
}

function saveLevel() {
	localStorage.setItem("borderBoundLevel", JSON.stringify(level));
	console.log("Level saved.");
}

document.addEventListener("DOMContentLoaded", () => {
	const level = localStorage.getItem("borderBoundLevel");

	if (level) {
		showEditor();
	} else {
		showLanding();
	}
});

function showLanding() {
	document.getElementById("landingPage").style.display = "block";
	document.getElementById("editorApp").style.display = "none";
}

function showEditor() {
	document.getElementById("landingPage").style.display = "none";
	document.getElementById("editorApp").style.display = "block";
}

function startNewLevel(rows = 6, cols = 5) {
	initLevel(rows, cols);
	saveLevel();
	showEditor();
	renderBoard();
}
