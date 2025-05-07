function getSeriesFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("series");
}

async function loadSeriesData() {
  const response = await fetch("data/series_data.json");
  const data = await response.json();
  const seriesName = getSeriesFromURL();
  const series = data[seriesName];

  if (!series) {
    console.error(`Series ${seriesName} not found.`);
    return;
  }

  renderSeriesDetails(series);
}

function renderSeriesDetails(series) {
  const banner = document.getElementById("banner");
  banner.src = series.banner;

  const title = document.getElementById("series-title");
  const description = document.getElementById("series-description");
  const rating = document.getElementById("series-rating");
  const genres = document.getElementById("series-genres");
  const creators = document.getElementById("series-creators");
  const stars = document.getElementById("series-stars");

  title.innerText = `${series.title} (${series.year})`;
  description.innerHTML = series.description;
  rating.innerText = series.IMDb || "N/A";
  genres.innerText = series.genres ? series.genres.join(", ") : "N/A";
  creators.innerText = series.creators ? series.creators.join(", ") : "N/A";
  stars.innerText = series.stars ? series.stars.join(", ") : "N/A";

  const seasonButtons = document.getElementById("season-buttons");
  seasonButtons.innerHTML = "";
  for (const season in series.seasons) {
    const button = document.createElement("button");
    button.innerText = `Saison ${season}`;
    button.onclick = () => redirectToSeason(series, season);
    seasonButtons.appendChild(button);
  }
}

function redirectToSeason(series, seasonNumber) {
  const firstEpisode = series.seasons[seasonNumber][0];
  window.location.href = `watching.html?series=${series.title}&season=${seasonNumber}&episode=${firstEpisode.title}`;
}

loadSeriesData();
