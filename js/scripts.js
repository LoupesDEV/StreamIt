let filmsData = {};
let seriesData = {};
let currentSection = 'home';

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    showSection('home');
    populateFilters();
    displayPopularContent();
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

    return `
      <div class="content-card" onclick="openModal('${item.title.replace(/'/g, "\\'")}', '${getItemType(item)}')">
        <div class="card-image">
          ${item.banner ? `<img src="${item.banner}" alt="${item.title}" onerror="this.style.display='none'">` : '<i class="fas fa-film"></i>'}
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
}

function createModalContent(item, type) {
    const genres = item.genres ? item.genres.map(g => `<span class="genre-tag">${g}</span>`).join('') : '';
    const rating = item.IMDb ? `<div class="modal-rating"><i class="fas fa-star"></i> ${item.IMDb}/10</div>` : '';
    const year = item.year ? `<span>${item.year}</span>` : '';
    const directors = item.directors ? `<p><strong>Réalisateurs:</strong> ${item.directors.join(', ')}</p>` : '';
    const writers = item.writers ? `<p><strong>Scénaristes:</strong> ${item.writers.join(', ')}</p>` : '';
    const stars = item.stars ? `<p><strong>Acteurs:</strong> ${item.stars.join(', ')}</p>` : '';
    const creators = item.creators ? `<p><strong>Créateurs:</strong> ${item.creators.join(', ')}</p>` : '';

    const watchButton = (type === 'film' && item.video) ?
        `<button class="btn btn-primary" onclick="playVideo('${item.video}')">
      <i class="fas fa-play"></i> Regarder
    </button>` : '';

    const trailerButton = item.trailer ?
        `<a href="${item.trailer}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> Bande-annonce
    </a>` : '';

    const imdbButton = item.IMDb_link ?
        `<a href="${item.IMDb_link}" target="_blank" class="btn btn-secondary">
      <i class="fas fa-external-link-alt"></i> IMDb
    </a>` : '';

    return `
    <div class="modal-body">
      <div class="modal-header">
        <div class="modal-poster">
          ${item.banner ? `<img src="${item.banner}" alt="${item.title}" class="modal-poster">` : '<div class="modal-poster" style="display: flex; align-items: center; justify-content: center; background-color: var(--bg-card);"><i class="fas fa-film" style="font-size: 3rem; color: var(--text-secondary);"></i></div>'}
        </div>
        <div class="modal-info">
          <h2 class="modal-title">${item.title}</h2>
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
        ${seasons.map((season, index) =>
        `<button class="season-btn ${index === 0 ? 'active' : ''}" data-season="${season}">
            Saison ${season}
          </button>`
    ).join('')}
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

    episodesContainer.innerHTML = episodes.map((episode, index) => `
    <div class="episode-item" onclick="playVideo('${episode.video}')">
      <div class="episode-number">E${index + 1}</div>
      <div class="episode-info">
        <div class="episode-title">${episode.title}</div>
        <div class="episode-description">${episode.desc}</div>
      </div>
      <div style="display: flex; align-items: center;">
        <i class="fas fa-play" style="color: var(--accent);"></i>
      </div>
    </div>
  `).join('');
}

function playVideo(videoPath) {
    if (!videoPath) {
        alert('Vidéo non disponible');
        return;
    }

    videoPlayer.src = videoPath;
    videoModal.classList.add('active');
    modal.classList.remove('active');
}

function closeModals() {
    modal.classList.remove('active');
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';

    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
    }
}

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    const filmResults = Object.values(filmsData).filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.genres && item.genres.some(genre => genre.toLowerCase().includes(query))) ||
        (item.directors && item.directors.some(director => director.toLowerCase().includes(query))) ||
        (item.stars && item.stars.some(star => star.toLowerCase().includes(query)))
    );

    const seriesResults = Object.values(seriesData).filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.genres && item.genres.some(genre => genre.toLowerCase().includes(query))) ||
        (item.creators && item.creators.some(creator => creator.toLowerCase().includes(query))) ||
        (item.stars && item.stars.some(star => star.toLowerCase().includes(query)))
    );

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
    if (e.key === 'f' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
        showSection('films');
        setActiveNavLink(document.querySelector('[data-section="films"]'));
    }

    if (e.key === 's' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
        showSection('series');
        setActiveNavLink(document.querySelector('[data-section="series"]'));
    }

    if (e.key === 'h' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
        showSection('home');
        setActiveNavLink(document.querySelector('[data-section="home"]'));
    }

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