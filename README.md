# JSON Parse

A Chrome extension that turns raw JSON into a clean, explorable tree — in a side panel, and directly on raw JSON pages.

## Features

**Automatic detection**
Finds JSON in `<pre>`, `<code>`, and `<script type="application/json">` tags on any page. Each block becomes its own labeled tab. On raw JSON URLs (`application/json` responses), the extension takes over the entire page.

**Interactive tree**
Collapsible nodes at every level. Click to toggle, Shift+click to recursively expand or collapse. Nodes auto-collapse at depth 2 to keep large payloads readable. Long strings are truncated with an ellipsis.

**Custom JSON input**
Paste or type any JSON directly into the panel using the `+` button. Auto-renders on paste, or press **Ctrl+Enter** / the Parse button to render manually.

**Full-text search**
Press **Ctrl+F** to search across all keys and values. Matches are highlighted inline, collapsed ancestors expand automatically, and a live counter shows your position. Navigate with **Enter** / **Shift+Enter**.

**Context menu & path tooltip**
Right-click any row to copy the key, value, or full dot-notation path (e.g. `$.items[0].name`). Hover over a key to see its path in a tooltip.

**Raw page toggle**
On raw JSON pages, switch between the interactive tree and pretty-printed raw JSON with **Ctrl+\\** or the toolbar button.

**Themes & display settings**
12 built-in syntax themes (Material, Dracula, Nord, Tokyo Night, and more) plus a fully customizable theme. Settings include: quote keys, count only, wrap strings, color brackets, show commas, first-level-only collapse.

**Dynamic toolbar icon**
The toolbar icon reflects the current page state — colored when JSON is detected, dimmed otherwise, adapting to light and dark OS themes.

**SPA support**
Watches for DOM changes and History API navigation so it works on single-page applications without a reload.

## Installation

### From source
1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load unpacked** and select the folder

### From the Chrome Web Store
Search for **JSON Parse** or visit the [Chrome Web Store](https://chrome.google.com/webstore).

## Usage

| Action | How |
|---|---|
| Open side panel | Click the JSON Parse toolbar icon |
| Add custom JSON | Click `+` in the panel nav, paste or type JSON |
| Search | **Ctrl+F**, then type |
| Navigate matches | **Enter** / **Shift+Enter** |
| Copy path / value | Right-click any row |
| Toggle raw / tree | **Ctrl+\\** (raw JSON pages only) |
| Open settings | **Ctrl+,** or the gear icon |

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| **Ctrl+F** | Open search |
| **Enter** | Next match |
| **Shift+Enter** | Previous match |
| **Escape** | Close search |
| **Ctrl+Enter** | Parse custom JSON input |
| **Ctrl+\\** | Toggle raw / tree (raw JSON pages) |
| **Ctrl+,** | Open settings |

## Permissions

See [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md) for full details.

| Permission | Why |
|---|---|
| `activeTab` | Read the current tab's content to detect JSON |
| `scripting` | Extract JSON from pages and update the toolbar icon |
| `sidePanel` | Show the side panel UI |
| `tabs` | Track tab switches and navigation |
| `storage` | Persist theme and display settings |
| `<all_urls>` | Detect JSON and take over raw JSON pages on any site |

## Privacy

- No data collection — all parsing is local
- No external requests — works fully offline
- No tracking — JSON content is never transmitted or stored
- Open source — code is transparent and auditable

## Requirements

- Chrome 108+ (Side Panel API)
- No external dependencies — vanilla JavaScript

| **Shift+Click** | Recursively expand or collapse all descendants |

### Adding or Modifying Themes
Edit [themes.json](themes.json) to add new themes or adjust colors. Each theme entry defines colors for the following token types:

```json
"mytheme": {
    "key":     "#color",
    "string":  "#color",
    "number":  "#color",
    "boolean": "#color",
    "null":    "#color",
    "bracket": "#color",
    "brace":   "#color",
    "punct":   "#color"
}
```

## License

This project is available under the MIT License.

## Support

For issues, feature requests, or feedback:
- Check existing issues in the repository
- Review [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md) for permission details
- Test on different websites and JSON structures to ensure compatibility

---