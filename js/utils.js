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

    // Update video title overlay
    updateVideoTitle(context);

    overlay.classList.remove('hidden');
    setTimeout(() => {
        player.play().catch(e => console.log("Autoplay bloqué par le navigateur", e));
    }, 50);
    
    // Initialize custom controls
    initCustomVideoControls();
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
    
    // Clean up custom controls
    cleanupCustomVideoControls();
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

let controlsTimeout = null;
let isControlsVisible = true;
let isSeeking = false;

/**
 * Updates the video title overlay based on context
 * @param {Object|null} context - Video context {type, title, season, episodeIndex, episodeTitle}
 */
function updateVideoTitle(context) {
    const seriesInfo = document.getElementById('videoSeriesInfo');
    const mainTitle = document.getElementById('videoMainTitle');
    
    if (!context) {
        seriesInfo.textContent = '';
        mainTitle.textContent = '';
        return;
    }
    
    if (context.type === 'series') {
        // Format: S1:E1
        const seasonNum = context.season || '1';
        const episodeNum = (context.episodeIndex !== undefined ? context.episodeIndex + 1 : 1);
        seriesInfo.textContent = `${context.title} • S${seasonNum}:E${episodeNum}`;
        mainTitle.textContent = context.episodeTitle || `Épisode ${episodeNum}`;
    } else {
        // Film
        seriesInfo.textContent = '';
        mainTitle.textContent = context.title || '';
    }
}

/**
 * Formats time in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Shows video controls
 */
function showControls() {
    const overlay = document.getElementById('videoOverlay');
    const playerContainer = document.getElementById('customVideoPlayer');
    
    overlay.classList.remove('controls-hidden');
    playerContainer.classList.remove('hide-cursor');
    isControlsVisible = true;
    
    resetControlsTimeout();
}

/**
 * Hides video controls
 */
function hideControls() {
    const player = document.getElementById('mainPlayer');
    const overlay = document.getElementById('videoOverlay');
    const playerContainer = document.getElementById('customVideoPlayer');
    
    // Don't hide if video is paused
    if (player.paused) return;
    
    overlay.classList.add('controls-hidden');
    playerContainer.classList.add('hide-cursor');
    isControlsVisible = false;
}

/**
 * Resets the auto-hide timeout for controls
 */
function resetControlsTimeout() {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
    }
    
    const player = document.getElementById('mainPlayer');
    
    // Only set timeout if video is playing
    if (!player.paused) {
        controlsTimeout = setTimeout(() => {
            hideControls();
        }, 3000); // Hide after 3 seconds of inactivity
    }
}

/**
 * Initializes all custom video player controls
 */
