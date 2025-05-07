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
  const banner = document.getElementById("banner");
  banner.src = films.banner;

  const title = document.getElementById("film-title");
  const description = document.getElementById("film-description");
  const rating = document.getElementById("film-rating");
  const genres = document.getElementById("film-genres");
  const directors = document.getElementById("film-directors");
  const writers = document.getElementById("film-writers");
  const stars = document.getElementById("film-stars");

  title.innerText = `${films.title} (${films.year})`;
  description.innerHTML = films.description;
  rating.innerText = films.IMDb || "N/A";
  genres.innerText = films.genres ? films.genres.join(", ") : "N/A";
  directors.innerText = films.directors ? films.directors.join(", ") : "N/A";
  writers.innerText = films.writers ? films.writers.join(", ") : "N/A";
  stars.innerText = films.stars ? films.stars.join(", ") : "N/A";

  const watchButtonContainer = document.getElementById(
    "watch-button-container"
  );
  watchButtonContainer.innerHTML = "";
  const button = document.createElement("button");
  button.innerText = "Regarder";
  button.onclick = () => redirectToSeason(films);
  watchButtonContainer.appendChild(button);
}

function redirectToSeason(films) {
  window.location.href = `watching.html?films=${films.title}`;
}

loadFilmsData();
