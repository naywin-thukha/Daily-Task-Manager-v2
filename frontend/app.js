import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-init.js";
import { API_BASE_URL } from "./firebase-config.js";

// ---------- DOM references ----------
const appSection = document.getElementById("appSection");
const authChecking = document.getElementById("authChecking");
const userBar = document.getElementById("userBar");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const addForm = document.getElementById("addForm");
const addTitle = document.getElementById("addTitle");
const addDescription = document.getElementById("addDescription");

const filterTabs = document.querySelectorAll(".filter-tab");
const searchInput = document.getElementById("searchInput");

const ledgerBody = document.getElementById("ledgerBody");
const ledgerEmpty = document.getElementById("ledgerEmpty");
const ledgerLoading = document.getElementById("ledgerLoading");
const taskError = document.getElementById("taskError");
const footStatus = document.getElementById("footStatus");

let currentFilter = "all";
let currentSearch = "";
let searchDebounce = null;

function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}
function hideError(el) {
  el.hidden = true;
  el.textContent = "";
}

// ---------- Route guard ----------
logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  authChecking.hidden = true;
  if (user) {
    appSection.hidden = false;
    userBar.hidden = false;
    userEmailEl.textContent = user.email;
    loadTasks();
  } else {
    window.location.href = "login.html";
  }
});

// ---------- API helper ----------
async function apiFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    await signOut(auth);
    throw new Error("Your session expired. Please log in again.");
  }

  if (!res.ok) {
    let detail = "Request failed.";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Task loading ----------
async function loadTasks() {
  hideError(taskError);
  ledgerLoading.hidden = false;
  ledgerEmpty.hidden = true;
  ledgerBody.innerHTML = "";

  const params = new URLSearchParams();
  if (currentFilter === "open") params.set("completed", "false");
  if (currentFilter === "done") params.set("completed", "true");
  if (currentSearch) params.set("search", currentSearch);

  try {
    const tasks = await apiFetch(`/tasks/?${params.toString()}`);
    renderTasks(tasks);
    footStatus.textContent = `${tasks.length} ${tasks.length === 1 ? "entry" : "entries"}`;
  } catch (err) {
    showError(taskError, err.message);
  } finally {
    ledgerLoading.hidden = true;
  }
}

function renderTasks(tasks) {
  ledgerBody.innerHTML = "";
  if (tasks.length === 0) {
    ledgerEmpty.hidden = false;
    return;
  }
  ledgerEmpty.hidden = true;
  tasks.forEach((task, index) => {
    ledgerBody.appendChild(buildRow(task, index + 1));
  });
}

function buildRow(task, index) {
  const li = document.createElement("li");
  li.className = "ledger-row" + (task.completed ? " is-done" : "");
  li.dataset.id = task.id;

  li.innerHTML = `
    <span class="col-idx">${String(index).padStart(2, "0")}</span>
    <button class="row-check-btn" aria-label="Toggle done" title="Toggle done">
      <svg viewBox="0 0 22 22">
        <rect class="check-box" x="2" y="2" width="18" height="18" rx="3"></rect>
        <path class="check-mark" d="M5.5 11.5l4 4 7-8"></path>
      </svg>
    </button>
    <div class="row-content">
      <p class="row-title">${escapeHtml(task.title)}</p>
      ${task.description ? `<p class="row-desc">${escapeHtml(task.description)}</p>` : ""}
    </div>
    <div class="col-actions">
      <button class="icon-btn edit-btn" title="Edit">Edit</button>
      <button class="icon-btn danger delete-btn" title="Delete">Del</button>
    </div>
  `;

  li.querySelector(".row-check-btn").addEventListener("click", () => toggleComplete(task));
  li.querySelector(".edit-btn").addEventListener("click", () => enterEditMode(li, task));
  li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task));

  return li;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Task actions ----------
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError(taskError);
  const title = addTitle.value.trim();
  const description = addDescription.value.trim();
  if (!title) return;

  try {
    await apiFetch("/tasks/", {
      method: "POST",
      body: JSON.stringify({ title, description: description || null, completed: false })
    });
    addTitle.value = "";
    addDescription.value = "";
    addTitle.focus();
    loadTasks();
  } catch (err) {
    showError(taskError, err.message);
  }
});

async function toggleComplete(task) {
  try {
    await apiFetch(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        completed: !task.completed
      })
    });
    loadTasks();
  } catch (err) {
    showError(taskError, err.message);
  }
}

async function deleteTask(task) {
  if (!confirm(`Delete "${task.title}"? This can't be undone.`)) return;
  try {
    await apiFetch(`/tasks/${task.id}`, { method: "DELETE" });
    loadTasks();
  } catch (err) {
    showError(taskError, err.message);
  }
}

function enterEditMode(li, task) {
  li.querySelector(".row-content").innerHTML = `
    <form class="row-edit-form">
      <input type="text" class="edit-title" value="${escapeHtml(task.title)}" maxlength="255" required />
      <input type="text" class="edit-description" value="${escapeHtml(task.description || "")}" maxlength="500" placeholder="Details (optional)" />
      <div class="row-edit-actions">
        <button type="submit" class="btn-primary">Save</button>
        <button type="button" class="icon-btn cancel-edit">Cancel</button>
      </div>
    </form>
  `;

  const form = li.querySelector(".row-edit-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = li.querySelector(".edit-title").value.trim();
    const description = li.querySelector(".edit-description").value.trim();
    if (!title) return;
    try {
      await apiFetch(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ title, description: description || null, completed: task.completed })
      });
      loadTasks();
    } catch (err) {
      showError(taskError, err.message);
    }
  });

  li.querySelector(".cancel-edit").addEventListener("click", () => loadTasks());
}

// ---------- Filters & search ----------
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentFilter = tab.dataset.filter;
    loadTasks();
  });
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    loadTasks();
  }, 300);
});


window.getToken = async () => {
    const token = await auth.currentUser.getIdToken();
    console.log(token);
};