function initCustomVideoControls() {
    const player = document.getElementById('mainPlayer');
    const overlay = document.getElementById('videoOverlay');
    const playerContainer = document.getElementById('customVideoPlayer');
    
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    const centerPlayBtn = document.getElementById('centerPlayBtn');
    
    playPauseBtn.onclick = togglePlayPause;
    
    // Click on video or center button to play/pause
    player.onclick = togglePlayPause;
    centerPlayBtn.onclick = togglePlayPause;
    
    // Rewind/Forward buttons
    document.getElementById('rewindBtn').onclick = () => {
        player.currentTime = Math.max(0, player.currentTime - 10);
    };
    
    document.getElementById('forwardBtn').onclick = () => {
        player.currentTime = Math.min(player.duration, player.currentTime + 10);
    };
    
    // Volume controls
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    volumeBtn.onclick = toggleMute;
    volumeSlider.oninput = (e) => {
        const volume = e.target.value / 100;
        player.volume = volume;
        updateVolumeIcon(volume);
        updateVolumeSliderBackground(e.target.value);
    };
    
    // Initialize volume
    volumeSlider.value = player.volume * 100;
    updateVolumeSliderBackground(volumeSlider.value);
    
    // Playback speed
    const speedBtn = document.getElementById('speedBtn');
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    let currentSpeedIndex = 3; // 1x
    
    speedBtn.onclick = () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        const speed = speeds[currentSpeedIndex];
        player.playbackRate = speed;
        speedBtn.textContent = speed === 1 ? '1x' : `${speed}x`;
    };
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    fullscreenBtn.onclick = toggleFullscreen;
    
    // Progress bar
    const progressContainer = document.getElementById('progressContainer');
    const playbackProgress = document.getElementById('playbackProgress');
    const progressHandle = document.getElementById('progressHandle');
    const timeTooltip = document.getElementById('timeTooltip');
    
    progressContainer.onclick = seekToPosition;
    progressContainer.onmousemove = showTimeTooltip;
    progressContainer.onmouseleave = () => {
        timeTooltip.style.opacity = '0';
    };
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyboardControls);
    
    // Player events
    player.onplay = () => {
        updatePlayPauseIcon(false);
        centerPlayBtn.classList.remove('show');
        resetControlsTimeout();
    };
    
    player.onpause = () => {
        updatePlayPauseIcon(true);
        centerPlayBtn.classList.add('show');
        showControls();
        if (controlsTimeout) clearTimeout(controlsTimeout);
    };
    
    player.ontimeupdate = updateProgress;
    player.onloadedmetadata = () => {
        document.getElementById('duration').textContent = formatTime(player.duration);
    };
    
    player.onwaiting = () => {
        document.getElementById('videoLoader').classList.add('show');
    };
    
    player.oncanplay = () => {
        document.getElementById('videoLoader').classList.remove('show');
    };
    
    player.onprogress = updateBufferedProgress;
    
    // Mouse movement detection
    playerContainer.onmousemove = () => {
        showControls();
    };
    
    // Touch support for mobile
    playerContainer.ontouchstart = () => {
        if (isControlsVisible) {
            hideControls();
        } else {
            showControls();
        }
    };
    
    // Show controls initially
    showControls();
}

/**
 * Cleans up custom video controls event listeners
 */
function cleanupCustomVideoControls() {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    
    document.removeEventListener('keydown', handleKeyboardControls);
    
    const overlay = document.getElementById('videoOverlay');
    overlay.classList.remove('controls-hidden');
}

/**
 * Toggles play/pause state
 */
function togglePlayPause() {
    const player = document.getElementById('mainPlayer');
    
    if (player.paused) {
        player.play().catch(e => console.log('Play error:', e));
    } else {
        player.pause();
    }
}

/**
 * Updates play/pause button icon
 * @param {boolean} isPaused - Whether video is paused
 */
function updatePlayPauseIcon(isPaused) {
    const icon = document.querySelector('#playPauseBtn i');
    const centerIcon = document.querySelector('#centerPlayBtn i');
    
    if (isPaused) {
        icon.className = 'fas fa-play text-3xl';
        if (centerIcon) centerIcon.className = 'fas fa-play text-white text-3xl ml-1';
    } else {
        icon.className = 'fas fa-pause text-3xl';
        if (centerIcon) centerIcon.className = 'fas fa-pause text-white text-3xl';
    }
}

/**
 * Toggles mute state
 */
function toggleMute() {
    const player = document.getElementById('mainPlayer');
    const volumeSlider = document.getElementById('volumeSlider');
    
    player.muted = !player.muted;
    
    if (player.muted) {
        updateVolumeIcon(0);
        volumeSlider.value = 0;
    } else {
        updateVolumeIcon(player.volume);
        volumeSlider.value = player.volume * 100;
    }
    
    updateVolumeSliderBackground(volumeSlider.value);
}

/**
 * Updates volume icon based on volume level
 * @param {number} volume - Volume level (0-1)
 */
function updateVolumeIcon(volume) {
    const icon = document.querySelector('#volumeBtn i');
    
    if (volume === 0) {
        icon.className = 'fas fa-volume-mute text-xl';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-down text-xl';
    } else {
        icon.className = 'fas fa-volume-up text-xl';
    }
}

/**
 * Updates volume slider background gradient
 * @param {number} value - Slider value (0-100)
 */
