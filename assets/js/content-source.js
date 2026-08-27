window.SQOLSource = (() => {
  let configPromise;
  const config = () => configPromise ||= fetch('/data/site-config.json', { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('Could not load site config');
    return r.json();
  });

  function baseFor(c, project) {
    if (project === 'stable') return c.stableRepoRaw;
    if (project === 'dev') return c.devRepoRaw;
    if (project === 'android') return c.androidRepoRaw;
    throw new Error(`Unknown project: ${project}`);
  }

  async function text(project, file, fallback = null) {
    const c = await config();
    const rawBase = baseFor(c, project);

    // Cloudflare Worker first when it is routed to the site.
    try {
      const wr = await fetch(`/api/source?project=${encodeURIComponent(project)}&file=${encodeURIComponent(file)}`, { cache: 'no-store' });
      if (wr.ok) return { text: await wr.text(), source: 'live-worker', project, file };
    } catch (_) {}

    // Raw GitHub works directly from GitHub Pages once the repo files exist.
    try {
      const rr = await fetch(`${rawBase}/${file}?v=${Date.now()}`, { cache: 'no-store' });
      if (rr.ok) return { text: await rr.text(), source: 'live-github', project, file };
    } catch (_) {}

    if (!fallback) throw new Error(`Live ${project}/${file} is not available yet`);
    const fr = await fetch(fallback, { cache: 'no-store' });
    if (!fr.ok) throw new Error(`Could not load fallback for ${project}/${file}`);
    return { text: await fr.text(), source: 'fallback', project, file };
  }

  async function json(project, file, fallback = null) {
    const r = await text(project, file, fallback);
    return { ...r, data: JSON.parse(r.text) };
  }

  async function chromeDevLatest() {
    const c = await config();
    try {
      const r = await fetch('/api/distribution/chrome-dev', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (data.version) return { ...data, source: 'live-worker' };
      }
    } catch (_) {}
    return { version: c.chromeDevVersion, url: c.chromeDevStore, source: 'fallback' };
  }

  async function firefoxDevLatest() {
    const c = await config();
    try {
      const r = await fetch('/api/distribution/firefox-dev', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (data.version) return { ...data, source: 'live-worker' };
      }
    } catch (_) {}

    // AMO's public API normally allows cross-origin reads, so GitHub Pages can stay current without the Worker.
    try {
      const r = await fetch(c.firefoxDevApi, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        const version = data.current_version?.version || data.current_version?.version_string || data.version;
        if (version) return { version, url: c.firefoxDevStore, source: 'live-amo' };
      }
    } catch (_) {}

    return { version: c.firefoxDevVersion, url: c.firefoxDevStore, source: 'fallback' };
  }

  async function androidLatest() {
    try {
      const r = await fetch('/api/android/latest', { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (_) {}
    return { available: false };
  }

  return { config, text, json, chromeDevLatest, firefoxDevLatest, androidLatest };
})();
