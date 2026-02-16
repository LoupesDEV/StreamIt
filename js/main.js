/**
 * js/main.js
 * Main application logic for routing, filtering, searching, and initializing the app.
 * @module main
 */

// Import data loading functionality
import { fetchAllData } from './dataLoader.js';

// Import display and rendering functions
import { setupHero, renderHorizontalRow, renderGrid, renderNotifs, openDetails, closeDetails, playCurrentMedia, renderCollections, renderActorsList, closeActorDetails, renderActorsListSearch, refreshActiveSeriesDetails, openActorDetails } from './display.js';

// Import utility functions for video player and UI interactions
import { closeVideo, toggleNotifs, toggleSettings, toggleMobileMenu, toggleMobileSearch, showLoader, hideLoader, hardenPlayerControls, initPlayerPersistence, downloadProgressBackup, openProgressImport, importProgressFromFile } from './utils.js';

// Global application state
let appData = { films: {}, series: {}, collections: {}, notifs: {}, actors: {} };
let currentView = 'home';
const ROUTES = new Set(['home', 'films', 'series', 'actors', 'collections']);
let activeDetailRoute = null;
let activeActorRoute = null;

// Expose functions to global window scope for inline HTML event handlers
window.router = router;
window.toggleNotifs = toggleNotifs;
window.toggleSettings = toggleSettings;
window.closeDetails = closeDetailsAndRoute;
window.playCurrentMedia = playCurrentMedia;
window.closeVideo = closeVideo;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleMobileMenu = toggleMobileMenu;
window.downloadProgressBackup = downloadProgressBackup;
window.openProgressImport = openProgressImport;
window.closeActorDetails = closeActorDetailsAndRoute;
window.openMediaDetails = openMediaDetails;
window.openActorDetailsRoute = openActorDetailsRoute;
window.refreshActiveSeriesDetails = refreshActiveSeriesDetails;

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();

    // Set up video player security and persistence
    hardenPlayerControls();
    initPlayerPersistence();

    // Attach mobile menu and search event listeners
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileSearchBtn').addEventListener('click', toggleMobileSearch);

    // Set up progress import file input handler
    const importInput = document.getElementById('progressImportInput');
    if (importInput) {
        importInput.addEventListener('change', async (event) => {
            // Get the selected file
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            try {
                // Import progress data from file
                const result = await importProgressFromFile(file);
                alert(`Progression importée (${result.filmsCount} films, ${result.seriesCount} séries).`);
                window.location.reload();
            } catch (err) {
                console.error('Import progression échouée', err);
                alert(err.message || "Erreur lors de l'import de la progression.");
            } finally {
                // Reset input and close settings dropdown
                event.target.value = '';
                const settings = document.getElementById('settingsDropdown');
                if (settings) settings.classList.remove('active');
            }
        });
    }

    // Load all application data (films, series, collections, notifications, actors)
    const data = await fetchAllData();
    appData = data;

    // Render notifications badge and populate UI
    renderNotifs(data.notifs);

    // Set up hero section and filters, then navigate to the current URL route
    initHero();
    populateFilters();
    const { view, detail, fromQuery } = parseLocationRoute();
    router(view, { pushState: false, detail });
    if (fromQuery) {
        updateRoute(view, detail, true);
    }

    hideLoader();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    const { view, detail } = parseLocationRoute();
    router(view, { pushState: false, detail });
});

/**
 * Builds a URL-friendly slug from a title string.
 * @param {string} text - Source text.
 * @returns {string} Slug.
 */
