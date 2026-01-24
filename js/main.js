/**
 * js/main.js
 * Main application logic for routing, filtering, searching, and initializing the app.
 * @module main
 */

import { fetchAllData } from './dataLoader.js';
import { setupHero, renderHorizontalRow, renderGrid, renderNotifs, openDetails, closeDetails, playCurrentMedia, renderCollections, renderActorsList, closeActorDetails, renderActorsListSearch } from './display.js';
import { closeVideo, toggleNotifs, toggleSettings, toggleMobileMenu, toggleMobileSearch, showLoader, hideLoader, hardenPlayerControls, initPlayerPersistence, downloadProgressBackup, openProgressImport, importProgressFromFile } from './utils.js';

let appData = { films: {}, series: {}, collections: {}, notifs: {}, actors: {} };
let currentView = 'home';

window.router = router;
window.toggleNotifs = toggleNotifs;
window.toggleSettings = toggleSettings;
window.closeDetails = closeDetails;
window.playCurrentMedia = playCurrentMedia;
window.closeVideo = closeVideo;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleMobileMenu = toggleMobileMenu;
window.downloadProgressBackup = downloadProgressBackup;
window.openProgressImport = openProgressImport;
window.closeActorDetails = closeActorDetails;

document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    hardenPlayerControls();
    initPlayerPersistence();

    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileSearchBtn').addEventListener('click', toggleMobileSearch);

    const importInput = document.getElementById('progressImportInput');
    if (importInput) {
        importInput.addEventListener('change', async (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            try {
                const result = await importProgressFromFile(file);
                alert(`Progression importée (${result.filmsCount} films, ${result.seriesCount} séries).`);
                window.location.reload();
            } catch (err) {
                console.error('Import progression échouée', err);
                alert(err.message || "Erreur lors de l'import de la progression.");
            } finally {
                event.target.value = '';
                const settings = document.getElementById('settingsDropdown');
                if (settings) settings.classList.remove('active');
            }
        });
    }

    const data = await fetchAllData();
    appData = data;

    renderNotifs(data.notifs);

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
function textWhite(navHome, navSeries, navFilms, navCollections, navActors) {
    [navHome, navSeries, navFilms, navCollections, navActors].forEach(el => {
        if (el) el.classList.remove('text-white', 'text-red-500');
    });
}

/**
 * Routes to the specified view and updates the UI accordingly.
 * @param {string} view - The view to route to ('home', 'series', 'films', 'collections', 'actors').
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
    const actorsContent = document.getElementById('actorsContent');
    const title = document.getElementById('titleText');
    const navHome = document.getElementById('nav-home');
    const navSeries = document.getElementById('nav-series');
    const navFilms = document.getElementById('nav-films');
    const navCollections = document.getElementById('nav-collections');
    const navActors = document.getElementById('nav-actors');

    textWhite(navHome, navSeries, navFilms, navCollections, navActors);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    actorsContent.classList.add('hidden');
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

        enableHorizontalWheelScroll();
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

        enableHorizontalWheelScroll();
    }
    else if (view === 'actors') {
        if (navActors) navActors.classList.add('text-white');
        actorsContent.classList.remove('hidden');
        renderActorsList(appData.actors, appData.films, appData.series);
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
    const actorsContent = document.getElementById('actorsContent');

    if (!q) {
        if (currentView === 'home') {
            hero.classList.remove('hidden'); homeContent.classList.remove('hidden'); genericGrid.classList.add('hidden');
        } else if (currentView === 'collections') {
            collectionsContent.classList.remove('hidden'); genericGrid.classList.add('hidden');
        } else if (currentView === 'actors') {
            actorsContent.classList.remove('hidden'); genericGrid.classList.add('hidden');
            renderActorsList(appData.actors, appData.films, appData.series);
        } else {
            filters.classList.remove('hidden'); applyFilters();
        }
        return;
    }

    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    actorsContent.classList.add('hidden');
    genericGrid.classList.remove('hidden');

    const all = [...Object.values(appData.films), ...Object.values(appData.series)];
    const resMedia = all.filter(i => i.title.toLowerCase().includes(q));
    const resActors = Object.values(appData.actors).filter(i => i.name.toLowerCase().includes(q));

    const navHome = document.getElementById('nav-home');
    const navSeries = document.getElementById('nav-series');
    const navFilms = document.getElementById('nav-films');
    const navCollections = document.getElementById('nav-collections');
    const navActors = document.getElementById('nav-actors');
    textWhite(navHome, navSeries, navFilms, navCollections, navActors);

    const titleEl = document.getElementById('titleText');
    const totalResults = resMedia.length + resActors.length;
    if (titleEl) {
        titleEl.textContent = `Résultats pour "${q}" `;
        let countSpan = titleEl.querySelector('.text-gray-500.text-sm.ml-2');
        if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'text-gray-500 text-sm ml-2';
            titleEl.appendChild(countSpan);
        }
        countSpan.textContent = `(${totalResults})`;
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
            titleTextSpan.textContent = `Résultats pour "${q}" (${totalResults})`;
            sectionTitle.appendChild(titleTextSpan);
        }
    }
    
    // Afficher les films et séries
    renderGrid(resMedia);
    
    // Afficher les acteurs s'il y en a
    if (resActors.length > 0) {
        renderActorsListSearch(resActors, appData.films, appData.series);
    }
}

/**
 * Clears search input fields.
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('mobileSearchInput').value = '';
}

/**
 * Enables horizontal scrolling for elements with the 'scroll-row' class using the mouse wheel.
 * @param root - The root element to search within (default is document).
 */
function enableHorizontalWheelScroll(root = document) {
    root.querySelectorAll('.scroll-row').forEach(el => {
        if (el.__wheelAttached) return;
        el.__wheelAttached = true;

        el.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
}

document.getElementById('searchInput').addEventListener('input', handleSearch);
document.getElementById('mobileSearchInput').addEventListener('input', handleSearch);