let filmsData = {};
let seriesData = {};
let currentSection = 'home';

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');

function getWatchedContent() {
    return JSON.parse(localStorage.getItem('watchedContent') || '{"films":{},"series":{}}');
}

function setWatchedContent(data) {
    localStorage.setItem('watchedContent', JSON.stringify(data));
}

function markFilmWatched(title, watched = true, time = 0) {
    const data = getWatchedContent();
    if (!data.films[title]) data.films[title] = {};
    data.films[title].watched = watched;
    data.films[title].time = time;
    setWatchedContent(data);
}

function getFilmWatchData(title) {
    const data = getWatchedContent();
    return data.films[title] || {watched: false, time: 0};
}

function markEpisodeWatched(seriesTitle, season, epIndex, watched = true, time = 0) {
    const data = getWatchedContent();
    if (!data.series[seriesTitle]) data.series[seriesTitle] = {};
    if (!data.series[seriesTitle][season]) data.series[seriesTitle][season] = {};
    data.series[seriesTitle][season][epIndex] = {watched, time};
    setWatchedContent(data);
}

function getEpisodeWatchData(seriesTitle, season, epIndex) {
    const data = getWatchedContent();
    return (data.series[seriesTitle] && data.series[seriesTitle][season] && data.series[seriesTitle][season][epIndex]) || {
        watched: false, time: 0
    };
}

function escapeForHTML(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    showSection('home');
    populateFilters();
    displayPopularContent();

    const exportBtn = document.getElementById('exportWatchedBtn');
    const importInput = document.getElementById('importWatchedInput');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = localStorage.getItem('watchedContent') || '{"films":{},"series":{}}';
            const blob = new Blob([data], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'streamit_progression.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (evt) {
                try {
                    const imported = JSON.parse(evt.target.result);
                    if (imported.films && imported.series) {
                        localStorage.setItem('watchedContent', JSON.stringify(imported));
                        alert('Progression importée avec succès !');
                        location.reload();
                    } else {
                        alert('Fichier invalide.');
                    }
                } catch {
                    alert('Erreur lors de l\'import.');
                }
            };
            reader.readAsText(file);
        });
    }
});

async function loadData() {
    try {
        const filmsResponse = await fetch('data/films_data.json');
        filmsData = await filmsResponse.json();

        const seriesResponse = await fetch('data/series_data.json');
        seriesData = await seriesResponse.json();

        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showNoResults('Erreur de chargement des données');
    }
}

function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            setActiveNavLink(link);
        });
    });

    searchInput.addEventListener('input', debounce(handleSearch, 300));

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModals();
    });

    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeModals();
    });

    document.getElementById('filmGenreFilter').addEventListener('change', () => {
        displayFilms(getFilteredFilms());
    });

    document.getElementById('filmYearFilter').addEventListener('change', () => {
        displayFilms(getFilteredFilms());
    });

    document.getElementById('filmDirectorFilter').addEventListener('change', () => {
        displayFilms(getFilteredFilms());
    });

    document.getElementById('filmActorFilter').addEventListener('change', () => {
        displayFilms(getFilteredFilms());
    });

    document.getElementById('filmRatingFilter').addEventListener('input', (e) => {
        document.querySelector('#films .rating-value').textContent = parseFloat(e.target.value).toFixed(1);
        displayFilms(getFilteredFilms());
    });

    document.getElementById('seriesGenreFilter').addEventListener('change', () => {
        displaySeries(getFilteredSeries());
    });

    document.getElementById('seriesYearFilter').addEventListener('change', () => {
        displaySeries(getFilteredSeries());
    });

    document.getElementById('seriesCreatorFilter').addEventListener('change', () => {
        displaySeries(getFilteredSeries());
    });

    document.getElementById('seriesActorFilter').addEventListener('change', () => {
        displaySeries(getFilteredSeries());
    });

    document.getElementById('seriesRatingFilter').addEventListener('input', (e) => {
        document.querySelector('#series .rating-value').textContent = parseFloat(e.target.value).toFixed(1);
        displaySeries(getFilteredSeries());
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });

    if (videoPlayer) {
        videoPlayer.addEventListener('timeupdate', handleVideoTimeUpdate);
        videoPlayer.addEventListener('ended', handleVideoEnded);
        videoPlayer.addEventListener('pause', handleVideoPause);
    }
}

