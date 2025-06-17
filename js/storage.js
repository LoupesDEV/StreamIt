/**
 * Provides access to and manipulation of watch progress data stored in localStorage.
 *
 * This module defines global datasets (`filmsData`, `seriesData`) and manages user watch state
 * for both films and series, including whether content has been watched and the last watched timestamp.
 * Data is persisted across sessions using the `watchedContent` key in localStorage.
 *
 * @module storage
 */

let filmsData = {};
let seriesData = {};

/**
 * Retrieves the entire watched content object from localStorage.
 *
 * Returns a default structure if no data is present.
 *
 * @function
 * @returns {Object} An object with `films` and `series` properties containing watch data.
 */
function getWatchedContent() {
  return JSON.parse(
    localStorage.getItem("watchedContent") || '{"films":{},"series":{}}'
  );
}

/**
 * Stores the provided watched content data in localStorage.
 *
 * @function
 * @param {Object} data - The data to persist, containing `films` and `series` watch information.
 */
function setWatchedContent(data) {
  localStorage.setItem("watchedContent", JSON.stringify(data));
}

/**
 * Marks a film as watched or not and saves the current playback time.
 *
 * @function
 * @param {string} title - The title of the film.
 * @param {boolean} [watched=true] - Whether the film is marked as watched.
 * @param {number} [time=0] - The current playback time in seconds.
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
 * @returns {Object} An object with `watched` (boolean) and `time` (number).
 */
function getFilmWatchData(title) {
  const data = getWatchedContent();
  return data.films[title] || { watched: false, time: 0 };
}

/**
 * Marks a specific episode of a series as watched or not, and saves the current playback time.
 *
 * @function
 * @param {string} seriesTitle - The title of the series.
 * @param {string|number} season - The season number.
 * @param {number} epIndex - The index of the episode.
 * @param {boolean} [watched=true] - Whether the episode is marked as watched.
 * @param {number} [time=0] - The current playback time in seconds.
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
 * Retrieves the watch data for a specific episode of a series.
 *
 * @function
 * @param {string} seriesTitle - The title of the series.
 * @param {string|number} season - The season number.
 * @param {number} epIndex - The index of the episode.
 * @returns {Object} An object with `watched` (boolean) and `time` (number).
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
 * Checks if all episodes of a series have been marked as watched.
 *
 * Iterates over all seasons and episodes of the series.
 *
 * @function
 * @param {Object} series - The series object containing a `seasons` structure.
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
