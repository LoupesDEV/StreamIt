function getSeriesFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("series");
}

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "../404.html";
}

async function loadSeriesData() {
  let data;
  try {
    const response = await fetch("data/series_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    data = await response.json();
  } catch (e) {
    handleErrorAndRedirect(
      "Erreur réseau : impossible de charger les données de la série."
    );
    return;
  }

  const seriesName = getSeriesFromURL();
  const series = data[seriesName];

  if (!series) {
    handleErrorAndRedirect(
      `La série "${seriesName}" est introuvable ou n'existe pas dans notre base de données.`
    );
    return;
  }

  renderSeriesDetails(series);
}

function renderSeriesDetails(series) {
  const bannerSkeleton = document.getElementById("banner-skeleton");
  const banner = document.getElementById("banner");

  if (bannerSkeleton) bannerSkeleton.style.display = "block";
  if (banner) banner.style.display = "none";

  if (banner) {
    banner.onload = () => {
      if (bannerSkeleton) bannerSkeleton.style.display = "none";
      banner.style.display = "block";
    };
    banner.onerror = () => {
      if (bannerSkeleton) bannerSkeleton.style.display = "none";
      banner.style.display = "none";
    };
    banner.src = series.banner || "";
  }

  const seriesInfo = document.getElementById("series-info");
  if (seriesInfo) {
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
  }

  const seasonButtons = document.getElementById("season-buttons");
  if (seasonButtons && series.seasons) {
    for (const season in series.seasons) {
      const button = document.createElement("button");
      button.innerText = `Saison ${season}`;
      button.setAttribute("aria-label", `Voir la saison ${season}`);
      button.onclick = () => redirectToSeason(series, season);
      seasonButtons.appendChild(button);
    }
  }

  const trailerButtonContainer = document.getElementById(
    "trailer-button-container"
  );
  if (trailerButtonContainer && series.trailer) {
    const trailerBtn = document.createElement("button");
    trailerBtn.innerText = "Regarder le trailer";
    trailerBtn.setAttribute("aria-label", "Regarder le trailer");
    trailerBtn.onclick = () => window.open(series.trailer, "_blank");
    trailerButtonContainer.appendChild(trailerBtn);
  }
}

function redirectToSeason(series, seasonNumber) {
  const firstEpisode = series.seasons[seasonNumber][0];
  window.location.href = `watching.html?series=${encodeURIComponent(
    series.title
  )}&season=${encodeURIComponent(seasonNumber)}&episode=${encodeURIComponent(
    firstEpisode.title
  )}`;
}

loadSeriesData();
