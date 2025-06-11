function displayPopularContent() {
  const popularFilms = Object.values(filmsData)
    .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
    .slice(0, 6);

  const popularSeries = Object.values(seriesData)
    .sort((a, b) => (b.IMDb || 0) - (a.IMDb || 0))
    .slice(0, 6);

  displayContent(popularFilms, "popularFilms");
  displayContent(popularSeries, "popularSeries");
}

function displayFilms(films) {
  displayContent(films, "filmsGrid");
}

function displaySeries(series) {
  displayContent(series, "seriesGrid");
}

function displayContent(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML =
      '<div class="no-results"><i class="fas fa-film"></i><p>Aucun contenu trouvé</p></div>';
    return;
  }

  container.innerHTML = items.map((item) => createContentCard(item)).join("");
}

function createContentCard(item) {
  const genres = item.genres
    ? item.genres
        .slice(0, 3)
        .map((g) => `<span class="genre-tag">${g}</span>`)
        .join("")
    : "";
  const rating = item.IMDb
    ? `<div class="card-rating"><i class="fas fa-star"></i> ${item.IMDb}</div>`
    : "";
  const year = item.year ? `<span class="card-year">${item.year}</span>` : "";

  let watchedBadge = "";
  if (getItemType(item) === "film") {
    const watchData = getFilmWatchData(item.title);
    if (watchData.watched) {
      watchedBadge = `<span class="watched-badge" title="Déjà vu"><i class="fas fa-eye"></i></span>`;
    }
  }

  return `
      <div class="content-card" onclick="openModal('${escapeForHTML(
        item.title
      )}', '${getItemType(item)}')">
        <div class="card-image">
          ${
            item.banner
              ? `<img src="${item.banner}" alt="${item.title}" onerror="this.style.display='none'">`
              : '<i class="fas fa-film"></i>'
          }
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
  return item.seasons ? "series" : "film";
}

function showNoResults(message = "Aucun résultat trouvé") {
  return `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <p>${message}</p>
    </div>
  `;
}
