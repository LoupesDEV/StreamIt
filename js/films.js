function getFilmsFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("films");
}

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "404.html";
}

async function loadFilmsData() {
  let data;
  try {
    const response = await fetch("data/films_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    data = await response.json();
  } catch (e) {
    handleErrorAndRedirect(
      "Erreur réseau : impossible de charger les données du film."
    );
    return;
  }
  const filmsName = getFilmsFromURL();
  const films = data[filmsName];

  if (!films) {
    handleErrorAndRedirect(
      `Le film "${filmsName}" est introuvable ou n'existe pas dans notre base de données.`
    );
    return;
  }

  renderFilmsDetails(films);
}

function renderFilmsDetails(films) {
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
    banner.src = films.banner || "";
  }

  const filmInfo = document.getElementById("film-info");
  if (filmInfo) {
    filmInfo.innerHTML = `
      <h1 id="film-title">${films.title} (${films.year})</h1>
      <p id="film-description">${films.description}</p>
      <div class="rating">
        <span>IMDb:</span>
        <span id="film-rating" class="rating-value">${
          films.IMDb || "N/A"
        }</span>
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
      <div class="trailer-button-container" id="trailer-button-container"></div>
    `;
  }

  const watchButtonContainer = document.getElementById(
    "watch-button-container"
  );
  if (watchButtonContainer) {
    const button = document.createElement("button");
    button.innerText = "Regarder";
    button.setAttribute("aria-label", `Regarder le film ${films.title}`);
    button.onclick = () => redirectToSeason(films);
    watchButtonContainer.appendChild(button);
  }

  const trailerButtonContainer = document.getElementById(
    "trailer-button-container"
  );
  if (trailerButtonContainer && films.trailer) {
    const trailerBtn = document.createElement("button");
    trailerBtn.innerText = "Regarder le trailer";
    trailerBtn.setAttribute(
      "aria-label",
      `Regarder le trailer de ${films.title}`
    );
    trailerBtn.onclick = () => window.open(films.trailer, "_blank");
    trailerButtonContainer.appendChild(trailerBtn);
  }
}

function redirectToSeason(films) {
  window.location.href = `watching.html?films=${encodeURIComponent(
    films.title
  )}`;
}

loadFilmsData();
