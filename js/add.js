const typeSelect = document.getElementById("type");
const filmFields = document.getElementById("filmFields");
const seriesFields = document.getElementById("seriesFields");
const seasonsInput = document.getElementById("seasons");
const episodesContainer = document.getElementById("episodesContainer");

function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, null, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "token-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "token-key";
        } else {
          cls = "token-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "token-boolean";
      } else if (/null/.test(match)) {
        cls = "token-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function getInnerJsonString(obj) {
  let json = JSON.stringify(obj, null, 2);
  let lines = json.split("\n");
  if (lines.length > 2) {
    lines = lines.slice(1, -1);
    lines = lines.map((line) => line.replace(/^  /, ""));
  }
  return lines.join("\n");
}

function updateFields() {
  if (typeSelect.value === "film") {
    filmFields.style.display = "block";
    seriesFields.style.display = "none";
  } else if (typeSelect.value === "serie") {
    filmFields.style.display = "none";
    seriesFields.style.display = "block";
  } else {
    filmFields.style.display = "none";
    seriesFields.style.display = "none";
  }
}
typeSelect.addEventListener("change", updateFields);
updateFields();

seasonsInput &&
  seasonsInput.addEventListener("input", function () {
    episodesContainer.innerHTML = "";
    const nbSeasons = parseInt(seasonsInput.value, 10);
    if (isNaN(nbSeasons) || nbSeasons < 1) return;
    for (let s = 1; s <= nbSeasons; s++) {
      const seasonDiv = document.createElement("div");
      seasonDiv.className = "season-block";
      seasonDiv.innerHTML = `
            <h4>Saison ${s}</h4>
            <label>Nombre d'épisodes :</label>
            <input type="number" min="1" class="episodesCount" data-season="${s}" /><br /><br />
            <div class="episodesFields" id="episodesFields${s}"></div>
          `;
      episodesContainer.appendChild(seasonDiv);
    }

    document.querySelectorAll(".episodesCount").forEach((input) => {
      input.addEventListener("input", function () {
        const seasonNum = parseInt(this.getAttribute("data-season"), 10);
        if (isNaN(seasonNum) || seasonNum < 1) return;
        const count = parseInt(this.value, 10);
        const fieldsDiv = document.getElementById(`episodesFields${seasonNum}`);
        fieldsDiv.innerHTML = "";
        if (isNaN(count) || count < 1) return;
        for (let e = 1; e <= count; e++) {
          const episodeLabel = document.createElement("label");
          episodeLabel.textContent = `Titre épisode ${e} :`;
          fieldsDiv.appendChild(episodeLabel);

          const episodeTitleInput = document.createElement("input");
          episodeTitleInput.type = "text";
          episodeTitleInput.name = `season${seasonNum}_episode${e}_title`;
          episodeTitleInput.required = true;
          fieldsDiv.appendChild(episodeTitleInput);

          fieldsDiv.appendChild(document.createElement("br"));

          const descLabel = document.createElement("label");
          descLabel.textContent = `Description épisode ${e} :`;
          fieldsDiv.appendChild(descLabel);

          const episodeDescInput = document.createElement("input");
          episodeDescInput.type = "text";
          episodeDescInput.name = `season${seasonNum}_episode${e}_desc`;
          episodeDescInput.required = true;
          fieldsDiv.appendChild(episodeDescInput);

          fieldsDiv.appendChild(document.createElement("br"));
          fieldsDiv.appendChild(document.createElement("br"));
        }
      });
    });
  });

