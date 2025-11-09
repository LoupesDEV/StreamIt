/**
 * @module scripts
 * @description
 * Contains main application logic, global event listeners, and utility functions.
 * Coordinates interactions between modules and manages app-wide behaviors.
 */

let currentSection = "home";

const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");

/**
 * Sets up all global event listeners for navigation, filtering, modals, video tracking, and search.
 *
 * @function
 * @returns {void}
 */
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

/**
 * Shows the specified section and updates content as needed.
 *
 * @function
 * @param {string} sectionName - The name of the section to display.
 * @returns {void}
 */
function showSection(sectionName) {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    case "collections":
      displayCollections();
      break;
    case "search":
      if (searchInput.value.trim()) {
        handleSearch();
      }
      break;
  }
}

/**
 * Sets the given navigation link as active and removes active state from others.
 *
 * @function
 * @param {Element} activeLink - The navigation link element to activate.
 * @returns {void}
 */
function setActiveNavLink(activeLink) {
  navLinks.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
}

/**
 * Handles the global error event for images.
 *
 * Replaces broken images with a fallback icon when an image fails to load.
 *
 * @event
 * @param {Event} e - The error event.
 * @returns {void}
 */
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

/**
 * Handles the global keydown event for keyboard shortcuts.
 *
 * Focuses the search input when the "/" key is pressed (without Ctrl or Alt).
 *
 * @event
 * @param {KeyboardEvent} e - The keydown event.
 * @returns {void}
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    searchInput.focus();
  }
});