function showSection(sectionName) {
    sections.forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');
    currentSection = sectionName;

    switch (sectionName) {
        case 'films':
            displayFilms(Object.values(filmsData));
            break;
        case 'series':
            displaySeries(Object.values(seriesData));
            break;
        case 'search':
            if (searchInput.value.trim()) {
                handleSearch();
            }
            break;
        case 'stats':
            displayStats();
            break;
    }
}

function setActiveNavLink(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function displayPopularContent() {
    const popularFilms = Object.values(filmsData)
        .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
        .slice(0, 6);

    const popularSeries = Object.values(seriesData)
        .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
        .slice(0, 6);

    displayContent(popularFilms, 'popularFilms');
    displayContent(popularSeries, 'popularSeries');
}

function displayFilms(films) {
    displayContent(films, 'filmsGrid');
}

function displaySeries(series) {
    displayContent(series, 'seriesGrid');
}

function displayContent(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="fas fa-film"></i><p>Aucun contenu trouvé</p></div>';
        return;
    }

    container.innerHTML = items.map(item => createContentCard(item)).join('');
}

function createContentCard(item) {
    const genres = item.genres ? item.genres.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join('') : '';
    const rating = item.IMDb ? `<div class="card-rating"><i class="fas fa-star"></i> ${item.IMDb}</div>` : '';
    const year = item.year ? `<span class="card-year">${item.year}</span>` : '';

    let watchedBadge = '';
    if (getItemType(item) === 'film') {
        const watchData = getFilmWatchData(item.title);
        if (watchData.watched) {
            watchedBadge = `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i></span>`;
        }
    }

    return `
      <div class="content-card" onclick="openModal('${escapeForHTML(item.title)}', '${getItemType(item)}')">
        <div class="card-image">
          ${item.banner ? `<img src="${item.banner}" alt="${item.title}" onerror="this.style.display='none'">` : '<i class="fas fa-film"></i>'}
          ${watchedBadge}
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-meta">
            ${rating}
            ${year}
          </div>
          <div class="card-genres">${genres}</div>
        </div>
      </div>
    `;
}

function getItemType(item) {
    return item.seasons ? 'series' : 'film';
}

let currentVideoContext = null;

function openModal(title, type) {
    const item = type === 'film' ? filmsData[title] : seriesData[title];
    if (!item) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = createModalContent(item, type);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (type === 'series' && item.seasons) {
        setupSeriesModal(item);
    }
    currentVideoContext = null;
}

