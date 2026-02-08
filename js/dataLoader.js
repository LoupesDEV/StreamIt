/**
 * js/dataLoader.js
 * Handles loading of data files: films, series, collections, and notifications.
 * @module dataLoader
 */

/**
 * Fetches all necessary data files: films, series, and collections.
 * @returns {Object} An object containing films, series, and collections data.
 */
export async function fetchAllData() {
    try {
        // Simulate loading delay for better UX
        await new Promise(r => setTimeout(r, 800));

        // Fetch all data files in parallel for better performance
        const [filmsRes, seriesRes, collectionsRes, notifsRes, actorsRes] = await Promise.all([
            fetch('data/films.json'),
            fetch('data/series.json'),
            fetch('data/collections.json'),
            fetch('data/notifs.json'),
            fetch('data/actors.json'),
        ]);

        // Validate critical data files (films and series are required)
        if (!filmsRes.ok || !seriesRes.ok) throw new Error("Erreur de chargement des fichiers JSON (Films/Séries)");

        // Parse required data (films and series)
        const films = await filmsRes.json();
        const series = await seriesRes.json();

        // Parse optional data (collections) - gracefully handle missing files
        let collections = {};
        if (collectionsRes.ok) {
            collections = await collectionsRes.json();
        } else {
            console.warn("Fichier collections.json non trouvé ou vide.");
        }

        // Parse optional data (notifications)
        const notifs = notifsRes.ok ? await notifsRes.json() : [];
        if (!notifsRes.ok) {
            console.warn("Fichier notifs.json non trouvé ou vide.");
        }

        // Parse optional data (actors)
        let actors = {};
        if (actorsRes.ok) {
            actors = await actorsRes.json();
        } else {
            console.warn("Fichier actors.json non trouvé ou vide.");
        }

        // Return all loaded data
        return { films, series, collections, notifs, actors };
    } catch (error) {
        console.error("Erreur Data Loader:", error);
        // Return empty objects as fallback on error
        return { films: {}, series: {}, collections: {}, notifs: {}, actors: {} };
    }
}