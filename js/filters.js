/**
 * Manages the creation, population, and handling of filtering options for films and series.
 *
 * This module includes all logic required to populate dropdown filters (genres, years, directors,
 * actors, creators), generate filter options from the dataset, and apply the selected filters
 * to dynamically update the visible content. It also provides utility functions to reset filters
 * and refresh the content grids accordingly.
 *
 * @module filters
 */

/**
 * Populates all filter dropdowns for films and series.
 *
 * Calls individual functions to populate filters for genres, years, directors, actors, and creators.
 *
 * @function
 */
function populateFilters() {
  populateGenreFilters();
  populateYearFilters();
  populateDirectorFilters();
  populateActorFilters();
  populateCreatorFilters();
}

/**
 * Populates genre filter dropdowns for films and series based on available data.
 *
 * @function
 */
function populateGenreFilters() {
  const filmGenres = new Set();
  const seriesGenres = new Set();

  Object.values(filmsData).forEach((film) => {
    if (film.genres) {
      film.genres.forEach((genre) => filmGenres.add(genre));
    }
  });

  Object.values(seriesData).forEach((series) => {
    if (series.genres) {
      series.genres.forEach((genre) => seriesGenres.add(genre));
    }
  });

  populateSelect(
    "filmGenreFilter",
    Array.from(filmGenres).sort(),
    "Tous les genres"
  );
  populateSelect(
    "seriesGenreFilter",
    Array.from(seriesGenres).sort(),
    "Tous les genres"
  );
}

/**
 * Populates year filter dropdowns for films and series using their respective release years.
 *
 * @function
 */
function populateYearFilters() {
  const filmYears = new Set();
  const seriesYears = new Set();

  Object.values(filmsData).forEach((film) => {
    if (film.year) filmYears.add(film.year);
  });

  Object.values(seriesData).forEach((series) => {
    if (series.year) seriesYears.add(series.year);
  });

  populateSelect(
    "filmYearFilter",
    Array.from(filmYears).sort((a, b) => b - a),
    "Toutes les années"
  );
  populateSelect(
    "seriesYearFilter",
    Array.from(seriesYears).sort((a, b) => b - a),
    "Toutes les années"
  );
}

/**
 * Populates the director filter dropdown for films using available director data.
 *
 * @function
 */
function populateDirectorFilters() {
  const directors = new Set();

  Object.values(filmsData).forEach((film) => {
    if (film.directors) {
      film.directors.forEach((director) => directors.add(director));
    }
  });

  populateSelect(
    "filmDirectorFilter",
    Array.from(directors).sort(),
    "Tous les réalisateurs"
  );
}

/**
 * Populates actor filter dropdowns for films and series using available cast information.
 *
 * @function
 */
function populateActorFilters() {
  const filmActors = new Set();
  const seriesActors = new Set();

  Object.values(filmsData).forEach((film) => {
    if (film.stars) {
      film.stars.forEach((actor) => filmActors.add(actor));
    }
  });

  Object.values(seriesData).forEach((series) => {
    if (series.stars) {
      series.stars.forEach((actor) => seriesActors.add(actor));
    }
  });

  populateSelect(
    "filmActorFilter",
    Array.from(filmActors).sort(),
    "Tous les acteurs"
  );
  populateSelect(
    "seriesActorFilter",
    Array.from(seriesActors).sort(),
    "Tous les acteurs"
  );
}

/**
 * Populates the creator filter dropdown for series using available creator data.
 *
 * @function
 */
function populateCreatorFilters() {
  const creators = new Set();

  Object.values(seriesData).forEach((series) => {
    if (series.creators) {
      series.creators.forEach((creator) => creators.add(creator));
    }
  });

  populateSelect(
    "seriesCreatorFilter",
    Array.from(creators).sort(),
    "Tous les créateurs"
  );
}

/**
 * Populates a given select element with provided options and a default placeholder.
 *
 * @function
 * @param {string} selectId - The ID of the select element to populate.
 * @param {string[]} options - The list of options to insert.
 * @param {string} [defaultText="--"] - The default placeholder option to show.
 */
function populateSelect(selectId, options, defaultText = "--") {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = `<option value="">${defaultText}</option>`;
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
}

