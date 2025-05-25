async function fetchData() {
  const films = await fetch("../data/films_data.json")
    .then((r) => r.json())
    .catch(() => []);
  const series = await fetch("../data/series_data.json")
    .then((r) => r.json())
    .catch(() => []);
  return { films, series };
}

function getGenres(items) {
  const genres = {};
  items.forEach((item) => {
    if (item.genres) {
      let genreList = Array.isArray(item.genres)
        ? item.genres
        : item.genres.split(",").map((g) => g.trim());
      genreList.forEach((g) => {
        if (g) genres[g] = (genres[g] || 0) + 1;
      });
    }
  });
  return genres;
}

function getYears(items) {
  const years = {};
  items.forEach((item) => {
    if (item.year) {
      years[item.year] = (years[item.year] || 0) + 1;
    }
  });
  return years;
}

function getAverageNote(items) {
  const notes = items
    .map((i) => {
      if (typeof i.IMDb === "number") return i.IMDb;
      if (typeof i.IMDb === "string" && i.IMDb.trim() !== "")
        return parseFloat(i.IMDb);
      return NaN;
    })
    .filter((n) => !isNaN(n));
  if (notes.length === 0) return "-";
  return (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2);
}

function updateStats({ films, series }) {
  const filmsArr = Array.isArray(films) ? films : Object.values(films);
  const seriesArr = Array.isArray(series) ? series : Object.values(series);

  document.getElementById("filmsCount").textContent = filmsArr.length;
  document.getElementById("seriesCount").textContent = seriesArr.length;

  const allItems = [...filmsArr, ...seriesArr];

  const genres = getGenres(allItems);
  document.getElementById("genresCount").textContent =
    Object.keys(genres).length;

  document.getElementById("imdbAvg").textContent = getAverageNote(allItems);

  createGenreChart(genres);
  createYearChart(getYears(allItems));
}

function createGenreChart(genres) {
  const ctx = document.getElementById("genreChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(genres),
      datasets: [
        {
          data: Object.values(genres),
          backgroundColor: [
            "#ffb347",
            "#b0b8d1",
            "#ff6961",
            "#77dd77",
            "#f49ac2",
            "#aec6cf",
            "#cfcfc4",
            "#836953",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function createYearChart(years) {
  const sortedYears = Object.keys(years).sort();
  const ctx = document.getElementById("yearChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedYears,
      datasets: [
        {
          label: "Nombre",
          data: sortedYears.map((y) => years[y]),
          backgroundColor: "#ffb347",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#fff",
          },
        },
        tooltip: {
          bodyColor: "#fff",
          titleColor: "#fff",
          footerColor: "#fff",
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Année", color: "#fff" },
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          title: { display: true, text: "Nombre", color: "#fff" },
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
          beginAtZero: true,
        },
      },
    },
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchData();
  updateStats(data);
});
