async function fetchData() {
  const films = await fetch("data/films_data.json")
    .then((r) => r.json())
    .catch(() => []);
  const series = await fetch("data/series_data.json")
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

  const filmsCountEl = document.getElementById("filmsCount");
  const seriesCountEl = document.getElementById("seriesCount");
  const genresCountEl = document.getElementById("genresCount");
  const imdbAvgEl = document.getElementById("imdbAvg");

  if (filmsCountEl) filmsCountEl.textContent = filmsArr.length;
  if (seriesCountEl) seriesCountEl.textContent = seriesArr.length;

  const allItems = [...filmsArr, ...seriesArr];

  const genres = getGenres(allItems);
  if (genresCountEl) genresCountEl.textContent = Object.keys(genres).length;

  if (imdbAvgEl) imdbAvgEl.textContent = getAverageNote(allItems);

  createGenreChart(genres);
  createYearChart(getYears(allItems));
}

let genreChartInstance = null;
function createGenreChart(genres) {
  const chartEl = document.getElementById("genreChart");
  if (!chartEl) return;
  const ctx = chartEl.getContext("2d");

  if (genreChartInstance) {
    genreChartInstance.destroy();
  }

  const baseColors = [
    "#ffb347",
    "#b0b8d1",
    "#ff6961",
    "#77dd77",
    "#f49ac2",
    "#aec6cf",
    "#cfcfc4",
    "#836953",
  ];
  const colorCount = Object.keys(genres).length;
  let backgroundColors = [];
  for (let i = 0; i < colorCount; i++) {
    backgroundColors.push(baseColors[i % baseColors.length]);
  }

  genreChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(genres),
      datasets: [
        {
          data: Object.values(genres),
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyColor: "#fff",
          titleColor: "#fff",
          footerColor: "#fff",
        },
        title: {
          display: false,
        },
      },
      elements: {
        arc: {
          borderWidth: 1,
        },
      },
    },
  });
}

let yearChartInstance = null;
function createYearChart(years) {
  const chartEl = document.getElementById("yearChart");
  if (!chartEl) return;
  const ctx = chartEl.getContext("2d");

  if (yearChartInstance) {
    yearChartInstance.destroy();
  }

  const sortedYears = Object.keys(years)
    .map(Number)
    .sort((a, b) => a - b)
    .map(String);

  yearChartInstance = new Chart(ctx, {
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
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          title: { display: false },
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          title: { display: false },
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.1)" },
          beginAtZero: true,
        },
      },
    },
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchData();
    updateStats(data);
  } catch (e) {
    const statsContainer = document.getElementById("statsContainer");
    if (statsContainer) {
      statsContainer.innerHTML =
        "<div style='color:red'>Erreur lors du chargement des statistiques.</div>";
    }
  }
});

function handleErrorAndRedirect(message) {
  localStorage.setItem("streamit_404_error", message);
  window.location.href = "error.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
});

(function detectDevTools() {
  const start = Date.now();
  debugger;
  if (Date.now() - start > 100) {
    handleErrorAndRedirect(
      "L'utilisation des outils de développement est interdite sur cette page."
    );
  }
  setTimeout(detectDevTools, 1000);
})();
