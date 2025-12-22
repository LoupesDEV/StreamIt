const msg = localStorage.getItem("streamit_404_error");
const errorMessageEl = document.getElementById("error-message");
const errorCodeEl = document.getElementById("error-code");
const urlParams = new URLSearchParams(window.location.search);
const paramCode = urlParams.get("code");

if (msg && errorMessageEl) {
  errorMessageEl.textContent = msg;
  localStorage.removeItem("streamit_404_error");
} else if (msg && !errorMessageEl) {
  localStorage.removeItem("streamit_404_error");
}

if (errorCodeEl) {
  if (paramCode === "403") {
    errorCodeEl.textContent = "403 - Forbidden";
  } else
    errorCodeEl.textContent = (paramCode || "404").toString();
}

function handleErrorAndRedirect(message, code = 404) {
  localStorage.setItem("streamit_404_error", message);
  const safeCode = (typeof code === "number" || typeof code === "string") ? code : 404;
  window.location.href = `error.html?code=${encodeURIComponent(safeCode)}`;
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
      "L'utilisation des outils de développement est interdite sur cette page.", 403
    );
  }
});

(function detectDevTools() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page.", 403
    );
  }
  setTimeout(detectDevTools, 1000);
})();