function createModalContent(item, type) {
    const genres = item.genres ? item.genres.map(g => `<span class="genre-tag">${g}</span>`).join('') : '';
    const rating = item.IMDb ? `<div class="modal-rating"><i class="fas fa-star"></i> ${item.IMDb}/10</div>` : '';
    const year = item.year ? `<span>${item.year}</span>` : '';
    const directors = item.directors ? `<p><strong>Réalisateurs:</strong> ${item.directors.join(', ')}</p>` : '';
    const writers = item.writers ? `<p><strong>Scénaristes:</strong> ${item.writers.join(', ')}</p>` : '';
    const stars = item.stars ? `<p><strong>Acteurs:</strong> ${item.stars.join(', ')}</p>` : '';
    const creators = item.creators ? `<p><strong>Créateurs:</strong> ${item.creators.join(', ')}</p>` : '';

    let watchedInfo = '';
    if (type === 'film') {
        const watchData = getFilmWatchData(item.title);
        if (watchData.watched) {
            watchedInfo = `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i> Vu</span>`;
        }
    }

    const watchButton = (type === 'film' && item.video) ? `<button class="btn btn-primary" onclick="playVideo('${item.video}', 'film', '${escapeForHTML(item.title)}')">
      <i class="fas fa-play"></i> Regarder
    </button>` : '';

    const trailerButton = item.trailer ? `<a href="${item.trailer}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> Bande-annonce
    </a>` : '';

    const imdbButton = item.IMDb_link ? `<a href="${item.IMDb_link}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> IMDb
    </a>` : '';

    return `
    <div class="modal-body">
      <div class="modal-header">
        <div class="modal-poster">
          ${item.banner ? `<img src="${item.banner}" alt="${item.title}" class="modal-poster">` : '<div class="modal-poster" style="display: flex; align-items: center; justify-content: center; background-color: var(--bg-card);"><i class="fas fa-film" style="font-size: 3rem; color: var(--text-secondary);"></i></div>'}
        </div>
        <div class="modal-info">
          <h2 class="modal-title">${item.title} ${watchedInfo}</h2>
          <div class="modal-meta">
            ${rating}
            ${year}
            <div class="card-genres">${genres}</div>
          </div>
          <p class="modal-description">${item.description || 'Aucune description disponible.'}</p>
          <div class="modal-cast">
            ${directors}
            ${creators}
            ${writers}
            ${stars}
          </div>
          <div class="action-buttons">
            ${watchButton}
            ${trailerButton}
            ${imdbButton}
          </div>
        </div>
      </div>
      ${type === 'series' ? '<div id="seasonsContainer"></div>' : ''}
    </div>
  `;
}

function setupSeriesModal(series) {
    if (!series.seasons) return;

    const seasonsContainer = document.getElementById('seasonsContainer');
    const seasons = Object.keys(series.seasons);

    seasonsContainer.innerHTML = `
    <div class="seasons-section">
      <h3>Saisons et Épisodes</h3>
      <div class="seasons-nav">
        ${seasons.map((season, index) => `<button class="season-btn ${index === 0 ? 'active' : ''}" data-season="${season}">
            Saison ${season}
          </button>`).join('')}
      </div>
      <div id="episodesContainer"></div>
    </div>
  `;

    const seasonBtns = seasonsContainer.querySelectorAll('.season-btn');
    seasonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            seasonBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayEpisodes(series, btn.dataset.season);
        });
    });

    displayEpisodes(series, seasons[0]);
}

function displayEpisodes(series, seasonNumber) {
    const episodes = series.seasons[seasonNumber];
    const episodesContainer = document.getElementById('episodesContainer');

    if (!episodes || episodes.length === 0) {
        episodesContainer.innerHTML = '<p>Aucun épisode disponible pour cette saison.</p>';
        return;
    }

    episodesContainer.innerHTML = episodes.map((episode, index) => {
        const watchData = getEpisodeWatchData(series.title, seasonNumber, index);
        const watchedClass = watchData.watched ? 'watched-episode' : '';
        const watchedBadge = watchData.watched ? `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i></span>` : '';
        return `
        <div class="episode-item ${watchedClass}" onclick="playVideo('${episode.video}', 'series', '${escapeForHTML(series.title)}', '${seasonNumber}', ${index})">
          <div class="episode-number">E${index + 1}</div>
          <div class="episode-info">
            <div class="episode-title">${episode.title} ${watchedBadge}</div>
            <div class="episode-description">${episode.desc}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <i class="fas fa-play" style="color: var(--accent);"></i>
          </div>
        </div>
      `;
    }).join('');
}

function playVideo(videoPath, type, title, season, epIndex) {
    if (!videoPath) {
        alert('Vidéo non disponible');
        return;
    }

    videoPlayer.src = videoPath;
    videoModal.classList.add('active');
    modal.classList.remove('active');
    document.body.style.overflow = 'hidden';

    let startTime = 0;
    if (type === 'film') {
        const watchData = getFilmWatchData(title);
        startTime = watchData.time || 0;
        currentVideoContext = {type, title};
    } else if (type === 'series') {
        const watchData = getEpisodeWatchData(title, season, epIndex);
        startTime = watchData.time || 0;
        currentVideoContext = {type, title, season, epIndex};
    }
    videoPlayer.currentTime = startTime;
    setTimeout(() => {
        videoPlayer.currentTime = startTime;
    }, 100);

    videoPlayer.play();
}

