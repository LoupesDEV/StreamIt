/**
 * @module error
 * @description
 * Provides global error handling and user-friendly error messages for the application.
 * Displays error notifications and logs issues for debugging.
 */

/**
 * Retrieves and displays the stored error message from localStorage, if present.
 * Removes the message from storage after displaying.
 *
 * @function
 * @returns {void}
 */
const msg = localStorage.getItem("streamit_404_error");
if (msg) {
    document.getElementById("error-message").textContent = msg;
    localStorage.removeItem("streamit_404_error");
}

/**
 * Stores an error message in localStorage and redirects to the error page.
 *
 * @function
 * @param {string} message - The error message to display on the error page.
 * @returns {void}
 */
function handleErrorAndRedirect(message) {
    localStorage.setItem("streamit_404_error", message);
    window.location.href = "error.html";
}

/**
 * Disables the context menu to prevent right-click actions.
 *
 * @event
 * @param {MouseEvent} e - The contextmenu event.
 * @returns {void}
 */
document.addEventListener("contextmenu", (e) => e.preventDefault());

/**
 * Blocks specific key combinations related to developer tools and source viewing.
 * Redirects to the error page with a message if such keys are pressed.
 *
 * @event
 * @param {KeyboardEvent} e - The keydown event.
 * @returns {void}
 */
document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || (e.ctrlKey && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
});

/**
 * Detects the use of developer tools by measuring debugger statement execution time.
 * If detected, redirects to the error page with a message.
 *
 * @function
 * @returns {void}
 * @private
 */
(function detectDevTools() {
    const start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
    setTimeout(detectDevTools, 1000);
})();
