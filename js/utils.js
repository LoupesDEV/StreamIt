/**
 * js/utils.js
 * Utility functions for video playback, UI toggles, loader management, and video player enhancements.
 * @module utils
 */

const PROGRESS_PREFIX = 'streamit:progress:';
const WATCHED_KEY = 'watchedContent';
let currentVideoSrc = '';
let currentVideoContext = null;

// Helpers for watched content storage (films & séries)
export function getWatchedContent() {
    try {
        return JSON.parse(localStorage.getItem(WATCHED_KEY) || '{"films":{},"series":{}}');
    } catch (e) {
        console.warn('Reset watchedContent (parse error)', e);
        return { films: {}, series: {} };
    }
}

function setWatchedContent(data) {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(data));
}

function sanitizeProgressData(raw) {
    const safeFilms = raw && typeof raw.films === 'object' && !Array.isArray(raw.films) ? raw.films : {};
    const safeSeries = raw && typeof raw.series === 'object' && !Array.isArray(raw.series) ? raw.series : {};
    return { films: safeFilms, series: safeSeries };
}

function normalizeSeason(season) {
    if (season === undefined || season === null || season === '') return '1';
    const cleaned = String(season).trim();
    return cleaned === '' ? '1' : cleaned;
}

function normalizeEpisodeIndex(epIndex) {
    return Number.isInteger(epIndex) && epIndex >= 0 ? epIndex : 0;
}

function markFilmWatched(title, watched = true, time = 0) {
    if (!title) return;
    const data = getWatchedContent();
    if (!data.films[title]) data.films[title] = {};
    data.films[title].watched = watched;
    data.films[title].time = Math.max(0, Math.floor(time));
    setWatchedContent(data);
}

function markEpisodeWatched(seriesTitle, season, epIndex, watched = true, time = 0) {
    if (!seriesTitle) return;
    const safeSeason = normalizeSeason(season);
    const safeIdx = normalizeEpisodeIndex(epIndex);
    const data = getWatchedContent();
    if (!data.series[seriesTitle]) data.series[seriesTitle] = {};
    if (!data.series[seriesTitle][safeSeason]) data.series[seriesTitle][safeSeason] = {};
    data.series[seriesTitle][safeSeason][safeIdx] = { watched, time: Math.max(0, Math.floor(time)) };
    setWatchedContent(data);
}

export function getFilmWatchData(title) {
    if (!title) return { watched: false, time: 0 };
    const data = getWatchedContent();
    return data.films[title] || { watched: false, time: 0 };
}

export function getEpisodeWatchData(seriesTitle, season, epIndex) {
    if (!seriesTitle) return { watched: false, time: 0 };
    const safeSeason = normalizeSeason(season);
    const safeIdx = normalizeEpisodeIndex(epIndex);
    const data = getWatchedContent();
    return (data.series[seriesTitle] && data.series[seriesTitle][safeSeason] && data.series[seriesTitle][safeSeason][safeIdx])
        || { watched: false, time: 0 };
}

export function isSeriesFullyWatched(series) {
    if (!series?.seasons) return false;
    const seasons = series.seasons;
    for (const sKey of Object.keys(seasons)) {
        const episodes = seasons[sKey] || [];
        for (let i = 0; i < episodes.length; i++) {
            const watch = getEpisodeWatchData(series.title, sKey, i);
            if (!watch.watched) return false;
        }
    }
    return true;
}

/**
 * Generates a unique key for storing video progress in localStorage.
 * @param {string} src - The video source URL.
 * @returns {string} The generated storage key.
 */
function progressKey(src) {
    return `${PROGRESS_PREFIX}${src}`;
}

/**
 * Applies a saved start time (resume) when metadata is available.
 * @param {HTMLVideoElement} player - The video player element.
 * @param {number} startTime - Time in seconds to seek to.
 */
function applyStartTime(player, startTime) {
    if (!Number.isFinite(startTime) || startTime <= 0) return;

    const applyTime = () => {
        const nearEnd = player.duration && startTime >= player.duration - 1;
        if (!nearEnd) player.currentTime = startTime;
        player.removeEventListener('loadedmetadata', applyTime);
    };

    if (player.readyState >= 1) applyTime();
    else player.addEventListener('loadedmetadata', applyTime);
}

function getResumeTime(src, context) {
    if (context?.type === 'film' && context.title) {
        return getFilmWatchData(context.title).time || 0;
    }
    if (context?.type === 'series' && context.title) {
        return getEpisodeWatchData(context.title, context.season, context.episodeIndex).time || 0;
    }

    const saved = parseFloat(localStorage.getItem(progressKey(src)) || '');
    return Number.isNaN(saved) ? 0 : saved;
}

/**
 * Persists video playback progress to localStorage (fallback when no context is provided).
 * @param {HTMLVideoElement} player - The video player element.
 */
function persistGenericProgress(player) {
    if (!currentVideoSrc) return;
    const key = progressKey(currentVideoSrc);
    const t = player.currentTime || 0;
    const nearEnd = player.duration && t >= player.duration - 1;

    if (nearEnd) localStorage.removeItem(key);
    else localStorage.setItem(key, String(t));
}

