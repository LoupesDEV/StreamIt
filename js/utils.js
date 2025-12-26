const PROGRESS_PREFIX = 'streamit:progress:';
let currentVideoSrc = '';

/**
 * Generates a unique key for storing video progress in localStorage.
 * @param {string} src - The video source URL.
 * @returns {string} The generated storage key.
 */
function progressKey(src) {
    return `${PROGRESS_PREFIX}${src}`;
}

/**
 * Restores video playback progress from localStorage.
 * @param {HTMLVideoElement} player - The video player element.
 * @param {string} src - The video source URL.
 */
function restoreProgress(player, src) {
    const saved = parseFloat(localStorage.getItem(progressKey(src)) || '');
    if (Number.isNaN(saved)) return;

    const applyTime = () => {
        const nearEnd = player.duration && saved >= player.duration - 1;
        if (!nearEnd) player.currentTime = saved;
        player.removeEventListener('loadedmetadata', applyTime);
    };

    if (player.readyState >= 1) applyTime();
    else player.addEventListener('loadedmetadata', applyTime);
}

/**
 * Persists video playback progress to localStorage.
 * @param {HTMLVideoElement} player - The video player element.
 */
function persistProgress(player) {
    if (!currentVideoSrc) return;
    const key = progressKey(currentVideoSrc);
    const t = player.currentTime || 0;
    const nearEnd = player.duration && t >= player.duration - 1;

    if (nearEnd) localStorage.removeItem(key);
    else localStorage.setItem(key, String(t));
}

/**
 * Plays a video in the overlay player.
 * @param {string} src - The video source URL.
 */
export function playVideo(src) {
    const overlay = document.getElementById('videoOverlay');
    const player = document.getElementById('mainPlayer');

    if (!src) {
        alert("Vidéo non disponible pour le moment.");
        return;
    }

    currentVideoSrc = src;
    player.src = src;
    restoreProgress(player, src);

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
    player.pause();
    player.src = "";
    currentVideoSrc = '';
    overlay.classList.add('hidden');
}

/**
 * Toggles the notifications dropdown visibility.
 */
export function toggleNotifs() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('active');
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

    const save = () => persistProgress(player);
    player.addEventListener('timeupdate', save);
    player.addEventListener('pause', save);
    player.addEventListener('ended', () => {
        save();
        currentVideoSrc = '';
    });
}