/**
 * @module add
 * @description
 * Handles the addition of new films and series via a form interface.
 * Manages dynamic form fields, collects and formats input data,
 * and generates JSON output for new media entries.
 */

const typeSelect = document.getElementById("type-add");
const filmFields = document.getElementById("filmFields-add");
const seriesFields = document.getElementById("seriesFields-add");
const seasonsInput = document.getElementById("seasons-add");
const episodesContainer = document.getElementById("episodesContainer-add");

/**
 * Applies syntax highlighting to a JSON string for display in HTML.
 *
 * @param {Object|string} json - The JSON object or string to highlight.
 * @returns {string} The HTML string with syntax highlighting.
 */
function syntaxHighlight(json) {
    if (typeof json != "string") {
        json = JSON.stringify(json, null, 2);
    }
    json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
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
    });
}

/**
 * Extracts and returns the inner content of a JSON object as a formatted string,
 * removing the outermost braces and adjusting indentation.
 *
 * @param {Object} obj - The JSON object to process.
 * @returns {string} The formatted inner JSON string.
 */
function getInnerJsonString(obj) {
    let json = JSON.stringify(obj, null, 2);
    let lines = json.split("\n");
    if (lines.length > 2) {
        lines = lines.slice(1, -1);
        lines = lines.map((line) => line.replace(/^ {2}/, ""));
    }
    return lines.join("\n");
}

/**
 * Updates the visibility of form fields based on the selected media type.
 * Shows or hides film and series fields accordingly.
 *
 * @returns {void}
 */
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

/**
 * Handles the input event on the seasons input field.
 * Dynamically generates season and episode input fields based on the number of seasons.
 *
 * @param {Event} event - The input event.
 * @returns {void}
 */
seasonsInput && seasonsInput.addEventListener("input", function () {
    episodesContainer.innerHTML = "";
    const nbSeasons = parseInt(seasonsInput.value, 10);
    if (isNaN(nbSeasons) || nbSeasons < 1) return;
    for (let s = 1; s <= nbSeasons; s++) {
        const seasonDiv = document.createElement("div");
        seasonDiv.className = "season-block-add";
        seasonDiv.innerHTML = `
            <h4>Saison ${s}</h4>
            <label>Nombre d'épisodes :</label>
            <input type="number" min="1" class="episodesCount-add" data-season="${s}" /><br /><br />
            <div class="add-episodesFields" id="add-episodesFields${s}"></div>
          `;
        episodesContainer.appendChild(seasonDiv);
    }

    document.querySelectorAll(".episodesCount-add").forEach((input) => {
        /**
         * Handles the input event on the episode count input fields.
         * Dynamically generates episode title and description fields for each episode.
         *
         * @param {Event} event - The input event.
         * @returns {void}
         */
        input.addEventListener("input", function () {
            const seasonNum = parseInt(this.getAttribute("data-season"), 10);
            if (isNaN(seasonNum) || seasonNum < 1) return;
            const count = parseInt(this.value, 10);
            const fieldsDiv = document.getElementById(`add-episodesFields${seasonNum}`);
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

/**
 * Handles the form submission event.
 * Collects form data, formats it as JSON, displays the result, and sets up the copy button.
 *
 * @param {Event} event - The submit event.
 * @returns {void}
 */
document.getElementById("addForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const folder = document.getElementById("folder-add").value;
    const title = document.getElementById("title-add").value;
    const type = document.getElementById("type-add").value;
    const year = document.getElementById("year-add").value;
    const genres = document.getElementById("genres-add").value;
    const trailer = document.getElementById("trailer-add").value;
    const imdb = document.getElementById("imdb-add").value;
    const note = document.getElementById("note-add").value;
    const desc = document.getElementById("description-add").value;

    let data = {
        folder, title, type, year, genres, trailer, imdb, note, description: desc,
    };

    if (type === "film") {
        data.directors = document.getElementById("directors-add").value;
        data.writers = document.getElementById("writers-add").value;
        data.stars = document.getElementById("stars-add").value;
    } else if (type === "serie") {
        data.directors = document.getElementById("directorsSerie-add").value;
        data.writers = document.getElementById("writersSerie-add").value;
        data.stars = document.getElementById("starsSerie-add").value;
        data.seasons = [];
        const nbSeasons = parseInt(document.getElementById("seasons-add").value, 10);
        for (let s = 1; s <= nbSeasons; s++) {
            const season = {episodes: []};
            const episodesCountInput = document.querySelector(`.episodesCount-add[data-season="${s}"]`);
            if (!episodesCountInput) continue;
            const nbEpisodes = parseInt(episodesCountInput.value, 10);
            for (let e = 1; e <= nbEpisodes; e++) {
                const epTitle = document.querySelector(`[name="season${s}_episode${e}_title"]`)?.value || "";
                const epDesc = document.querySelector(`[name="season${s}_episode${e}_desc"]`)?.value || "";
                season.episodes.push({title: epTitle, description: epDesc});
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
            directors: data.directors ? data.directors.split(",").map((d) => d.trim()) : [],
            writers: data.writers ? data.writers.split(",").map((w) => w.trim()) : [],
            stars: data.stars ? data.stars.split(",").map((s) => s.trim()) : [],
            trailer: trailer,
            video: `medias/films/${folder}/${folder}.mp4`,
        };
    } else if (type === "serie") {
        let seasonsObj = {};
        data.seasons.forEach((season, idx) => {
            const seasonNum = (idx + 1).toString();
            seasonsObj[seasonNum] = season.episodes.map((ep, epIdx) => ({
                title: ep.title, desc: ep.description, video: `medias/series/${folder}/${seasonNum}-${epIdx + 1}.mp4`,
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
            creators: data.writers ? data.writers.split(",").map((w) => w.trim()) : [],
            stars: data.stars ? data.stars.split(",").map((s) => s.trim()) : [],
            trailer: trailer,
            seasons: seasonsObj,
        };
    }

    const jsonOutput = document.getElementById("jsonOutput-add");
    const jsonResultDiv = document.getElementById("json-result-add");
    if (jsonOutput) {
        const innerJson = getInnerJsonString(formatted);
        jsonOutput.innerHTML = syntaxHighlight(innerJson);
        jsonOutput.style.display = "";
        if (jsonResultDiv) {
            jsonResultDiv.style.display = "block";
        }
    }

    const copyBtn = document.getElementById("copyButton-add");
    if (copyBtn && jsonOutput) {
        copyBtn.onclick = function () {
            navigator.clipboard.writeText(jsonOutput.textContent);
            copyBtn.textContent = "Copié !";
            setTimeout(() => (copyBtn.textContent = "Copier le JSON"), 1500);
        };
    }
});