# JSON Parse – Chrome Extension for JSON Visualization

A Chrome extension that detects, parses, and visualizes JSON found on any webpage. Perfect for developers working with APIs, raw JSON responses, and data-heavy pages.

## Features

✨ **Automatic JSON Detection**
- Finds all JSON blocks inside `<pre>` tags on the current page
- Also works on raw JSON file tabs (when Chrome displays a bare JSON response)
- Displays each JSON block as a separate, labeled tab in the side panel

🌲 **Interactive JSON Tree**
- Renders JSON as a clean, collapsible tree
- Click any node to expand or collapse it
- **Shift+click** to recursively expand or collapse a node and all its descendants
- Nodes auto-collapse at depth 2 to keep large payloads readable
- Long strings (>300 characters) are truncated with an ellipsis

🎨 **Syntax Highlighting & Themes**
- Keys, strings, numbers, booleans, and null values are color-coded
- 12 built-in themes: Material, Visual Studio, Monokai, JetBrains, Brackets, Dracula, One Dark, Nord, Gruvbox, Catppuccin, Tokyo Night, GitHub
- Live theme preview in the options page

⚙️ **Customizable Display Settings**
- **Quote keys** – toggle whether object keys are shown with quotes
- **Count only** – show item/key counts as plain numbers instead of labeled text
- **Wrap strings** – allow long string values to wrap instead of overflow
- **Color brackets** – toggle distinct colors for brackets and braces
- **Show commas** – toggle trailing commas after values
- **First level only** – collapse all nodes beyond the first level on load

� **Full-Text Search**
- Press **Ctrl+F** (or the search button) to open a search bar
- Highlights all matches across keys, values, strings, numbers, booleans, and nulls
- Navigate matches with **Enter** / **Shift+Enter** or the ▲ ▼ buttons
- Collapsed nodes containing matches are automatically expanded
- Shows a live `current / total` match counter

🖱️ **Context Menu**
- Right-click any node to open a context menu
- **Copy Key** – copies the key name to the clipboard
- **Copy Value** – copies the value (objects/arrays as formatted JSON)
- **Copy Path** – copies the full dot-notation path (e.g. `$.user.address.city`)
- **Expand / Collapse** – toggle the node from the menu

🏷️ **Path Tooltip**
- Hover over any key to see its full JSON path after a short delay
- Paths use standard dot and bracket notation (e.g. `$.items[0].name`)

📄 **Raw JSON Page Takeover**
- When you navigate to a URL that serves a raw JSON response (`application/json` content type or a single `<pre>` page), the extension replaces the browser's plain-text view with the full styled tree UI
- Includes a **Raw / Tree toggle** (Ctrl+\\) to switch between the interactive tree and pretty-printed raw JSON
- The page title is updated to reflect the top-level keys and structure of the JSON
- The favicon switches to a context-aware icon (object vs. array)

🔔 **Dynamic Toolbar Icon**
- The extension icon in the Chrome toolbar changes state based on the current page:
  - **Active (colored)** – JSON detected on the page
  - **Inactive (light/dark)** – no JSON found, adapts to your OS color scheme

�🔄 **SPA & Dynamic Page Support**
- Automatically detects `<pre>` content changes via MutationObserver
- Responds to client-side navigation (History API `pushState`/`replaceState`)
- Works on single-page applications without needing a page reload

## Installation

### From Source (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension folder

### From Chrome Web Store (When Published)
- Search for "JSON Parse" in the [Chrome Web Store](https://chrome.google.com/webstore)
- Click **Add to Chrome**

## How to Use

1. **Open the Extension:**
   - Click the JSON Parse icon in your Chrome toolbar
   - The side panel opens on the right side of your browser

2. **Browse to a Page with JSON:**
   - Navigate to any page that displays JSON in `<pre>` tags (e.g., an API endpoint, a JSON file URL)
   - The extension automatically detects and parses the JSON

3. **Explore the Tree:**
   - Click the arrow on any object `{}` or array `[]` node to expand or collapse it
   - Shift+click an arrow to recursively expand or collapse that node and all its descendants
   - Tabs at the top of the panel let you switch between multiple JSON blocks on the same page

4. **Search the Tree:**
   - Press **Ctrl+F** to open the search bar
   - Type to highlight matches; use **Enter** / **Shift+Enter** to jump between results
   - Press **Escape** to close search

5. **Use the Context Menu:**
   - Right-click any row to copy the key, value, or full JSON path to the clipboard
   - You can also expand or collapse a node from the context menu

6. **Hover for Paths:**
   - Hover over a key name to see its full JSON path in a tooltip

7. **Customize Appearance:**
   - Click the settings gear (or press **Ctrl+,**) to open the options page
   - Choose a syntax highlighting theme and adjust all display settings
   - Changes apply live to the current view

## Permissions

This extension requires specific permissions to function. For detailed explanations, see [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md):

- **`activeTab`** – Access the currently active tab to detect JSON content
- **`scripting`** – Execute scripts to extract JSON from pages and update the toolbar icon
- **`sidePanel`** – Display the side panel UI
- **`tabs`** – Query tabs and update the toolbar icon on tab switches and navigation
- **`storage`** – Save your chosen theme and display settings
- **`<all_urls>`** – Detect and transform JSON on any website (side panel + raw page takeover)

## Privacy & Security

✅ **No data collection** – All parsing and rendering happens locally in your browser  
✅ **No external requests** – The extension works completely offline  
✅ **No tracking** – Your browsing data and JSON content are never transmitted or stored  
✅ **Open source** – Code is transparent and auditable  

## Development

### Requirements
- Chrome 108+ (for side panel API support)
- No external dependencies (vanilla JavaScript)

### Building & Testing
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click **Refresh** on the JSON Parse extension card
4. Test on any page that contains JSON in `<pre>` tags

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| **Ctrl+F** | Open / focus search bar |
| **Enter** | Jump to next search match |
| **Shift+Enter** | Jump to previous search match |
| **Escape** | Close search bar |
| **Ctrl+\\** | Toggle raw JSON / tree view (raw JSON pages) |
| **Ctrl+,** | Open settings / options page |
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