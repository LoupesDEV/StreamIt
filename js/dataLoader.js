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

        const [filmsRes, seriesRes, collectionsRes, notifsRes, actorsRes] = await Promise.all([
            fetch('data/films.json'),
            fetch('data/series.json'),
            fetch('data/collections.json'),
            fetch('data/notifs.json'),
            fetch('data/actors.json'),
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

        const notifs = notifsRes.ok ? await notifsRes.json() : [];
        if (!notifsRes.ok) {
            console.warn("Fichier notifs.json non trouvé ou vide.");
        }

        let actors = {};
        if (actorsRes.ok) {
            actors = await actorsRes.json();
        } else {
            console.warn("Fichier actors.json non trouvé ou vide.");
        }

        return { films, series, collections, notifs, actors };
    } catch (error) {
        console.error("Erreur Data Loader:", error);
        return { films: {}, series: {}, collections: {}, notifs: {}, actors: {} };
    }
}