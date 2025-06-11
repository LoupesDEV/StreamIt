function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    document.getElementById("searchResults").innerHTML = "";
    return;
  }

  const filmResults = Object.values(filmsData).filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.genres &&
        item.genres.some((genre) => genre.toLowerCase().includes(query))) ||
      (item.directors &&
        item.directors.some((director) =>
          director.toLowerCase().includes(query)
        )) ||
      (item.stars &&
        item.stars.some((star) => star.toLowerCase().includes(query)))
  );

  const seriesResults = Object.values(seriesData).filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.genres &&
        item.genres.some((genre) => genre.toLowerCase().includes(query))) ||
      (item.creators &&
        item.creators.some((creator) =>
          creator.toLowerCase().includes(query)
        )) ||
      (item.stars &&
        item.stars.some((star) => star.toLowerCase().includes(query)))
  );

  const allResults = [...filmResults, ...seriesResults];

  if (currentSection === "search") {
    displayContent(allResults, "searchResults");
  }

  if (currentSection !== "search" && allResults.length > 0) {
    showSection("search");
    setActiveNavLink(document.querySelector('[data-section="search"]'));
    displayContent(allResults, "searchResults");
  }
}
