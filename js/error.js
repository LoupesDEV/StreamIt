/**
 * Handles error display and intrusion detection for the application.
 *
 * This module provides functionality to redirect users to a custom error page with a stored message,
 * and dynamically displays it when the page loads. It also includes basic protection mechanisms
 * against inspection or tampering attempts by disabling context menus, blocking specific key combinations,
 * and detecting the use of developer tools. When suspicious behavior is detected, a playful error message is shown.
 *
 * @module error
 */

const msg = localStorage.getItem("streamit_404_error");
if (msg) {
    document.getElementById("error-message").textContent = msg;
    localStorage.removeItem("streamit_404_error");
}

/**
 * Handles an error by storing a message in localStorage and redirecting to an error page.
 *
 * Saves the provided error message under the key "streamit_404_error" and navigates the user to "error.html".
 * This is used to display custom error information on a dedicated error page.
 *
 * @function
 * @param {string} message - The error message to store and display.
 */
function handleErrorAndRedirect(message) {
    localStorage.setItem("streamit_404_error", message);
    window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || (e.ctrlKey && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        handleErrorAndRedirect("Encore toi ? Même en appuyant sur tous les boutons, tu n'auras pas le trésor caché ici !");
    }
});

(function detectDevTools() {
    const start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        handleErrorAndRedirect("Encore toi ? Même en appuyant sur tous les boutons, tu n'auras pas le trésor caché ici !");
    }
    setTimeout(detectDevTools, 1000);
})();
