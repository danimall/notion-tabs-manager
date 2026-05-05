document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupNavigation();
  await renderOpenTabs();
  await renderSavedGroups();

  document.getElementById("refresh-btn").addEventListener("click", refresh);
  document.getElementById("save-btn").addEventListener("click", saveCurrentTabs);
}

function setupNavigation() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(`${btn.dataset.view}-view`).classList.add("active");
    });
  });
}

async function refresh() {
  await renderOpenTabs();
  await renderSavedGroups();
}

async function renderOpenTabs() {
  const tabs = await window.api.getTabs();
  const list = document.getElementById("open-tabs-list");
  const count = document.getElementById("open-count");

  count.textContent = tabs.length;
  list.innerHTML = "";

  if (tabs.length === 0) {
    list.innerHTML = '<li class="muted">No Notion tabs detected</li>';
    return;
  }

  const seen = new Set();
  for (const tab of tabs) {
    const urlKey = stripQueryParams(tab.url);
    if (seen.has(urlKey)) continue;
    seen.add(urlKey);

    const li = document.createElement("li");
    li.title = tab.url;
    li.classList.add("clickable");
    li.innerHTML = `
      ${tab.isPinned ? '<span class="pin">📌</span>' : ""}
      <span class="tab-title">${escapeHtml(tab.title)}</span>
    `;
    li.addEventListener("click", () => window.api.openInNotion(tab.url));
    list.appendChild(li);
  }
  count.textContent = seen.size;
}

async function saveCurrentTabs() {
  const nameInput = document.getElementById("save-name");
  const name = nameInput.value.trim();
  const result = await window.api.saveTabs(name || undefined);

  if (result.error) {
    alert(result.error);
    return;
  }

  nameInput.value = "";
  await renderSavedGroups();

  // Flash the saved tab to give feedback
  document.querySelector('[data-view="saved"]').click();
}

async function renderSavedGroups() {
  const saves = await window.api.getSaves();
  const container = document.getElementById("saved-groups-list");
  const noSaved = document.getElementById("no-saved");

  container.innerHTML = "";

  if (saves.length === 0) {
    noSaved.style.display = "block";
    return;
  }

  noSaved.style.display = "none";

  for (const group of saves) {
    const date = new Date(group.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const div = document.createElement("div");
    div.className = "saved-group";
    div.innerHTML = `
      <div class="saved-group-header">
        <div>
          <div class="group-name">${escapeHtml(group.name)}</div>
          <div class="group-meta">${group.tabs.length} tabs · ${date}</div>
        </div>
        <div class="saved-group-actions">
          <button class="btn danger delete-btn">Delete</button>
        </div>
      </div>
      <button class="toggle-tabs">Show tabs ▾</button>
      <ul class="tabs-list">
        ${deduplicateTabs(group.tabs)
          .map(
            (t) =>
              `<li title="${escapeAttr(t.url)}" class="clickable" data-url="${escapeAttr(t.url)}">
                ${t.isPinned ? '<span class="pin">📌</span>' : ""}
                <span class="tab-title">${escapeHtml(t.title)}</span>
              </li>`
          )
          .join("")}
      </ul>
    `;

    div.querySelector(".delete-btn").addEventListener("click", async () => {
      await window.api.deleteSave(group.id);
      await renderSavedGroups();
    });

    div.querySelector(".toggle-tabs").addEventListener("click", (e) => {
      const tabsList = div.querySelector(".tabs-list");
      const expanded = tabsList.classList.toggle("expanded");
      e.target.textContent = expanded ? "Hide tabs ▴" : "Show tabs ▾";
    });

    div.querySelectorAll(".tabs-list li").forEach((li) => {
      li.addEventListener("click", () => {
        window.api.openInNotion(li.dataset.url);
      });
    });

    container.appendChild(div);
  }
}

function stripQueryParams(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

function deduplicateTabs(tabs) {
  const seen = new Set();
  return tabs.filter((t) => {
    const key = stripQueryParams(t.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