document.getElementById("addForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const folder = document.getElementById("folder").value;
  const title = document.getElementById("title").value;
  const type = document.getElementById("type").value;
  const year = document.getElementById("year").value;
  const genres = document.getElementById("genres").value;
  const imdb = document.getElementById("imdb").value;
  const note = document.getElementById("note").value;
  const desc = document.getElementById("description").value;

  let data = {
    folder,
    title,
    type,
    year,
    genres,
    imdb,
    note,
    description: desc,
  };

  if (type === "film") {
    data.directors = document.getElementById("directors").value;
    data.writers = document.getElementById("writers").value;
    data.stars = document.getElementById("stars").value;
  } else if (type === "serie") {
    data.directors = document.getElementById("directorsSerie").value;
    data.writers = document.getElementById("writersSerie").value;
    data.stars = document.getElementById("starsSerie").value;
    data.seasons = [];
    const nbSeasons = parseInt(document.getElementById("seasons").value, 10);
    for (let s = 1; s <= nbSeasons; s++) {
      const season = { episodes: [] };
      const episodesCountInput = document.querySelector(
        `.episodesCount[data-season="${s}"]`
      );
      if (!episodesCountInput) continue;
      const nbEpisodes = parseInt(episodesCountInput.value, 10);
      for (let e = 1; e <= nbEpisodes; e++) {
        const epTitle =
          document.querySelector(`[name="season${s}_episode${e}_title"]`)
            ?.value || "";
        const epDesc =
          document.querySelector(`[name="season${s}_episode${e}_desc"]`)
            ?.value || "";
        season.episodes.push({ title: epTitle, description: epDesc });
      }
      data.seasons.push(season);
    }
  }

  document.getElementById("addForm").remove();

  let formatted = {};
  if (type === "film") {
    formatted[title] = {
      title: title,
      description: desc,
      banner: `medias/films/${folder}/${folder}.jpg`,
      IMDb: note ? parseFloat(note) : undefined,
      IMDb_link: imdb ? `${imdb}` : "",
      year: year ? parseInt(year, 10) : undefined,
      genres: genres ? genres.split(",").map((g) => g.trim()) : [],
      directors: data.directors
        ? data.directors.split(",").map((d) => d.trim())
        : [],
      writers: data.writers ? data.writers.split(",").map((w) => w.trim()) : [],
      stars: data.stars ? data.stars.split(",").map((s) => s.trim()) : [],
      video: `medias/films/${folder}/${folder}.mp4`,
    };
  } else if (type === "serie") {
    let seasonsObj = {};
    data.seasons.forEach((season, idx) => {
      const seasonNum = (idx + 1).toString();
      seasonsObj[seasonNum] = season.episodes.map((ep, epIdx) => ({
        title: ep.title,
        desc: ep.description,
        video: `medias/series/${folder}/${seasonNum}-${epIdx + 1}.mp4`,
      }));
    });
    formatted[title] = {
      title: title,
      description: desc,
      banner: `medias/series/${folder}/${folder}.jpg`,
      IMDb: note ? parseFloat(note) : undefined,
      IMDb_link: imdb ? `${imdb}/` : "",
      year: year ? parseInt(year, 10) : undefined,
      genres: genres ? genres.split(",").map((g) => g.trim()) : [],
      creators: data.writers
        ? data.writers.split(",").map((w) => w.trim())
        : [],
      stars: data.stars ? data.stars.split(",").map((s) => s.trim()) : [],
      seasons: seasonsObj,
    };
  }

  const jsonOutput = document.getElementById("jsonOutput");
  const jsonResultDiv = document.getElementById("json-result");
  if (jsonOutput) {
    const innerJson = getInnerJsonString(formatted);
    jsonOutput.innerHTML = syntaxHighlight(innerJson);
    jsonOutput.style.display = "";
    if (jsonResultDiv) {
      jsonResultDiv.style.display = "block";
    }
  }

  const copyBtn = document.getElementById("copyButton");
  if (copyBtn && jsonOutput) {
    copyBtn.onclick = function () {
      navigator.clipboard.writeText(jsonOutput.textContent);
      copyBtn.textContent = "Copié !";
      setTimeout(() => (copyBtn.textContent = "Copier le JSON"), 1500);
    };
  }
});
