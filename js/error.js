const msg = localStorage.getItem("streamit_404_error");
if (msg) {
  document.getElementById("error-message").textContent = msg;
  localStorage.removeItem("streamit_404_error");
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
      "Encore toi ? Même en appuyant sur tous les boutons, tu n'auras pas le trésor caché ici !"
    );
  }
});

(function detectDevTools() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    handleErrorAndRedirect(
      "Encore toi ? Même en appuyant sur tous les boutons, tu n'auras pas le trésor caché ici !"
    );
  }
  setTimeout(detectDevTools, 1000);
})();
