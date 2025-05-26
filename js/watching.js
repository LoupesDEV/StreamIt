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
  window.location.href = `series.html?series=${encodeURIComponent(series)}`;
}

function goBackToFilms() {
  const { films } = getURLParams();
  window.location.href = `films.html?films=${encodeURIComponent(films)}`;
}

function showSkeletons() {
  document
    .querySelectorAll(".skeleton")
    .forEach((el) => (el.style.display = ""));
  const videoPlayer = document.getElementById("video-player");
  const episodeInfo = document.getElementById("episode-info");
  const seasonSelect = document.getElementById("season-select");
  const episodeListUl = document.getElementById("episode-list-ul");
  if (videoPlayer) videoPlayer.style.display = "none";
  if (episodeInfo) episodeInfo.style.display = "none";
  if (seasonSelect) seasonSelect.style.display = "none";
  if (episodeListUl) episodeListUl.style.display = "none";
}

function hideSkeletons() {
  document
    .querySelectorAll(".skeleton")
    .forEach((el) => (el.style.display = "none"));
  const videoPlayer = document.getElementById("video-player");
  const episodeInfo = document.getElementById("episode-info");
  const seasonSelect = document.getElementById("season-select");
  const episodeListUl = document.getElementById("episode-list-ul");
  if (videoPlayer) videoPlayer.style.display = "";
  if (episodeInfo) episodeInfo.style.display = "";
  if (seasonSelect && seasonSelect.options.length > 0)
    seasonSelect.style.display = "";
  if (episodeListUl && episodeListUl.children.length > 0)
    episodeListUl.style.display = "";
  const episodeListSkeleton = document.getElementById("episode-list-skeleton");
  if (episodeListSkeleton) episodeListSkeleton.style.display = "none";
}

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "404.html";
}

async function fetchJsonOrError(url, errorMsg) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (error) {
    handleErrorAndRedirect(errorMsg);
    throw error;
  }
}

function renderEpisodeList(
  episodeListUl,
  episodes,
  series,
  season,
  currentEpisodeTitle
) {
  if (!episodeListUl) return;
  episodeListUl.innerHTML = "";
  episodes.forEach((ep, index) => {
    const episodeNumber = (index + 1).toString().padStart(2, "0");
    const episodeLi = document.createElement("li");
    episodeLi.innerText = `#${episodeNumber} - ${ep.title}`;
    episodeLi.onclick = () =>
      (window.location.href = `watching.html?series=${encodeURIComponent(
        series
      )}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(
        ep.title
      )}`);
    if (ep.title === currentEpisodeTitle) {
      episodeLi.classList.add("active");
    }
    episodeListUl.appendChild(episodeLi);
  });
}

