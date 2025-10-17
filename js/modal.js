/**
 * @module modal
 * @description
 * Controls the display and behavior of modal dialogs (pop-ups) in the UI.
 * Handles opening, closing, and content management for modals.
 */

let currentVideoContext = null;
let lastOpenedContent = null;

/**
 * Displays the modal for a film with its details.
 *
 * @function
 * @param {Object} film - The film object to display.
 * @returns {void}
 */
function showFilmModal(film) {
  if (film) openModal(film.title, "film", 0);
}

/**
 * Displays the modal for a series with its details and selected season.
 *
 * @function
 * @param {Object} series - The series object to display.
 * @param {string|number} season - The season to display.
 * @returns {void}
 */
function showSeriesModal(series, season) {
  if (series) openModal(series.title, "series", season);
}

/**
 * Opens the modal for a given content item (film or series).
 *
 * @function
 * @param {string} title - The title of the content.
 * @param {string} type - The type of content ("film" or "series").
 * @param {string|number} season - The season to display (for series).
 * @returns {void}
 */
function openModal(title, type, season) {
  const item = type === "film" ? filmsData[title] : seriesData[title];
  if (!item) return;

  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = createModalContent(item, type);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  if (type === "series" && item.seasons) {
    setupSeriesModal(item, season);
  }
  currentVideoContext = null;
}

/**
 * Generates the HTML content for the modal based on the item and its type.
 *
 * @function
 * @param {Object} item - The content item (film or series).
 * @param {string} type - The type of content ("film" or "series").
 * @returns {string} The HTML string for the modal content.
 */
function createModalContent(item, type) {
  const genres = item.genres
    ? item.genres.map((g) => `<span class="genre-tag">${g}</span>`).join("")
    : "";
  const rating = item.IMDb
    ? `<div class="modal-rating"><i class="fas fa-star"></i> ${item.IMDb}/10</div>`
    : "";
  const year = item.year ? `<span class="year-tag">${item.year}</span>` : "";
  const directors = item.directors
    ? `<p><strong>Réalisateurs:</strong> ${item.directors.join(", ")}</p>`
    : "";
  const writers = item.writers
    ? `<p><strong>Scénaristes:</strong> ${item.writers.join(", ")}</p>`
    : "";
  const stars = item.stars
    ? `<p><strong>Acteurs:</strong> ${item.stars.join(", ")}</p>`
    : "";
  const creators = item.creators
    ? `<p><strong>Créateurs:</strong> ${item.creators.join(", ")}</p>`
    : "";

  let watchedInfo = "";
  if (type === "film") {
    const watchData = getFilmWatchData(item.title);
    if (watchData.watched) {
      watchedInfo = `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i> Vu</span>`;
    }
  }

  const watchButton =
    type === "film" && item.video
      ? `<button class="btn btn-primary" onclick="playVideo('${
          item.video
        }', 'film', '${escapeForHTML(item.title)}')">
      <i class="fas fa-play"></i> Regarder
    </button>`
      : "";

  const trailerButton = item.trailer
    ? `<a href="${item.trailer}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> Bande-annonce
    </a>`
    : "";

  const imdbButton = item.IMDb_link
    ? `<a href="${item.IMDb_link}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> IMDb
    </a>`
    : "";

  return `
    <div class="modal-body">
      <div class="modal-header">
        <div class="modal-poster">
          ${
            item.banner
              ? `<img src="${item.banner}" alt="${item.title}" class="modal-poster">`
              : '<div class="modal-poster" style="display: flex; align-items: center; justify-content: center; background-color: var(--bg-card);"><i class="fas fa-film" style="font-size: 3rem; color: var(--text-secondary);"></i></div>'
          }
        </div>
        <div class="modal-info">
          <h2 class="modal-title">${item.title} ${watchedInfo}</h2>
          <div class="modal-meta">
            ${rating}
            ${year}
            <div class="card-genres">${genres}</div>
          </div>
          <p class="modal-description">${
            item.description || "Aucune description disponible."
          }</p>
          <div class="modal-cast">
            ${directors}
            ${creators}
            ${writers}
            ${stars}
          </div>
          <div class="action-buttons">
            ${watchButton}
            ${trailerButton}
            ${imdbButton}
          </div>
        </div>
      </div>
      ${type === "series" ? '<div id="seasonsContainer"></div>' : ""}
    </div>
  `;
}

/**
 * Sets up the modal for a series, displaying seasons and episodes.
 *
 * @function
 * @param {Object} series - The series object.
 * @param {string|number} defaultSeason - The season to display initially.
 * @returns {void}
 */
function setupSeriesModal(series, defaultSeason) {
  if (!series.seasons) return;

  const seasonsContainer = document.getElementById("seasonsContainer");
  const seasons = Object.keys(series.seasons);
  const initialSeason =
    defaultSeason && seasons.includes(defaultSeason)
      ? defaultSeason
      : seasons[0];

  seasonsContainer.innerHTML = `
    <div class="seasons-section">
      <h3>Saisons et Épisodes</h3>
      <div class="seasons-nav">
        ${seasons
          .map(
            (season) => `<button class="season-btn ${
              season === initialSeason ? "active" : ""
            }" data-season="${season}">
            Saison ${season}
          </button>`
          )
          .join("")}
      </div>
      <div id="episodesContainer"></div>
    </div>
  `;

  const seasonBtns = seasonsContainer.querySelectorAll(".season-btn");
  seasonBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      seasonBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      displayEpisodes(series, btn.dataset.season);
    });
  });

  displayEpisodes(series, initialSeason);
}

