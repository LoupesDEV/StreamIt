function displayStats() {
  const films = Object.values(filmsData);
  const series = Object.values(seriesData);

  const filmsCount = films.length;
  const seriesCount = series.length;

  const filmRatings = films
    .map((f) => f.IMDb)
    .filter((r) => typeof r === "number");
  const avgFilmRating = filmRatings.length
    ? (filmRatings.reduce((a, b) => a + b, 0) / filmRatings.length).toFixed(1)
    : "0.0";
  const seriesRatings = series
    .map((s) => s.IMDb)
    .filter((r) => typeof r === "number");
  const avgSeriesRating = seriesRatings.length
    ? (seriesRatings.reduce((a, b) => a + b, 0) / seriesRatings.length).toFixed(
        1
      )
    : "0.0";

  const genreCount = {};
  films.forEach((f) =>
    (f.genres || []).forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1))
  );
  series.forEach((s) =>
    (s.genres || []).forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1))
  );
  const popularGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const allActors = new Set();
  films.forEach((f) => (f.stars || []).forEach((a) => allActors.add(a)));
  series.forEach((s) => (s.stars || []).forEach((a) => allActors.add(a)));
  const allDirectors = new Set();
  films.forEach((f) => (f.directors || []).forEach((d) => allDirectors.add(d)));
  const allCreators = new Set();
  series.forEach((s) => (s.creators || []).forEach((c) => allCreators.add(c)));

  const topFilm = films.reduce(
    (best, f) => (f.IMDb > (best?.IMDb || 0) ? f : best),
    null
  );
  const topSeries = series.reduce(
    (best, s) => (s.IMDb > (best?.IMDb || 0) ? s : best),
    null
  );

  const totalEpisodes = series.reduce(
    (sum, s) =>
      sum +
      Object.values(s.seasons || {}).reduce(
        (acc, eps) => acc + (eps?.length || 0),
        0
      ),
    0
  );

  document.getElementById("statsContent").innerHTML = `
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
            ${popularGenres.map(([g, c]) => `<li>${g} (${c})</li>`).join("")}
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
          <p>${topFilm ? `${topFilm.title} (${topFilm.IMDb}/10)` : "N/A"}</p>
        </div>
        <div class="stat-card">
          <h4>🏆 Série la mieux notée</h4>
          <p>${
            topSeries ? `${topSeries.title} (${topSeries.IMDb}/10)` : "N/A"
          }</p>
        </div>
      </div>
    `;
}