function handleVideoTimeUpdate() {
    if (!currentVideoContext) return;
    const {type, title, season, epIndex} = currentVideoContext;
    const duration = videoPlayer.duration || 1;
    const current = videoPlayer.currentTime;

    if (type === 'film') {
        markFilmWatched(title, false, current);
    } else if (type === 'series') {
        markEpisodeWatched(title, season, epIndex, false, current);
    }

    if (current / duration >= 0.9) {
        if (type === 'film') {
            markFilmWatched(title, true, 0);
        } else if (type === 'series') {
            markEpisodeWatched(title, season, epIndex, true, 0);
        }
    }
}

function handleVideoEnded() {
    if (!currentVideoContext) return;
    const {type, title, season, epIndex} = currentVideoContext;
    if (type === 'film') {
        markFilmWatched(title, true, 0);
    } else if (type === 'series') {
        markEpisodeWatched(title, season, epIndex, true, 0);
    }
}

function handleVideoPause() {
    if (!currentVideoContext) return;
    const {type, title, season, epIndex} = currentVideoContext;
    const current = videoPlayer.currentTime;
    if (type === 'film') {
        markFilmWatched(title, false, current);
    } else if (type === 'series') {
        markEpisodeWatched(title, season, epIndex, false, current);
    }
}

function closeModals() {
    modal.classList.remove('active');
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';

    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }
    currentVideoContext = null;
}

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    const filmResults = Object.values(filmsData).filter(item => item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.genres && item.genres.some(genre => genre.toLowerCase().includes(query))) || (item.directors && item.directors.some(director => director.toLowerCase().includes(query))) || (item.stars && item.stars.some(star => star.toLowerCase().includes(query))));

    const seriesResults = Object.values(seriesData).filter(item => item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.genres && item.genres.some(genre => genre.toLowerCase().includes(query))) || (item.creators && item.creators.some(creator => creator.toLowerCase().includes(query))) || (item.stars && item.stars.some(star => star.toLowerCase().includes(query))));

    const allResults = [...filmResults, ...seriesResults];

    if (currentSection === 'search') {
        displayContent(allResults, 'searchResults');
    }

    if (currentSection !== 'search' && allResults.length > 0) {
        showSection('search');
        setActiveNavLink(document.querySelector('[data-section="search"]'));
        displayContent(allResults, 'searchResults');
    }
}

function populateFilters() {
    populateGenreFilters();
    populateYearFilters();
    populateDirectorFilters();
    populateActorFilters();
    populateCreatorFilters();
}

function populateGenreFilters() {
    const filmGenres = new Set();
    const seriesGenres = new Set();

    Object.values(filmsData).forEach(film => {
        if (film.genres) {
            film.genres.forEach(genre => filmGenres.add(genre));
        }
    });

    Object.values(seriesData).forEach(series => {
        if (series.genres) {
            series.genres.forEach(genre => seriesGenres.add(genre));
        }
    });

    populateSelect('filmGenreFilter', Array.from(filmGenres).sort());
    populateSelect('seriesGenreFilter', Array.from(seriesGenres).sort());
}

function populateYearFilters() {
    const filmYears = new Set();
    const seriesYears = new Set();

    Object.values(filmsData).forEach(film => {
        if (film.year) filmYears.add(film.year);
    });

    Object.values(seriesData).forEach(series => {
        if (series.year) seriesYears.add(series.year);
    });

    populateSelect('filmYearFilter', Array.from(filmYears).sort((a, b) => b - a));
    populateSelect('seriesYearFilter', Array.from(seriesYears).sort((a, b) => b - a));
}

function populateDirectorFilters() {
    const directors = new Set();

    Object.values(filmsData).forEach(film => {
        if (film.directors) {
            film.directors.forEach(director => directors.add(director));
        }
    });

    populateSelect('filmDirectorFilter', Array.from(directors).sort());
}

