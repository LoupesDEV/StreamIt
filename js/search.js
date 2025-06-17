/**
 * Provides global search functionality across films and series.
 *
 * This module defines logic to capture and process search queries,
 * match them against various fields in the dataset (titles, descriptions, genres, people),
 * and display the results dynamically in the search section of the interface.
 *
 * @module search
 */

/**
 * Handles global search functionality for films and series.
 *
 * Retrieves the user's search query from the input field, normalizes it,
 * and performs a case-insensitive search across titles, descriptions, genres,
 * directors/creators, and actors. Displays matching results in the search section.
 *
 * Automatically navigates to the search section if results are found and it’s not already visible.
 * Clears the result area if the query is empty.
 *
 * @function
 */
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        document.getElementById("searchResults").innerHTML = "";
        return;
    }

    const filmResults = Object.values(filmsData).filter((item) => item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.genres && item.genres.some((genre) => genre.toLowerCase().includes(query))) || (item.directors && item.directors.some((director) => director.toLowerCase().includes(query))) || (item.stars && item.stars.some((star) => star.toLowerCase().includes(query))));

    const seriesResults = Object.values(seriesData).filter((item) => item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.genres && item.genres.some((genre) => genre.toLowerCase().includes(query))) || (item.creators && item.creators.some((creator) => creator.toLowerCase().includes(query))) || (item.stars && item.stars.some((star) => star.toLowerCase().includes(query))));

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
