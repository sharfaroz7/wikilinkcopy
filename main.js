const { Notice, Plugin, TFile, normalizePath } = require("obsidian");

module.exports = class CopyNoteWikilinkPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "copy-current-note-wikilink",
      name: "Copy current note name as [[wikilink]]",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "C"
        }
      ],
      callback: async () => {
        await this.copyBestWikilink();
      }
    });

    this.registerDomEvent(
      document,
      "keydown",
      async (event) => {
        if (!this.isCopyWikilinkHotkey(event) || !this.hasSearchUiOpen()) return;

        const target = this.getSearchSelectedFile();
        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        await this.copyFileWikilink(target);
      },
      { capture: true }
    );
  }

  async copyBestWikilink() {
    const target = this.getSearchSelectedFile() ?? this.app.workspace.getActiveFile();

    if (!target) {
      new Notice("No file to copy.");
      return;
    }

    await this.copyFileWikilink(target);
  }

  async copyFileWikilink(file) {
    const wikilink = `[[${file.basename}]]`;
    await navigator.clipboard.writeText(wikilink);
    new Notice(`Copied ${wikilink}`);
  }

  isCopyWikilinkHotkey(event) {
    const hasMod = event.metaKey || event.ctrlKey;
    return hasMod && event.shiftKey && !event.altKey && event.key.toLowerCase() === "c";
  }

  hasSearchUiOpen() {
    return !!document.querySelector(
      ".omnisearch-modal, .prompt, .suggestion-container, .modal-container .suggestion-item"
    );
  }

  getSearchSelectedFile() {
    return this.getOmnisearchSelectedFile() ?? this.getSelectedSuggestionFile();
  }

  getOmnisearchSelectedFile() {
    const selectedResult = document.querySelector(
      ".omnisearch-modal .omnisearch-result.is-selected[data-result-id], .omnisearch-result.is-selected[data-result-id]"
    );

    return this.getFileByPath(selectedResult?.getAttribute("data-result-id"));
  }

  getSelectedSuggestionFile() {
    const selected = document.querySelector(
      ".prompt .suggestion-item.is-selected, .suggestion-container .suggestion-item.is-selected, .suggestion-item.is-selected"
    );

    if (!selected || selected.classList.contains("omnisearch-result")) return null;

    const candidates = this.getSuggestionTextCandidates(selected);
    for (const candidate of candidates) {
      const file = this.resolveFileCandidate(candidate);
      if (file) return file;
    }

    return null;
  }

  getSuggestionTextCandidates(selected) {
    const values = [];
    const add = (value) => {
      const cleaned = this.cleanCandidate(value);
      if (cleaned && !values.includes(cleaned)) values.push(cleaned);
    };

    for (const attr of ["data-path", "data-file-path", "data-result-id", "aria-label", "title"]) {
      add(selected.getAttribute(attr));
    }

    for (const selector of [
      ".suggestion-title",
      ".suggestion-name",
      ".suggestion-note",
      ".suggestion-content",
      ".nav-file-title-content"
    ]) {
      selected.querySelectorAll(selector).forEach((el) => add(el.textContent));
    }

    add(selected.textContent);
    return values;
  }

  cleanCandidate(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/\b\d+\s+matches?\b/gi, "")
      .replace(/#\S+/g, "")
      .replace(/\s+\/\s+/g, "/")
      .trim();
  }

  resolveFileCandidate(candidate) {
    const exact = this.getFileByPath(candidate) ?? this.getFileByPath(`${candidate}.md`);
    if (exact) return exact;

    const withoutMd = candidate.endsWith(".md") ? candidate.slice(0, -3) : candidate;
    const basename = withoutMd.split("/").pop();
    if (!basename) return null;

    const normalizedCandidate = normalizePath(withoutMd).toLowerCase();
    return (
      this.app.vault
        .getMarkdownFiles()
        .find((file) => {
          const pathWithoutMd = file.path.slice(0, -3).toLowerCase();
          return (
            file.basename.toLowerCase() === basename.toLowerCase() ||
            pathWithoutMd === normalizedCandidate
          );
        }) ?? null
    );
  }

  getFileByPath(path) {
    if (!path) return null;

    const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
    return file instanceof TFile ? file : null;
  }
};