function updateVolumeSliderBackground(value) {
    const slider = document.getElementById('volumeSlider');
    slider.style.setProperty('--volume-percentage', `${value}%`);
}

/**
 * Toggles fullscreen mode
 */
function toggleFullscreen() {
    const overlay = document.getElementById('videoOverlay');
    const icon = document.querySelector('#fullscreenBtn i');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        // Enter fullscreen
        if (overlay.requestFullscreen) {
            overlay.requestFullscreen();
        } else if (overlay.webkitRequestFullscreen) {
            overlay.webkitRequestFullscreen();
        } else if (overlay.mozRequestFullScreen) {
            overlay.mozRequestFullScreen();
        }
        icon.className = 'fas fa-compress text-xl';
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        icon.className = 'fas fa-expand text-xl';
    }
}

/**
 * Updates progress bar and time display
 */
function updateProgress() {
    const player = document.getElementById('mainPlayer');
    const playbackProgress = document.getElementById('playbackProgress');
    const progressHandle = document.getElementById('progressHandle');
    const currentTimeEl = document.getElementById('currentTime');
    
    if (!player.duration) return;
    
    const percentage = (player.currentTime / player.duration) * 100;
    playbackProgress.style.width = `${percentage}%`;
    progressHandle.style.left = `${percentage}%`;
    
    currentTimeEl.textContent = formatTime(player.currentTime);
}

/**
 * Updates buffered progress bar
 */
function updateBufferedProgress() {
    const player = document.getElementById('mainPlayer');
    const bufferedProgress = document.getElementById('bufferedProgress');
    
    if (player.buffered.length > 0 && player.duration) {
        const bufferedEnd = player.buffered.end(player.buffered.length - 1);
        const percentage = (bufferedEnd / player.duration) * 100;
        bufferedProgress.style.width = `${percentage}%`;
    }
}

/**
 * Seeks to clicked position on progress bar
 * @param {MouseEvent} e - Click event
 */
function seekToPosition(e) {
    const player = document.getElementById('mainPlayer');
    const progressContainer = document.getElementById('progressContainer');
    
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * player.duration;
    
    player.currentTime = newTime;
}

/**
 * Shows time tooltip on progress bar hover
 * @param {MouseEvent} e - Mouse event
 */
function showTimeTooltip(e) {
    const player = document.getElementById('mainPlayer');
    const progressContainer = document.getElementById('progressContainer');
    const timeTooltip = document.getElementById('timeTooltip');
    
    if (!player.duration) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = hoverX / rect.width;
    const hoverTime = percentage * player.duration;
    
    timeTooltip.textContent = formatTime(hoverTime);
    timeTooltip.style.left = `${hoverX}px`;
    timeTooltip.style.opacity = '1';
}

/**
 * Handles keyboard controls
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardControls(e) {
    const overlay = document.getElementById('videoOverlay');
    
    // Only handle if video overlay is visible
    if (overlay.classList.contains('hidden')) return;
    
    const player = document.getElementById('mainPlayer');
    
    switch(e.key) {
        case ' ':
        case 'k':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            player.currentTime = Math.max(0, player.currentTime - 5);
            showControls();
            break;
        case 'ArrowRight':
            e.preventDefault();
            player.currentTime = Math.min(player.duration, player.currentTime + 5);
            showControls();
            break;
        case 'ArrowUp':
            e.preventDefault();
            player.volume = Math.min(1, player.volume + 0.1);
            document.getElementById('volumeSlider').value = player.volume * 100;
            updateVolumeIcon(player.volume);
            updateVolumeSliderBackground(player.volume * 100);
            showControls();
            break;
        case 'ArrowDown':
            e.preventDefault();
            player.volume = Math.max(0, player.volume - 0.1);
            document.getElementById('volumeSlider').value = player.volume * 100;
            updateVolumeIcon(player.volume);
            updateVolumeSliderBackground(player.volume * 100);
            showControls();
            break;
        case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'm':
            e.preventDefault();
            toggleMute();
            showControls();
            break;
        case 'Escape':
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
                e.preventDefault();
                toggleFullscreen();
            }
            break;
    }
}