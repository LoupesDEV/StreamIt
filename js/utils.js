function escapeForHTML(str) {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
});

(function detectDevTools() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
  setTimeout(detectDevTools, 1000);
})();
