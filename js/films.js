function getFilmsFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("films");
}

async function loadFilmsData() {
  const response = await fetch("data/films_data.json");
  const data = await response.json();
  const filmsName = getFilmsFromURL();
  const films = data[filmsName];

  if (!films) {
    console.error(`Films ${filmsName} not found.`);
    return;
  }

  renderFilmsDetails(films);
}

function renderFilmsDetails(films) {
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

  banner.src = films.banner || "";

  const filmInfo = document.getElementById("film-info");
  filmInfo.innerHTML = `
    <h1 id="film-title">${films.title} (${films.year})</h1>
    <p id="film-description">${films.description}</p>
    <div class="rating">
      <span>IMDb:</span>
      <span id="film-rating" class="rating-value">${films.IMDb || "N/A"}</span>
    </div>
    <div class="genres">
      <strong>Genres:</strong> <span id="film-genres">${
        films.genres ? films.genres.join(", ") : "N/A"
      }</span>
    </div>
    <div class="directors">
      <strong>Directeurs:</strong> <span id="film-directors">${
        films.directors ? films.directors.join(", ") : "N/A"
      }</span>
    </div>
    <div class="writers">
      <strong>Writers:</strong> <span id="film-writers">${
        films.writers ? films.writers.join(", ") : "N/A"
      }</span>
    </div>
    <div class="stars">
      <strong>Célébrités:</strong> <span id="film-stars">${
        films.stars ? films.stars.join(", ") : "N/A"
      }</span>
    </div>
    <div class="watch-button-container" id="watch-button-container"></div>
  `;

  const watchButtonContainer = document.getElementById(
    "watch-button-container"
  );
  const button = document.createElement("button");
  button.innerText = "Regarder";
  button.onclick = () => redirectToSeason(films);
  watchButtonContainer.appendChild(button);
}

function redirectToSeason(films) {
  window.location.href = `watching.html?films=${films.title}`;
}

loadFilmsData();
