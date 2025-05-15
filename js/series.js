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
  const bannerSkeleton = document.getElementById("banner-skeleton");
  const banner = document.getElementById("banner");

  bannerSkeleton.style.display = "block";
  banner.style.display = "none";

  banner.onload = () => {
    bannerSkeleton.style.display = "none";
    banner.style.display = "block";
  };
  banner.onerror = () => {
    bannerSkeleton.style.display = "none";
    banner.style.display = "none";
  };

  banner.src = series.banner || "";

  const seriesInfo = document.getElementById("series-info");
  seriesInfo.innerHTML = `
    <h1 id="series-title">${series.title} (${series.year})</h1>
    <p id="series-description">${series.description}</p>
    <div class="rating">
      <span>IMDb:</span>
      <span id="series-rating" class="rating-value">${
        series.IMDb || "N/A"
      }</span>
    </div>
    <div class="genres">
      <strong>Genres:</strong> <span id="series-genres">${
        series.genres ? series.genres.join(", ") : "N/A"
      }</span>
    </div>
    <div class="creators">
      <strong>Créateurs:</strong> <span id="series-creators">${
        series.creators ? series.creators.join(", ") : "N/A"
      }</span>
    </div>
    <div class="stars">
      <strong>Célébrités:</strong> <span id="series-stars">${
        series.stars ? series.stars.join(", ") : "N/A"
      }</span>
    </div>
    <div class="season-buttons" id="season-buttons"></div>
  `;

  const seasonButtons = document.getElementById("season-buttons");
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
