async function loadSeriesData() {
  const response = await fetch("data/series_data.json");
  const data = await response.json();
  renderSeries(data);
}

async function loadFilmsData() {
  const response = await fetch("data/films_data.json");
  const data = await response.json();
  renderFilms(data);
}

function renderSeries(seriesData) {
  const seriesList = document.getElementById("series-list");
  seriesList.innerHTML = "";

  const sortedSeries = Object.keys(seriesData).sort((a, b) => {
    return seriesData[a].title.localeCompare(seriesData[b].title);
  });

  for (const series of sortedSeries) {
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("series");
    seriesDiv.onclick = () =>
      (window.location.href = `pages/series.html?series=${series}`);

    const seriesImage = document.createElement("img");
    seriesImage.src = seriesData[series].banner;

    const seriesInfo = document.createElement("div");
    seriesInfo.classList.add("series-info");

    const seriesTitle = document.createElement("div");
    seriesTitle.classList.add("series-title");
    seriesTitle.innerText = seriesData[series].title;

    const seriesDescription = document.createElement("div");
    seriesDescription.classList.add("series-description");
    seriesDescription.innerText = seriesData[series].description
      ? seriesData[series].description.slice(0, 100) + "..."
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
  filmsList.innerHTML = "";

  const sortedFilms = Object.keys(filmsData).sort((a, b) => {
    return filmsData[a].title.localeCompare(filmsData[b].title);
  });

  for (const film of sortedFilms) {
    const filmDiv = document.createElement("div");
    filmDiv.classList.add("films");
    filmDiv.onclick = () =>
      (window.location.href = `pages/films.html?films=${film}`);

    const filmImage = document.createElement("img");
    filmImage.src = filmsData[film].banner;

    const filmInfo = document.createElement("div");
    filmInfo.classList.add("films-info");

    const filmTitle = document.createElement("div");
    filmTitle.classList.add("films-title");
    filmTitle.innerText = filmsData[film].title;

    const filmDescription = document.createElement("div");
    filmDescription.classList.add("films-description");
    filmDescription.innerText = filmsData[film].description
      ? filmsData[film].description.slice(0, 100) + "..."
      : "Aucune description disponible.";

    filmInfo.appendChild(filmTitle);
    filmInfo.appendChild(filmDescription);
    filmDiv.appendChild(filmImage);
    filmDiv.appendChild(filmInfo);
    filmsList.appendChild(filmDiv);
  }
}

function filter() {
  const searchQuery = document.getElementById("search-bar").value.toLowerCase();

  const seriesList = document.getElementById("series-list");
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

  const filmsList = document.getElementById("films-list");
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

loadSeriesData();
loadFilmsData();

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "y") {
    event.preventDefault();
    document.getElementById("search-bar").focus();
  }
});
