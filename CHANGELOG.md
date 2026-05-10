# Changelog

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
