/**
 * js/main.js
 * Main application logic for routing, filtering, searching, and initializing the app.
 * @module main
 */

import { fetchAllData, fetchNotifs } from './dataLoader.js';
import { setupHero, renderHorizontalRow, renderGrid, renderNotifs, openDetails, closeDetails, playCurrentMedia, renderCollections } from './display.js';
import { playVideo, closeVideo, toggleNotifs, toggleMobileMenu, toggleMobileSearch, showLoader, hideLoader } from './utils.js';

let appData = { films: {}, series: {}, collections: {} };
let currentView = 'home';

window.router = router;
window.toggleNotifs = toggleNotifs;
window.closeDetails = closeDetails;
window.playCurrentMedia = playCurrentMedia;
window.closeVideo = closeVideo;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleMobileMenu = toggleMobileMenu;

document.addEventListener('DOMContentLoaded', async () => {
    showLoader();

    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileSearchBtn').addEventListener('click', toggleMobileSearch);

    const data = await fetchAllData();
    appData = data;

    const notifs = await fetchNotifs();
    renderNotifs(notifs);

    initHero();
    populateFilters();
    router('home');

    hideLoader();
});

/**
 * Sets navigation link colors to default (removes highlight).
 * @param {HTMLElement} navHome - Navigation link elements
 * @param {HTMLElement} navSeries - Navigation link elements
 * @param {HTMLElement} navFilms - Navigation link elements
 * @param {HTMLElement} navCollections - Navigation link elements
 */
function textWhite(navHome, navSeries, navFilms, navCollections) {
    [navHome, navSeries, navFilms, navCollections].forEach(el => {
        if (el) el.classList.remove('text-white', 'text-red-500');
    });
}

/**
 * Routes to the specified view and updates the UI accordingly.
 * @param {string} view - The view to route to ('home', 'series', 'films', 'collections').
 */
function router(view) {
    currentView = view;

    clearSearch();

    document.getElementById('mobileMenuPanel').classList.remove('active');
    document.getElementById('mobileSearchPanel').classList.remove('active');

    const hero = document.getElementById('heroSection');
    const filters = document.getElementById('filterSection');
    const homeContent = document.getElementById('homePageContent');
    const collectionsContent = document.getElementById('collectionsContent');
    const genericGrid = document.getElementById('genericGridContainer');
    const title = document.getElementById('titleText');
    const navHome = document.getElementById('nav-home');
    const navSeries = document.getElementById('nav-series');
    const navFilms = document.getElementById('nav-films');
    const navCollections = document.getElementById('nav-collections');

    textWhite(navHome, navSeries, navFilms, navCollections);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    genericGrid.classList.add('hidden');
    document.getElementById('contentGrid').innerHTML = '';

    const allFilms = Object.values(appData.films);
    const allSeries = Object.values(appData.series);

    if (view === 'home') {
        if (navHome) navHome.classList.add('text-white');
        hero.classList.remove('hidden');
        homeContent.classList.remove('hidden');

        const latestFilms = [...allFilms].sort((a, b) => b.year - a.year).slice(0, 5);
        const latestSeries = [...allSeries].sort((a, b) => b.year - a.year).slice(0, 5);

        renderHorizontalRow('homeFilmsRow', latestFilms);
        renderHorizontalRow('homeSeriesRow', latestSeries);
    }
    else if (view === 'series') {
        if (navSeries) navSeries.classList.add('text-white');
        filters.classList.remove('hidden');
        genericGrid.classList.remove('hidden');
        title.innerText = "Toutes les Séries TV";
        populateFilters();
        applyFilters();
    }
    else if (view === 'films') {
        if (navFilms) navFilms.classList.add('text-white');
        filters.classList.remove('hidden');
        genericGrid.classList.remove('hidden');
        title.innerText = "Tous les Films";
        populateFilters();
        applyFilters();
    }
    else if (view === 'collections') {
        if (navCollections) navCollections.classList.add('text-white');
        collectionsContent.classList.remove('hidden');
        renderCollections(appData.collections, appData);
    }
}

/**
 * Initializes the hero section with a featured item or the latest item.
 */
function initHero() {
    const all = [...Object.values(appData.films), ...Object.values(appData.series)];
    if (all.length === 0) return;

    const featuredItem = all.find(item => item.featured === true);

    if (featuredItem) {
        setupHero(featuredItem);
    } else {
        all.sort((a, b) => b.year - a.year);
        setupHero(all[0]);
    }
}

/**
 * Populates filter dropdowns based on available data.
 */
