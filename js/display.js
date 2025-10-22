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
  const sortedFilms = films
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
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
  const sortedSeries = series
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
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
    container.innerHTML =
      '<div class="no-results"><i class="fas fa-film"></i><p>Aucun contenu trouvé</p></div>';
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
  const genres = item.genres
    ? item.genres
        .slice(0, 3)
        .map((g) => `<span class="genre-tag">${g}</span>`)
        .join("")
    : "";
  const rating = item.IMDb
    ? `<div class="card-rating"><i class="fas fa-star"></i> ${item.IMDb}</div>`
    : "";
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
      <div class="content-card" onclick="openModal('${escapeForHTML(
        item.title
      )}', '${getItemType(item)}')">
        <div class="card-image">
          ${
            item.banner
              ? `<img src="${item.banner}" alt="${item.title}" onerror="this.style.display='none'">`
              : '<i class="fas fa-film"></i>'
          }
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
          ${featuredItems
            .map(
              (item, idx) => `
              <div class="slider-card featured ${
                idx === currentIndex ? "active" : ""
              }"
                   data-idx="${idx}" style="cursor:pointer;" aria-hidden="${
                idx === currentIndex ? "false" : "true"
              }">
                <img src="${item.banner}" alt="${
                item.title
              }" class="slider-img" onerror="this.style.display='none'">
                <div class="slider-overlay">
                  <div class="slider-card-title">${item.title}</div>
                  <div class="slider-card-desc">${item.description}</div>
                </div>
              </div>
            `
            )
            .join("")}
        </div>
        <div class="slider-dots">
          ${featuredItems
            .map(
              (_, dotIdx) => `
                <span class="slider-dot${
                  dotIdx === currentIndex ? " active" : ""
                }" data-idx="${dotIdx}"></span>
              `
            )
            .join("")}
        </div>
      </div>
    `;

    slider.querySelectorAll(".slider-card.featured").forEach((card) => {
      card.onclick = () => {
        const idx = parseInt(card.getAttribute("data-idx"));
        const item = featuredItems[idx];
        openModal(item.title, item.seasons ? "series" : "film");
      };
    });

    slider.querySelectorAll(".slider-dot").forEach((dot) => {
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

/**
 * Displays available collections in the collections grid.
 * Fetches `data/collections.json` if `collectionsData` is not already loaded.
 *
 * @function
 * @returns {Promise<void>}
 */
async function displayCollections() {
  const container = document.getElementById("collectionsGrid");
  if (!container) return;

  try {
    if (typeof collectionsData === "undefined") {
      const resp = await fetch("data/collections.json");
      collectionsData = await resp.json();
    }

    const collections = Object.values(collectionsData || {}).sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );
    if (!collections || collections.length === 0) {
      container.innerHTML =
        '<div class="no-results"><i class="fas fa-folder-open"></i><p>Aucune collection trouvée</p></div>';
      return;
    }

    container.innerHTML = collections
      .map((col) => createCollectionCard(col))
      .join("");
  } catch (err) {
    console.error("Erreur en chargeant les collections:", err);
    container.innerHTML =
      '<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Erreur lors du chargement des collections</p></div>';
  }
}

/**
 * Creates HTML for a single collection card.
 * Clicking the card opens a modal that lists all films and series in the collection.
 *
 * @function
 * @param {Object} collection - The collection object ({ name, films, series }).
 * @returns {string} HTML string for the collection card.
 */
function createCollectionCard(collection) {
  const filmsCount = collection.films ? collection.films.length : 0;
  const seriesCount = collection.series ? collection.series.length : 0;

  let thumbnail = "";
  if (collection.films && collection.films.length > 0) {
    const first = filmsData[collection.films[0]];
    if (first && first.banner) thumbnail = first.banner;
  }
  if (!thumbnail && collection.series && collection.series.length > 0) {
    const firstS = seriesData[collection.series[0]];
    if (firstS && firstS.banner) thumbnail = firstS.banner;
  }

  const thumbHtml = thumbnail
    ? `<img src="${thumbnail}" alt="${collection.name}" onerror="this.style.display='none'">`
    : '<i class="fas fa-folder-open"></i>';

  return `
    <div class="content-card" onclick="showCollectionPage('${escapeForHTML(
      collection.name
    )}')">
      <div class="card-image">
        ${thumbHtml}
      </div>
      <div class="card-content">
        <h3 class="card-title">${collection.name}</h3>
        <div class="card-meta">
          <span class="card-year">${filmsCount} films • ${seriesCount} séries</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Navigates to the collection page and displays its content.
 *
 * @function
 * @param {string} collectionName
 */
function showCollectionPage(collectionName) {
  if (!collectionName) return;
  (async () => {
    try {
      if (typeof collectionsData === "undefined") {
        const resp = await fetch("data/collections.json");
        collectionsData = await resp.json();
      }
      const collection = collectionsData[collectionName];
      if (!collection) {
        alert("Collection introuvable");
        return;
      }
      displayCollectionPage(collection);
      showSection("collection");
    } catch (err) {
      console.error("Erreur en ouvrant la collection:", err);
      alert("Erreur lors de l'ouverture de la collection");
    }
  })();
}

/**
 * Renders the collection page with films and series grids.
 * @param {Object} collection
 */
function displayCollectionPage(collection) {
  const titleEl = document.getElementById("collectionTitle");
  const filmsGrid = document.getElementById("collectionFilmsGrid");
  const seriesGrid = document.getElementById("collectionSeriesGrid");
  if (!titleEl || !filmsGrid || !seriesGrid) return;

  titleEl.textContent = `${collection.name}`;

  const films = (collection.films || [])
    .map((t) => filmsData[t])
    .filter(Boolean);
  const series = (collection.series || [])
    .map((t) => seriesData[t])
    .filter(Boolean);

  const filmsSection = filmsGrid.closest(".content-section");
  if (films.length) {
    filmsGrid.innerHTML = films.map((f) => createContentCard(f)).join("");
    if (filmsSection) filmsSection.style.display = "block";
  } else {
    filmsGrid.innerHTML = "";
    if (filmsSection) filmsSection.style.display = "none";
  }

  const seriesSection = seriesGrid.closest(".content-section");
  if (series.length) {
    seriesGrid.innerHTML = series.map((s) => createContentCard(s)).join("");
    if (seriesSection) seriesSection.style.display = "block";
  } else {
    seriesGrid.innerHTML = "";
    if (seriesSection) seriesSection.style.display = "none";
  }
}
