const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getTabs: () => ipcRenderer.invoke("get-tabs"),
  saveTabs: (name) => ipcRenderer.invoke("save-tabs", name),
  getSaves: () => ipcRenderer.invoke("get-saves"),
  deleteSave: (id) => ipcRenderer.invoke("delete-save", id),
  openInNotion: (url) => ipcRenderer.invoke("open-in-notion", url),
});
