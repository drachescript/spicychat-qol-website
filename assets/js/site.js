(async () => {
  const header = document.querySelector('[data-header]');
  if (header) {
    const update = () => header.classList.toggle('scrolled', scrollY > 10);
    update(); addEventListener('scroll', update, { passive: true });
  }

  const menu = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
    }));
  }

  document.querySelectorAll('[data-year]').forEach(n => n.textContent = new Date().getFullYear());

  const cfg = await SQOLSource.config();
  document.querySelectorAll('[data-stable-version]').forEach(n => n.textContent = cfg.stableVersion);
  document.querySelectorAll('[data-discord-bot-version]').forEach(n => n.textContent = cfg.discordBotVersion || '');
  document.querySelectorAll('[data-current-milestone]').forEach(n => n.textContent = cfg.currentMilestone || '');
  document.querySelectorAll('[data-public-bots-href]').forEach(n => n.href = cfg.publicBotsUrl);
  document.querySelectorAll('[data-stable-chrome-href]').forEach(n => n.href = cfg.stableChromeStore);
  document.querySelectorAll('[data-stable-firefox-href]').forEach(n => n.href = cfg.stableFirefoxStore);
  document.querySelectorAll('[data-legacy-chrome-href]').forEach(n => n.href = cfg.legacyChromeStore);
  document.querySelectorAll('[data-stable-release-href]').forEach(n => n.href = cfg.stableReleaseUrl);
  document.querySelectorAll('[data-dev-release-href]').forEach(n => n.href = cfg.devReleaseUrl);
  document.querySelectorAll('[data-main-repo-href]').forEach(n => n.href = cfg.stableRepo);
  document.querySelectorAll('[data-android-repo-href]').forEach(n => n.href = cfg.androidRepo);

  const [stable, dev, android] = await Promise.all([
    SQOLSource.stableLatest().catch(() => ({ version: cfg.stableVersion, source: 'fallback' })),
    SQOLSource.developmentLatest().catch(() => ({ available: true, label: 'Development build', source: 'fallback' })),
    SQOLSource.androidLatest().catch(() => ({ available: false, sourcePublic: true }))
  ]);

  document.querySelectorAll('[data-stable-version]').forEach(n => n.textContent = stable.version || cfg.stableVersion);
  if (stable.releaseUrl) document.querySelectorAll('[data-stable-release-href]').forEach(n => n.href = stable.releaseUrl);
  document.querySelectorAll('[data-stable-published]').forEach(n => n.textContent = formatDate(stable.publishedAt) || 'current release');
  document.querySelectorAll('[data-dev-build]').forEach(n => n.textContent = dev.label || 'Development build');
  document.querySelectorAll('[data-dev-commit]').forEach(n => n.textContent = dev.referenceCommit || 'latest main');
  document.querySelectorAll('[data-dev-published]').forEach(n => n.textContent = formatDateTime(dev.publishedAt || dev.lastBuild) || 'updated from main');
  if (dev.releaseUrl) document.querySelectorAll('[data-dev-release-href]').forEach(n => n.href = dev.releaseUrl);

  document.querySelectorAll('[data-android-version]').forEach(n => {
    n.textContent = android.available ? (android.versionName || android.tagName || 'Available') : 'Public APK pending';
  });
  document.querySelectorAll('[data-android-download]').forEach(n => {
    if (android.available && (android.apkUrl || android.releaseUrl)) {
      n.href = android.apkUrl || android.releaseUrl;
      n.textContent = android.apkUrl ? 'Download APK' : 'Open Android release';
      n.hidden = false;
    } else {
      n.hidden = true;
    }
  });

  // Repository state labels now reflect public/open-source sources.
  if (document.querySelector('[data-repo-state]')) {
    const checks = {
      stable: ['README.md', '/data/fallback/stable/README.md', `Release source (${stable.tagName || `v${stable.version || cfg.stableVersion}`})`],
      dev: ['README.md', '/data/fallback/dev/README.md', 'Development source (main branch)'],
      android: ['README.md', '/data/fallback/android/README.md', 'Android wrapper source']
    };
    await Promise.all(Object.entries(checks).map(async ([project, [file, fallback, label]]) => {
      let source = 'fallback';
      try { source = (await SQOLSource.text(project, file, fallback)).source; } catch (_) {}
      document.querySelectorAll(`[data-repo-state="${project}"]`).forEach(el => {
        el.className = `repo-state ${source === 'fallback' ? 'pending' : 'live'}`;
        el.textContent = source === 'fallback'
          ? `${label} is public; GitHub could not be reached just now, so this page is using its bundled snapshot.`
          : `${label} is live on GitHub.`;
      });
    }));
  }

  // Global release/incident banner.
  try {
    const s = await fetch('/data/site-status.json', { cache: 'no-store' }).then(r => r.json());
    const host = document.querySelector('[data-global-notice]');
    const item = s.incident?.enabled ? s.incident : s.announcement?.enabled ? s.announcement : null;
    if (host && item) {
      host.hidden = false;
      host.innerHTML = `<div class="global-notice ${s.incident?.enabled ? 'incident' : ''}"><strong>${esc(item.label || 'Update')}</strong><p><b>${esc(item.title)}</b> ${esc(item.text)}</p><a href="${item.href || '/status/'}">More →</a></div>`;
    }
  } catch (_) {}

  // Homepage feature overview follows the current stable release.
  if (document.querySelector('[data-home-features]')) {
    try {
      const r = await SQOLSource.text('stable', 'features.md', '/data/fallback/stable/features.md');
      const parsed = SQOLMarkdown.sections(r.text);
      const wanted = parsed.sections.filter(s => !/planned|history|^v?\d+\.\d+\.\d+$/i.test(s.title)).slice(0, 8);
      const html = wanted.map(s => {
        const first = s.lines.map(x => x.match(/^\s*[-*]\s+(.+)/)?.[1]).find(Boolean) || '';
        return `<article class="overview-item"><span class="dot"></span><div><strong>${SQOLMarkdown.inline(s.title)}</strong>${first ? `<p>${SQOLMarkdown.inline(first)}</p>` : ''}</div></article>`;
      }).join('');
      document.querySelectorAll('[data-home-features]').forEach(h => h.innerHTML = html || '<div class="loading-card">Feature list is temporarily unavailable.</div>');
    } catch (_) {}
  }

  if (document.querySelector('[data-features-browser]')) await renderFeatureBrowser();

  if (document.querySelector('[data-features-content]')) {
    try {
      const r = await SQOLSource.text('dev', 'features.md', '/data/fallback/dev/features.md');
      setSource('features', r.source, 'Development feature list');
      const p = SQOLMarkdown.sections(r.text);
      const html = p.sections.filter(s => !/planned|^v?\d+\.\d+\.\d+$/i.test(s.title)).map(s => `<section class="markdown-section" id="${slug(s.title)}"><h2>${SQOLMarkdown.inline(s.title)}</h2>${SQOLMarkdown.render(s.lines.join('\n'))}</section>`).join('');
      document.querySelectorAll('[data-features-content]').forEach(h => h.innerHTML = html);
    } catch (_) {
      document.querySelectorAll('[data-features-content]').forEach(h => h.innerHTML = '<div class="loading-card">Could not load features right now.</div>');
    }
  }

  if (document.querySelector('[data-changelog-content]')) {
    try {
      const r = await SQOLSource.text('dev', 'CHANGELOG.md', '/data/fallback/dev/CHANGELOG.md');
      setSource('changelog', r.source, 'Extension changelog');
      renderReleases(document.querySelector('[data-changelog-content]'), r.text);
    } catch (_) {
      document.querySelector('[data-changelog-content]').innerHTML = '<div class="loading-card">Could not load the extension changelog.</div>';
    }
  }

  if (document.querySelector('[data-android-readme]')) {
    try {
      const r = await SQOLSource.text('android', 'README.md', '/data/fallback/android/README.md');
      setSource('android', r.source, 'Android source');
      document.querySelector('[data-android-readme]').innerHTML = SQOLMarkdown.render(r.text);
    } catch (_) {}
  }

  if (document.querySelector('[data-android-changelog-content]')) {
    try {
      const r = await SQOLSource.text('android', 'android-CHANGELOG.md', '/data/fallback/android/android-CHANGELOG.md');
      setSource('android-changelog', r.source, 'Android changelog');
      renderReleases(document.querySelector('[data-android-changelog-content]'), r.text);
    } catch (_) {}
  }

  const search = document.querySelector('[data-changelog-search]');
  if (search) search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.release').forEach(el => el.classList.toggle('hidden', q && !el.textContent.toLowerCase().includes(q)));
  });

  async function renderFeatureBrowser() {
    const host = document.querySelector('[data-features-browser]');
    let stableSrc, devSrc;
    try { stableSrc = await SQOLSource.text('stable', 'features.md', '/data/fallback/stable/features.md'); } catch (_) {}
    try { devSrc = await SQOLSource.text('dev', 'features.md', '/data/fallback/dev/features.md'); } catch (_) {}
    if (!stableSrc || !devSrc) { host.innerHTML = '<div class="loading-card">Could not load the feature sources.</div>'; return; }

    applySourceState(document.querySelector('[data-source-state="stable-features"]'), stableSrc.source, `Stable v${stable.version || cfg.stableVersion}`);
    applySourceState(document.querySelector('[data-source-state="dev-features"]'), devSrc.source, 'Development main');

    const stableSections = currentFeatureSections(SQOLMarkdown.sections(stableSrc.text).sections, false);
    const allDevSections = SQOLMarkdown.sections(devSrc.text).sections;
    const planned = allDevSections.filter(s => /planned|roadmap|future/i.test(s.title));
    const devCurrent = currentFeatureSections(allDevSections, false);

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

  function currentFeatureSections(sections) {
    return sections.filter(s => !/^v?\d+\.\d+\.\d+$/i.test(s.title) && !/planned|roadmap|future/i.test(s.title));
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
      if (el?.tagName === 'DETAILS') el.open = true;
    }
  }

  function setSource(key, source, label) {
    const el = document.querySelector(`[data-source-state="${key}"]`);
    if (el) applySourceState(el, source, label);
  }
  function applySourceState(el, source, label) {
    if (!el) return;
    const live = source !== 'fallback';
    el.className = `source-state ${live ? 'live' : 'fallback'}`;
    el.textContent = live ? `${label} loaded live from GitHub.` : `${label}: using the bundled snapshot because GitHub is temporarily unavailable.`;
  }
  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value); if (Number.isNaN(d.valueOf())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function formatDateTime(value) {
    if (!value) return '';
    const d = new Date(value); if (Number.isNaN(d.valueOf())) return String(value);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function slug(s) { return String(s).toLowerCase().replace(/^v/, 'v-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
})();