function saveWatchProgress(player, isEnded = false) {
    if (!player) return;

    if (!currentVideoContext) {
        persistGenericProgress(player);
        return;
    }

    const { type, title } = currentVideoContext;
    const season = currentVideoContext.season;
    const epIndex = currentVideoContext.episodeIndex;
    const duration = player.duration || 0;
    const current = player.currentTime || 0;
    const hasDuration = Number.isFinite(duration) && duration > 1;
    const nearEnd = hasDuration && current >= 0 && (duration - current) <= Math.max(180, duration * 0.05);
    const watched = isEnded || nearEnd;
    const timeToSave = watched ? 0 : current;

    if (type === 'film' && title) {
        markFilmWatched(title, watched, timeToSave);
    } else if (type === 'series' && title) {
        markEpisodeWatched(title, season, epIndex, watched, timeToSave);
    }

    if (watched) {
        currentVideoSrc = '';
        currentVideoContext = null;
    }
}

/**
 * Plays a video in the overlay player with optional watch context.
 * @param {string} src - The video source URL.
 * @param {Object|null} context - Optional playback context {type, title, season, episodeIndex}.
 */
export function playVideo(src, context = null) {
    const overlay = document.getElementById('videoOverlay');
    const player = document.getElementById('mainPlayer');

    if (!src) {
        alert("Vidéo non disponible pour le moment.");
        return;
    }

    currentVideoSrc = src;
    currentVideoContext = context ? { ...context, season: normalizeSeason(context.season) } : null;
    player.src = src;
    const startTime = getResumeTime(src, currentVideoContext);
    applyStartTime(player, startTime);

    overlay.classList.remove('hidden');
    setTimeout(() => {
        player.play().catch(e => console.log("Autoplay bloqué par le navigateur", e));
    }, 50);
}

/**
 * Closes the video overlay and stops playback.
 */
export function closeVideo() {
    const overlay = document.getElementById('videoOverlay');
    const player = document.getElementById('mainPlayer');
    saveWatchProgress(player);
    player.pause();
    player.src = "";
    currentVideoSrc = '';
    currentVideoContext = null;
    overlay.classList.add('hidden');
}

/**
 * Toggles the notifications dropdown visibility.
 */
export function toggleNotifs() {
    const dropdown = document.getElementById('notifDropdown');
    const settings = document.getElementById('settingsDropdown');
    if (settings) settings.classList.remove('active');
    dropdown.classList.toggle('active');
}

export function toggleSettings() {
    const dropdown = document.getElementById('settingsDropdown');
    const notifs = document.getElementById('notifDropdown');
    if (notifs) notifs.classList.remove('active');
    dropdown.classList.toggle('active');
}

export function downloadProgressBackup() {
    const data = sanitizeProgressData(getWatchedContent());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `streamit-progression-${stamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export function openProgressImport() {
    const input = document.getElementById('progressImportInput');
    if (input) {
        input.value = '';
        input.click();
    }
}

export async function importProgressFromFile(file) {
    if (!file) throw new Error('Aucun fichier sélectionné');

    const text = await file.text();
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (err) {
        throw new Error('Fichier JSON invalide.');
    }

    const sanitized = sanitizeProgressData(parsed);
    setWatchedContent(sanitized);

    const filmsCount = Object.keys(sanitized.films || {}).length;
    const seriesCount = Object.keys(sanitized.series || {}).length;
    return { filmsCount, seriesCount };
}

/**
 * Toggles the mobile menu visibility.
 */
export function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenuPanel');
    const search = document.getElementById('mobileSearchPanel');

    if (search.classList.contains('active')) {
        search.classList.remove('active');
    }

    menu.classList.toggle('active');
}

/**
 * Toggles the mobile search panel visibility.
 */
export function toggleMobileSearch() {
    const search = document.getElementById('mobileSearchPanel');
    const menu = document.getElementById('mobileMenuPanel');

    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    }

    search.classList.toggle('active');

    if (search.classList.contains('active')) {
        document.getElementById('mobileSearchInput').focus();
    }
}

/**
 * Shows the loading spinner.
 */
export function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('loader').style.opacity = '1';
}

/**
 * Hides the loading spinner with a fade-out effect.
 */
export function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.classList.add('hidden'), 700);
}

/**
 * Enhances video player controls to prevent downloading and remote playback.
 */
export function hardenPlayerControls() {
    const player = document.getElementById('mainPlayer');
    if (!player) return;

    player.setAttribute('controlsList', 'nodownload noremoteplayback');
    player.setAttribute('disablepictureinpicture', '');
    player.setAttribute('playsinline', '');
    player.addEventListener('contextmenu', (e) => e.preventDefault());
}

/**
 * Initializes video player progress persistence.
 */
export function initPlayerPersistence() {
    const player = document.getElementById('mainPlayer');
    if (!player) return;

    const save = () => saveWatchProgress(player, false);
    player.addEventListener('timeupdate', save);
    player.addEventListener('pause', save);
    player.addEventListener('ended', () => {
        saveWatchProgress(player, true);
        currentVideoSrc = '';
        currentVideoContext = null;
    });
}