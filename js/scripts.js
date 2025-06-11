let currentSection = "home";

const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");

function setupEventListeners() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
      setActiveNavLink(link);
    });
  });

  searchInput.addEventListener("input", debounce(handleSearch, 300));

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", closeModals);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModals();
  });

  videoModal.addEventListener("click", (e) => {
    if (e.target === videoModal) closeModals();
  });

  document.getElementById("filmGenreFilter").addEventListener("change", () => {
    displayFilms(getFilteredFilms());
  });

  document.getElementById("filmYearFilter").addEventListener("change", () => {
    displayFilms(getFilteredFilms());
  });

  document
    .getElementById("filmDirectorFilter")
    .addEventListener("change", () => {
      displayFilms(getFilteredFilms());
    });

  document.getElementById("filmActorFilter").addEventListener("change", () => {
    displayFilms(getFilteredFilms());
  });

  document.getElementById("filmRatingFilter").addEventListener("input", (e) => {
    document.querySelector("#films .rating-value").textContent = parseFloat(
      e.target.value
    ).toFixed(1);
    displayFilms(getFilteredFilms());
  });

  document
    .getElementById("seriesGenreFilter")
    .addEventListener("change", () => {
      displaySeries(getFilteredSeries());
    });

  document.getElementById("seriesYearFilter").addEventListener("change", () => {
    displaySeries(getFilteredSeries());
  });

  document
    .getElementById("seriesCreatorFilter")
    .addEventListener("change", () => {
      displaySeries(getFilteredSeries());
    });

  document
    .getElementById("seriesActorFilter")
    .addEventListener("change", () => {
      displaySeries(getFilteredSeries());
    });

  document
    .getElementById("seriesRatingFilter")
    .addEventListener("input", (e) => {
      document.querySelector("#series .rating-value").textContent = parseFloat(
        e.target.value
      ).toFixed(1);
      displaySeries(getFilteredSeries());
    });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModals();
    }
  });

  if (videoPlayer) {
    videoPlayer.addEventListener("timeupdate", handleVideoTimeUpdate);
    videoPlayer.addEventListener("ended", handleVideoEnded);
    videoPlayer.addEventListener("pause", handleVideoPause);
  }
}

function showSection(sectionName) {
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionName).classList.add("active");
  currentSection = sectionName;

  switch (sectionName) {
    case "films":
      displayFilms(Object.values(filmsData));
      break;
    case "series":
      displaySeries(Object.values(seriesData));
      break;
    case "search":
      if (searchInput.value.trim()) {
        handleSearch();
      }
      break;
    case "stats":
      displayStats();
      break;
  }
}

function setActiveNavLink(activeLink) {
  navLinks.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
}

document.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG") {
      e.target.style.display = "none";
      e.target.parentElement.innerHTML = '<i class="fas fa-film"></i>';
    }
  },
  true
);

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    searchInput.focus();
  }
});
