# JSON Parse Extension - Permissions Justification

This document explains each permission requested by the JSON Parse extension and its purpose.

## Permissions Breakdown

### `activeTab`
**Why it's needed:** Allows the extension to access the currently active tab to detect and parse JSON content on the page.

**What it does:** Enables the side panel to identify and extract JSON from the webpage you're currently viewing.

**Use case:** When you open the side panel, this permission lets us see which tab is active so we can analyze that specific page's JSON content.

---

### `scripting`
**Why it's needed:** Allows the extension to execute JavaScript code on web pages to extract and parse JSON data, and to check whether a page contains JSON in order to update the toolbar icon.

**What it does:** Runs scripts on the webpage to find JSON contained in `<pre>` tags and to detect raw JSON responses (`application/json` content type), then parses and structures the data for display. Also used to detect JSON on page load so the toolbar icon can reflect whether the current page contains JSON.

**Use case:** This is essential for the core functionality—detecting, extracting, and visualizing JSON found on any webpage, as well as providing accurate icon state feedback.

---

### `sidePanel`
**Why it's needed:** Enables the extension to display a dedicated side panel in Chrome where parsed JSON is visualized.

**What it does:** Creates and manages the user interface panel on the side of your browser showing the interactive, formatted JSON tree.

**Use case:** Provides a convenient, persistent view of the JSON data without opening a popup, letting you explore it alongside the original page.

---

### `tabs`
**Why it's needed:** Allows the extension to query information about tabs, communicate with content scripts running on them, and track tab changes to keep the toolbar icon and side panel up to date.

**What it does:** Enables the extension to:
- Identify the active tab
- Send messages to tabs to trigger JSON extraction
- Listen for tab navigation (`onUpdated`) and tab switches (`onActivated`) to refresh the side panel and update the toolbar icon state

**Use case:** Ensures the side panel always reflects the JSON from the currently active tab, and that the toolbar icon correctly shows whether the current page contains JSON whenever you switch tabs or navigate.

---

### `storage`
**Why it's needed:** Allows the extension to save user preferences and settings.

**What it does:** Stores user options and configuration choices (such as the selected theme) locally in your browser.

**Use case:** Remembers your preferences across browser sessions, such as your chosen syntax highlighting theme.

---

### `<all_urls>` (Host Permissions)
**Why it's needed:** Allows the extension to run on any website to detect and parse JSON on any page you visit.

**What it does:** Grants permission for two content scripts to run on all pages:
1. **`content.js`** – Watches for `<pre>` DOM changes and client-side navigation (SPA support) and notifies the side panel to refresh.
2. **`json-page.js`** – Detects when the browser loads a raw JSON response (e.g. an API URL returning `application/json`) and replaces the browser’s plain-text view with the full interactive tree UI.

Also required for `scripting.executeScript` to extract JSON from `<pre>` tags and detect JSON for toolbar icon updates.

**Use case:** Enables the extension to work on any webpage—API responses, documentation, developer tools, or any site that displays raw JSON—and to transform bare JSON URLs into a rich, explorable view.

---

## Data Privacy

The JSON Parse extension:
- ✅ **Does NOT** collect or transmit your browsing data
- ✅ **Does NOT** store or log the JSON content from pages you visit
- ✅ **Does NOT** require internet connectivity to function
- ✅ Performs all parsing and visualization **locally in your browser** only

All processing happens on your machine and in your browser—no data is sent to external servers.
