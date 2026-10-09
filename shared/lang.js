// Load in <head> of every page: picks the language before first paint, so only one language is ever shown.
// The key is shared by the portal and all decks, so a choice made on one page carries to the others.
try { var l = localStorage.getItem('deck-lang2'); document.documentElement.dataset.lang = /^(zh|en|ko)$/.test(l) ? l : 'en'; }
catch (e) { document.documentElement.dataset.lang = 'en'; }
