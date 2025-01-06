function replaceWordInDOM(word, replacement) {
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const newText = text.replace(
        new RegExp(`\\b${word}\\b`, "gi"),
        replacement,
      );
      if (newText !== text) {
        node.textContent = newText;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(traverse);
    }
  }

  traverse(document.body);
}

replaceWordInDOM("dishpit", "dipshit");
