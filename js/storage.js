let filmsData = {};
let seriesData = {};

function getWatchedContent() {
  return JSON.parse(
    localStorage.getItem("watchedContent") || '{"films":{},"series":{}}'
  );
}

function setWatchedContent(data) {
  localStorage.setItem("watchedContent", JSON.stringify(data));
}

function markFilmWatched(title, watched = true, time = 0) {
  const data = getWatchedContent();
  if (!data.films[title]) data.films[title] = {};
  data.films[title].watched = watched;
  data.films[title].time = time;
  setWatchedContent(data);
}

function getFilmWatchData(title) {
  const data = getWatchedContent();
  return data.films[title] || { watched: false, time: 0 };
}

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
