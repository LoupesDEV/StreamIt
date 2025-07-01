/**
 * Provides utility functions and basic protection mechanisms for the application.
 *
 * This module includes functions to retrieve film and series data, escape strings for HTML/JS,
 * debounce function calls, and handle errors by redirecting to an error page.
 * It also includes basic protection against developer tools usage by preventing context menu actions,
 * disabling certain key combinations, and detecting if developer tools are open.
 *
 * @module utils
 */

/**
 * Retrieves a film object by its title from the film's data.
 *
 * @param title - The title of the film to retrieve.
 * @returns {Object} - The film object containing metadata like title, description, genres, etc.
 */
function getFilmByTitle(title) {
    return filmsData[title];
}

/**
 * Retrieves a series object by its title from the series data.
 *
 * @param title - The title of the series to retrieve.
 * @returns {Object} - The series object containing metadata like title, description, seasons, etc.
 */
function getSeriesByTitle(title) {
    return seriesData[title];
}

/**
 * Escapes backslashes and single quotes in a string for safe HTML/JS injection.
 *
 * Commonly used to prevent syntax errors when embedding strings inside HTML attributes or JS code.
 *
 * @function
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeForHTML(str) {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Creates a debounced version of a function that delays its execution.
 *
 * Useful for limiting the rate at which a function is called, such as during user input events.
 *
 * @function
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} A debounced version of the original function.
 */
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

/**
 * Redirects the user to an error page and stores a custom error message in localStorage.
 *
 * @function
 * @param {string} message - The message to display on the error page.
 */
function handleErrorAndRedirect(message) {
    localStorage.setItem("streamit_404_error", message);
    window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || (e.ctrlKey && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
});

(function detectDevTools() {
    const start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
    setTimeout(detectDevTools, 1000);
})();
