async function loadSeriesData() {
  try {
    const response = await fetch("data/series_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    const data = await response.json();
    renderSeries(data);
  } catch (e) {
    showError("Erreur lors du chargement des séries.");
  }
}

async function loadFilmsData() {
  try {
    const response = await fetch("data/films_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    const data = await response.json();
    renderFilms(data);
  } catch (e) {
    showError("Erreur lors du chargement des films.");
  }
}

function showError(message) {
  let container = document.getElementById("main-container");
  if (!container) {
    container = document.body;
  }
  container.innerHTML = `<div style="color:red;text-align:center;margin:2em;">${message}</div>`;
}

function renderSeries(seriesData) {
  const seriesList = document.getElementById("series-list");
  if (!seriesList) return;
  seriesList.innerHTML = "";

  const sortedSeries = Object.keys(seriesData).sort((a, b) => {
    return seriesData[a].title.localeCompare(seriesData[b].title);
  });

  for (const series of sortedSeries) {
    const s = seriesData[series];
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("series");
    seriesDiv.tabIndex = 0;
    seriesDiv.setAttribute("role", "button");
    seriesDiv.setAttribute("aria-label", `Voir la série ${s.title}`);
    seriesDiv.onclick = () =>
      (window.location.href = `series.html?series=${encodeURIComponent(
        series
      )}`);
    seriesDiv.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") seriesDiv.onclick();
    };

    const seriesImage = document.createElement("img");
    seriesImage.src = s.banner || "";
    seriesImage.alt = s.title || "Image série";

    const seriesInfo = document.createElement("div");
    seriesInfo.classList.add("series-info");

    const seriesTitle = document.createElement("div");
    seriesTitle.classList.add("series-title");
    seriesTitle.innerText = s.title || "";

    const seriesDescription = document.createElement("div");
    seriesDescription.classList.add("series-description");
    seriesDescription.innerText = s.description
      ? s.description.slice(0, 100) + "..."
      : "Aucune description disponible.";

    seriesInfo.appendChild(seriesTitle);
    seriesInfo.appendChild(seriesDescription);
    seriesDiv.appendChild(seriesImage);
    seriesDiv.appendChild(seriesInfo);
    seriesList.appendChild(seriesDiv);
  }
}

function renderFilms(filmsData) {
  const filmsList = document.getElementById("films-list");
  if (!filmsList) return;
  filmsList.innerHTML = "";

  const sortedFilms = Object.keys(filmsData).sort((a, b) => {
    return filmsData[a].title.localeCompare(filmsData[b].title);
  });

  for (const film of sortedFilms) {
    const f = filmsData[film];
    const filmDiv = document.createElement("div");
    filmDiv.classList.add("films");
    filmDiv.tabIndex = 0;
    filmDiv.setAttribute("role", "button");
    filmDiv.setAttribute("aria-label", `Voir le film ${f.title}`);
    filmDiv.onclick = () =>
      (window.location.href = `films.html?films=${encodeURIComponent(
        film
      )}`);
    filmDiv.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") filmDiv.onclick();
    };

    const filmImage = document.createElement("img");
    filmImage.src = f.banner || "";
    filmImage.alt = f.title || "Image film";

    const filmInfo = document.createElement("div");
    filmInfo.classList.add("films-info");

    const filmTitle = document.createElement("div");
    filmTitle.classList.add("films-title");
    filmTitle.innerText = f.title || "";

    const filmDescription = document.createElement("div");
    filmDescription.classList.add("films-description");
    filmDescription.innerText = f.description
      ? f.description.slice(0, 100) + "..."
      : "Aucune description disponible.";

    filmInfo.appendChild(filmTitle);
    filmInfo.appendChild(filmDescription);
    filmDiv.appendChild(filmImage);
    filmDiv.appendChild(filmInfo);
    filmsList.appendChild(filmDiv);
  }
}

function filter() {
  const searchBar = document.getElementById("search-bar");
  if (!searchBar) return;
  const searchQuery = searchBar.value.toLowerCase();

  const seriesList = document.getElementById("series-list");
  if (seriesList) {
    const seriesItems = seriesList.getElementsByClassName("series");
    let visibleSeriesCount = 0;
    for (let i = 0; i < seriesItems.length; i++) {
      const seriesTitle = seriesItems[i]
        .querySelector(".series-title")
        .innerText.toLowerCase();
      if (seriesTitle.includes(searchQuery)) {
        seriesItems[i].style.display = "block";
        visibleSeriesCount++;
      } else {
        seriesItems[i].style.display = "none";
      }
    }
    const seriesSectionTitle = document.getElementById("series-section-title");
    if (seriesSectionTitle) {
      seriesSectionTitle.style.display = visibleSeriesCount === 0 ? "none" : "";
    }
  }

  const filmsList = document.getElementById("films-list");
  if (filmsList) {
    const filmsItems = filmsList.getElementsByClassName("films");
    let visibleFilmsCount = 0;
    for (let i = 0; i < filmsItems.length; i++) {
      const filmTitle = filmsItems[i]
        .querySelector(".films-title")
        .innerText.toLowerCase();
      if (filmTitle.includes(searchQuery)) {
        filmsItems[i].style.display = "block";
        visibleFilmsCount++;
      } else {
        filmsItems[i].style.display = "none";
      }
    }
    const filmsSectionTitle = document.getElementById("films-section-title");
    if (filmsSectionTitle) {
      filmsSectionTitle.style.display = visibleFilmsCount === 0 ? "none" : "";
    }
  }
}

loadSeriesData();
loadFilmsData();

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "y") {
    event.preventDefault();
    const searchBar = document.getElementById("search-bar");
    if (searchBar) searchBar.focus();
  }
});
