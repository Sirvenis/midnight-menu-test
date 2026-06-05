const CACHE_NAME = 'midnight-menu-v4';
const APP_SHELL = [
  "./",
  "./index.html?v=4",
  "./styles.css?v=4",
  "./app.js?v=4",
  "./data/case-midnight-menu.json",
  "./manifest.webmanifest?v=4",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/characters/arthur-spoon.png",
  "./assets/characters/bianca-brulee.png",
  "./assets/characters/celeste-saffron.png",
  "./assets/characters/dahlia-plate.png",
  "./assets/characters/gordon-glaze.png",
  "./assets/characters/marcel-pepperidge.png",
  "./assets/characters/mina-mise.png",
  "./assets/characters/rufus-kale.png",
  "./assets/scenes/back-hallway.png",
  "./assets/scenes/dining-room.png",
  "./assets/scenes/kitchen.png",
  "./assets/scenes/private-plating.png",
  "./assets/scenes/title.png",
  "./assets/scenes/voss-office.png",
  "./assets/scenes/wine-cellar.png",
  "./assets/clues/arthur-coded-ledger.png",
  "./assets/clues/bb-black-book-page.png",
  "./assets/clues/bianca-handwriting-match.png",
  "./assets/clues/bitter-almond-ganache-trace.png",
  "./assets/clues/celeste-investor-threat.png",
  "./assets/clues/cellar-service-key.png",
  "./assets/clues/chefs-portion-note.png",
  "./assets/clues/critic-kitchen-pass.png",
  "./assets/clues/dahlia-edited-clip.png",
  "./assets/clues/dahlia-restored-video.png",
  "./assets/clues/gordon-recipe-theft-motive.png",
  "./assets/clues/marcel-seating-plan.png",
  "./assets/clues/million-dollar-dessert-sale.png",
  "./assets/clues/mina-saw-bianca.png",
  "./assets/clues/missing-black-recipe-book.png",
  "./assets/clues/moonless-torte-theft.png",
  "./assets/clues/rewritten-dessert-ticket.png",
  "./assets/clues/rufus-bribery-page.png",
  "./assets/clues/voss-interrupted-toast.png"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html?v=4')))
  );
});
