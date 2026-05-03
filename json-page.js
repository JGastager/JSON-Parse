// json-page.js — Renders raw JSON file tabs as the JSON Parse styled tree
(function () {
    'use strict';

    // ── Detection ────────────────────────────────────────────────────────────
    // Only act when the entire page is a JSON document.
    const isJsonContentType = document.contentType === 'application/json';
    const isSinglePrePage = (
        document.body &&
        document.body.children.length === 1 &&
        document.body.children[0].tagName === 'PRE'
    );
    if (!isJsonContentType && !isSinglePrePage) return;

    const pre = document.querySelector('pre');
    if (!pre) return;
    const raw = (pre.textContent || '').trim();
    if (!raw) return;

    let parsed;
    try { parsed = JSON.parse(raw); } catch { return; }

    // ── Themes (loaded from themes.json) ────────────────────────────────────
    let THEMES = {};

    // ── Settings defaults ────────────────────────────────────────────────────
    let SETTINGS = { quoteKeys: true, countOnly: false, wrapStrings: false, colorBrackets: true, showCommas: true };
    const AUTO_COLLAPSE_DEPTH = 2;

    // ── Inject CSS ───────────────────────────────────────────────────────────
    function injectStyles(themeKey, settings) {
        const t = THEMES[themeKey] || THEMES.material;
        const bracketColor = settings.colorBrackets !== false ? t.bracket : t.punct;
        const braceColor = settings.colorBrackets !== false ? t.brace : t.punct;

        // Load the static stylesheet once
        if (!document.getElementById('jp-stylesheet')) {
            const link = document.createElement('link');
            link.id = 'jp-stylesheet';
            link.rel = 'stylesheet';
            link.href = chrome.runtime.getURL('style.css');
            document.head.appendChild(link);
        }

        // Inject only the dynamic theme variables
        const themeVars = `
#jp-page-root {
  --json-key:     ${t.key};
  --json-string:  ${t.string};
  --json-number:  ${t.number};
  --json-boolean: ${t.boolean};
  --json-null:    ${t.null};
  --json-bracket: ${bracketColor};
  --json-brace:   ${braceColor};
  --json-punct:   ${t.punct};
}`;

        // Update or create the theme vars style tag
        let style = document.getElementById('jp-theme-vars');
        if (!style) {
            style = document.createElement('style');
            style.id = 'jp-theme-vars';
            document.head.appendChild(style);
        }
        style.textContent = themeVars;
    }

    // ── DOM helpers ──────────────────────────────────────────────────────────
    function createEl(tag, className) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    }

    function createSpan(className, text) {
        const el = createEl('span', className);
        el.textContent = text;
        return el;
    }

    // ── Tree builder (mirrors sidepanel.js) ──────────────────────────────────
    function buildJsonTree(container, value, key, depth, isLast, path = '$', arrayIndex = null) {
        const row = createEl('div', 'json-row');
        row.style.paddingLeft = `${depth * 20}px`;
        row._jpData = { key: arrayIndex !== null ? arrayIndex : key, value, path };

        if (key !== null && key !== undefined) {
            const keyText = SETTINGS.quoteKeys ? `"${key}"` : key;
            row.appendChild(createSpan('json-key', keyText));
            row.appendChild(createSpan('json-punct', ': '));
        }

        if (value === null) {
            row.insertBefore(createSpan('json-toggle-spacer', ''), row.firstChild);
            row.appendChild(createSpan('json-null', 'null'));
            if (!isLast && SETTINGS.showCommas !== false) row.appendChild(createSpan('json-punct', ','));
            container.appendChild(row);
            return;
        }
        if (typeof value === 'boolean') {
            row.insertBefore(createSpan('json-toggle-spacer', ''), row.firstChild);
            row.appendChild(createSpan('json-boolean', String(value)));
            if (!isLast && SETTINGS.showCommas !== false) row.appendChild(createSpan('json-punct', ','));
            container.appendChild(row);
            return;
        }
        if (typeof value === 'number') {
            row.insertBefore(createSpan('json-toggle-spacer', ''), row.firstChild);
            row.appendChild(createSpan('json-number', String(value)));
            if (!isLast && SETTINGS.showCommas !== false) row.appendChild(createSpan('json-punct', ','));
            container.appendChild(row);
            return;
        }
        if (typeof value === 'string') {
            const display = value.length > 300 ? value.slice(0, 300) + '\u2026' : value;
            row.insertBefore(createSpan('json-toggle-spacer', ''), row.firstChild);
            row.appendChild(createSpan('json-string', `"${display}"`));
            if (!isLast && SETTINGS.showCommas !== false) row.appendChild(createSpan('json-punct', ','));
            container.appendChild(row);
            return;
        }

        const isArray = Array.isArray(value);
        const childKeys = isArray ? null : Object.keys(value);
        const count = isArray ? value.length : childKeys.length;
        const openChar = isArray ? '[' : '{';
        const closeChar = isArray ? ']' : '}';
        const bracketClass = isArray ? 'json-bracket' : 'json-brace';

        // Empty array/object — render inline without a collapsible
        if (count === 0) {
            row.insertBefore(createSpan('json-toggle-spacer', ''), row.firstChild);
            row.appendChild(createSpan(bracketClass, openChar));
            row.appendChild(createSpan(bracketClass, closeChar));
            if (!isLast && SETTINGS.showCommas !== false) row.appendChild(createSpan('json-punct', ','));
            container.appendChild(row);
            return;
        }

        const collapsed = depth >= AUTO_COLLAPSE_DEPTH;

        const toggle = createSpan('json-toggle', '');
        if (!collapsed) toggle.classList.add('open');
        row.insertBefore(toggle, row.firstChild);
        row.appendChild(createSpan(bracketClass, openChar));

        const summary = createEl('span', 'json-summary');
        const label = SETTINGS.countOnly
            ? `\u00A0${count}\u00A0`
            : isArray
                ? `\u00A0${count}\u00A0${count === 1 ? 'item' : 'items'}\u00A0`
                : `\u00A0${count}\u00A0${count === 1 ? 'key' : 'keys'}\u00A0`;
        summary.appendChild(document.createTextNode(label));
        summary.appendChild(createSpan(bracketClass, closeChar));
        if (!isLast && SETTINGS.showCommas !== false) summary.appendChild(createSpan('json-punct', ','));
        summary.style.display = collapsed ? 'inline' : 'none';
        row.appendChild(summary);

        row.classList.add('json-collapsible');
        container.appendChild(row);

        const childContainer = createEl('div', 'json-children');
        childContainer.style.setProperty('--indent-x', `${depth * 20 + 7}px`);
        childContainer.style.display = collapsed ? 'none' : '';

        if (isArray) {
            value.forEach((item, i) => {
                buildJsonTree(childContainer, item, null, depth + 1, i === value.length - 1, `${path}[${i}]`, i);
            });
        } else {
            childKeys.forEach((k, i) => {
                const childPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
                    ? `${path}.${k}`
                    : `${path}["${k.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
                buildJsonTree(childContainer, value[k], k, depth + 1, i === childKeys.length - 1, childPath);
            });
        }
        container.appendChild(childContainer);

        const closingRow = createEl('div', 'json-row json-closing');
        closingRow.style.paddingLeft = `${depth * 20}px`;
        closingRow.appendChild(createSpan('json-toggle-spacer', ''));
        closingRow.appendChild(createSpan(bracketClass, closeChar));
        if (!isLast && SETTINGS.showCommas !== false) closingRow.appendChild(createSpan('json-punct', ','));
        closingRow.style.display = collapsed ? 'none' : '';
        container.appendChild(closingRow);

        row._jsonCollapsible = { toggle, summary, childContainer, closingRow };

        row.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = childContainer.style.display === 'none';

            if (e.shiftKey) {
                Array.from(container.children)
                    .filter(el => el.classList.contains('json-collapsible') && el._jsonCollapsible)
                    .forEach(sibling => {
                        const c = sibling._jsonCollapsible;
                        c.childContainer.style.display = isCollapsed ? '' : 'none';
                        c.closingRow.style.display = isCollapsed ? '' : 'none';
                        c.summary.style.display = isCollapsed ? 'none' : 'inline';
                        c.toggle.classList.toggle('open', isCollapsed);
                    });
            } else {
                childContainer.style.display = isCollapsed ? '' : 'none';
                closingRow.style.display = isCollapsed ? '' : 'none';
                summary.style.display = isCollapsed ? 'none' : 'inline';
                toggle.classList.toggle('open', isCollapsed);
            }
        });
    }

    // ── Context menu ─────────────────────────────────────────────────────────
    function setupContextMenu(root) {
        let menu = null;
        let targetRow = null;

        function hideMenu() {
            if (menu) { menu.remove(); menu = null; }
            targetRow = null;
        }

        function showMenu(e, row) {
            hideMenu();
            targetRow = row;

            menu = createEl('div');
            menu.id = 'jp-context-menu';

            const isCollapsible = row.classList.contains('json-collapsible') && row._jsonCollapsible;
            const isCollapsed = isCollapsible && row._jsonCollapsible.childContainer.style.display === 'none';

            const actions = [
                { action: 'copy-key', label: 'Copy Key', iconClass: 'jp-ctx-icon-key' },
                { action: 'copy-value', label: 'Copy Value', iconClass: 'jp-ctx-icon-value' },
                { action: 'copy-path', label: 'Copy Path', iconClass: 'jp-ctx-icon-path' },
                ...(isCollapsible ? [{ action: 'toggle-collapse', label: isCollapsed ? 'Expand' : 'Collapse', iconClass: isCollapsed ? 'jp-ctx-icon-expand' : 'jp-ctx-icon-collapse' }] : []),
            ];

            actions.forEach(({ action, label, iconClass }) => {
                const item = createEl('div', 'jp-ctx-item');
                const icon = createEl('span', `jp-ctx-icon ${iconClass}`);
                const labelEl = createEl('span');
                labelEl.textContent = label;
                item.appendChild(icon);
                item.appendChild(labelEl);
                item.addEventListener('click', () => {
                    if (!targetRow || !targetRow._jpData) { hideMenu(); return; }
                    const { key, value, path } = targetRow._jpData;
                    if (action === 'toggle-collapse') {
                        if (!targetRow._jsonCollapsible) { hideMenu(); return; }
                        const c = targetRow._jsonCollapsible;
                        const collapsed = c.childContainer.style.display === 'none';
                        c.childContainer.style.display = collapsed ? '' : 'none';
                        c.closingRow.style.display = collapsed ? '' : 'none';
                        c.summary.style.display = collapsed ? 'none' : 'inline';
                        c.toggle.classList.toggle('open', collapsed);
                        hideMenu();
                        return;
                    }
                    let text = '';
                    if (action === 'copy-key') {
                        text = key !== null && key !== undefined ? String(key) : '';
                    } else if (action === 'copy-value') {
                        text = value === null ? 'null'
                            : typeof value === 'object' ? JSON.stringify(value, null, 2)
                                : String(value);
                    } else if (action === 'copy-path') {
                        text = path || '';
                    }
                    navigator.clipboard.writeText(text).catch(() => { });
                    hideMenu();
                });
                menu.appendChild(item);
            });

            menu.style.left = '0px';
            menu.style.top = '0px';
            root.appendChild(menu);

            const rect = menu.getBoundingClientRect();
            const x = Math.min(e.clientX, window.innerWidth - rect.width - 8);
            const y = Math.min(e.clientY, window.innerHeight - rect.height - 8);
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
        }

        root.addEventListener('contextmenu', (e) => {
            const row = e.target.closest('.json-row');
            if (!row || !row._jpData) return;
            e.preventDefault();
            showMenu(e, row);
        });

        root.addEventListener('click', (e) => { if (!e.target.closest('#jp-context-menu')) hideMenu(); }, true);
        root.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideMenu(); });
    }

    // ── Path tooltip ─────────────────────────────────────────────────────────
    function setupPathTooltip(root) {
        let tooltip = document.getElementById('jp-path-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'jp-path-tooltip';
            document.body.appendChild(tooltip);
        }

        let hoverTimer = null;
        let currentRow = null;

        function show(path, x, y) {
            tooltip.textContent = path;
            tooltip.classList.add('visible');
            position(x, y);
        }

        function hide() {
            clearTimeout(hoverTimer);
            hoverTimer = null;
            currentRow = null;
            tooltip.classList.remove('visible');
        }

        function position(x, y) {
            const gap = 12;
            tooltip.style.left = '0px';
            tooltip.style.top = '0px';
            const rect = tooltip.getBoundingClientRect();
            const left = Math.min(x + gap, window.innerWidth - rect.width - 8);
            const top = y - rect.height - gap;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top < 8 ? y + gap : top}px`;
        }

        root.addEventListener('mouseover', (e) => {
            if (!e.target.classList.contains('json-key')) { hide(); return; }
            const row = e.target.closest('.json-row');
            if (!row || !row._jpData || !row._jpData.path) { hide(); return; }
            if (row === currentRow) return;
            clearTimeout(hoverTimer);
            currentRow = row;
            hoverTimer = setTimeout(() => show(row._jpData.path, e.clientX, e.clientY), 500);
        });

        root.addEventListener('mouseout', (e) => {
            const row = e.target.closest('.json-row');
            if (row && row === currentRow && !row.contains(e.relatedTarget)) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
                currentRow = null;
                tooltip.classList.remove('visible');
            }
        });

        root.addEventListener('mouseleave', hide);
    }

    // ── Search ───────────────────────────────────────────────────────────────
    function setupSearch(root, header, headerBtns, body) {
        // Search toggle button in header
        const searchBtn = createEl('div', 'btn');
        searchBtn.title = 'Search (Ctrl+F)';
        searchBtn.appendChild(createEl('span', 'i-search-btn'));
        headerBtns.prepend(searchBtn);

        const wrap = createEl('div');
        wrap.id = 'search-input-wrap';
        wrap.style.display = 'none';

        const icon = createEl('span', 'i-search');
        const input = document.createElement('input');
        input.id = 'search-input';
        input.type = 'text';
        input.placeholder = 'Search keys & values…';
        input.spellcheck = false;
        input.autocomplete = 'off';
        const countEl = createEl('span');
        countEl.id = 'search-count';
        const prevBtn = createEl('button', 'search-nav-btn');
        prevBtn.title = 'Previous match';
        prevBtn.appendChild(createEl('span', 'i-search-prev'));
        const nextBtn = createEl('button', 'search-nav-btn');
        nextBtn.title = 'Next match';
        nextBtn.appendChild(createEl('span', 'i-search-next'));
        const closeBtn = document.createElement('button');
        closeBtn.id = 'search-close';
        closeBtn.title = 'Close search';
        closeBtn.appendChild(createEl('span', 'i-search-close'));

        wrap.append(icon, input, countEl, prevBtn, nextBtn, closeBtn);

        // Insert wrap before the settings button (last child of header)
        header.insertBefore(wrap, header.lastElementChild);

        const state = { matches: [], current: -1 };

        function clearHighlights() {
            root.querySelectorAll('.search-highlight').forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
            state.matches = [];
            state.current = -1;
        }

        function highlightSpan(span, query) {
            const text = span.textContent;
            const lower = text.toLowerCase();
            const q = query.toLowerCase();
            const positions = [];
            let idx = 0;
            while ((idx = lower.indexOf(q, idx)) !== -1) { positions.push(idx); idx += q.length; }
            if (!positions.length) return;
            const frag = document.createDocumentFragment();
            let last = 0;
            positions.forEach(start => {
                if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
                const mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = text.slice(start, start + query.length);
                frag.appendChild(mark);
                last = start + query.length;
            });
            if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
            span.replaceChildren(frag);
            span.querySelectorAll('.search-highlight').forEach(m => state.matches.push(m));
        }

        function runSearch(query) {
            clearHighlights();
            if (!query) { updateCount(); return; }
            root.querySelectorAll('.json-key, .json-string, .json-number, .json-boolean, .json-null').forEach(span => {
                highlightSpan(span, query);
            });
            state.matches.forEach(mark => {
                let el = mark.parentElement;
                while (el && el !== root) {
                    if (el.classList.contains('json-collapsible') && el._jsonCollapsible) {
                        const c = el._jsonCollapsible;
                        if (c.childContainer.style.display === 'none') {
                            c.childContainer.style.display = '';
                            c.closingRow.style.display = '';
                            c.summary.style.display = 'none';
                            c.toggle.classList.add('open');
                        }
                    }
                    el = el.parentElement;
                }
            });
            updateCount();
            if (state.matches.length) navigateTo(0);
        }

        function navigateTo(index) {
            state.matches.forEach(m => m.classList.remove('active'));
            if (!state.matches.length) return;
            state.current = (index + state.matches.length) % state.matches.length;
            const active = state.matches[state.current];
            active.classList.add('active');
            active.scrollIntoView({ block: 'center', behavior: 'smooth' });
            updateCount();
        }

        function updateCount() {
            const total = state.matches.length;
            if (!total) {
                countEl.textContent = input.value ? '0 / 0' : '';
                countEl.classList.toggle('no-match', !!input.value);
            } else {
                countEl.textContent = `${state.current + 1} / ${total}`;
                countEl.classList.remove('no-match');
            }
            prevBtn.disabled = total < 2;
            nextBtn.disabled = total < 2;
        }

        function openSearch() {
            wrap.style.display = 'flex';
            input.focus();
            input.select();
        }

        function closeSearch() {
            wrap.style.display = 'none';
            clearHighlights();
            input.value = '';
            countEl.textContent = '';
        }

        searchBtn.addEventListener('click', openSearch);

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); openSearch(); }
            if (e.key === 'Escape' && wrap.style.display !== 'none') closeSearch();
        }, true);

        input.addEventListener('input', () => runSearch(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.shiftKey ? navigateTo(state.current - 1) : navigateTo(state.current + 1);
            }
        });

        prevBtn.addEventListener('click', () => navigateTo(state.current - 1));
        nextBtn.addEventListener('click', () => navigateTo(state.current + 1));
        closeBtn.addEventListener('click', closeSearch);
    }

    // ── Page takeover ────────────────────────────────────────────────────────
    function renderPage(themeKey, settings) {
        Object.assign(SETTINGS, settings);
        injectStyles(themeKey, settings);

        // Build root container
        const root = createEl('div');
        root.id = 'jp-page-root';

        // Header
        const header = createEl('div');
        header.id = 'jp-page-header';

        const titleEl = createEl('span');
        titleEl.id = 'jp-page-title';
        titleEl.textContent = location.pathname.split('/').pop() || 'JSON';

        const settingsBtn = createEl('div');
        settingsBtn.className = 'btn';
        settingsBtn.title = 'Open settings';
        settingsBtn.appendChild(createEl('span', 'i-gear'));
        settingsBtn.addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openOptions' }));

        const rawBtn = createEl('div');
        rawBtn.className = 'btn';
        rawBtn.title = 'View raw JSON';
        rawBtn.appendChild(createEl('span', 'i-raw'));
        rawBtn.addEventListener('click', () => {
            if (rawBtn.classList.contains('active')) {
                rawBtn.classList.remove('active');
                rawBtn.title = 'View raw JSON';
                body.innerHTML = '';
                const newTree = createEl('div', 'json-tree');
                if (SETTINGS.wrapStrings) newTree.classList.add('wrap-strings');
                buildJsonTree(newTree, parsed, null, 0, true);
                body.appendChild(newTree);
            } else {
                rawBtn.classList.add('active');
                rawBtn.title = 'View tree';
                body.innerHTML = '';
                const pre = createEl('pre', 'jp-raw-json');
                pre.textContent = JSON.stringify(parsed, null, 2);
                body.appendChild(pre);
            }
        });

        header.appendChild(titleEl);

        const headerBtns = createEl('div', 'jp-header-btns');
        headerBtns.appendChild(rawBtn);
        headerBtns.appendChild(settingsBtn);
        header.appendChild(headerBtns);

        root.appendChild(header);

        // Scrollable body
        const body = createEl('div');
        body.id = 'jp-page-body';

        const tree = createEl('div', 'json-tree');
        if (settings.wrapStrings) tree.classList.add('wrap-strings');
        buildJsonTree(tree, parsed, null, 0, true);
        body.appendChild(tree);

        root.appendChild(body);

        // Replace page content
        document.documentElement.style.cssText = 'margin:0;padding:0;height:100%;overflow:hidden;';
        document.body.style.cssText = 'margin:0;padding:0;height:100%;overflow:hidden;';
        document.body.innerHTML = '';
        document.body.appendChild(root);
        setupContextMenu(root);
        setupPathTooltip(root);
        setupSearch(root, header, headerBtns, body);

        // Update page title
        document.title = location.pathname.split('/').pop() || 'JSON Parse';
    }

    // ── Load settings then render ────────────────────────────────────────────
    fetch(chrome.runtime.getURL('themes.json'))
        .then(r => r.json())
        .then(themes => {
            THEMES = themes;
            chrome.storage.sync.get(['jsonParseTheme', 'jsonParseSettings'], (data) => {
                const theme = data.jsonParseTheme || 'material';
                const settings = data.jsonParseSettings || {};
                renderPage(theme, settings);
            });
        });

    // Re-render if settings change while the tab is open
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.jsonParseTheme || changes.jsonParseSettings) {
            chrome.storage.sync.get(['jsonParseTheme', 'jsonParseSettings'], (data) => {
                const theme = data.jsonParseTheme || 'material';
                const settings = data.jsonParseSettings || {};
                renderPage(theme, settings);
            });
        }
    });

})();
