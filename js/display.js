/**
 * js/display.js
 * Handles the display and rendering of media items, hero section, details overlay, collections, and notifications.
 * @module display
 */

import { playVideo } from './utils.js';

let activeDetailItem = null;
let activeVideoSrc = "";

/**
 * Sets up the hero section with the given media item.
 * @param {Object} item - The media item to display in the hero section.
 */
export function setupHero(item) {
    if (!item) return;

    const isSerie = item.type === 'serie' || item.seasons !== undefined;

    document.getElementById('heroImage').src = item.banner || item.poster;
    document.getElementById('heroTitle').innerText = item.title;
    document.getElementById('heroDesc').innerText = item.description;
    document.getElementById('heroRating').innerText = item.IMDb;
    document.getElementById('heroYear').innerText = item.year;
    document.getElementById('heroType').innerText = isSerie ? 'Série' : 'Film';

    let durationText = item.duration || "2h 15min";
    if (isSerie && item.seasons) {
        const nbSeasons = Object.keys(item.seasons).length;
        durationText = nbSeasons + (nbSeasons > 1 ? " Saisons" : " Saison");
    }
    document.getElementById('heroDuration').innerText = durationText;
    document.getElementById('heroGenre').innerText = item.genres?.[0] || "";

    const heroBtn = document.getElementById('heroPlayBtn');
    const newBtn = heroBtn.cloneNode(true);
    heroBtn.parentNode.replaceChild(newBtn, heroBtn);

    newBtn.onclick = () => {
        openDetails(item);
        if (isSerie && item.seasons?.["1"]?.[0]) {
            playVideo(item.seasons["1"][0].video);
        } else if (item.video) {
            playVideo(item.video);
        }
    };

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
 */
export function openDetails(item) {
    activeDetailItem = item;
    const overlay = document.getElementById('detailsOverlay');
    const isSerie = item.type === 'serie' || item.seasons !== undefined;
    const playBtn = document.getElementById('detailPlayBtn');

    document.getElementById('detailHeroImg').src = item.banner || item.poster;
    document.getElementById('detailTitle').innerText = item.title;
    document.getElementById('detailDesc').innerText = item.description;
    document.getElementById('detailYear').innerText = item.year;

    const matchScore = item.IMDb ? Math.round(item.IMDb * 10) : 90;
    document.getElementById('detailMatch').innerText = `Recommandé à ${matchScore}%`;

    let durationText = item.duration || "2h 15min";
    if (isSerie && item.seasons) {
        const nbSeasons = Object.keys(item.seasons).length;
        durationText = nbSeasons + (nbSeasons > 1 ? " Saisons" : " Saison");
    }
    document.getElementById('detailDuration').innerText = durationText;

    document.getElementById('detailGenrePills').innerHTML = item.genres?.map(g => `<span class="text-gray-300 text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">${g}</span>`).join('') || "";
    document.getElementById('detailCast').innerHTML = item.stars?.map(s => `<span class="bg-red-600/10 text-red-300 px-4 py-2 rounded-full text-sm font-bold">${s}</span>`).join('') || "Non renseigné";
    document.getElementById('detailCreators').innerText = (item.directors || item.creators || []).join(", ") || "Non renseigné";

    const seriesSec = document.getElementById('seriesSection');
    const seasonSelect = document.getElementById('seasonSelect');

    if (isSerie) {
        seriesSec.classList.remove('hidden');
        activeVideoSrc = "";

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
            renderEpisodes(seasons[seasonKeys[0]], seasonKeys[0]);

            seasonSelect.onchange = (e) => {
                const rawValue = e.target && typeof e.target.value === 'string' ? e.target.value : null;
                const selectedKey = rawValue && Object.prototype.hasOwnProperty.call(seasons, rawValue)
                    ? rawValue
                    : null;
                const selectedSeason = selectedKey ? seasons[selectedKey] : null;
                if (selectedSeason) {
                    const safeSeasonId = String(selectedKey);
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
    }

    if (playBtn) {
        const hasVideo = activeVideoSrc && activeVideoSrc.trim() !== '';
        playBtn.disabled = !hasVideo;
        if (hasVideo) {
            playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            playBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

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
 * Plays the currently selected media in the details overlay.
 */
export function playCurrentMedia() {
    if (activeVideoSrc) {
        playVideo(activeVideoSrc);
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

    if (!episodes || episodes.length === 0) {
        episodes = [
            { title: "Épisode 1", desc: "Description indisponible.", duration: "45m", video: "" },
            { title: "Épisode 2", desc: "Description indisponible.", duration: "42m", video: "" }
        ];
    }

    const safeSeasonNum = typeof seasonNum === 'string'
        ? seasonNum.replace(/[^0-9]/g, '') || '1'
        : String(Number.isFinite(seasonNum) ? seasonNum : 1);

    if (episodes.length > 0) activeVideoSrc = episodes[0].video;

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

    episodes.forEach((ep, idx) => {
        const row = document.createElement('div');
        row.className = "episode-item flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 hover:bg-white/[0.02] group bg-[#0a0a0a]";

        const fallbackThumb = `https://placehold.co/300x200/333/666?text=S${safeSeasonNum}-EP${idx + 1}`;
        const thumbUrl = activeDetailItem ? activeDetailItem.poster : fallbackThumb;

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
        thumbContainer.appendChild(img);

        const overlay = document.createElement('div');
        overlay.className = "absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors";

        const playIcon = document.createElement('i');
        playIcon.className = "fas fa-play text-white text-xl opacity-0 group-hover:opacity-100 transition-all";
        overlay.appendChild(playIcon);

        thumbContainer.appendChild(overlay);
        leftContainer.appendChild(thumbContainer);

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

        titleRow.appendChild(titleEl);
        titleRow.appendChild(durationEl);

        const descEl = document.createElement('p');
        descEl.className = "text-gray-400 text-sm leading-relaxed line-clamp-2";
        descEl.textContent = ep.desc || "...";

        rightContainer.appendChild(titleRow);
        rightContainer.appendChild(descEl);

        row.appendChild(leftContainer);
        row.appendChild(rightContainer);

        row.onclick = (e) => {
            e.stopPropagation();
            playVideo(ep.video);
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

    card.innerHTML = `
        <img src="${item.poster}" onerror="this.src='${fallback}'" class="w-full h-full object-cover object-center transition-transform duration-700 loading='lazy'">
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

    const sortedCollections = Object.entries(collectionsData).sort(([, a], [, b]) => {
        return a.name.localeCompare(b.name);
    });

    for (const [key, collection] of sortedCollections) {
        const items = [];
        
        if (collection.films && Array.isArray(collection.films)) {
            collection.films.forEach(title => {
                const foundFilm = Object.values(appData.films).find(f => f.title === title);
                if (foundFilm) items.push(foundFilm);
            });
        }

        if (collection.series && Array.isArray(collection.series)) {
            collection.series.forEach(title => {
                const foundSerie = Object.values(appData.series).find(s => s.title === title);
                if (foundSerie) items.push(foundSerie);
            });
        }

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
            rowDiv.className = "flex gap-6 overflow-x-auto pb-8 hide-scrollbar scroll-smooth snap-x pl-1";
            
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