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
      const data =
        localStorage.getItem("watchedContent") || '{"films":{},"series":{}}';
      const blob = new Blob([data], { type: "application/json" });
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
