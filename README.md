<div align="center">
    <img src="medias/README/header.png">
</div>

<h1 align="center">StreamIt</h1>

<div align="center">
    <p>Application web moderne pour organiser, explorer et regarder vos films et séries préférés en toute simplicité.</p>
    <img src="https://m3-markdown-badges.vercel.app/stars/9/3/LoupesDEV/StreamIt">
    <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/HTML/html3.svg">
    <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/CSS/css3.svg">
    <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/Javascript/javascript3.svg">
    <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/JSON/json3.svg">
</div>

<br>

## Table des matières

- [Comment utiliser StreamIt](#comment-utiliser-streamit)
- [Fonctionnalités](#fonctionnalités)
- [Démo](#démo)
- [Contributeurs](#contributeurs)
- [Structure du projet](#structure-du-projet)

# Comment utiliser StreamIt

Pour commencer avec StreamIt, suivez ces étapes simples:

1. **Cloner le dépôt**

   Téléchargez le projet en clonant le dépôt Git:
   ```bash
   git clone https://github.com/LoupesDEV/StreamIt.git
   ```

2. **Lancer un serveur local**

   Accédez au dossier cloné, puis lancez un serveur local pour servir les fichiers. Par exemple:
    - Avec **VSCode**: faites un clic droit sur `index.html` et sélectionnez **Open with Live Server** (extension
      recommandée).
    - Avec **Python**:
      ```bash
      python3 -m http.server 8000
      ```

3. **Ouvrir l’application dans le navigateur**

   Rendez-vous sur [http://localhost:8000](http://localhost:8000) pour accéder à StreamIt.

> 💡 *Aucune installation supplémentaire n’est requise: StreamIt fonctionne directement dans votre navigateur!*

> *Note bonus* : Tous les films et séries présents sont issus de ma base de données personnelle, mais vous pouvez facilement ajouter vos propres contenus en modifiant les fichiers JSON du dossier `data/`.
> Pour disposer de la même bibliothèque que moi, prévoyez environ 1,5 To de stockage pour l’ensemble des films et séries.

# Fonctionnalités

- **Gestion complète du contenu** 🎞️ : Parcourez et gérez facilement vos films et séries préférés grâce à des fiches détaillées (description, genres, note IMDb, créateurs, réalisateurs, acteurs).
- **Chargement dynamique des données** 📊 : Profitez d'une interface réactive où les informations se mettent à jour en temps réel, sans rechargement de page.
- **Lecteur vidéo intégré** 🎥 : Regardez vos films et épisodes directement dans l’application avec un lecteur moderne, des contrôles intuitifs et une reprise rapide de la lecture.
- **Recherche intelligente** 🔍 : Accédez instantanément à n'importe quel contenu grâce à une barre de recherche puissante disponible dès l'accueil.
- **Navigation intuitive** 🧭 : Passez facilement d’un contenu à l’autre ou revenez à l’accueil via une interface fluide et ergonomique.
- **Design adaptatif** 📱💻 : Bénéficiez d’une expérience optimale sur tous vos appareils (ordinateur, tablette, mobile) grâce à une mise en page responsive.
- **Ajout de contenu simplifié** 📝 : Enrichissez votre bibliothèque en quelques clics grâce à des formulaires dédiés à l’ajout de nouveaux films ou séries.
- **Import/Export des informations de visionnage** 🔄 : Exportez ou importez facilement votre historique, vos épisodes vus, minutages et autres données pour migrer ou synchroniser vos informations entre différents appareils.

# Démo

Vous pouvez tester l'application [ici](https://www.matheo-pichotmoise.fr/StreamIt).

<div align="center">
    <table>
        <tr>
            <td><img src="medias/README/accueil.png" alt="Page d'accueil"/></td>
            <td><img src="medias/README/watching.png" alt="Page de lecture"/></td>
        </tr>
        <tr>
            <td><img src="medias/README/films.png" alt="Page des films"/></td>
            <td><img src="medias/README/films_info.png" alt="Page d'information des films"/></td>
        </tr>
        <tr>
            <td><img src="medias/README/series.png" alt="Page des séries"/></td>
            <td><img src="medias/README/series_info.png" alt="Page d'information des séries"/></td>
        <tr>
            <td><img src="medias/README/stats.png" alt="Page des statistiques"/></td>
            <td><img src="medias/README/add.png" alt="Page d'ajout"/></td>
        </tr>
    </table>
</div>

# Structure du projet

Le projet est organisé de la manière suivante:

```
StreamIt/
├── index.html                # Page principale l'application
├── error.html                # Page d'erreur (404)
├── css/                      # Dossier contenant les fichiers CSS
├── js/                       # Dossier contenant les fichiers JavaScript
├── medias/                   # Dossier contenant les médias (images, vidéos, etc.)
│   ├── films/                # Dossier pour les images des films
│   ├── series/               # Dossier pour les images des séries
│   └── README/               # Dossier pour les images du README
├── data/                     # Dossier contenant les données JSON
│   ├── films_data.json       # Données des films
│   └── series_data.json      # Données des séries
├── README.md                 # Documentation du projet
├── CONTRIBUTING.md           # Guide de contribution
├── CODE_OFCONDUCT.md         # Code de conduite pour les contributeurs
├── jsdoc.json                # Configuration pour JSDoc
├── .gitignore                # Fichier pour ignorer certains fichiers dans Git
└── LICENSE                   # Fichier de licence
```

# Contributeurs

Merci aux personnes et ressources ayant contribué au projet:

- [LoupesDEV](https://github.com/LoupesDEV) — Développement principal, conception et maintenance.
- [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) —
  Sécurité et bonnes pratiques.

Vous souhaitez contribuer ? Consultez le [guide de contribution](CONTRIBUTING.md) ou ouvrez une *issue* pour proposer
des améliorations.

<p align="center">
    <img alt="Footer" src="https://i.imgur.com/9Ojjug7.png">
    <br><br>
    <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/LicenceGPLv3/licencegplv33.svg">
</p>
