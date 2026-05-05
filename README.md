# Notion Tabs Manager

A macOS menu bar app that captures and manages your open Notion desktop app tabs. Save snapshots of your tabs before closing them, and restore any page later with a click.

## Features

- **See all open Notion tabs** from your menu bar
- **Save snapshots** with optional names before closing tabs
- **Click to reopen** any saved tab directly in Notion
- **Deduplication** — duplicate tabs are automatically collapsed
- **Pinned tab indicators** — pinned tabs are marked with 📌

## How it works

The app reads the Notion desktop app's local state file (`~/Library/Application Support/Notion/state.json`) to discover your open tabs. No network requests, no Notion API key required.

## Requirements

- macOS
- [Notion desktop app](https://www.notion.so/desktop)
- Node.js 18+

## Setup

```bash
git clone <repo-url>
cd notion-tabs-manager
npm install
npm start
```

## Usage

1. Click the **N** icon in your menu bar
2. The **Open** tab shows your currently open Notion tabs
3. Type an optional name and click **Save** to snapshot them
4. Switch to the **Saved** tab to see all your snapshots
5. Click any tab title to reopen it in Notion
6. Use **Delete** to remove snapshots you no longer need
7. Hit **↻** to refresh if you've opened/closed tabs since opening the panel

## Project structure

```
├── main.js          # Electron main process, reads Notion state, manages saves
├── preload.js       # IPC bridge between main and renderer
├── app/
│   ├── index.html   # Menu bar popup UI
│   ├── styles.css   # Styling
│   └── renderer.js  # UI logic
├── icons/           # Menu bar and app icons
└── package.json
```

## Future ideas

- Notion API integration to save tab lists as Notion pages
- Auto-save on a schedule
- Launch at login
- Search across saved snapshots
