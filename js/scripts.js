/**
 * Controls global user interface behavior and navigation interactions.
 *
 * This module sets up all DOM event listeners required for navigation, filtering,
 * modals, video tracking, and search interactions. It manages section transitions,
 * updates active navigation states, and reacts to filter input to refresh content dynamically.
 * It also handles global keyboard shortcuts and graceful fallback when images fail to load.
 *
 * @module scripts
 */

let currentSection = "home";

const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");

/**
 * Attaches all necessary event listeners to DOM elements for navigation, filtering, search, modal control, and video handling.
 *
 * This includes:
 * - Navigation link clicks and section switching
 * - Search input with debounce
 * - Modal open/close behavior
 * - Filter changes for both films and series
 * - Video player tracking (time update, end, pause)
 * - Global keyboard shortcuts (Escape to close modals, "/" to focus search)
 *
 * @function
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
        document.querySelector("#films .rating-value").textContent = parseFloat(e.target.value).toFixed(1);
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
            document.querySelector("#series .rating-value").textContent = parseFloat(e.target.value).toFixed(1);
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
 * Displays the requested section and updates its content if necessary.
 *
 * Hides all other sections, shows the one specified, and triggers corresponding content
 * rendering depending on the section (films, series, search, or stats).
 *
 * @function
 * @param {string} sectionName - The ID of the section to display.
 */
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

/**
 * Sets the clicked navigation link as active and removes the active state from others.
 *
 * Visually highlights the currently selected section in the navigation bar.
 *
 * @function
 * @param {HTMLElement} activeLink - The link element that was clicked.
 */
function setActiveNavLink(activeLink) {
    navLinks.forEach((link) => link.classList.remove("active"));
    activeLink.classList.add("active");
}

document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") {
        e.target.style.display = "none";
        e.target.parentElement.innerHTML = '<i class="fas fa-film"></i>';
    }
}, true);

document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchInput.focus();
    }
});
