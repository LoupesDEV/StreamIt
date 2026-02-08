/**
 * js/errorHandler.js
 * Handles error display and developer tools prevention.
 * @module errorHandler
 */

// Retrieve error message from localStorage for display
const msg = localStorage.getItem("streamit_error");

// Get references to error display elements
const errorMessageEl = document.getElementById("error-message");
const errorCodeEl = document.getElementById("error-code");

// Parse error code from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const paramCode = urlParams.get("code");

// Display error message if it exists in localStorage
if (msg && errorMessageEl) {
  errorMessageEl.textContent = msg;
  // Clean up localStorage after displaying the message
  localStorage.removeItem("streamit_error");
} else if (msg && !errorMessageEl) {
  // Clean up localStorage if error element doesn't exist
  localStorage.removeItem("streamit_error");
}

// Display error code from URL parameter or default to 404
if (errorCodeEl) {
  // Special formatting for 403 Forbidden errors
  if (paramCode === "403") {
    errorCodeEl.textContent = "403 - Forbidden";
  } else
    // Display the provided error code or default to 404
    errorCodeEl.textContent = (paramCode || "404").toString();
}

/**
 * Handles an error by storing the message and redirecting to the error page.
 * @param {string} message - The error message to display.
 * @param {number|string} [code=404] - The error code to display.
 */
function handleErrorAndRedirect(message, code = 404) {
  localStorage.setItem("streamit_error", message);
  const safeCode = (typeof code === "number" || typeof code === "string") ? code : 404;
  window.location.href = `error.html?code=${encodeURIComponent(safeCode)}`;
}

// Prevent right-click context menu to protect content
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Prevent common developer tools keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Detect F12, Ctrl+Shift+I (Inspect), or Ctrl+U (View Source)
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    // Redirect to error page with 403 status
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page.", 403
    );
  }
});

/**
 * Detects if developer tools are open and redirects if so.
 */
(function detectDevTools() {
  // Measure time taken by debugger statement (slow if devtools open)
  const start = Date.now();
  debugger; // This pauses execution if developer tools are open
  if (Date.now() - start > 100) {
    // Developer tools detected - redirect to error page
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page.", 403
    );
  }
  // Run detection check every second
  setTimeout(detectDevTools, 1000);
})();