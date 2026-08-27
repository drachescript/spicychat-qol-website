(async () => {
  const header = document.querySelector('[data-header]');
  if (header) {
    const f = () => header.classList.toggle('scrolled', scrollY > 10);
    f(); addEventListener('scroll', f, { passive: true });
  }

  const btn = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }));
  }

  document.querySelectorAll('[data-year]').forEach(n => n.textContent = new Date().getFullYear());

  const cfg = await SQOLSource.config();
  document.querySelectorAll('[data-stable-version]').forEach(n => n.textContent = cfg.stableVersion);
  document.querySelectorAll('[data-demo-snapshot-version]').forEach(n => n.textContent = cfg.demoDevSnapshotVersion);

  const [chromeDev, firefoxDev] = await Promise.all([
    SQOLSource.chromeDevLatest(),
    SQOLSource.firefoxDevLatest()
  ]);
  document.querySelectorAll('[data-chrome-dev-version], [data-dev-version]').forEach(n => n.textContent = chromeDev.version || cfg.chromeDevVersion);
  document.querySelectorAll('[data-firefox-dev-version]').forEach(n => n.textContent = firefoxDev.version || cfg.firefoxDevVersion);
  document.querySelectorAll('[data-firefox-dev-source]').forEach(n => {
    n.textContent = firefoxDev.source === 'fallback' ? 'cached site value' : 'live Mozilla Add-ons data';
  });

  try {
    const a = await SQOLSource.androidLatest();
    if (a.available) document.querySelectorAll('[data-android-version]').forEach(n => n.textContent = a.versionName || a.tagName || 'Available');
  } catch (_) {}

  // Repository readiness labels. These flip automatically when the real root files appear.
  if (document.querySelector('[data-repo-state]')) {
    const checks = {
      stable: ['features.md', '/data/fallback/stable/features.md'],
      dev: ['features.md', '/data/fallback/dev/features.md'],
      android: ['CHANGELOG.md', '/data/fallback/android-CHANGELOG.md']
    };
    await Promise.all(Object.entries(checks).map(async ([project, [file, fallback]]) => {
      let source = 'fallback';
      try { source = (await SQOLSource.text(project, file, fallback)).source; } catch (_) {}
      document.querySelectorAll(`[data-repo-state="${project}"]`).forEach(el => {
        const live = source !== 'fallback';
        el.className = `repo-state ${live ? 'live' : 'pending'}`;
        el.textContent = live
          ? `${project === 'dev' ? 'DEV' : project === 'stable' ? 'Stable' : 'Android'} root project files are live on GitHub.`
          : `${project === 'dev' ? 'DEV' : project === 'stable' ? 'Stable' : 'Android'} repository is staged, but the full root project files are not uploaded yet.`;
      });
    }));
  }

  // Global project / compatibility notice.
  try {
    const s = await fetch('/data/site-status.json', { cache: 'no-store' }).then(r => r.json());
    const host = document.querySelector('[data-global-notice]');
    const item = s.incident?.enabled ? s.incident : s.announcement?.enabled ? s.announcement : null;
    if (host && item) {
      host.hidden = false;
      host.innerHTML = `<div class="global-notice ${s.incident?.enabled ? 'incident' : ''}"><strong>${escapeHTML(item.label || 'Update')}</strong><p><b>${escapeHTML(item.title)}</b> ${escapeHTML(item.text)}</p><a href="${item.href || '/status/'}">More →</a></div>`;
    }
  } catch (_) {}

  // Homepage overview: use the DEV features file because it represents the current feature direction.
  if (document.querySelector('[data-home-features]')) {
    try {
      const r = await SQOLSource.text('dev', 'features.md', '/data/fallback/dev/features.md');
      const parsed = SQOLMarkdown.sections(r.text);
      const wanted = parsed.sections.filter(s => !/planned|fresh-install/i.test(s.title)).slice(0, 8);
      const html = wanted.map(s => {
        const first = s.lines.map(x => x.match(/^\s*[-*]\s+(.+)/)?.[1]).find(Boolean) || '';
        return `<article class="overview-item"><span class="dot"></span><div><strong>${SQOLMarkdown.inline(s.title)}</strong>${first ? `<p>${SQOLMarkdown.inline(first)}</p>` : ''}</div></article>`;
      }).join('');
      document.querySelectorAll('[data-home-features]').forEach(h => h.innerHTML = html || '<div class="loading-card">Feature list is being prepared.</div>');
    } catch (_) {}
  }

  // Full Stable / DEV feature browser.
  if (document.querySelector('[data-features-browser]')) {
    await renderFeatureBrowser();
  } else if (document.querySelector('[data-features-content]')) {
    // Smaller DEV feature preview used on product pages.
    try {
      const r = await SQOLSource.text('dev', 'features.md', '/data/fallback/dev/features.md');
      setSource('features', r.source, 'DEV');
      const p = SQOLMarkdown.sections(r.text);
      const html = p.sections.filter(s => !/planned/i.test(s.title)).map(s => `<section class="markdown-section" id="${slug(s.title)}"><h2>${SQOLMarkdown.inline(s.title)}</h2>${SQOLMarkdown.render(s.lines.join('\n'))}</section>`).join('');
      document.querySelectorAll('[data-features-content]').forEach(h => h.innerHTML = html);
    } catch (_) {
      document.querySelectorAll('[data-features-content]').forEach(h => h.innerHTML = '<div class="loading-card">Could not load features right now.</div>');
    }
  }

  // DEV changelog. Once the DEV root CHANGELOG exists, this becomes fully live automatically.
  if (document.querySelector('[data-changelog-content]')) {
    try {
      const r = await SQOLSource.text('dev', 'CHANGELOG.md', '/data/fallback/dev/CHANGELOG.md');
      setSource('changelog', r.source, 'DEV changelog');
      renderReleases(document.querySelector('[data-changelog-content]'), r.text);
    } catch (_) {}
  }

  // Android root information.
  if (document.querySelector('[data-android-readme]')) {
    let r;
    try { r = await SQOLSource.text('android', 'README.md', '/data/fallback/android-CHANGELOG.md'); } catch (_) {}
    // The Android repo currently has a one-line placeholder README. Treat that as a placeholder,
    // not as more useful content than the bundled Android development notes.
    if (r && r.source !== 'fallback' && r.text.replace(/[#\s]/g, '').length < 45) {
      try {
        const fr = await fetch('/data/fallback/android-CHANGELOG.md', { cache: 'no-store' });
        if (fr.ok) r = { text: await fr.text(), source: 'fallback' };
      } catch (_) {}
    }
    if (r) {
      setSource('android', r.source, 'Android');
      document.querySelector('[data-android-readme]').innerHTML = SQOLMarkdown.render(r.text);
    }
  }

  if (document.querySelector('[data-android-changelog-content]')) {
    let r;
    try { r = await SQOLSource.text('android', 'CHANGELOG.md', '/data/fallback/android-CHANGELOG.md'); } catch (_) {}
    if (r) {
      setSource('android-changelog', r.source, 'Android changelog');
      renderReleases(document.querySelector('[data-android-changelog-content]'), r.text, true);
    }
  }

  const search = document.querySelector('[data-changelog-search]');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.release').forEach(el => el.classList.toggle('hidden', q && !el.textContent.toLowerCase().includes(q)));
    });
  }

  async function renderFeatureBrowser() {
    const host = document.querySelector('[data-features-browser]');
    const stableState = document.querySelector('[data-source-state="stable-features"]');
    const devState = document.querySelector('[data-source-state="dev-features"]');
    let stable, dev;
    try { stable = await SQOLSource.text('stable', 'features.md', '/data/fallback/stable/features.md'); } catch (_) {}
    try { dev = await SQOLSource.text('dev', 'features.md', '/data/fallback/dev/features.md'); } catch (_) {}

    if (stableState && stable) applySourceState(stableState, stable.source, 'Stable');
    if (devState && dev) applySourceState(devState, dev.source, 'DEV');
    if (!stable || !dev) { host.innerHTML = '<div class="loading-card">Could not load the feature sources.</div>'; return; }

    const stableSections = SQOLMarkdown.sections(stable.text).sections;
    const devSections = SQOLMarkdown.sections(dev.text).sections;
    const planned = devSections.filter(s => /planned/i.test(s.title));
    const devCurrent = devSections.filter(s => !/planned/i.test(s.title));

    host.innerHTML = `
      <div class="feature-pane" data-feature-pane="stable">${renderFeatureSet(stableSections, 'stable')}</div>
      <div class="feature-pane" data-feature-pane="dev" hidden>${renderFeatureSet(devCurrent, 'dev')}</div>
      <div class="feature-pane" data-feature-pane="planned" hidden>${renderFeatureSet(planned, 'planned')}</div>`;

    document.querySelectorAll('[data-feature-mode]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.featureMode;
      document.querySelectorAll('[data-feature-mode]').forEach(b => b.classList.toggle('active', b === button));
      host.querySelectorAll('[data-feature-pane]').forEach(p => p.hidden = p.dataset.featurePane !== mode);
    }));
  }

  function renderFeatureSet(sections, kind) {
    if (!sections.length) return '<div class="loading-card">Nothing is listed here yet.</div>';
    return `<div class="markdown-sections">${sections.map(s => `<section class="markdown-section feature-section" id="${kind}-${slug(s.title)}"><div class="feature-section-head"><h2>${SQOLMarkdown.inline(s.title)}</h2><span class="badge ${kind === 'stable' ? 'good' : kind === 'planned' ? 'quiet' : 'warn'}">${kind}</span></div>${SQOLMarkdown.render(s.lines.join('\n'))}</section>`).join('')}</div>`;
  }

  function renderReleases(host, md) {
    const secs = SQOLMarkdown.versionSections(md);
    if (!secs.length) { host.innerHTML = `<article class="markdown-article">${SQOLMarkdown.render(md)}</article>`; return; }
    host.innerHTML = secs.map((s, i) => {
      const id = slug(s.title);
      const isVersion = /^v?\d+(\.\d+)+/.test(s.title);
      return `<details class="release" id="${id}" ${i === 0 ? 'open' : ''}><summary><span>${SQOLMarkdown.inline(s.title)}</span>${isVersion ? '<span class="badge quiet">version</span>' : ''}</summary><div class="release-body">${SQOLMarkdown.render(s.lines.join('\n'))}</div></details>`;
    }).join('');
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el && el.tagName === 'DETAILS') el.open = true;
    }
  }

  function setSource(key, source, label = 'Source') {
    const el = document.querySelector(`[data-source-state="${key}"]`);
    if (el) applySourceState(el, source, label);
  }

  function applySourceState(el, source, label) {
    const live = source !== 'fallback';
    el.className = `source-state ${live ? 'live' : 'fallback'}`;
    el.textContent = live
      ? `${label} loaded from the live repository.`
      : `${label} root files are not uploaded yet — showing the bundled site snapshot.`;
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/^v/, 'v-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
})();