/**
 * Retrieves the list of films that match the currently selected filter criteria.
 *
 * Applies filters for genre, year, director, actor, and minimum rating.
 *
 * @function
 * @returns {Object[]} Filtered array of film objects.
 */
function getFilteredFilms() {
  const genreFilter = document.getElementById("filmGenreFilter").value;
  const yearFilter = document.getElementById("filmYearFilter").value;
  const directorFilter = document.getElementById("filmDirectorFilter").value;
  const actorFilter = document.getElementById("filmActorFilter").value;
  const ratingFilter = parseFloat(
    document.getElementById("filmRatingFilter").value
  );

  return Object.values(filmsData).filter((film) => {
    const genreMatch =
      !genreFilter || (film.genres && film.genres.includes(genreFilter));
    const yearMatch = !yearFilter || film.year === Number(yearFilter);
    const directorMatch =
      !directorFilter ||
      (film.directors && film.directors.includes(directorFilter));
    const actorMatch =
      !actorFilter || (film.stars && film.stars.includes(actorFilter));
    const ratingMatch =
      !ratingFilter || (film.IMDb && film.IMDb >= ratingFilter);

    return (
      genreMatch && yearMatch && directorMatch && actorMatch && ratingMatch
    );
  });
}

/**
 * Retrieves the list of series that match the currently selected filter criteria.
 *
 * Applies filters for genre, year, creator, actor, and minimum rating.
 *
 * @function
 * @returns {Object[]} Filtered array of series objects.
 */
function getFilteredSeries() {
  const genreFilter = document.getElementById("seriesGenreFilter").value;
  const yearFilter = document.getElementById("seriesYearFilter").value;
  const creatorFilter = document.getElementById("seriesCreatorFilter").value;
  const actorFilter = document.getElementById("seriesActorFilter").value;
  const ratingFilter = parseFloat(
    document.getElementById("seriesRatingFilter").value
  );

  return Object.values(seriesData).filter((series) => {
    const genreMatch =
      !genreFilter || (series.genres && series.genres.includes(genreFilter));
    const yearMatch = !yearFilter || series.year === Number(yearFilter);
    const creatorMatch =
      !creatorFilter ||
      (series.creators && series.creators.includes(creatorFilter));
    const actorMatch =
      !actorFilter || (series.stars && series.stars.includes(actorFilter));
    const ratingMatch =
      !ratingFilter || (series.IMDb && series.IMDb >= ratingFilter);

    return genreMatch && yearMatch && creatorMatch && actorMatch && ratingMatch;
  });
}

/**
 * Updates the films display grid based on the currently selected filters.
 *
 * Fetches filtered films and displays them using the display module.
 *
 * @function
 */
function updateFilmsGrid() {
  displayFilms(getFilteredFilms());
}

/**
 * Resets all film-related filters to their default values and refreshes the display grid.
 *
 * @function
 */
function resetFilmFilters() {
  document.getElementById("filmGenreFilter").value = "";
  document.getElementById("filmYearFilter").value = "";
  document.getElementById("filmDirectorFilter").value = "";
  document.getElementById("filmActorFilter").value = "";
  document.getElementById("filmRatingFilter").value = 0;
  document.querySelector("#films .rating-value").textContent = "0.0";
  if (typeof updateFilmsGrid === "function") updateFilmsGrid();
}

/**
 * Updates the series display grid based on the currently selected filters.
 *
 * Fetches filtered series and displays them using the display module.
 *
 * @function
 */
function updateSeriesGrid() {
  displaySeries(getFilteredSeries());
}

/**
 * Resets all series-related filters to their default values and refreshes the display grid.
 *
 * @function
 */
function resetSeriesFilters() {
  document.getElementById("seriesGenreFilter").value = "";
  document.getElementById("seriesYearFilter").value = "";
  document.getElementById("seriesCreatorFilter").value = "";
  document.getElementById("seriesActorFilter").value = "";
  document.getElementById("seriesRatingFilter").value = 0;
  document.querySelector("#series .rating-value").textContent = "0.0";
  if (typeof updateSeriesGrid === "function") updateSeriesGrid();
}
