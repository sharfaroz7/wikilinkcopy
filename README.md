# Copy Note Wikilink

Copy the selected note as an Obsidian wikilink, such as `[[My note]]`.

## Features

- Copies the currently active note as `[[Note name]]`.
- Can copy the highlighted result from Obsidian search-style modals when available.
- Includes support for Omnisearch result rows that expose a selected file path.
- Includes best-effort support for Quick Switcher and Better Command Palette style results.

## Usage

Run the command **Copy current note name as [[wikilink]]** from the command palette, or use the default hotkey:

- macOS: `Cmd+Shift+C`
- Windows/Linux: `Ctrl+Shift+C`

When a supported search modal is open, highlight the result you want, then use the hotkey.

## Notes

Search-result support depends on the selected result being exposed in the modal DOM. If a third-party search plugin changes its result markup, copying from that plugin may need an update.

## Installation 

### Community plugins 

The plugin is available on the community plugin store. https://community.obsidian.md/plugins/copy-note-wikilink

### Manual installation

1. Download `main.js` and `manifest.json` from a release.
2. Put them in `<vault>/.obsidian/plugins/copy-note-wikilink/`.
3. Reload Obsidian and enable **Copy Note Wikilink** in Community plugins.
