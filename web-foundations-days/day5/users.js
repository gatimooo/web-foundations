const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusEl = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

function renderUsers(list) {
  usersList.replaceChildren();

  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No users match your filter.";
    usersList.appendChild(empty);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const email = document.createElement("div");
    email.textContent = "Email: " + user.email;

    const city = document.createElement("div");
    city.textContent = "City: " + user.address.city;

    const company = document.createElement("div");
    company.textContent = "Company: " + user.company.name;

    li.append(name, email, city, company);
    usersList.appendChild(li);
  });
}

function getFilteredUsers() {
  const term = filterInput.value.trim().toLowerCase();
  return users.filter((user) => user.name.toLowerCase().includes(term));
}

async function loadUsers() {
  statusEl.textContent = "Loading users...";
  loadBtn.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Server responded with status " + response.status);
    }

    users = await response.json();
    renderUsers(getFilteredUsers());
    statusEl.textContent = "Loaded " + users.length + " users.";
  } catch (error) {
    statusEl.textContent = "Could not load users: " + error.message;
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  if (users.length === 0) return;
  renderUsers(getFilteredUsers());
});