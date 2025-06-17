/**
 * Handles the loading of external data sources required by the application.
 *
 * This module is responsible for asynchronously fetching and parsing JSON data
 * related to films and series. It ensures that the data is properly retrieved
 * and made available for use elsewhere in the application, and handles error
 * reporting in case of failure.
 *
 * @module dataLoader
 */

/**
 * Loads film and series data from local JSON files.
 *
 * Fetches data from 'data/films_data.json' and 'data/series_data.json',
 * parses the responses into JavaScript objects, and assigns them to
 * the corresponding global variables. Displays an error message if the
 * loading process fails.
 *
 * @async
 * @function
 */
async function loadData() {
    try {
        const filmsResponse = await fetch('data/films_data.json');
        filmsData = await filmsResponse.json();

        const seriesResponse = await fetch('data/series_data.json');
        seriesData = await seriesResponse.json();

        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showNoResults('Erreur de chargement des données');
    }
}