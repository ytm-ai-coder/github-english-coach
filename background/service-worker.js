const MENU_ID = "gec-explain-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "用 GitHub 英语助手解释并记住",
      contexts: ["selection"],
      documentUrlPatterns: ["https://github.com/*"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id || !info.selectionText) return;
  chrome.tabs.sendMessage(tab.id, {
    type: "GEC_EXPLAIN_TEXT",
    text: info.selectionText
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "GEC_OPEN_REVIEW") {
    chrome.tabs.create({ url: chrome.runtime.getURL("review/review.html") });
  }
});