function populateActorFilters() {
    const filmActors = new Set();
    const seriesActors = new Set();

    Object.values(filmsData).forEach(film => {
        if (film.stars) {
            film.stars.forEach(actor => filmActors.add(actor));
        }
    });

    Object.values(seriesData).forEach(series => {
        if (series.stars) {
            series.stars.forEach(actor => seriesActors.add(actor));
        }
    });

    populateSelect('filmActorFilter', Array.from(filmActors).sort());
    populateSelect('seriesActorFilter', Array.from(seriesActors).sort());
}

function populateCreatorFilters() {
    const creators = new Set();

    Object.values(seriesData).forEach(series => {
        if (series.creators) {
            series.creators.forEach(creator => creators.add(creator));
        }
    });

    populateSelect('seriesCreatorFilter', Array.from(creators).sort());
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">--</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function getFilteredFilms() {
    const genreFilter = document.getElementById('filmGenreFilter').value;
    const yearFilter = document.getElementById('filmYearFilter').value;
    const directorFilter = document.getElementById('filmDirectorFilter').value;
    const actorFilter = document.getElementById('filmActorFilter').value;
    const ratingFilter = parseFloat(document.getElementById('filmRatingFilter').value);

    return Object.values(filmsData).filter(film => {
        const genreMatch = !genreFilter || (film.genres && film.genres.includes(genreFilter));
        const yearMatch = !yearFilter || film.year === yearFilter;
        const directorMatch = !directorFilter || (film.directors && film.directors.includes(directorFilter));
        const actorMatch = !actorFilter || (film.stars && film.stars.includes(actorFilter));
        const ratingMatch = !ratingFilter || (film.IMDb && film.IMDb >= ratingFilter);

        return genreMatch && yearMatch && directorMatch && actorMatch && ratingMatch;
    });
}

function getFilteredSeries() {
    const genreFilter = document.getElementById('seriesGenreFilter').value;
    const yearFilter = document.getElementById('seriesYearFilter').value;
    const creatorFilter = document.getElementById('seriesCreatorFilter').value;
    const actorFilter = document.getElementById('seriesActorFilter').value;
    const ratingFilter = parseFloat(document.getElementById('seriesRatingFilter').value);

    return Object.values(seriesData).filter(series => {
        const genreMatch = !genreFilter || (series.genres && series.genres.includes(genreFilter));
        const yearMatch = !yearFilter || series.year === yearFilter;
        const creatorMatch = !creatorFilter || (series.creators && series.creators.includes(creatorFilter));
        const actorMatch = !actorFilter || (series.stars && series.stars.includes(actorFilter));
        const ratingMatch = !ratingFilter || (series.IMDb && series.IMDb >= ratingFilter);

        return genreMatch && yearMatch && creatorMatch && actorMatch && ratingMatch;
    });
}

function showNoResults(message = 'Aucun résultat trouvé') {
    return `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <p>${message}</p>
    </div>
  `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = '<i class="fas fa-film"></i>';
    }
}, true);

document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchInput.focus();
    }
});

function updateFilmsGrid() {
    displayFilms(getFilteredFilms());
}

function resetFilmFilters() {
    document.getElementById('filmGenreFilter').value = '';
    document.getElementById('filmYearFilter').value = '';
    document.getElementById('filmDirectorFilter').value = '';
    document.getElementById('filmActorFilter').value = '';
    document.getElementById('filmRatingFilter').value = 0;
    document.querySelector('#films .rating-value').textContent = '0.0';
    if (typeof updateFilmsGrid === 'function') updateFilmsGrid();
}

function updateSeriesGrid() {
    displaySeries(getFilteredSeries());
}

function resetSeriesFilters() {
    document.getElementById('seriesGenreFilter').value = '';
    document.getElementById('seriesYearFilter').value = '';
    document.getElementById('seriesCreatorFilter').value = '';
    document.getElementById('seriesActorFilter').value = '';
    document.getElementById('seriesRatingFilter').value = 0;
    document.querySelector('#series .rating-value').textContent = '0.0';
    if (typeof updateSeriesGrid === 'function') updateSeriesGrid();
}

