/**
 * Initializes the application after the DOM is fully loaded.
 *
 * This module coordinates the startup process, including loading data, setting up event listeners,
 * showing the home section, populating filters, and displaying popular content.
 * It also handles the export and import of watched content to and from localStorage via JSON files.
 * Exported data is downloaded as a file, while imported data is validated and reloaded into the app.
 *
 * @module init
 */

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    setupEventListeners();
    showSection("home");
    populateFilters();
    displayPopularContent();

    const exportBtn = document.getElementById("exportWatchedBtn");
    const importInput = document.getElementById("importWatchedInput");
    if (exportBtn) {
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
