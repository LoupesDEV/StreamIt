/**
 * @module init
 * @description
 * Initializes the application, sets up event listeners, and loads initial data.
 * Ensures all modules are ready and the UI is interactive on startup.
 */

/**
 * Initializes the application after the DOM is fully loaded.
 *
 * Loads data, sets up event listeners, shows the home section, populates filters,
 * displays popular content, and renders the featured slider.
 * Also manages export and import of watched content via JSON files.
 *
 * @event
 * @param {Event} event - The DOMContentLoaded event.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    setupEventListeners();
    showSection("home");
    populateFilters();
    displayPopularContent();
    renderFeaturedSlider();

    const exportBtn = document.getElementById("exportWatchedBtn");
    const importInput = document.getElementById("importWatchedInput");
    if (exportBtn) {
        /**
         * Handles the click event on the export button to download watched content as a JSON file.
         *
         * @event
         * @param {MouseEvent} event - The click event.
         * @returns {void}
         */
        exportBtn.addEventListener("click", () => {
            const data = localStorage.getItem("watchedContent") || '{"films":{},"series":{}}';
            const blob = new Blob([data], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `StreamIt_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "_")}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    if (importInput) {
        /**
         * Handles the change event on the import input to load watched content from a JSON file.
         *
         * @event
         * @param {Event} event - The change event.
         * @returns {void}
         */
        importInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (evt) {
                try {
                    const imported = JSON.parse(evt.target.result);
                    if (imported.films && imported.series) {
                        localStorage.setItem("watchedContent", JSON.stringify(imported));
                        alert("Progression importée avec succès !");
                        location.reload();
                    } else {
                        alert("Fichier invalide.");
                    }
                } catch {
                    alert("Erreur lors de l'import.");
                }
            };
            reader.readAsText(file);
        });
    }
});