function displayStats() {
    const films = Object.values(filmsData);
    const series = Object.values(seriesData);

    const filmsCount = films.length;
    const seriesCount = series.length;

    const filmRatings = films.map(f => f.IMDb).filter(r => typeof r === 'number');
    const avgFilmRating = filmRatings.length ? (filmRatings.reduce((a, b) => a + b, 0) / filmRatings.length).toFixed(1) : '0.0';
    const seriesRatings = series.map(s => s.IMDb).filter(r => typeof r === 'number');
    const avgSeriesRating = seriesRatings.length ? (seriesRatings.reduce((a, b) => a + b, 0) / seriesRatings.length).toFixed(1) : '0.0';

    const genreCount = {};
    films.forEach(f => (f.genres || []).forEach(g => genreCount[g] = (genreCount[g] || 0) + 1));
    series.forEach(s => (s.genres || []).forEach(g => genreCount[g] = (genreCount[g] || 0) + 1));
    const popularGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const allActors = new Set();
    films.forEach(f => (f.stars || []).forEach(a => allActors.add(a)));
    series.forEach(s => (s.stars || []).forEach(a => allActors.add(a)));
    const allDirectors = new Set();
    films.forEach(f => (f.directors || []).forEach(d => allDirectors.add(d)));
    const allCreators = new Set();
    series.forEach(s => (s.creators || []).forEach(c => allCreators.add(c)));

    const topFilm = films.reduce((best, f) => (f.IMDb > (best?.IMDb || 0) ? f : best), null);
    const topSeries = series.reduce((best, s) => (s.IMDb > (best?.IMDb || 0) ? s : best), null);

    const totalEpisodes = series.reduce((sum, s) => sum + Object.values(s.seasons || {}).reduce((acc, eps) => acc + (eps?.length || 0), 0), 0);

    document.getElementById('statsContent').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h4>🎬 Films</h4>
          <p><strong>${filmsCount}</strong> films</p>
          <p>Moyenne IMDb : <strong>${avgFilmRating}</strong></p>
        </div>
        <div class="stat-card">
          <h4>📺 Séries</h4>
          <p><strong>${seriesCount}</strong> séries</p>
          <p>Moyenne IMDb : <strong>${avgSeriesRating}</strong></p>
          <p>Total épisodes : <strong>${totalEpisodes}</strong></p>
        </div>
        <div class="stat-card">
          <h4>🔥 Genres populaires</h4>
          <ul>
            ${popularGenres.map(([g, c]) => `<li>${g} (${c})</li>`).join('')}
          </ul>
        </div>
        <div class="stat-card">
          <h4>👥 Acteurs uniques</h4>
          <p><strong>${allActors.size}</strong></p>
        </div>
        <div class="stat-card">
          <h4>🎬 Réalisateurs uniques</h4>
          <p><strong>${allDirectors.size}</strong></p>
        </div>
        <div class="stat-card">
          <h4>📝 Créateurs uniques</h4>
          <p><strong>${allCreators.size}</strong></p>
        </div>
        <div class="stat-card">
          <h4>🏆 Film le mieux noté</h4>
          <p>${topFilm ? `${topFilm.title} (${topFilm.IMDb}/10)` : 'N/A'}</p>
        </div>
        <div class="stat-card">
          <h4>🏆 Série la mieux notée</h4>
          <p>${topSeries ? `${topSeries.title} (${topSeries.IMDb}/10)` : 'N/A'}</p>
        </div>
      </div>
    `;
}

function handleErrorAndRedirect(message) {
    localStorage.setItem("streamit_404_error", message);
    window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || (e.ctrlKey && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
});

(function detectDevTools() {
    const start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        handleErrorAndRedirect("L'utilisation des outils de développement est interdite sur cette page.");
    }
    setTimeout(detectDevTools, 1000);
})();