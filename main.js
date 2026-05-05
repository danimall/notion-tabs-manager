const { app, nativeImage, Tray, BrowserWindow, ipcMain, shell } = require("electron");
const { menubar } = require("menubar");
const path = require("path");
const fs = require("fs");
const os = require("os");

const STATE_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Notion/state.json"
);
const SAVES_PATH = path.join(app.getPath("userData"), "saved-tabs.json");

const mb = menubar({
  index: `file://${path.join(__dirname, "app", "index.html")}`,
  icon: path.join(__dirname, "icons", "menubar-icon.png"),
  preloadWindow: true,
  browserWindow: {
    width: 400,
    height: 520,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  },
});

mb.on("ready", () => {
  console.log("Notion Tabs Manager ready");
});

function getOpenTabs() {
  if (!fs.existsSync(STATE_PATH)) return [];
  const raw = fs.readFileSync(STATE_PATH, "utf-8");
  const state = JSON.parse(raw);
  const windows = state.history?.appRestorationState?.windows || [];
  const tabs = [];

  for (const window of windows) {
    for (const tab of window.tabs || []) {
      tabs.push({
        title: tab.title || "(untitled)",
        url: tab.url,
        isPinned: tab.isPinned || false,
        index: tab.index,
      });
    }
  }
  return tabs;
}

function loadSaves() {
  if (!fs.existsSync(SAVES_PATH)) return [];
  return JSON.parse(fs.readFileSync(SAVES_PATH, "utf-8"));
}

function writeSaves(saves) {
  fs.writeFileSync(SAVES_PATH, JSON.stringify(saves, null, 2));
}

ipcMain.handle("get-tabs", () => getOpenTabs());

ipcMain.handle("save-tabs", (_, name) => {
  const tabs = getOpenTabs();
  if (tabs.length === 0) return { error: "No tabs found" };
  const saves = loadSaves();
  const group = {
    id: Date.now().toString(),
    name: name || new Date().toLocaleString(),
    date: new Date().toISOString(),
    tabs: tabs.map(({ title, url, isPinned }) => ({ title, url, isPinned })),
  };
  saves.unshift(group);
  writeSaves(saves);
  return group;
});

ipcMain.handle("get-saves", () => loadSaves());

ipcMain.handle("delete-save", (_, id) => {
  const saves = loadSaves();
  const updated = saves.filter((g) => g.id !== id);
  writeSaves(updated);
  return updated;
});

ipcMain.handle("open-in-notion", (_, url) => {
  shell.openExternal(url);
});
