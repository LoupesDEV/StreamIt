/**
 * @module display
 * @description
 * Manages rendering and updating the UI for films, series, and their details.
 * Handles DOM manipulation for displaying media content and metadata.
 */

/**
 * Displays the most popular films and series based on IMDb ratings.
 *
 * Sorts and selects the top 6 films and series, then renders them in their respective containers.
 *
 * @function
 * @returns {void}
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
 * Displays a sorted list of films in the films grid container.
 *
 * @function
 * @param {Object[]} films - Array of film objects to display.
 * @returns {void}
 */
function displayFilms(films) {
    const sortedFilms = films.slice().sort((a, b) => a.title.localeCompare(b.title));
    displayContent(sortedFilms, "filmsGrid");
}

/**
 * Displays a sorted list of series in the series grid container.
 *
 * @function
 * @param {Object[]} series - Array of series objects to display.
 * @returns {void}
 */
function displaySeries(series) {
    const sortedSeries = series.slice().sort((a, b) => a.title.localeCompare(b.title));
    displayContent(sortedSeries, "seriesGrid");
}

/**
 * Renders a list of content items (films or series) into a specified container.
 *
 * @function
 * @param {Object[]} items - Array of content items to display.
 * @param {string} containerId - The DOM element ID where content will be injected.
 * @returns {void}
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
 * Generates the HTML for a single content card (film or series).
 *
 * @function
 * @param {Object} item - The content item to render.
 * @returns {string} The HTML string for the content card.
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
 * Determines the type of a content item (film or series).
 *
 * @function
 * @param {Object} item - The content item to check.
 * @returns {string} Returns `"series"` if the item has a `seasons` property, otherwise `"film"`.
 */
function getItemType(item) {
    return item.seasons ? "series" : "film";
}

/**
 * Generates the HTML for a "no results" message.
 *
 * @function
 * @param {string} [message="Aucun résultat trouvé"] - The message to display.
 * @returns {string} The HTML string for the no results message.
 */
function showNoResults(message = "Aucun résultat trouvé") {
    return `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Retrieves the most recently added film from the films data.
 *
 * @function
 * @returns {Object} The latest film object.
 */
function getLatestFilm() {
    const films = Object.values(filmsData);
    return films[films.length - 1];
}

/**
 * Retrieves the most recently added series from the series data.
 *
 * @function
 * @returns {Object} The latest series object.
 */
function getLatestSeries() {
    const series = Object.values(seriesData);
    return series[series.length - 1];
}

/**
 * Renders the featured slider with the latest film and series.
 *
 * Handles slider navigation, auto-sliding, and click events to open modals for featured items.
 *
 * @function
 * @returns {void}
 */
function renderFeaturedSlider() {
    const film = getLatestFilm();
    const series = getLatestSeries();
    const slider = document.getElementById("featuredSlider");
    if (!slider) return;

    const featuredItems = [film, series];
    let currentIndex = 0;
    let autoSlideInterval;

    function render() {
        slider.innerHTML = `
            <div class="slider-wrapper">
                <div class="slider-track">
                    ${featuredItems.map((item, idx) => `
                        <div class="slider-card featured" data-idx="${idx}" style="cursor:pointer;">
                            <img src="${item.banner}" alt="${item.title}" class="slider-img">
                            <div class="slider-overlay">
                                <div class="slider-card-title">${item.title}</div>
                                <div class="slider-card-desc">${item.description}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <div class="slider-dots">
                    ${featuredItems.map((_, dotIdx) => `
                        <span class="slider-dot${dotIdx === currentIndex ? " active" : ""}" data-idx="${dotIdx}"></span>
                    `).join("")}
                </div>
            </div>
        `;

        const track = slider.querySelector(".slider-track");
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        slider.querySelectorAll(".slider-card.featured").forEach(card => {
            card.onclick = () => {
                const idx = parseInt(card.getAttribute("data-idx"));
                const item = featuredItems[idx];
                openModal(item.title, item.seasons ? "series" : "film");
            };
        });

        slider.querySelectorAll(".slider-dot").forEach(dot => {
            dot.onclick = (e) => {
                e.stopPropagation();
                currentIndex = parseInt(dot.getAttribute("data-idx"));
                render();
                resetAutoSlide();
            };
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % featuredItems.length;
        render();
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    render();
    resetAutoSlide();
}