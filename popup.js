document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: extractText
    }, handleResult);
  });
});

function extractText() {
  // Function to check if a text node contains meaningful content
  function isValidTextNode(node) {
    return node.textContent.trim().length > 40;  // Minimum 40 characters
  }

  // Function to get the first meaningful paragraph
  function getFirstParagraph() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (isValidTextNode(node) && 
              node.parentElement.offsetWidth > 0 && 
              node.parentElement.offsetHeight > 0 &&
              window.getComputedStyle(node.parentElement).display !== 'none') {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text.length > 0) {
        return text;
      }
    }
    return "No readable text found on this page.";
  }

  return getFirstParagraph();
}

function handleResult(results) {
  if (results && results[0] && results[0].result) {
    document.getElementById('textContent').textContent = results[0].result;
  } else {
    document.getElementById('textContent').textContent = 
      "Unable to extract text from this page.";
  }
}