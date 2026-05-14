# Changelog

## [1.1.1]

### What's New

- **🗂️ `.json` URL support** — Pages served from a `.json` URL are now recognized and rendered as an interactive tree, in addition to pages with `application/json` content type.
- **🖱️ Mouse-wheel tab scrolling** — The tab bar can now be scrolled horizontally with the mouse wheel.

### Bug Fixes

- **Toolbar icon not updating reliably** — `dataset.jpHasJson` was set once on initial load but never cleared on SPA navigation. The page is now re-scanned and the attribute reset before each icon update, so the icon correctly reflects the current page state after client-side navigation.
- **JSON tabs not removed when JSON disappears** — The mutation observer skipped `childList` mutations where the target was a `<pre>`/`<code>`/`<script>` element itself (e.g. when a SPA replaced the element's content directly). The observer now checks `m.target` in addition to `m.addedNodes`/`m.removedNodes`, so content changes are caught and the side panel refreshes correctly.
- **Icon and panel stale after back/forward navigation** — Pages restored from the browser's Back-Forward Cache (bfcache) do not fire `tabs.onUpdated`. A `pageshow` listener now triggers a rescan for bfcache restores.
- **Stale panel render on rapid navigation** — Concurrent `refresh()` calls could race, with a slower earlier call overwriting a correct newer result. A sequence counter now discards out-of-order responses.

## [1.1.0]

### What's New

**✒️ Custom JSON input**
A new `+` tab lets you paste or type any JSON directly in the side panel. The tree renders automatically on paste, or press `Ctrl+Enter` / the Parse button to render manually.

**🎨 Customizable theme**
A color-picker UI lets you tune every token color — keys, strings, numbers, booleans, nulls, brackets, braces, and punctuation — and save it as your own theme.

---

## [1.0.0] — Initial release

- Side panel UI with interactive, collapsible JSON tree.
- Raw JSON page takeover with tree and pretty-print toggle (`Ctrl+\`).
- 12 built-in syntax themes.
- Full-text search (`Ctrl+F`) with inline highlights and match navigation.
- Context menu to copy key, value, or dot-notation path; hover tooltip for paths.
- Dynamic toolbar icon that reflects JSON detection state and adapts to OS theme.
- Options page with display settings: quote keys, count-only, wrap strings, color brackets, show commas, first-level-only collapse.
- SPA support via DOM mutation observer and History API listener.
