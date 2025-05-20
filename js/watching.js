function getNumberOfArguments() {
  const params = new URLSearchParams(window.location.search);
  return Array.from(params.keys()).length;
}

function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const keys = Array.from(params.keys());

  if (keys.length === 1) {
    return {
      films: params.get("films"),
    };
  }

  return {
    series: params.get("series"),
    season: params.get("season"),
    episode: params.get("episode"),
  };
}

function goBackToSeries() {
  const { series } = getURLParams();
  window.location.href = `series.html?series=${series}`;
}

function goBackToFilms() {
  const { films } = getURLParams();
  window.location.href = `films.html?films=${films}`;
}

async function loadEpisodeData() {
  const { series, season, episode } = getURLParams();
  const response = await fetch("data/series_data.json");
  const data = await response.json();

  if (!data[series]) {
    console.error(`Série ${series} non trouvée.`);
    return;
  }

  const seriesData = data[series];
  const currentSeason = seriesData.seasons[season];

  if (!currentSeason) {
    console.error(`Saison ${season} non trouvée pour la série ${series}.`);
    return;
  }

  const episodeData = currentSeason.find((ep) => ep.title === episode);
  if (!episodeData) {
    console.error(`Épisode ${episode} non trouvé.`);
    return;
  }

  const watchTitle = document.getElementById("watch-title");
  const videoPlayer = document.getElementById("video-player");
  const episodeTitle = document.getElementById("episode-title");
  const episodeDescription = document.getElementById("episode-description");
  const episodeListUl = document.getElementById("episode-list-ul");
  const seasonSelect = document.getElementById("season-select");

  watchTitle.innerText = `${series} (${seriesData.year})`;
  videoPlayer.src = episodeData.video;
  episodeTitle.innerText = episodeData.title;
  episodeDescription.innerText = episodeData.desc;

  episodeListUl.innerHTML = "";
  currentSeason.forEach((ep, index) => {
    const episodeNumber = (index + 1).toString().padStart(2, "0");
    const episodeLi = document.createElement("li");
    episodeLi.innerText = `#${episodeNumber} - ${ep.title}`;
    episodeLi.onclick = () =>
      (window.location.href = `watching.html?series=${series}&season=${season}&episode=${ep.title}`);

    if (ep.title === episode) {
      episodeLi.classList.add("active");
    }

    episodeListUl.appendChild(episodeLi);
  });

  seasonSelect.innerHTML = "";
  Object.keys(seriesData.seasons).forEach((seasonKey) => {
    const seasonOption = document.createElement("option");
    seasonOption.value = seasonKey;
    seasonOption.innerText = `Saison ${seasonKey}`;
    seasonSelect.appendChild(seasonOption);
  });

  seasonSelect.value = season;
}

async function loadFilmData() {
  const { films } = getURLParams();
  const response = await fetch("data/films_data.json");
  const data = await response.json();

  if (!data[films]) {
    console.error(`Film ${films} non trouvé.`);
    return;
  }

  const filmData = data[films];

  const watchTitle = document.getElementById("watch-title");
  const videoPlayer = document.getElementById("video-player");
  const filmTitle = document.getElementById("episode-title");
  const filmDescription = document.getElementById("episode-description");

  watchTitle.innerText = `${films} (${filmData.year})`;
  videoPlayer.src = filmData.video;
  filmTitle.innerText = filmData.title;
  filmDescription.innerText = filmData.description;

  const mainSection = document.getElementById("main-section");
  mainSection.style.justifyContent = "center";

  const episodeList = document.getElementById("episode-list");
  episodeList.remove();
}

async function changeSeason() {
  const seasonSelect = document.getElementById("season-select");
  const selectedSeason = seasonSelect.value;
  const { series } = getURLParams();

  const response = await fetch("data/series_data.json");
  const data = await response.json();

  if (!data[series]) {
    console.error(`Série ${series} non trouvée.`);
    return;
  }

  const seriesData = data[series];
  const validSeasons = Object.keys(seriesData.seasons);
  if (!validSeasons.includes(selectedSeason)) {
    console.error(`Saison non valide sélectionnée : ${selectedSeason}`);
    return;
  }
  const currentSeason = seriesData.seasons[selectedSeason];

  const episodeListUl = document.getElementById("episode-list-ul");
  episodeListUl.innerHTML = "";

  currentSeason.forEach((ep, index) => {
    const episodeNumber = (index + 1).toString().padStart(2, "0");
    const episodeLi = document.createElement("li");
    episodeLi.innerText = `#${episodeNumber} - ${ep.title}`;
    episodeLi.onclick = () => {
      const sanitizedSeason = encodeURIComponent(selectedSeason);
      window.location.href = `watching.html?series=${series}&season=${sanitizedSeason}&episode=${encodeURIComponent(
        ep.title
      )}`;
    };
    episodeListUl.appendChild(episodeLi);
  });

  const firstEpisode = currentSeason[0];
  window.location.href = `watching.html?series=${series}&season=${selectedSeason}&episode=${encodeURIComponent(
    firstEpisode.title
  )}`;
}

function goBack() {
  const numberOfArguments = getNumberOfArguments();
  if (numberOfArguments === 1) {
    goBackToFilms();
  } else if (numberOfArguments === 3) {
    goBackToSeries();
  } else {
    console.error("Paramètres d'URL non valides. - " + numberOfArguments);
  }
}

function loadData() {
  const numberOfArguments = getNumberOfArguments();
  if (numberOfArguments === 1) {
    loadFilmData();
  } else if (numberOfArguments === 3) {
    loadEpisodeData();
  } else {
    console.error("Paramètres d'URL non valides. - " + numberOfArguments);
  }
}

loadData();
