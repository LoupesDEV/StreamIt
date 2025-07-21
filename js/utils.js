/**
 * @module utils
 * @description
 * Provides utility functions for data access, string manipulation, and function debouncing.
 * Used across multiple modules to simplify common operations.
 */

/**
 * Retrieves a film object by its title from the film's data.
 *
 * @function
 * @param {string} title - The title of the film to retrieve.
 * @returns {Object} The film object containing metadata like title, description, genres, etc.
 */
function getFilmByTitle(title) {
    return filmsData[title];
}

/**
 * Retrieves a series object by its title from the series data.
 *
 * @function
 * @param {string} title - The title of the series to retrieve.
 * @returns {Object} The series object containing metadata like title, description, seasons, etc.
 */
function getSeriesByTitle(title) {
    return seriesData[title];
}

/**
 * Escapes backslashes and single quotes in a string for safe HTML/JS injection.
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
