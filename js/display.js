/**
 * js/display.js
 * Handles the display and rendering of media items, hero section, details overlay, collections, and notifications.
 * @module display
 */

// Import utility functions for video playback and watch data
import { playVideo, getFilmWatchData, getEpisodeWatchData, isSeriesFullyWatched } from './utils.js';

// Global state variables for managing active media details and video context
let activeDetailItem = null;
let activeVideoSrc = "";
let activeVideoContext = null;
let activeSelectedSeason = null; // Track the currently selected season

/**
 * Sets up the hero section with the given media item.
 * @param {Object} item - The media item to display in the hero section.
 */
export function setupHero(item) {
    if (!item) return;

    // Determine if the item is a series or film
    const isSerie = item.type === 'serie' || item.seasons !== undefined;

    // Populate hero section elements with media data
    document.getElementById('heroImage').src = item.banner || item.poster;
    document.getElementById('heroTitle').innerText = item.title;
    document.getElementById('heroDesc').innerText = item.description;
    document.getElementById('heroRating').innerText = item.IMDb;
    document.getElementById('heroYear').innerText = item.year;
    document.getElementById('heroType').innerText = isSerie ? 'Série' : 'Film';

    // Set duration text (seasons count for series, duration for films)
    let durationText = item.duration || "2h 15min";
    if (isSerie && item.seasons) {
        const nbSeasons = Object.keys(item.seasons).length;
        durationText = nbSeasons + (nbSeasons > 1 ? " Saisons" : " Saison");
    }
    document.getElementById('heroDuration').innerText = durationText;
    document.getElementById('heroGenre').innerText = item.genres?.[0] || "";

    // Replace play button to clear previous event listeners
    const heroBtn = document.getElementById('heroPlayBtn');
    const newBtn = heroBtn.cloneNode(true);
    heroBtn.parentNode.replaceChild(newBtn, heroBtn);

    // Set up play button click handler based on media type
    newBtn.onclick = () => {
        openDetails(item);
        if (isSerie && item.seasons?.["1"]?.[0]) {
            const ctx = {
                type: 'series',
                title: item.title,
                season: '1',
                episodeIndex: 0,
                episodeTitle: item.seasons["1"][0].title || 'Épisode 1'
            };
            activeVideoContext = ctx;
            activeVideoSrc = item.seasons["1"][0].video;
            playVideo(activeVideoSrc, ctx);
        } else if (item.video) {
            const ctx = { type: 'film', title: item.title };
            activeVideoContext = ctx;
            activeVideoSrc = item.video;
            playVideo(item.video, ctx);
        }
    };

    // Set up info button to open details overlay
    const infoBtn = document.getElementById('heroInfoBtn');
    if (infoBtn) {
        const newInfoBtn = infoBtn.cloneNode(true);
        infoBtn.parentNode.replaceChild(newInfoBtn, infoBtn);
        newInfoBtn.onclick = () => openDetails(item);
    }
}

/**
 * Opens the details overlay for a given media item.
 * @param {Object} item - The media item to display details for.
 * @param {string|null} [preferredSeason=null] - Optional season to pre-select.
 */
