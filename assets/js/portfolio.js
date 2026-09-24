(() => {
  const endpoint = '/data/portfolio-stats.json';
  fetch(endpoint, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
    .then(stats => {
      apply('chrome-users', stats.chrome?.users);
      apply('firefox-users', stats.firefox?.users);
      const chromeNote = document.querySelector('[data-portfolio-stat-note="chrome-users"]');
      const firefoxNote = document.querySelector('[data-portfolio-stat-note="firefox-users"]');
      if (chromeNote) chromeNote.textContent = 'public store count · cached / auto-updated';
      if (firefoxNote) firefoxNote.textContent = 'public AMO count · cached / auto-updated';
      const updated = document.querySelector('[data-portfolio-stats-updated]');
      if (updated && stats.updatedAt) {
        const d = new Date(stats.updatedAt);
        if (!Number.isNaN(d.valueOf())) updated.textContent = `store snapshot updated ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
      }
    })
    .catch(() => {
      // The numbers already in the HTML are intentional fallbacks.
    });

  document.querySelectorAll('.profile-avatar, .portfolio-project img[src*="dragonfull.jpg"]').forEach(img => {
    img.addEventListener('error', () => {
      img.src = '/assets/icons/profile-512.png';
    }, { once: true });
  });

  function apply(key, value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return;
    document.querySelectorAll(`[data-portfolio-stat="${key}"]`).forEach(el => el.textContent = Number(value).toLocaleString());
  }
})();
