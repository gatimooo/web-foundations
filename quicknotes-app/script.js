const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const noteCount = document.querySelector("#note-count");
const clearAllBtn = document.querySelector("#clear-all-btn");
const list = document.querySelector("#notes-list");

const MAX_LENGTH = 200;
const STORAGE_KEY = "quicknotes";

let notes = loadNotes();

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(date) {
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = "You have " + notes.length + " notes.";
  }
}

function getVisibleNotes() {
  const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return notes.filter((note) => {
    const text = note.text.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

function render() {
  list.replaceChildren();

  const visible = getVisibleNotes();

  if (visible.length === 0 && searchInput.value.trim() !== "") {
    const empty = document.createElement("li");
    empty.className = "no-results";
    empty.textContent = "No notes match your search.";
    list.appendChild(empty);
  }

  visible.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note category-" + note.category.toLowerCase();

    const text = document.createElement("p");
    text.className = "note-text";
    text.textContent = note.text;

    const label = document.createElement("span");
    label.className = "note-category-label";
    label.textContent = note.category;

    const date = document.createElement("span");
    date.className = "note-date";
    date.textContent = note.createdAt;

    const meta = document.createElement("div");
    meta.className = "note-meta";
    meta.append(label, date);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    const footer = document.createElement("div");
    footer.className = "note-footer";
    footer.append(meta, deleteBtn);

    li.append(text, footer);
    list.appendChild(li);
  });

  updateCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }
  if (text.length > MAX_LENGTH) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";

  notes.unshift({
    id: Date.now(),
    text: text,
    category: categorySelect.value,
    createdAt: formatDate(new Date()),
  });

  input.value = "";
  saveNotes();
  render();
});

searchInput.addEventListener("input", render);
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
  }
});

render();