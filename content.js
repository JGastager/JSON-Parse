// JSON Parse SPA support: detect <pre> DOM changes and client-side navigation

let _debounceTimer = null;

function notifyRefresh() {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    chrome.runtime.sendMessage({ action: 'refreshJson' }).catch(() => { });
  }, 400);
}

// 1. Watch for <pre>, <script[type*=json]>, or <code> elements being added/removed or their text content changing
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList') {
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

