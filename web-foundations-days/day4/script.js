const note = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeBtn = document.getElementById("theme-toggle");

const DRAFT_KEY = "note-draft";
const THEME_KEY = "note-theme";
const LIMIT = 200;
const WARN_AT = 180;

function updateCounts() {
  const text = note.value;
  const chars = text.length;
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  charCount.textContent = chars + " / " + LIMIT + " characters";
  wordCount.textContent = words + (words === 1 ? " word" : " words");

  charCount.classList.toggle("over", chars > LIMIT);
  charCount.classList.toggle("warning", chars > WARN_AT && chars <= LIMIT);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, note.value);
}

function clearNote() {
  note.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
}

note.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

note.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearNote();
});

clearBtn.addEventListener("click", clearNote);

themeBtn.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

// Restore on load
note.value = localStorage.getItem(DRAFT_KEY) || "";
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
updateCounts();