export function openDetails(item, preferredSeason = null) {
    activeDetailItem = item;
    const overlay = document.getElementById('detailsOverlay');
    const isSerie = item.type === 'serie' || item.seasons !== undefined;
    const playBtn = document.getElementById('detailPlayBtn');

    // Populate detail overlay with media information
    document.getElementById('detailHeroImg').src = item.banner || item.poster;
    document.getElementById('detailTitle').innerText = item.title;
    document.getElementById('detailDesc').innerText = item.description;
    document.getElementById('detailYear').innerText = item.year;

    // Calculate and display match score based on IMDb rating
    const matchScore = item.IMDb ? Math.round(item.IMDb * 10) : 90;
    document.getElementById('detailMatch').innerText = `Recommandé à ${matchScore}%`;

    let durationText = item.duration || "2h 15min";
    if (isSerie && item.seasons) {
        const nbSeasons = Object.keys(item.seasons).length;
        durationText = nbSeasons + (nbSeasons > 1 ? " Saisons" : " Saison");
    }
    document.getElementById('detailDuration').innerText = durationText;

    // Generate genre pills and cast badges
    document.getElementById('detailGenrePills').innerHTML = item.genres?.map(g => `<span class="text-gray-300 text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">${g}</span>`).join('') || "";
    document.getElementById('detailCast').innerHTML = item.stars?.map(s => `<span class="bg-red-600/10 text-red-300 px-4 py-2 rounded-full text-sm font-bold">${s}</span>`).join('') || "Non renseigné";
    document.getElementById('detailCreators').innerText = (item.directors || item.creators || []).join(", ") || "Non renseigné";

    // Handle series-specific elements (seasons and episodes)
    const seriesSec = document.getElementById('seriesSection');
    const seasonSelect = document.getElementById('seasonSelect');

    if (isSerie) {
        seriesSec.classList.remove('hidden');
        activeVideoSrc = "";
        activeVideoContext = null;

        // Populate season selector dropdown
        seasonSelect.innerHTML = '';
        const seasons = item.seasons || {};
        const seasonKeys = Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b));

        if (seasonKeys.length > 0) {
            seasonKeys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.innerText = `Saison ${key}`;
                seasonSelect.appendChild(opt);
            });
            
            // Determine which season to display
            let initialSeason = seasonKeys[0];
            if (preferredSeason && seasonKeys.includes(String(preferredSeason))) {
                initialSeason = String(preferredSeason);
            } else if (activeSelectedSeason && seasonKeys.includes(String(activeSelectedSeason))) {
                initialSeason = String(activeSelectedSeason);
            }
            
            // Set the select value and render episodes
            seasonSelect.value = initialSeason;
            activeSelectedSeason = initialSeason;
            renderEpisodes(seasons[initialSeason], initialSeason);

            // Handle season selection changes
            seasonSelect.onchange = (e) => {
                const rawValue = e.target && typeof e.target.value === 'string' ? e.target.value : null;
                const selectedKey = rawValue && Object.prototype.hasOwnProperty.call(seasons, rawValue)
                    ? rawValue
                    : null;
                const selectedSeason = selectedKey ? seasons[selectedKey] : null;
                if (selectedSeason) {
                    const safeSeasonId = String(selectedKey);
                    activeSelectedSeason = safeSeasonId; // Save the selected season
                    renderEpisodes(selectedSeason, safeSeasonId);
                }
            };
        } else {
            const opt = document.createElement('option');
            opt.innerText = "Saison 1";
            seasonSelect.appendChild(opt);
            renderEpisodes([], 1);
        }
    } else {
        seriesSec.classList.add('hidden');
        activeVideoSrc = item.video;
        activeVideoContext = item.video ? { type: 'film', title: item.title } : null;
    }

    // Update play button state based on video availability
    if (playBtn) {
        const hasVideo = activeVideoSrc && activeVideoSrc.trim() !== '';
        playBtn.disabled = !hasVideo;
        if (hasVideo) {
            playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            playBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    // Show overlay and prevent background scrolling
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the details overlay.
 */
export function closeDetails() {
    document.getElementById('detailsOverlay').classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Refreshes the details overlay for the active series.
 * This is useful after watching an episode to update the watched status.
 */
export function refreshActiveSeriesDetails() {
    if (activeDetailItem && (activeDetailItem.type === 'serie' || activeDetailItem.seasons !== undefined)) {
        openDetails(activeDetailItem, activeSelectedSeason);
    }
}

/**
 * Plays the currently selected media in the details overlay.
 */
export function playCurrentMedia() {
    if (!activeVideoSrc && activeDetailItem && activeDetailItem.seasons) {
        // Fallback: select first episode if none chosen yet
        const firstSeasonKey = Object.keys(activeDetailItem.seasons || {})[0];
        const firstEpisode = firstSeasonKey ? activeDetailItem.seasons[firstSeasonKey]?.[0] : null;
        if (firstEpisode) {
            activeVideoSrc = firstEpisode.video;
            activeVideoContext = {
                type: 'series',
                title: activeDetailItem.title,
                season: firstSeasonKey,
                episodeIndex: 0,
                episodeTitle: firstEpisode.title || 'Épisode 1'
            };
        }
    }

    // Play video if available, otherwise show alert
    if (activeVideoSrc) {
        playVideo(activeVideoSrc, activeVideoContext);
    } else {
        alert("Vidéo non disponible");
    }
}

/**
 * Renders the list of episodes for a given season.
 * @param {Array} episodes - The list of episodes to render.
 * @param {number|string} seasonNum - The season number.
 */
function renderEpisodes(episodes, seasonNum) {
    const list = document.getElementById('episodesList');
    list.innerHTML = '';

    // Use default placeholder episodes if none provided
    if (!episodes || episodes.length === 0) {
        episodes = [
            { title: "Épisode 1", desc: "Description indisponible.", duration: "45m", video: "" },
            { title: "Épisode 2", desc: "Description indisponible.", duration: "42m", video: "" }
        ];
    }

    // Sanitize season number to ensure it's a valid string
    const safeSeasonNum = typeof seasonNum === 'string'
        ? seasonNum.replace(/[^0-9]/g, '') || '1'
        : String(Number.isFinite(seasonNum) ? seasonNum : 1);

    // Update the active selected season
    activeSelectedSeason = safeSeasonNum;

    // Set first episode as default video source
    if (episodes.length > 0) {
        activeVideoSrc = episodes[0].video;
        activeVideoContext = {
            type: 'series',
            title: activeDetailItem?.title || '',
            season: safeSeasonNum,
            episodeIndex: 0,
            episodeTitle: episodes[0].title || 'Épisode 1',
        };
    }

    const playBtn = document.getElementById('detailPlayBtn');
    if (playBtn) {
        const hasVideo = activeVideoSrc && activeVideoSrc.trim() !== '';
        playBtn.disabled = !hasVideo;
        if (hasVideo) {
            playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            playBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    // Render each episode as a card with watch status
    episodes.forEach((ep, idx) => {
        const watchData = getEpisodeWatchData(activeDetailItem?.title, safeSeasonNum, idx);
        const isWatched = watchData.watched;
        const hasProgress = !isWatched && watchData.time > 0;

        // Create episode card container
        const row = document.createElement('div');
        row.className = "episode-item flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 hover:bg-white/[0.02] group bg-[#0a0a0a]";
        if (isWatched) row.classList.add('episode-watched');

        const fallbackThumb = `https://placehold.co/300x200/333/666?text=S${safeSeasonNum}-EP${idx + 1}`;
        const thumbUrl = activeDetailItem ? activeDetailItem.poster : fallbackThumb;

        // Create left container with episode number and thumbnail
        const leftContainer = document.createElement('div');
        leftContainer.className = "flex items-center gap-6 w-full md:w-auto";

        const indexSpan = document.createElement('span');
        indexSpan.className = "text-2xl font-black text-gray-600 group-hover:text-red-500 transition-colors w-8 text-center";
        indexSpan.textContent = String(idx + 1);
        leftContainer.appendChild(indexSpan);

        const thumbContainer = document.createElement('div');
        thumbContainer.className = "relative w-40 h-24 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden shadow-lg";

        const img = document.createElement('img');
        img.src = thumbUrl;
        img.className = "w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110";
        img.onerror = function () {
            this.src = fallbackThumb;
        };
        img.alt = `Thumbnail for ${ep.title}`;
        thumbContainer.appendChild(img);

        // Add play icon overlay on hover
        const overlay = document.createElement('div');
        overlay.className = "absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors";

        const playIcon = document.createElement('i');
        playIcon.className = "fas fa-play text-white text-xl opacity-0 group-hover:opacity-100 transition-all";
        overlay.appendChild(playIcon);

        thumbContainer.appendChild(overlay);
        leftContainer.appendChild(thumbContainer);

        // Create right container with episode title, duration, and description
        const rightContainer = document.createElement('div');
        rightContainer.className = "flex-1 w-full text-center md:text-left overflow-hidden";

        const titleRow = document.createElement('div');
        titleRow.className = "flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2";

        const titleEl = document.createElement('h4');
        titleEl.className = "font-bold text-white text-xl truncate group-hover:text-red-400 transition-colors";
        titleEl.textContent = ep.title;

        const durationEl = document.createElement('span');
        durationEl.className = "text-sm font-bold text-gray-400 bg-black/30 px-2 py-1 rounded-md";
        durationEl.textContent = ep.duration || '45m';

        const metaRow = document.createElement('div');
        metaRow.className = "flex items-center gap-2 flex-wrap justify-center md:justify-end";
        metaRow.appendChild(durationEl);

        // Add watched or resume badges based on watch status
        if (isWatched) {
            const watchedBadge = document.createElement('span');
            watchedBadge.className = "watched-pill";
            watchedBadge.innerHTML = '<i class="fas fa-eye text-xs"></i> Vu';
            metaRow.appendChild(watchedBadge);
        } else if (hasProgress) {
            const resumeBadge = document.createElement('span');
            resumeBadge.className = "resume-pill";
            resumeBadge.textContent = "Reprendre";
            metaRow.appendChild(resumeBadge);
        }

        titleRow.appendChild(titleEl);
        titleRow.appendChild(metaRow);

        const descEl = document.createElement('p');
        descEl.className = "text-gray-400 text-sm leading-relaxed line-clamp-2";
        descEl.textContent = ep.desc || "...";

        rightContainer.appendChild(titleRow);
        rightContainer.appendChild(descEl);

        row.appendChild(leftContainer);
        row.appendChild(rightContainer);

        // Set up click handler to play the episode
        row.onclick = (e) => {
            e.stopPropagation();
            const ctx = {
                type: 'series',
                title: activeDetailItem?.title || '',
                season: safeSeasonNum,
                episodeIndex: idx,
                episodeTitle: ep.title || `Épisode ${idx + 1}`,
            };
            activeVideoSrc = ep.video;
            activeVideoContext = ctx;
            playVideo(ep.video, ctx);
        };
        list.appendChild(row);
    });
}

/**
 * Creates a media card element for a given media item.
 * @param {Object} item - The media item to create a card for.
 * @param {string} [extraClasses=""] - Additional CSS classes to apply to the card.
 * @returns {HTMLElement} The created media card element.
 */
export function createMediaCard(item, extraClasses = "") {
    const card = document.createElement('div');
    card.className = `media-card group relative rounded-xl overflow-hidden cursor-pointer bg-[#1a1a1a] shadow-lg transition-all duration-300 ${extraClasses}`;

    const fallback = `https://placehold.co/400x600/1a1a1a/e50914?text=${encodeURIComponent(item.title)}`;

    const isSerie = item.type === 'serie' || item.seasons !== undefined;
    const filmWatch = !isSerie ? getFilmWatchData(item.title) : null;

    // Determine watch status (watched/resume) for badge display
    let watched = false;
    let hasResume = false;

    // Check watch status for series (fully watched or has progress)
    if (isSerie) {
        watched = isSeriesFullyWatched(item);
        if (!watched && item.seasons) {
            const seasonKeys = Object.keys(item.seasons).sort((a, b) => parseInt(a) - parseInt(b));
            for (const sKey of seasonKeys) {
                const episodes = item.seasons[sKey] || [];
                for (let i = 0; i < episodes.length; i++) {
                    const w = getEpisodeWatchData(item.title, sKey, i);
                    if (w.time > 0 && !w.watched) {
                        hasResume = true;
                        break;
                    }
                }
                if (hasResume) break;
            }
        }
    } else {
        watched = filmWatch?.watched || false;
        hasResume = !watched && filmWatch && (filmWatch.time || 0) > 0;
    }

    // Generate status badges HTML (watched/resume)
    const watchedBadge = watched ? '<span class="watched-pill"><i class="fas fa-eye text-xs"></i> Vu</span>' : '';
    const resumeBadge = !watched && hasResume ? '<span class="resume-pill">Reprendre</span>' : '';
    const badgeStack = watchedBadge || resumeBadge ? `<div class="status-badges">${watchedBadge}${resumeBadge}</div>` : '';

    // Build media card HTML structure
    card.innerHTML = `
        ${badgeStack}
        <img src="${item.poster}" alt="Poster for ${item.title}" onerror="this.src='${fallback}'" class="w-full h-full object-cover object-center transition-transform duration-700 loading='lazy'">
        <div class="absolute inset-x-0 bottom-0 p-4 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 class="font-bold text-white text-base md:text-lg leading-tight mb-1 drop-shadow-md line-clamp-1">${item.title}</h3>
            <div class="flex items-center gap-3 text-xs font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                <span class="text-green-400"><i class="fas fa-star text-[10px]"></i> ${item.IMDb}</span>
                <span>${item.year}</span>
            </div>
        </div>
    `;
    card.onclick = () => openDetails(item);
    return card;
}

/**
 * Renders a grid of media items.
 * @param {Array} items - The list of media items to render.
 */
export function renderGrid(items) {
    const grid = document.getElementById('contentGrid');
    grid.innerHTML = '';
    items.forEach(item => grid.appendChild(createMediaCard(item, "aspect-[2/3]")));
}

/**
 * Renders a horizontal row of media items.
 * @param {string} containerId - The ID of the container element.
 * @param {Array} items - The list of media items to render.
 */
export function renderHorizontalRow(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.classList.add("scroll-row");
    if (items.length === 0) return;
    items.forEach(item => {
        const card = createMediaCard(item, "min-w-[200px] md:min-w-[280px] aspect-[2/3] snap-start");
        container.appendChild(card);
    });
}

/**
 * Renders collections of media items.
 * @param {Object} collectionsData - The collections data.
 * @param {Object} appData - The application data containing films and series.
 */
export function renderCollections(collectionsData, appData) {
    const container = document.getElementById('collectionsContent');
    container.innerHTML = '';

    if (Object.keys(collectionsData).length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-10">Aucune collection disponible.</div>';
        return;
    }

    // Sort collections alphabetically by name
    const sortedCollections = Object.entries(collectionsData).sort(([, a], [, b]) => {
        return a.name.localeCompare(b.name);
    });

    for (const [key, collection] of sortedCollections) {
        const items = [];

        // Aggregate films from collection
        if (collection.films && Array.isArray(collection.films)) {
            collection.films.forEach(title => {
                const foundFilm = Object.values(appData.films).find(f => f.title === title);
                if (foundFilm) items.push(foundFilm);
            });
        }

        // Aggregate series from collection
        if (collection.series && Array.isArray(collection.series)) {
            collection.series.forEach(title => {
                const foundSerie = Object.values(appData.series).find(s => s.title === title);
                if (foundSerie) items.push(foundSerie);
            });
        }

        // Render collection section if it has items
        if (items.length > 0) {
            items.sort((a, b) => a.year - b.year);

            const section = document.createElement('section');
            section.className = "animate-fade-in-up";

            const titleHTML = `
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span class="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_15px_#dc2626]"></span>
                    <span class="tracking-tight">${collection.name}</span>
                </h2>
            `;
            section.innerHTML = titleHTML;

            const rowDiv = document.createElement('div');
            rowDiv.className = "scroll-row flex gap-6 overflow-x-auto pb-8 hide-scrollbar scroll-smooth snap-x pl-1";

            items.forEach(item => {
                const card = createMediaCard(item, "min-w-[200px] md:min-w-[280px] aspect-[2/3] snap-start");
                rowDiv.appendChild(card);
            });

            section.appendChild(rowDiv);
            container.appendChild(section);
        }
    }
}

/**
 * Renders the list of notifications.
 * @param {Array} list - The list of notifications to render.
 */
export function renderNotifs(list) {
    const container = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');

    // Show notification badge if there are notifications
    if (list.length > 0) badge.classList.remove('hidden');

    container.innerHTML = list.map(n => `
        <div class="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-red-500 text-xs uppercase tracking-wide">${n.title}</span>
                <span class="text-[10px] text-gray-500">${n.time}</span>
            </div>
            <p class="text-sm text-gray-300 group-hover:text-white transition-colors">${n.message}</p>
        </div>
    `).join('');

    if (list.length === 0) container.innerHTML = '<div class="p-4 text-center text-gray-500 text-xs">Aucune notification</div>';
}

/**
 * Computes age from a birth date string.
 * @param {string} dateStr - The birth date string.
 * @returns {number|null} The calculated age or null if invalid.
 */
function computeAge(dateStr) {
    if (!dateStr) return null;
    const dob = new Date(dateStr);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
    return age;
}

/**
 * Formats a birth date string into a localized French date format.
 * @param {string} dateStr - The birth date string.
 * @returns {string} Formatted date or "Date inconnue" if invalid.
 */
function formatBirthDate(dateStr) {
    if (!dateStr) return "Date inconnue";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Date inconnue";
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Generates an availability badge HTML.
 * @param {boolean} isAvailable - Whether the item is available in the catalog.
 * @returns {string} HTML string for the availability badge.
 */
function availabilityBadge(isAvailable) {
    return isAvailable
        ? '<span class="badge badge-available">Disponible</span>'
        : '<span class="badge badge-missing">Hors catalogue</span>';
}

/**
 * Generates a media type badge (Film/Série).
 * @param {string} type - The media type ('serie' or 'film').
 * @returns {string} HTML string for the type badge.
 */
function typeBadge(type) {
    const label = type === 'serie' ? 'Série' : 'Film';
    return `<span class="badge badge-type">${label}</span>`;
}

/**
 * Renders the filmography timeline for an actor.
 * @param {HTMLElement} timelineEl - The timeline container element.
 * @param {Array} filmography - Array of filmography items.
 * @param {Object} filmsData - Films data for availability check.
 * @param {Object} seriesData - Series data for availability check.
 */
function renderTimeline(timelineEl, filmography, filmsData, seriesData) {
    timelineEl.innerHTML = '';

    if (!filmography || filmography.length === 0) {
        timelineEl.innerHTML = '<div class="text-gray-500 text-sm">Aucun projet enregistré.</div>';
        return;
    }

    // Group films by year for timeline display
    const grouped = {};
    filmography.forEach(item => {
        const year = item.year || 0;
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(item);
    });

    // Process grouped years in descending order (newest first)
    Object.keys(grouped)
        .sort((a, b) => b - a)
        .forEach(year => {
            const items = grouped[year];
            const row = document.createElement('div');
            row.className = "timeline-item";

            // Check if all items in this year are available
            const allAvailable = items.every(item =>
                item.type === 'serie' ? Boolean(seriesData[item.title]) : Boolean(filmsData[item.title])
            );

            let projectsHTML = '';
            items.forEach(item => {
                const isAvailable = item.type === 'serie'
                    ? Boolean(seriesData[item.title])
                    : Boolean(filmsData[item.title]);

                const episodesLabel = item.type === 'serie' && item.episodes
                    ? `${item.episodes} ${item.episodes > 1 ? 'épisodes' : 'épisode'}`
                    : '';

                const roleText = ['Executive Producer', 'Director', 'Screenplay', 'Co-Executive Producer', 'Producer', 'Songs', 'Associate Producer', 'Thanks', 'Writer', 'Musician', 'Vocals'].includes(item.role) ? 'En tant que' : 'Incarnant';

                projectsHTML += `
                    <div class="timeline-project mb-2 pb-2 last:mb-0 last:pb-0 border-b border-white/5 last:border-b-0">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <span class="font-bold text-white">${item.title || 'Titre inconnu'}</span>
                            ${availabilityBadge(isAvailable)}
                            ${typeBadge(item.type)}
                        </div>
                        <div class="text-sm text-gray-400 leading-relaxed">
                            ${item.role ? `<strong><u>${episodesLabel}</u></strong> ${roleText} <a style="color: #f87171;">${item.role}</a>` : `<strong><u>${episodesLabel}</u></strong> Rôle non renseigné.`}
                        </div>
                    </div>
                `;
            });

            row.innerHTML = `
                <div class="timeline-year">${year || '—'}</div>
                <div class="timeline-body">
                    ${projectsHTML}
                </div>
            `;
            timelineEl.appendChild(row);
        });
}

/**
 * Opens the actor details overlay.
 * @param {Object} actor - Actor object.
 * @param {Object} filmsData - Films data keyed by title.
 * @param {Object} seriesData - Series data keyed by title.
 */
export function openActorDetails(actor, filmsData = {}, seriesData = {}) {
    const overlay = document.getElementById('actorOverlay');

    if (!overlay || !actor) return;

    const photo = actor.photo || `https://placehold.co/500x700/111/fff?text=${encodeURIComponent(actor.name || 'Acteur')}`;
    const filmography = Array.isArray(actor.filmography) ? [...actor.filmography] : [];
    filmography.sort((a, b) => (b.year || 0) - (a.year || 0));

    // Calculate age and format birth information
    const age = computeAge(actor.birthDate);
    const ageLabel = age !== null ? `${age} ans` : 'Âge inconnu';
    const birthLabel = formatBirthDate(actor.birthDate);

    const photoEl = document.getElementById('actorDetailPhoto');
    if (photoEl) {
        photoEl.src = photo;
        photoEl.onerror = function () {
            this.src = 'https://placehold.co/500x700/111/fff?text=Acteur';
        };
    }

    // Get references to all detail elements
    const nameEl = document.getElementById('actorDetailName');
    const bioEl = document.getElementById('actorDetailBio');
    const genderEl = document.getElementById('actorDetailGender');
    const ageEl = document.getElementById('actorDetailAge');
    const birthEl = document.getElementById('actorDetailBirth');
    const nationalityEl = document.getElementById('actorDetailNationality');
    const projectsEl = document.getElementById('actorDetailProjects');
    const timelineEl = document.getElementById('actorTimeline');

    // Populate actor detail elements
    if (nameEl) nameEl.textContent = actor.name || 'Nom inconnu';
    if (bioEl) bioEl.textContent = actor.bio || 'Biographie non renseignée.';
    if (genderEl) genderEl.textContent = actor.gender || 'Non renseigné';
    if (ageEl) ageEl.textContent = ageLabel;
    if (birthEl) birthEl.textContent = actor.birthPlace ? `${birthLabel} • ${actor.birthPlace}` : birthLabel;
    if (nationalityEl) nationalityEl.textContent = actor.nationality || '—';
    if (projectsEl) projectsEl.textContent = `${filmography.length} projets`;

    // Render filmography timeline
    if (timelineEl) renderTimeline(timelineEl, filmography, filmsData, seriesData);

    // Show overlay and prevent background scrolling
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the actor details overlay.
 */
export function closeActorDetails() {
    const overlay = document.getElementById('actorOverlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Renders the grid of actors (photo + nom).
 * @param {Object} actorsData - Actors keyed by slug/id.
 * @param {Object} filmsData - Films data keyed by title.
 * @param {Object} seriesData - Series data keyed by title.
 */
export function renderActorsList(actorsData, filmsData = {}, seriesData = {}) {
    const container = document.getElementById('actorsContent');
    if (!container) return;

    // Convert actors object to array and sort alphabetically
    const actors = Object.values(actorsData || {});
    if (actors.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Aucun acteur enregistré pour le moment.</div>';
        return;
    }

    actors.sort((a, b) => a.name.localeCompare(b.name));
    container.innerHTML = '';

    // Create responsive grid for actor cards
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-8";

    // Create and append actor cards
    actors.forEach(actor => {
        const photo = actor.photo || `https://placehold.co/500x700/111/fff?text=${encodeURIComponent(actor.name || 'Acteur')}`;
        const card = document.createElement('div');
        card.className = "relative overflow-hidden rounded-2xl group shadow-lg bg-[#121212] border border-white/5 cursor-pointer actor-thumb";
        card.innerHTML = `
            <img src="${photo}" alt="${actor.name || 'Acteur'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/500x700/111/fff?text=Acteur'" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <h4 class="font-black text-white text-lg drop-shadow-md line-clamp-2">${actor.name || 'Nom inconnu'}</h4>
                <span class="text-xs font-bold text-gray-300 bg-white/10 rounded-full px-3 py-1 border border-white/10">Voir</span>
            </div>
        `;

        card.onclick = () => openActorDetails(actor, filmsData, seriesData);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

/**
 * Renders a list of actors in a search results section.
 * @param {Array} actorsData - Array of actor objects to display.
 * @param {Object} filmsData - Films data for opening actor details.
 * @param {Object} seriesData - Series data for opening actor details.
 */
export function renderActorsListSearch(actorsData, filmsData = {}, seriesData = {}) {
    const container = document.getElementById('contentGrid');
    if (!container) return;

    if (!actorsData || actorsData.length === 0) {
        return;
    }

    // Create a section title for actors in search results
    const section = document.createElement('div');
    section.className = "col-span-full mt-12 mb-6";

    const titleDiv = document.createElement('div');
    titleDiv.className = "flex items-center gap-4 mb-6";

    const accentSpan = document.createElement('span');
    accentSpan.className = 'w-1 h-8 bg-red-600 rounded-full shadow-[0_0_15px_#dc2626]';
    titleDiv.appendChild(accentSpan);

    const titleText = document.createElement('span');
    titleText.className = 'tracking-tight text-xl font-bold';
    titleText.textContent = `Acteurs (${actorsData.length})`;
    titleDiv.appendChild(titleText);

    section.appendChild(titleDiv);

    // Create grid for actor cards in search results
    const grid = document.createElement('div');
    grid.className = "col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-8";

    actorsData.forEach(actor => {
        const photo = actor.photo || `https://placehold.co/500x700/111/fff?text=${encodeURIComponent(actor.name || 'Acteur')}`;
        const card = document.createElement('div');
        card.className = "relative overflow-hidden rounded-2xl group shadow-lg bg-[#121212] border border-white/5 cursor-pointer actor-thumb";
        card.innerHTML = `
            <img src="${photo}" alt="${actor.name || 'Acteur'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/500x700/111/fff?text=Acteur'" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <h4 class="font-black text-white text-lg drop-shadow-md line-clamp-2">${actor.name || 'Nom inconnu'}</h4>
                <span class="text-xs font-bold text-gray-300 bg-white/10 rounded-full px-3 py-1 border border-white/10">Voir</span>
            </div>
        `;

        card.onclick = () => openActorDetails(actor, filmsData, seriesData);
        grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
}