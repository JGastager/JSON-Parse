// JSON Parse SPA support: detect <pre> DOM changes and client-side navigation

let _debounceTimer = null;

function hasValidJson(text) {
  const t = (text || '').trim();
  if (!t) return false;
  try { JSON.parse(t); return true; } catch { return false; }
}

function rescanPage() {
  delete document.documentElement.dataset.jpHasJson;
  if (/json/i.test(document.contentType)) { document.documentElement.dataset.jpHasJson = '1'; return; }
  for (const pre of document.querySelectorAll('pre')) {
    if (hasValidJson(pre.textContent)) { document.documentElement.dataset.jpHasJson = '1'; return; }
  }
  for (const script of document.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]')) {
    if (hasValidJson(script.textContent)) { document.documentElement.dataset.jpHasJson = '1'; return; }
  }
  for (const code of document.querySelectorAll('code')) {
    if (code.closest('pre')) continue;
    if (hasValidJson(code.textContent)) { document.documentElement.dataset.jpHasJson = '1'; return; }
  }
}

function notifyRefresh() {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    rescanPage();
    chrome.runtime.sendMessage({ action: 'refreshJson' }).catch(() => { });
  }, 400);
}

// 1. Watch for <pre>, <script[type*=json]>, or <code> elements being added/removed or their text content changing
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList') {
      // If the mutation target itself is a JSON container, its content changed.
      const tgt = m.target;
      if (tgt.nodeType === 1) {
        const tgtTag = tgt.tagName;
        if (
          tgtTag === 'PRE' || tgtTag === 'CODE' ||
          (tgtTag === 'SCRIPT' && /json/i.test(tgt.type || ''))
        ) {
          notifyRefresh();
          return;
        }
      }
      for (const node of [...m.addedNodes, ...m.removedNodes]) {
        if (node.nodeType !== 1) continue;
        const tag = node.tagName;
        if (
          tag === 'PRE' || tag === 'CODE' ||
          (tag === 'SCRIPT' && /json/i.test(node.type || '')) ||
          node.querySelector('pre, code, script[type*="json"]')
        ) {
          notifyRefresh();
          return;
        }
      }
    } else if (m.type === 'characterData') {
      const parent = m.target.parentElement;
      if (
        parent?.closest('pre') ||
        parent?.closest('code') ||
        parent?.closest('script[type*="json"]')
      ) {
        notifyRefresh();
        return;
      }
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

// 2. SPA navigation via History API (pushState / replaceState)
function patchHistory(method) {
  const original = history[method];
  history[method] = function (...args) {
    const result = original.apply(this, args);
    notifyRefresh();
    return result;
  };
}
patchHistory('pushState');
patchHistory('replaceState');

// 3. Browser back / forward navigation
window.addEventListener('popstate', notifyRefresh);

// 4. Page restored from Back/Forward Cache (bfcache) — tabs.onUpdated does not fire for these.
window.addEventListener('pageshow', (e) => { if (e.persisted) notifyRefresh(); });

// 5. Initial scan — set dataset.jpHasJson so background.js can read it without re-scanning
rescanPage();

