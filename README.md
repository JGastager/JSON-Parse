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
- **Shift+click** to expand or collapse all siblings at once
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

🔄 **SPA & Dynamic Page Support**
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
   - Shift+click an arrow to collapse or expand all sibling nodes at the same level
   - Tabs at the top of the panel let you switch between multiple JSON blocks on the same page

4. **Customize Appearance:**
   - Click the settings icon or open the extension options page
   - Choose a syntax highlighting theme and adjust display settings
   - Changes apply live to the current view

## Permissions

This extension requires specific permissions to function. For detailed explanations, see [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md):

- **`activeTab`** – Access the currently active tab to detect JSON content
- **`scripting`** – Execute scripts to extract JSON from `<pre>` tags
- **`sidePanel`** – Display the side panel UI
- **`tabs`** – Query and communicate with tabs
- **`storage`** – Save your chosen theme and display settings
- **`<all_urls>`** – Detect JSON on any website

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

## Future Enhancements

- 📥 Copy JSON block to clipboard
- 🔍 Search and filter keys/values within the tree
- 📝 Path display when hovering over a node
- ⚙️ Per-site settings memory

## License

This project is available under the MIT License.

## Support

For issues, feature requests, or feedback:
- Check existing issues in the repository
- Review [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md) for permission details
- Test on different websites and JSON structures to ensure compatibility

---

**Made with ❤️ for developers who live in JSON**
