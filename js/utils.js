export function playVideo(src) {
    const overlay = document.getElementById('videoOverlay');
    const player = document.getElementById('mainPlayer');

    if (!src) {
        alert("Vidéo non disponible pour le moment.");
        return;
    }

    player.src = src;
    overlay.classList.remove('hidden');
    setTimeout(() => {
        player.play().catch(e => console.log("Autoplay bloqué par le navigateur", e));
    }, 50);
}

export function closeVideo() {
    const overlay = document.getElementById('videoOverlay');
    const player = document.getElementById('mainPlayer');
    player.pause();
    player.src = "";
    overlay.classList.add('hidden');
}

export function toggleNotifs() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('active');
}

export function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenuPanel');
    const search = document.getElementById('mobileSearchPanel');

    if (search.classList.contains('active')) {
        search.classList.remove('active');
    }

    menu.classList.toggle('active');
}

export function toggleMobileSearch() {
    const search = document.getElementById('mobileSearchPanel');
    const menu = document.getElementById('mobileMenuPanel');

    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    }

    search.classList.toggle('active');

    if (search.classList.contains('active')) {
        document.getElementById('mobileSearchInput').focus();
    }
}

export function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('loader').style.opacity = '1';
}

export function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.classList.add('hidden'), 700);
}