chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// -- Icon state -------------------------------------------------------------

let _iconActive = null;  // JSON detected
let _iconLight = null;   // no JSON, light theme
let _iconDark = null;    // no JSON, dark theme

async function pngToImageData(url, size) {
  const blob = await (await fetch(url)).blob();
  const bitmap = await createImageBitmap(blob, { resizeWidth: size, resizeHeight: size });
  const canvas = new OffscreenCanvas(size, size);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  return canvas.getContext('2d').getImageData(0, 0, size, size);
}

async function loadIcons() {
  if (_iconActive && _iconLight && _iconDark) return;
  const sizes = [16, 32, 48];
  const [activeFrames, lightFrames, darkFrames] = await Promise.all([
    Promise.all(sizes.map(s => pngToImageData(chrome.runtime.getURL('icon-active.png'), s))),
    Promise.all(sizes.map(s => pngToImageData(chrome.runtime.getURL('icon-light.png'), s))),
    Promise.all(sizes.map(s => pngToImageData(chrome.runtime.getURL('icon-dark.png'), s))),
  ]);
  _iconActive = Object.fromEntries(sizes.map((s, i) => [s, activeFrames[i]]));
  _iconLight = Object.fromEntries(sizes.map((s, i) => [s, lightFrames[i]]));
  _iconDark = Object.fromEntries(sizes.map((s, i) => [s, darkFrames[i]]));
}

async function updateIcon(tabId) {
  await loadIcons();
  let hasJson = false;
  let isDark = false;
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // Raw JSON document
        if (/json/i.test(document.contentType)) return { hasJson: true, isDark: dark };
        // JSON in <pre> tags
        for (const pre of document.querySelectorAll('pre')) {
          const text = (pre.textContent || '').trim();
          if (text) try { JSON.parse(text); return { hasJson: true, isDark: dark }; } catch { }
        }
        return { hasJson: false, isDark: dark };
      }
    });
    hasJson = result?.result?.hasJson === true;
    isDark = result?.result?.isDark === true;
  } catch {
    // Restricted page (chrome://, etc.) — leave icon unchanged
    return;
  }
  const disabledIcon = isDark ? _iconDark : _iconLight;
  chrome.action.setIcon({ tabId, imageData: hasJson ? _iconActive : disabledIcon });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') updateIcon(tabId);
});

chrome.tabs.onActivated.addListener(({ tabId }) => updateIcon(tabId));

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'refreshJson' && sender.tab) {
    updateIcon(sender.tab.id);
  }
});
