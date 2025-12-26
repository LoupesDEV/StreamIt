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
        await new Promise(r => setTimeout(r, 800));

        const [filmsRes, seriesRes, collectionsRes] = await Promise.all([
            fetch('data/films.json'),
            fetch('data/series.json'),
            fetch('data/collections.json')
        ]);

        if (!filmsRes.ok || !seriesRes.ok) throw new Error("Erreur de chargement des fichiers JSON (Films/Séries)");

        const films = await filmsRes.json();
        const series = await seriesRes.json();

        let collections = {};
        if (collectionsRes.ok) {
            collections = await collectionsRes.json();
        } else {
            console.warn("Fichier collections.json non trouvé ou vide.");
        }

        return { films, series, collections };
    } catch (error) {
        console.error("Erreur Data Loader:", error);
        return { films: {}, series: {}, collections: {} };
    }
}

/**
 * Fetches notifications data.
 * @returns {Array} An array of notifications.
 */
export async function fetchNotifs() {
    try {
        const res = await fetch('data/notifs.json');
        if (!res.ok) throw new Error("Erreur notifs");
        return await res.json();
    } catch (error) {
        console.warn("Impossible de charger les notifications");
        return [];
    }
}