/**
 * Displays the episodes for a given series and season in the modal.
 *
 * @function
 * @param {Object} series - The series object.
 * @param {string|number} seasonNumber - The season number to display.
 * @returns {void}
 */
function displayEpisodes(series, seasonNumber) {
  const episodes = series.seasons[seasonNumber];
  const episodesContainer = document.getElementById("episodesContainer");

  if (!episodes || episodes.length === 0) {
    episodesContainer.innerHTML =
      "<p>Aucun épisode disponible pour cette saison.</p>";
    return;
  }

  episodesContainer.innerHTML = episodes
    .map((episode, index) => {
      const watchData = getEpisodeWatchData(series.title, seasonNumber, index);
      const watchedClass = watchData.watched ? "watched-episode" : "";
      const watchedBadge = watchData.watched
        ? `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i></span>`
        : "";
      return `
        <div class="episode-item ${watchedClass}" onclick="playVideo('${
        episode.video
      }', 'series', '${escapeForHTML(
        series.title
      )}', '${seasonNumber}', ${index})">
          <div class="episode-number">E${index + 1}</div>
          <div class="episode-info">
            <div class="episode-title">${episode.title} ${watchedBadge}</div>
            <div class="episode-description">${episode.desc}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <i class="fas fa-play" style="color: var(--accent);"></i>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Plays a video (film or episode) in the video modal, resuming from last watched time if available.
 *
 * @function
 * @param {string} videoPath - The path to the video file.
 * @param {string} type - The type of content ("film" or "series").
 * @param {string} title - The title of the content.
 * @param {string|number} [season] - The season number (for series).
 * @param {number} [epIndex] - The episode index (for series).
 * @returns {void}
 */
function playVideo(videoPath, type, title, season, epIndex) {
  if (!videoPath) {
    alert("Vidéo non disponible");
    return;
  }

  lastOpenedContent = { type, title, season, epIndex };

  videoPlayer.src = videoPath;
  videoModal.classList.add("active");
  modal.classList.remove("active");
  document.body.style.overflow = "hidden";

  let startTime = 0;
  if (type === "film") {
    const watchData = getFilmWatchData(title);
    startTime = watchData.time || 0;
    currentVideoContext = { type, title };
  } else if (type === "series") {
    const watchData = getEpisodeWatchData(title, season, epIndex);
    startTime = watchData.time || 0;
    currentVideoContext = { type, title, season, epIndex };
  }
  videoPlayer.currentTime = startTime;
  setTimeout(() => {
    videoPlayer.currentTime = startTime;
  }, 100);

  videoPlayer.play();
}

/**
 * Handles updating watch progress while the video is playing.
 *
 * @function
 * @returns {void}
 */
function handleVideoTimeUpdate() {
  if (!currentVideoContext) return;
  const { type, title, season, epIndex } = currentVideoContext;
  const duration = videoPlayer.duration || 1;
  const current = videoPlayer.currentTime;

  if (type === "film") {
    markFilmWatched(title, false, current);
  } else if (type === "series") {
    markEpisodeWatched(title, season, epIndex, false, current);
  }

  const remaining = duration - current;
  if (remaining <= 180) {
    if (type === "film") {
      markFilmWatched(title, true, 0);
    } else if (type === "series") {
      markEpisodeWatched(title, season, epIndex, true, 0);
    }
  }
}

/**
 * Handles marking content as watched when the video ends.
 *
 * @function
 * @returns {void}
 */
function handleVideoEnded() {
  if (!currentVideoContext) return;
  const { type, title, season, epIndex } = currentVideoContext;
  if (type === "film") {
    markFilmWatched(title, true, 0);
  } else if (type === "series") {
    markEpisodeWatched(title, season, epIndex, true, 0);
  }
}

/**
 * Handles saving watch progress when the video is paused.
 *
 * @function
 * @returns {void}
 */
function handleVideoPause() {
  if (!currentVideoContext) return;
  const { type, title, season, epIndex } = currentVideoContext;
  const current = videoPlayer.currentTime;
  if (type === "film") {
    markFilmWatched(title, false, current);
  } else if (type === "series") {
    markEpisodeWatched(title, season, epIndex, false, current);
  }
}

/**
 * Closes all modals and restores the previous state.
 *
 * @function
 * @returns {void}
 */
function closeModals() {
  const wasVideoModalActive = videoModal.classList.contains("active");
  modal.classList.remove("active");
  videoModal.classList.remove("active");
  document.body.style.overflow = "auto";

  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.src = "";
  }
  currentVideoContext = null;

  if (wasVideoModalActive && lastOpenedContent) {
    if (lastOpenedContent.type === "film") {
      showFilmModal(getFilmByTitle(lastOpenedContent.title));
    } else if (lastOpenedContent.type === "series") {
      showSeriesModal(
        getSeriesByTitle(lastOpenedContent.title),
        lastOpenedContent.season
      );
    }
  }
}
