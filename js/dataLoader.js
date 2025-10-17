/**
 * @module dataLoader
 * @description
 * Loads and parses film and series data from external sources or local files.
 * Provides functions to fetch, validate, and structure media datasets.
 */

/**
 * Asynchronously loads film and series data from external JSON files.
 *
 * Fetches `films_data.json` and `series_data.json` from the `data` directory,
 * parses their contents, and assigns them to the global variables `filmsData`
 * and `seriesData`. Logs a success message upon completion. If an error occurs
 * during fetching or parsing, logs the error and displays a user-friendly
 * message using `showNoResults`.
 *
 * @async
 * @function loadData
 * @returns {Promise<void>} Resolves when data is loaded or an error is handled.
 */
async function loadData() {
  try {
    const filmsResponse = await fetch("data/films_data.json");
    filmsData = await filmsResponse.json();

    const seriesResponse = await fetch("data/series_data.json");
    seriesData = await seriesResponse.json();

    console.log("Data loaded successfully");
  } catch (error) {
    console.error("Error loading data:", error);
    showNoResults("Erreur de chargement des données");
  }
}
