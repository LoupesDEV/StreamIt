export async function fetchAllData() {
    try {
        await new Promise(r => setTimeout(r, 800));

        const [filmsRes, seriesRes] = await Promise.all([
            fetch('data/films.json'),
            fetch('data/series.json')
        ]);

        if (!filmsRes.ok || !seriesRes.ok) throw new Error("Erreur de chargement des fichiers JSON");

        const films = await filmsRes.json();
        const series = await seriesRes.json();

        return { films, series };
    } catch (error) {
        console.error("Erreur Data Loader:", error);
        return { films: {}, series: {} };
    }
}

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