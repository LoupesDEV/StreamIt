async function loadData() {
    try {
        const filmsResponse = await fetch('data/films_data.json');
        filmsData = await filmsResponse.json();

        const seriesResponse = await fetch('data/series_data.json');
        seriesData = await seriesResponse.json();

        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showNoResults('Erreur de chargement des données');
    }
}