function populateFilters() {
    const source = currentView === 'films' ? Object.values(appData.films) : Object.values(appData.series);
    const genres = new Set();
    const years = new Set();
    const directors = new Set();

    source.forEach(item => {
        item.genres?.forEach(g => genres.add(g));
        if (item.year) years.add(item.year);
        const people = item.directors || item.creators || [];
        people.forEach(p => directors.add(p));
    });

    const genreSel = document.getElementById('filterGenre');
    genreSel.innerHTML = '<option value="">Tous les genres</option>';
    Array.from(genres).sort().forEach(g => genreSel.add(new Option(g, g)));

    const yearSel = document.getElementById('filterYear');
    yearSel.innerHTML = '<option value="">Toutes</option>';
    Array.from(years).sort((a, b) => b - a).forEach(y => yearSel.add(new Option(y, y)));

    const directorSel = document.getElementById('filterDirector');
    directorSel.innerHTML = '<option value="">Tous</option>';
    Array.from(directors).sort().forEach(d => directorSel.add(new Option(d, d)));
}

/**
 * Applies selected filters and sorting to the displayed items.
 */
function applyFilters() {
    const genre = document.getElementById('filterGenre').value;
    const year = document.getElementById('filterYear').value;
    const imdb = parseFloat(document.getElementById('filterImdb').value) || 0;
    const director = document.getElementById('filterDirector').value;
    const sortBy = document.getElementById('sortBy').value;

    const source = currentView === 'films' ? Object.values(appData.films) : Object.values(appData.series);

    let filtered = source.filter(item => {
        const gMatch = !genre || item.genres?.includes(genre);
        const yMatch = !year || item.year == year;
        const iMatch = (item.IMDb || 0) >= imdb;
        const people = item.directors || item.creators || [];
        const dMatch = !director || people.includes(director);
        return gMatch && yMatch && iMatch && dMatch;
    });

    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'date_desc': return b.year - a.year;
            case 'date_asc': return a.year - b.year;
            case 'rating_desc': return (b.IMDb || 0) - (a.IMDb || 0);
            case 'alpha_desc': return b.title.localeCompare(a.title);
            case 'alpha_asc':
            default: return a.title.localeCompare(b.title);
        }
    });

    renderGrid(filtered);
}

/**
 * Resets all filters to default values and reapplies them.
 */
function resetFilters() {
    document.getElementById('filterGenre').value = "";
    document.getElementById('filterYear').value = "";
    document.getElementById('filterImdb').value = "";
    document.getElementById('filterDirector').value = "";
    document.getElementById('sortBy').value = "alpha_asc";
    applyFilters();
}

/**
 * Handles search input and updates the displayed content accordingly.
 * @param {Event} e - The input event.
 */
function handleSearch(e) {
    const q = e.target.value.toLowerCase();

    if (e.target.id === 'searchInput') document.getElementById('mobileSearchInput').value = q;
    else document.getElementById('searchInput').value = q;

    const hero = document.getElementById('heroSection');
    const filters = document.getElementById('filterSection');
    const homeContent = document.getElementById('homePageContent');
    const collectionsContent = document.getElementById('collectionsContent');
    const genericGrid = document.getElementById('genericGridContainer');

    if (!q) {
        if (currentView === 'home') {
            hero.classList.remove('hidden'); homeContent.classList.remove('hidden'); genericGrid.classList.add('hidden');
        } else if (currentView === 'collections') {
            collectionsContent.classList.remove('hidden'); genericGrid.classList.add('hidden');
        } else {
            filters.classList.remove('hidden'); applyFilters();
        }
        return;
    }

    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    genericGrid.classList.remove('hidden');

    const all = [...Object.values(appData.films), ...Object.values(appData.series)];
    const res = all.filter(i => i.title.toLowerCase().includes(q));

    const navHome = document.getElementById('nav-home');
    const navSeries = document.getElementById('nav-series');
    const navFilms = document.getElementById('nav-films');
    const navCollections = document.getElementById('nav-collections');
    textWhite(navHome, navSeries, navFilms, navCollections);

    const titleEl = document.getElementById('titleText');
    if (titleEl) {
        titleEl.textContent = `Résultats pour "${q}" `;
        let countSpan = titleEl.querySelector('.text-gray-500.text-sm.ml-2');
        if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'text-gray-500 text-sm ml-2';
            titleEl.appendChild(countSpan);
        }
        countSpan.textContent = `(${res.length})`;
    } else {
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            while (sectionTitle.firstChild) {
                sectionTitle.removeChild(sectionTitle.firstChild);
            }

            const accentSpan = document.createElement('span');
            accentSpan.className = 'w-1 h-8 bg-red-600 rounded-full shadow-[0_0_15px_#dc2626]';
            sectionTitle.appendChild(accentSpan);

            const titleTextSpan = document.createElement('span');
            titleTextSpan.id = 'titleText';
            titleTextSpan.className = 'tracking-tight';
            titleTextSpan.textContent = `Résultats pour "${q}" (${res.length})`;
            sectionTitle.appendChild(titleTextSpan);
        }
    }
    renderGrid(res);
}

/**
 * Clears search input fields.
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('mobileSearchInput').value = '';
}

document.getElementById('searchInput').addEventListener('input', handleSearch);
document.getElementById('mobileSearchInput').addEventListener('input', handleSearch);