function slugify(text) {
    if (!text) return '';
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Determines the base path (useful for deployments in subfolders).
 * @param {string} pathname - Current location pathname.
 * @returns {string} Normalized base path ending with '/'.
 */
function getBasePath(pathname) {
    let path = pathname || '/';
    if (!path.endsWith('/')) {
        const parts = path.split('/');
        const last = parts[parts.length - 1];
        const prev = parts[parts.length - 2];
        if (ROUTES.has(last) || last === 'index.html') {
            parts.pop();
        } else if (ROUTES.has(prev)) {
            parts.pop();
            parts.pop();
        }
        path = parts.join('/') + '/';
    }
    return path === '' ? '/' : path;
}

/**
 * Resolves the view name from the current URL.
 * @returns {string} View name.
 */
function parseLocationRoute() {
    const url = new URL(window.location.href);
    const routeParam = url.searchParams.get('route');
    const rawPath = routeParam || url.pathname || '/';
    const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const basePath = getBasePath(pathname);
    const raw = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
    const parts = raw.split('/').filter(Boolean);
    if (parts.length === 0 || parts[0] === 'index.html') {
        return { view: 'home', detail: null, fromQuery: Boolean(routeParam) };
    }

    const view = ROUTES.has(parts[0]) ? parts[0] : 'home';
    if (view === 'home') {
        return { view: 'home', detail: null, fromQuery: Boolean(routeParam) };
    }

    const slug = parts[1] || '';
    const detail = slug ? { type: view, slug } : null;
    return { view, detail, fromQuery: Boolean(routeParam) };
}

/**
 * Finds a media item by slug within a media collection.
 * @param {string} type - 'films' or 'series'.
 * @param {string} slug - Media slug.
 * @returns {Object|null} Media item or null.
 */
function findMediaBySlug(type, slug) {
    if (!slug) return null;
    const source = type === 'films' ? Object.values(appData.films) : Object.values(appData.series);
    return source.find(item => slugify(item.title) === slug) || null;
}

/**
 * Finds an actor by slug.
 * @param {string} slug - Actor slug.
 * @returns {Object|null} Actor object or null.
 */
function findActorBySlug(slug) {
    if (!slug) return null;
    const actors = Object.values(appData.actors);
    return actors.find(actor => slugify(actor.name) === slug) || null;
}

/**
 * Updates the URL path for the current view and optional detail.
 * @param {string} view - Base view.
 * @param {Object|null} detail - Optional detail route.
 */
function updateRoute(view, detail = null, replace = false) {
    const basePath = getBasePath(window.location.pathname || '/');
    let targetPath = basePath;
    if (view && view !== 'home') {
        targetPath = `${basePath}${view}`;
    }
    if (detail && detail.slug) {
        targetPath = `${targetPath}/${detail.slug}`;
    }
    if (window.location.pathname !== targetPath) {
        if (replace) {
            window.history.replaceState({ view, detail }, '', targetPath);
        } else {
            window.history.pushState({ view, detail }, '', targetPath);
        }
    }
}

/**
 * Opens a media details overlay and syncs the route.
 * @param {Object} item - Media item.
 */
function openMediaDetails(item) {
    if (!item) return;
    const isSerie = item.type === 'serie' || item.seasons !== undefined;
    const view = isSerie ? 'series' : 'films';
    const slug = slugify(item.title);
    activeDetailRoute = { type: view, slug };
    activeActorRoute = null;
    router(view, { detail: { type: view, slug, item }, pushState: true });
}

/**
 * Opens an actor details overlay and syncs the route.
 * @param {Object} actor - Actor item.
 * @param {Object} filmsData - Films data.
 * @param {Object} seriesData - Series data.
 */
function openActorDetailsRoute(actor, filmsData, seriesData) {
    if (!actor) return;
    const slug = slugify(actor.name);
    activeActorRoute = { type: 'actors', slug };
    activeDetailRoute = null;
    router('actors', { detail: { type: 'actors', slug, actor, filmsData, seriesData }, pushState: true });
}

/**
 * Closes media details overlay and restores the base view route.
 */
function closeDetailsAndRoute() {
    closeDetails();
    activeDetailRoute = null;
    updateRoute(currentView, null);
}

/**
 * Closes actor details overlay and restores the base view route.
 */
function closeActorDetailsAndRoute() {
    closeActorDetails();
    activeActorRoute = null;
    updateRoute(currentView, null);
}

/**
 * Sets navigation link colors to default (removes highlight).
 * @param {HTMLElement} navHome - Navigation link for home
 * @param {HTMLElement} navSeries - Navigation link for series
 * @param {HTMLElement} navFilms - Navigation link for films
 * @param {HTMLElement} navCollections - Navigation link for collections
 * @param {HTMLElement} navActors - Navigation link for actors
 */
function textWhite(navHome, navSeries, navFilms, navCollections, navActors) {
    // Remove all active and highlight classes from navigation links
    [navHome, navSeries, navFilms, navCollections, navActors].forEach(el => {
        if (el) el.classList.remove('text-white', 'text-red-500');
    });
}

/**
 * Routes to the specified view and updates the UI accordingly.
 * @param {string} view - The view to route to ('home', 'series', 'films', 'collections', 'actors').
 */
function router(view, options = {}) {
    const { pushState = true } = options;
    const detail = options.detail || null;
    const safeView = ROUTES.has(view) ? view : 'home';
    currentView = safeView;

    // Clear any active search when navigating
    clearSearch();

    // Close mobile menu and search panels
    document.getElementById('mobileMenuPanel').classList.remove('active');
    document.getElementById('mobileSearchPanel').classList.remove('active');

    // Get references to all page sections and navigation elements
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

    // Reset all navigation link styles
    textWhite(navHome, navSeries, navFilms, navCollections, navActors);

    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide all sections initially
    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    actorsContent.classList.add('hidden');
    genericGrid.classList.add('hidden');
    document.getElementById('contentGrid').innerHTML = '';

    // Prepare data collections for current view
    const allFilms = Object.values(appData.films);
    const allSeries = Object.values(appData.series);

    // Render content based on selected view
    if (safeView === 'home') {
        if (navHome) navHome.classList.add('text-white');
        hero.classList.remove('hidden');
        homeContent.classList.remove('hidden');

        // Get latest films and series for home page
        const latestFilms = [...allFilms].sort((a, b) => b.year - a.year).slice(0, 5);
        const latestSeries = [...allSeries].sort((a, b) => b.year - a.year).slice(0, 5);

        renderHorizontalRow('homeFilmsRow', latestFilms);
        renderHorizontalRow('homeSeriesRow', latestSeries);

        // Enable horizontal mouse wheel scrolling for rows
        enableHorizontalWheelScroll();
    }
    else if (safeView === 'series') {
        // Show series view with filters
        if (navSeries) navSeries.classList.add('text-white');
        filters.classList.remove('hidden');
        genericGrid.classList.remove('hidden');
        title.innerText = "Toutes les Séries TV";
        populateFilters();
        applyFilters();
    }
    else if (safeView === 'films') {
        // Show films view with filters
        if (navFilms) navFilms.classList.add('text-white');
        filters.classList.remove('hidden');
        genericGrid.classList.remove('hidden');
        title.innerText = "Tous les Films";
        populateFilters();
        applyFilters();
    }
    else if (safeView === 'collections') {
        // Show collections view
        if (navCollections) navCollections.classList.add('text-white');
        collectionsContent.classList.remove('hidden');
        renderCollections(appData.collections, appData);

        enableHorizontalWheelScroll();
    }
    else if (safeView === 'actors') {
        // Show actors view
        if (navActors) navActors.classList.add('text-white');
        actorsContent.classList.remove('hidden');
        renderActorsList(appData.actors, appData.films, appData.series);
    }

    if (detail && detail.type === 'actors') {
        const actor = detail.actor || findActorBySlug(detail.slug);
        if (actor) {
            openActorDetails(actor, detail.filmsData || appData.films, detail.seriesData || appData.series);
            activeActorRoute = { type: 'actors', slug: detail.slug };
        }
    } else if (detail && (detail.type === 'films' || detail.type === 'series')) {
        const item = detail.item || findMediaBySlug(detail.type, detail.slug);
        if (item) {
            openDetails(item);
            activeDetailRoute = { type: detail.type, slug: detail.slug };
        }
    } else {
        closeDetails();
        closeActorDetails();
        activeDetailRoute = null;
        activeActorRoute = null;
    }

    if (pushState) {
        updateRoute(safeView, detail && detail.slug ? detail : null);
    }
}

/**
 * Initializes the hero section with a featured item or the latest item.
 */
function initHero() {
    const all = [...Object.values(appData.films), ...Object.values(appData.series)];
    if (all.length === 0) return;

    // Try to find a featured item first
    const featuredItem = all.find(item => item.featured === true);

    if (featuredItem) {
        setupHero(featuredItem);
    } else {
        // Fallback to most recent item if no featured item
        all.sort((a, b) => b.year - a.year);
        setupHero(all[0]);
    }
}

/**
 * Populates filter dropdowns based on available data.
 */
function populateFilters() {
    const source = currentView === 'films' ? Object.values(appData.films) : Object.values(appData.series);

    // Extract unique values for filter dropdowns
    const genres = new Set();
    const years = new Set();
    const directors = new Set();

    // Collect all unique genres, years, and directors/creators
    source.forEach(item => {
        item.genres?.forEach(g => genres.add(g));
        if (item.year) years.add(item.year);
        const people = item.directors || item.creators || [];
        people.forEach(p => directors.add(p));
    });

    // Populate genre dropdown with sorted values
    const genreSel = document.getElementById('filterGenre');
    genreSel.innerHTML = '<option value="">Tous les genres</option>';
    Array.from(genres).sort().forEach(g => genreSel.add(new Option(g, g)));

    // Populate year dropdown with sorted values (descending)
    const yearSel = document.getElementById('filterYear');
    yearSel.innerHTML = '<option value="">Toutes</option>';
    Array.from(years).sort((a, b) => b - a).forEach(y => yearSel.add(new Option(y, y)));

    // Populate director/creator dropdown with sorted values
    const directorSel = document.getElementById('filterDirector');
    directorSel.innerHTML = '<option value="">Tous</option>';
    Array.from(directors).sort().forEach(d => directorSel.add(new Option(d, d)));
}

/**
 * Applies selected filters and sorting to the displayed items.
 */
function applyFilters() {
    // Get current filter and sort values
    const genre = document.getElementById('filterGenre').value;
    const year = document.getElementById('filterYear').value;
    const imdb = parseFloat(document.getElementById('filterImdb').value) || 0;
    const director = document.getElementById('filterDirector').value;
    const sortBy = document.getElementById('sortBy').value;

    const source = currentView === 'films' ? Object.values(appData.films) : Object.values(appData.series);

    // Filter items based on selected criteria
    let filtered = source.filter(item => {
        // Check if item matches all selected filters
        const gMatch = !genre || item.genres?.includes(genre);
        const yMatch = !year || item.year == year;
        const iMatch = (item.IMDb || 0) >= imdb;
        const people = item.directors || item.creators || [];
        const dMatch = !director || people.includes(director);
        return gMatch && yMatch && iMatch && dMatch;
    });

    // Sort filtered results based on selected option
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

    // Render the filtered and sorted results
    renderGrid(filtered);
}

/**
 * Resets all filters to default values and reapplies them.
 */
function resetFilters() {
    // Reset all filter dropdowns to default values
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
    // Get search query and normalize to lowercase
    const q = e.target.value.toLowerCase();

    // Sync desktop and mobile search inputs
    if (e.target.id === 'searchInput') document.getElementById('mobileSearchInput').value = q;
    else document.getElementById('searchInput').value = q;

    // Get references to all page sections
    const hero = document.getElementById('heroSection');
    const filters = document.getElementById('filterSection');
    const homeContent = document.getElementById('homePageContent');
    const collectionsContent = document.getElementById('collectionsContent');
    const genericGrid = document.getElementById('genericGridContainer');
    const actorsContent = document.getElementById('actorsContent');

    // If search is empty, restore current view
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

    // Hide all sections to show only search results
    hero.classList.add('hidden');
    filters.classList.add('hidden');
    homeContent.classList.add('hidden');
    collectionsContent.classList.add('hidden');
    actorsContent.classList.add('hidden');
    genericGrid.classList.remove('hidden');

    // Search across all films, series, and actors
    const all = [...Object.values(appData.films), ...Object.values(appData.series)];
    // Filter media and actors by search query
    const resMedia = all.filter(i => i.title.toLowerCase().includes(q));
    const resActors = Object.values(appData.actors).filter(i => i.name.toLowerCase().includes(q));

    // Clear all navigation highlights during search
    const navHome = document.getElementById('nav-home');
    const navSeries = document.getElementById('nav-series');
    const navFilms = document.getElementById('nav-films');
    const navCollections = document.getElementById('nav-collections');
    const navActors = document.getElementById('nav-actors');
    textWhite(navHome, navSeries, navFilms, navCollections, navActors);

    // Update page title with search query and result count
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

    // Render media search results (films and series)
    renderGrid(resMedia);

    // Render actor search results if any found
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
 * @param {Document|HTMLElement} [root=document] - The root element to search within.
 */
function enableHorizontalWheelScroll(root = document) {
    // Find all scrollable rows and attach wheel event listeners
    root.querySelectorAll('.scroll-row').forEach(el => {
        // Skip if already attached to prevent duplicate listeners
        if (el.__wheelAttached) return;
        el.__wheelAttached = true;

        // Convert vertical scroll to horizontal scroll
        el.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
}

// Attach search input handlers for desktop and mobile
document.getElementById('searchInput').addEventListener('input', handleSearch);
document.getElementById('mobileSearchInput').addEventListener('input', handleSearch);