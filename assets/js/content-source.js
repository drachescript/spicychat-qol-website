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

    try {
      const wr = await fetch(`/api/source?project=${encodeURIComponent(project)}&file=${encodeURIComponent(file)}`, { cache: 'no-store' });
      if (wr.ok) return { text: await wr.text(), source: 'live-worker', project, file };
    } catch (_) {}

    try {
      const rr = await fetch(`${rawBase}/${file}?v=${Date.now()}`, { cache: 'no-store' });
      if (rr.ok) return { text: await rr.text(), source: 'live-github', project, file };
    } catch (_) {}

    if (!fallback) throw new Error(`Could not load ${project}/${file}`);
    const fr = await fetch(fallback, { cache: 'no-store' });
    if (!fr.ok) throw new Error(`Could not load fallback for ${project}/${file}`);
    return { text: await fr.text(), source: 'fallback', project, file };
  }

  async function json(project, file, fallback = null) {
    const r = await text(project, file, fallback);
    return { ...r, data: JSON.parse(r.text) };
  }

  async function stableLatest() {
    const c = await config();
    try {
      const r = await fetch('/api/distribution/stable', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (data.version) return { ...data, source: data.fallback ? 'fallback' : 'live-worker' };
      }
    } catch (_) {}
    try {
      const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-extension/releases/tags/v0.2.0', { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) {
        const rel = await r.json();
        return { version: String(rel.tag_name || 'v0.2.0').replace(/^v/, ''), tagName: rel.tag_name, publishedAt: rel.published_at, releaseUrl: rel.html_url, source: 'live-github-api' };
      }
    } catch (_) {}
    return {
      version: c.stableVersion,
      tagName: `v${c.stableVersion}`,
      releaseUrl: c.stableReleaseUrl,
      source: 'fallback'
    };
  }

  async function developmentLatest() {
    const c = await config();
    try {
      const r = await fetch('/api/distribution/dev', { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (data.available !== false) return { ...data, source: data.fallback ? 'fallback' : 'live-worker' };
      }
    } catch (_) {}
    try {
      const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-extension/releases/tags/dev-build', { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) {
        const rel = await r.json();
        const body = String(rel.body || '');
        const referenceCommit = body.match(/Reference commit:\s*`?([0-9a-f]{7,40})`?/i)?.[1] || '';
        const lastBuild = body.match(/Last build:\s*([^\n\r]+)/i)?.[1]?.trim() || rel.published_at || '';
        return { available: true, label: rel.name || 'Development build', tagName: rel.tag_name || 'dev-build', publishedAt: rel.published_at, lastBuild, referenceCommit, releaseUrl: rel.html_url, source: 'live-github-api' };
      }
    } catch (_) {}
    return {
      available: true,
      label: 'Development build',
      tagName: 'dev-build',
      releaseUrl: c.devReleaseUrl,
      source: 'fallback'
    };
  }

  async function androidLatest() {
    try {
      const r = await fetch('/api/android/latest', { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (_) {}
    try {
      const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-android/releases/latest', { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) {
        const rel = await r.json();
        const apk = (rel.assets || []).find(a => String(a.name).toLowerCase().endsWith('.apk'));
        return { available: true, sourcePublic: true, versionName: String(rel.tag_name || '').replace(/^v/, ''), tagName: rel.tag_name, publishedAt: rel.published_at, releaseUrl: rel.html_url, apkUrl: apk?.browser_download_url || '', apkName: apk?.name || '' };
      }
    } catch (_) {}
    return { available: false, sourcePublic: true };
  }

  return { config, text, json, stableLatest, developmentLatest, androidLatest };
})();
