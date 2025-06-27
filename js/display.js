/**
 * Manages the rendering and visual presentation of film and series content.
 *
 * This module provides functions to display popular items, individual films and series,
 * generate styled content cards, and handle empty result states. It also includes logic
 * to determine the type of a content item and structure the corresponding HTML output.
 * All rendering is performed by injecting HTML into predefined container elements in the DOM.
 *
 * @module display
 */

/**
 * Displays the most popular films and series based on IMDb ratings.
 *
 * Sorts the film and series data by descending IMDb rating, selects the top six items
 * from each category, and renders them using the appropriate display container.
 *
 * @function
 */
function displayPopularContent() {
    const popularFilms = Object.values(filmsData)
        .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
        .slice(0, 6);

    const popularSeries = Object.values(seriesData)
        .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
        .slice(0, 6);

    displayContent(popularFilms, "popularFilms");
    displayContent(popularSeries, "popularSeries");
}

/**
 * Displays a list of film items in the films display grid.
 *
 * Sorts the provided films alphabetically by title, then renders them
 * in the DOM element with the ID "filmsGrid" using the displayContent function.
 *
 * @function
 * @param {Object[]} films - An array of film objects to display.
 */
function displayFilms(films) {
    const sortedFilms = films.slice().sort((a, b) => a.title.localeCompare(b.title));
    displayContent(sortedFilms, "filmsGrid");
}

/**
 * Displays a list of film items in the series display grid.
 *
 * Sorts the provided series alphabetically by title, then renders them
 * in the DOM element with the ID "seriesGrid" using the displayContent function.
 *
 * @function
 * @param {Object[]} series - An array of series objects to display.
 */
function displaySeries(series) {
    const sortedSeries = series.slice().sort((a, b) => a.title.localeCompare(b.title));
    displayContent(sortedSeries, "seriesGrid");
}

/**
 * Displays a list of content items in the specified container.
 *
 * Retrieves the DOM element by its ID and populates it with content cards generated
 * from the provided items. If the container is not found or the items array is empty,
 * a "no results" message is displayed instead.
 *
 * @function
 * @param {Object[]} items - An array of content objects to display (e.g., films or series).
 * @param {string} containerId - The ID of the DOM element where the content should be rendered.
 */
function displayContent(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="fas fa-film"></i><p>Aucun contenu trouvé</p></div>';
        return;
    }

    container.innerHTML = items.map((item) => createContentCard(item)).join("");
}

/**
 * Creates an HTML content card for a given item (film or series).
 *
 * Builds a styled card element containing the item's title, banner image, genres,
 * release year, IMDb rating, and a badge indicating whether it has been fully watched.
 * The card includes an onclick handler to open a modal with detailed information.
 *
 * @function
 * @param {Object} item - The content item to render (must include title, genres, year, IMDb rating, and optionally a banner).
 * @returns {string} A string of HTML representing the content card.
 */
function createContentCard(item) {
    const genres = item.genres ? item.genres
        .slice(0, 3)
        .map((g) => `<span class="genre-tag">${g}</span>`)
        .join("") : "";
    const rating = item.IMDb ? `<div class="card-rating"><i class="fas fa-star"></i> ${item.IMDb}</div>` : "";
    const year = item.year ? `<span class="card-year">${item.year}</span>` : "";

    let watchedBadge = "";
    if (getItemType(item) === "film") {
        const watchData = getFilmWatchData(item.title);
        if (watchData.watched) {
            watchedBadge = `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i></span>`;
        }
    } else if (getItemType(item) === "series") {
        if (isSeriesFullyWatched(item)) {
            watchedBadge = `<span class="watched-badge" title="Série vue en entier"><i class="fas fa-eye"></i></span>`;
        }
    }

    return `
      <div class="content-card" onclick="openModal('${escapeForHTML(item.title)}', '${getItemType(item)}')">
        <div class="card-image">
          ${item.banner ? `<img src="${item.banner}" alt="${item.title}" onerror="this.style.display='none'">` : '<i class="fas fa-film"></i>'}
          ${watchedBadge}
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-meta">
            ${rating}
            ${year}
          </div>
          <div class="card-genres">${genres}</div>
        </div>
      </div>
    `;
}

/**
 * Determines the type of a content item based on its properties.
 *
 * Checks whether the item has a "seasons" property to classify it as a series;
 * otherwise, it is considered a film.
 *
 * @function
 * @param {Object} item - The content item to evaluate.
 * @returns {string} Returns "series" if the item has seasons, otherwise "film".
 */
function getItemType(item) {
    return item.seasons ? "series" : "film";
}

/**
 * Generates an HTML block displaying a "no results" message.
 *
 * Returns a styled HTML string containing an icon and a message, used when no content matches the user's search or filter criteria.
 *
 * @function
 * @param {string} [message="Aucun résultat trouvé"] - The message to display.
 * @returns {string} An HTML string representing the "no results" message.
 */
function showNoResults(message = "Aucun résultat trouvé") {
    return `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <p>${message}</p>
    </div>
  `;
}
