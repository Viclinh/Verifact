chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkNews",
    title: "Verify with VeriFact",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "checkNews") {
    chrome.tabs.sendMessage(tab.id, {
      action: "analyzeNews",
      selectedText: info.selectionText
    });
  }
});