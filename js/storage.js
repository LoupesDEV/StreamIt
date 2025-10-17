/**
 * @module storage
 * @description
 * Manages saving and retrieving watched content data in localStorage.
 * Provides functions to mark content as watched and retrieve watch history.
 */

let filmsData = {};
let seriesData = {};

/**
 * Retrieves the watched content data from localStorage.
 *
 * @function
 * @returns {Object} The watched content data with films and series.
 */
function getWatchedContent() {
  return JSON.parse(
    localStorage.getItem("watchedContent") || '{"films":{},"series":{}}'
  );
}

/**
 * Saves the watched content data to localStorage.
 *
 * @function
 * @param {Object} data - The watched content data to store.
 * @returns {void}
 */
function setWatchedContent(data) {
  localStorage.setItem("watchedContent", JSON.stringify(data));
}

/**
 * Marks a film as watched or unwatched and updates the last watched time.
 *
 * @function
 * @param {string} title - The title of the film.
 * @param {boolean} [watched=true] - Whether the film is watched.
 * @param {number} [time=0] - The last watched timestamp in seconds.
 * @returns {void}
 */
function markFilmWatched(title, watched = true, time = 0) {
  const data = getWatchedContent();
  if (!data.films[title]) data.films[title] = {};
  data.films[title].watched = watched;
  data.films[title].time = time;
  setWatchedContent(data);
}

/**
 * Retrieves the watch data for a specific film.
 *
 * @function
 * @param {string} title - The title of the film.
 * @returns {Object} The watch data ({watched: boolean, time: number}).
 */
function getFilmWatchData(title) {
  const data = getWatchedContent();
  return data.films[title] || { watched: false, time: 0 };
}

/**
 * Marks an episode as watched or unwatched and updates the last watched time.
 *
 * @function
 * @param {string} seriesTitle - The title of the series.
 * @param {string|number} season - The season number or name.
 * @param {number} epIndex - The episode index.
 * @param {boolean} [watched=true] - Whether the episode is watched.
 * @param {number} [time=0] - The last watched timestamp in seconds.
 * @returns {void}
 */
function markEpisodeWatched(
  seriesTitle,
  season,
  epIndex,
  watched = true,
  time = 0
) {
  const data = getWatchedContent();
  if (!data.series[seriesTitle]) data.series[seriesTitle] = {};
  if (!data.series[seriesTitle][season]) data.series[seriesTitle][season] = {};
  data.series[seriesTitle][season][epIndex] = { watched, time };
  setWatchedContent(data);
}

/**
 * Retrieves the watch data for a specific episode.
 *
 * @function
 * @param {string} seriesTitle - The title of the series.
 * @param {string|number} season - The season number or name.
 * @param {number} epIndex - The episode index.
 * @returns {Object} The watch data ({watched: boolean, time: number}).
 */
function getEpisodeWatchData(seriesTitle, season, epIndex) {
  const data = getWatchedContent();
  return (
    (data.series[seriesTitle] &&
      data.series[seriesTitle][season] &&
      data.series[seriesTitle][season][epIndex]) || {
      watched: false,
      time: 0,
    }
  );
}

/**
 * Checks if all episodes in a series have been watched.
 *
 * @function
 * @param {Object} series - The series object with seasons and episodes.
 * @returns {boolean} True if all episodes are watched, false otherwise.
 */
function isSeriesFullyWatched(series) {
  if (!series.seasons) return false;
  for (const seasonNum in series.seasons) {
    const episodes = series.seasons[seasonNum];
    for (let i = 0; i < episodes.length; i++) {
      const watchData = getEpisodeWatchData(series.title, seasonNum, i);
      if (!watchData.watched) return false;
    }
  }
  return true;
}