async function loadEpisodeData() {
  showSkeletons();
  const { series, season, episode } = getURLParams();
  try {
    const data = await fetchJsonOrError(
      "data/series_data.json",
      "Erreur réseau : impossible de charger les données de la série."
    );

    if (!data[series]) {
      handleErrorAndRedirect(
        `La série "${series}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }
    const seriesData = data[series];
    const currentSeason = seriesData.seasons[season];
    if (!currentSeason) {
      handleErrorAndRedirect(
        `La saison "${season}" de la série "${series}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }
    const episodeData = currentSeason.find((ep) => ep.title === episode);
    if (!episodeData) {
      handleErrorAndRedirect(
        `L'épisode "${episode}" de la série "${series}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }

    const watchTitle = document.getElementById("watch-title");
    const videoPlayer = document.getElementById("video-player");
    const episodeTitle = document.getElementById("episode-title");
    const episodeDescription = document.getElementById("episode-description");
    const episodeListUl = document.getElementById("episode-list-ul");
    const seasonSelect = document.getElementById("season-select");

    if (watchTitle) watchTitle.innerText = `${series} (${seriesData.year})`;
    if (videoPlayer) videoPlayer.src = episodeData.video;
    if (episodeTitle) episodeTitle.innerText = episodeData.title;
    if (episodeDescription) episodeDescription.innerText = episodeData.desc;

    renderEpisodeList(episodeListUl, currentSeason, series, season, episode);

    if (seasonSelect) {
      seasonSelect.innerHTML = "";
      Object.keys(seriesData.seasons).forEach((seasonKey) => {
        const seasonOption = document.createElement("option");
        seasonOption.value = seasonKey;
        seasonOption.innerText = `Saison ${seasonKey}`;
        seasonSelect.appendChild(seasonOption);
      });
      seasonSelect.value = season;
    }
  } finally {
    hideSkeletons();
  }
}

async function loadFilmData() {
  showSkeletons();
  const { films } = getURLParams();
  try {
    const data = await fetchJsonOrError(
      "data/films_data.json",
      "Erreur réseau : impossible de charger les données du film."
    );

    if (!data[films]) {
      handleErrorAndRedirect(
        `Le film "${films}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }

    const filmData = data[films];
    const watchTitle = document.getElementById("watch-title");
    const videoPlayer = document.getElementById("video-player");
    const filmTitle = document.getElementById("episode-title");
    const filmDescription = document.getElementById("episode-description");

    if (watchTitle) watchTitle.innerText = `${films} (${filmData.year})`;
    if (videoPlayer) videoPlayer.src = filmData.video;
    if (filmTitle) filmTitle.innerText = filmData.title;
    if (filmDescription) filmDescription.innerText = filmData.description;

    const mainSection = document.getElementById("main-section");
    if (mainSection) mainSection.style.justifyContent = "center";

    const episodeList = document.getElementById("episode-list");
    if (episodeList) episodeList.style.display = "none";
  } finally {
    hideSkeletons();
  }
}

async function changeSeason() {
  const seasonSelect = document.getElementById("season-select");
  if (!seasonSelect) return;
  const selectedSeason = seasonSelect.value;
  const { series } = getURLParams();

  try {
    const data = await fetchJsonOrError(
      "data/series_data.json",
      "Erreur réseau : impossible de charger les données de la série."
    );

    if (!data[series]) {
      handleErrorAndRedirect(
        `La série "${series}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }
    const seriesData = data[series];
    const validSeasons = Object.keys(seriesData.seasons);
    if (!validSeasons.includes(selectedSeason)) {
      handleErrorAndRedirect(
        `La saison "${selectedSeason}" de la série "${series}" est introuvable ou n'existe pas dans notre base de données.`
      );
      return;
    }
    const currentSeason = seriesData.seasons[selectedSeason];

    const episodeListUl = document.getElementById("episode-list-ul");
    renderEpisodeList(
      episodeListUl,
      currentSeason,
      series,
      selectedSeason,
      null
    );

    const firstEpisode = currentSeason[0];
    window.location.href = `watching.html?series=${encodeURIComponent(
      series
    )}&season=${encodeURIComponent(
      selectedSeason
    )}&episode=${encodeURIComponent(firstEpisode.title)}`;
  } catch (error) {
    // L'erreur est déjà gérée dans fetchJsonOrError
  }
}

function goBack() {
  const numberOfArguments = getNumberOfArguments();
  if (numberOfArguments === 1) {
    goBackToFilms();
  } else if (numberOfArguments === 3) {
    goBackToSeries();
  } else {
    handleErrorAndRedirect(
      `Impossible de revenir en arrière : paramètres d'URL non valides (${numberOfArguments} argument(s)).`
    );
  }
}

function loadData() {
  const numberOfArguments = getNumberOfArguments();
  if (numberOfArguments === 1) {
    loadFilmData();
  } else if (numberOfArguments === 3) {
    loadEpisodeData();
  } else {
    handleErrorAndRedirect(
      `Impossible de revenir en arrière : paramètres d'URL non valides (${numberOfArguments} argument(s)).`
    );
  }
}

loadData();
