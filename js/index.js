let allFilms = {};
let allSeries = {};

async function loadSeriesData() {
  try {
    const response = await fetch("data/series_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    const data = await response.json();
    allSeries = data;
    renderSeries(data);
    populateGenres();
  } catch (e) {
    showError("Erreur lors du chargement des séries.");
  }
}

async function loadFilmsData() {
  try {
    const response = await fetch("data/films_data.json");
    if (!response.ok) throw new Error("Erreur réseau");
    const data = await response.json();
    allFilms = data;
    renderFilms(data);
    populateGenres();
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
      (window.location.href = `films.html?films=${encodeURIComponent(film)}`);
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

function populateGenres() {
  const genreSet = new Set();
  Object.values(allFilms).forEach((f) =>
    (f.genres || []).forEach((g) => genreSet.add(g.trim()))
  );
  Object.values(allSeries).forEach((s) =>
    (s.genres || []).forEach((g) => genreSet.add(g.trim()))
  );
  const genreSelect = document.getElementById("filter-genre");
  if (!genreSelect) return;
  genreSelect.innerHTML = '<option value="">Tous les genres</option>';
  Array.from(genreSet)
    .sort()
    .forEach((genre) => {
      const opt = document.createElement("option");
      opt.value = genre;
      opt.textContent = genre;
      genreSelect.appendChild(opt);
    });
}

function filter() {
  const searchBar = document.getElementById("search-bar");
  const genreSelect = document.getElementById("filter-genre");
  const yearInput = document.getElementById("filter-year");
  const searchQuery = searchBar ? searchBar.value.toLowerCase() : "";
  const selectedGenre = genreSelect ? genreSelect.value : "";
  const selectedYear = yearInput ? yearInput.value : "";

  const filmsList = document.getElementById("films-list");
  if (filmsList) {
    const filmsItems = filmsList.getElementsByClassName("films");
    let visibleFilmsCount = 0;
    for (let i = 0; i < filmsItems.length; i++) {
      const filmDiv = filmsItems[i];
      const filmTitle = filmDiv
        .querySelector(".films-title")
        .innerText.toLowerCase();
      const filmDesc = filmDiv
        .querySelector(".films-description")
        .innerText.toLowerCase();
      const filmKey = Object.keys(allFilms).find(
        (key) => allFilms[key].title.toLowerCase() === filmTitle
      );
      const film = filmKey ? allFilms[filmKey] : null;
      let show = true;
      if (
        searchQuery &&
        !filmTitle.includes(searchQuery) &&
        !filmDesc.includes(searchQuery)
      )
        show = false;
      if (
        selectedGenre &&
        (!film || !(film.genres || []).includes(selectedGenre))
      )
        show = false;
      if (selectedYear && (!film || String(film.year) !== selectedYear))
        show = false;
      filmDiv.style.display = show ? "block" : "none";
      if (show) visibleFilmsCount++;
    }
    const filmsSectionTitle = document.getElementById("films-section-title");
    if (filmsSectionTitle) {
      filmsSectionTitle.style.display = visibleFilmsCount === 0 ? "none" : "";
    }
  }

  const seriesList = document.getElementById("series-list");
  if (seriesList) {
    const seriesItems = seriesList.getElementsByClassName("series");
    let visibleSeriesCount = 0;
    for (let i = 0; i < seriesItems.length; i++) {
      const seriesDiv = seriesItems[i];
      const seriesTitle = seriesDiv
        .querySelector(".series-title")
        .innerText.toLowerCase();
      const seriesDesc = seriesDiv
        .querySelector(".series-description")
        .innerText.toLowerCase();
      const seriesKey = Object.keys(allSeries).find(
        (key) => allSeries[key].title.toLowerCase() === seriesTitle
      );
      const serie = seriesKey ? allSeries[seriesKey] : null;
      let show = true;
      if (
        searchQuery &&
        !seriesTitle.includes(searchQuery) &&
        !seriesDesc.includes(searchQuery)
      )
        show = false;
      if (
        selectedGenre &&
        (!serie || !(serie.genres || []).includes(selectedGenre))
      )
        show = false;
      if (selectedYear && (!serie || String(serie.year) !== selectedYear))
        show = false;
      seriesDiv.style.display = show ? "block" : "none";
      if (show) visibleSeriesCount++;
    }
    const seriesSectionTitle = document.getElementById("series-section-title");
    if (seriesSectionTitle) {
      seriesSectionTitle.style.display = visibleSeriesCount === 0 ? "none" : "";
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

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
});

(function detectDevTools() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
  setTimeout(detectDevTools, 1000);
})();
