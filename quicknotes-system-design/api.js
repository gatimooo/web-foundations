"use strict";

// Practice API used to prove the front end can talk to a real HTTP API.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const list = document.getElementById("notes-list");

// ---------- Helpers ----------

function setStatus(message, type) {
  statusEl.textContent = message;          // textContent only: never innerHTML
  statusEl.className = "status " + type;   // loading | success | error
}

// Disable every button (load, submit, all Delete buttons) while a request runs.
function setBusy(isBusy) {
  loadBtn.disabled = isBusy;
  submitBtn.disabled = isBusy;
  list.querySelectorAll("button").forEach((b) => { b.disabled = isBusy; });
}

// Reusable request helper: calls fetch, checks response.ok, throws on errors.
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    ...options,
  });
  if (!response.ok) {
    const error = new Error("Request failed with status " + response.status);
    error.status = response.status;
    throw error;
  }
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}

function friendlyError(error) {
  if (error.status) {
    return "The server answered with an error (status " + error.status + "). Please try again.";
  }
  return "Could not reach the server. Check your connection and try again.";
}

function createNoteItem(note) {
  const li = document.createElement("li");
  li.className = "note";
  li.dataset.id = note.id;

  const heading = document.createElement("h3");
  heading.textContent = note.title;
  const paragraph = document.createElement("p");
  paragraph.textContent = note.body || "";
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteNote(note.id, li));

  li.append(heading, paragraph, deleteBtn);
  return li;
}

function showEmptyState() {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet. Load notes or add one with the form.";
  list.replaceChildren(li);
}

// ---------- GET: load 10 notes ----------

async function loadNotes() {
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    const { data } = await request(API_URL + "?_limit=10");
    if (!Array.isArray(data) || data.length === 0) {
      showEmptyState();
      setStatus("The server has no notes to show.", "success");
      return;
    }
    list.replaceChildren(...data.map(createNoteItem));
    setStatus("Loaded " + data.length + " notes from the server.", "success");
  } catch (error) {
    setStatus(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", loadNotes);

// ---------- POST: create a note ----------

// Returns an error message, or null when the title is valid.
function validateTitle(title) {
  if (!title) return "Please enter a title.";
  if (title.length > 100) return "The title must be 100 characters or fewer.";
  return null;
}

async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();   // body is optional

  const problem = validateTitle(title);
  if (problem) {
    setStatus(problem, "error");
    titleInput.focus();
    return;
  }

  setBusy(true);
  setStatus("Creating note...", "loading");
  try {
    const { status, data } = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    const empty = list.querySelector(".empty");
    if (empty) empty.remove();
    list.prepend(createNoteItem({ id: data.id, title: data.title, body: data.body }));
    form.reset();
    setStatus("Note created (status " + status + ", id " + data.id + ").", "success");
  } catch (error) {
    setStatus(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

form.addEventListener("submit", createNote);

// ---------- DELETE: remove a note ----------

// JSONPlaceholder is a fake API: it accepts POST and DELETE and answers with
// the right status codes, but it never really stores or removes anything.
// A note we "created" (id 101) cannot be fetched again, and a deleted note
// would reappear after reloading. So we trust the successful response (2xx)
// as the confirmation and update the page ourselves by removing the <li>.
// A real backend would behave the same way from the client's point of view.
async function deleteNote(id, li) {
  setBusy(true);
  setStatus("Deleting note " + id + "...", "loading");
  try {
    await request(API_URL + "/" + id, { method: "DELETE" });
    li.remove();
    if (list.children.length === 0) showEmptyState();
    setStatus("Note " + id + " deleted.", "success");
  } catch (error) {
    setStatus("Could not delete note " + id + ". " + friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}