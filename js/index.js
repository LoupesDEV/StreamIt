async function loadSeriesData() {
  const response = await fetch("series_data.json");
  const data = await response.json();
  renderSeries(data);
}

function renderSeries(seriesData) {
  const seriesList = document.getElementById("series-list");
  seriesList.innerHTML = "";

  for (const series in seriesData) {
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("series");
    seriesDiv.onclick = () =>
      (window.location.href = `series.html?series=${series}`);

    const seriesImage = document.createElement("img");
    seriesImage.src = seriesData[series].banner;

    const seriesInfo = document.createElement("div");
    seriesInfo.classList.add("series-info");

    const seriesTitle = document.createElement("div");
    seriesTitle.classList.add("series-title");
    seriesTitle.innerText = seriesData[series].title;

    const seriesDescription = document.createElement("div");
    seriesDescription.classList.add("series-description");
    seriesDescription.innerText = seriesData[series].description
      ? seriesData[series].description.slice(0, 90) + "..."
      : "Aucune description disponible.";

    seriesInfo.appendChild(seriesTitle);
    seriesInfo.appendChild(seriesDescription);
    seriesDiv.appendChild(seriesImage);
    seriesDiv.appendChild(seriesInfo);
    seriesList.appendChild(seriesDiv);
  }
}

function filterSeries() {
  const searchQuery = document.getElementById("search-bar").value.toLowerCase();
  const seriesList = document.getElementById("series-list");
  const seriesItems = seriesList.getElementsByClassName("series");

  for (let i = 0; i < seriesItems.length; i++) {
    const seriesTitle = seriesItems[i]
      .querySelector(".series-title")
      .innerText.toLowerCase();
    if (seriesTitle.includes(searchQuery)) {
      seriesItems[i].style.display = "block";
    } else {
      seriesItems[i].style.display = "none";
    }
  }
}

loadSeriesData();
