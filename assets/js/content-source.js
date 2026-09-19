window.SQOLSource = (() => {
  let configPromise;
  let stableLatestPromise;

  const config = () => configPromise ||= fetch('/data/site-config.json', { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('Could not load site config');
    return r.json();
  });

  async function baseFor(c, project) {
    if (project === 'stable') {
      const release = await stableLatest().catch(() => null);
      const tag = release?.tagName || `v${c.stableVersion}`;
      return `https://raw.githubusercontent.com/drachescript/spicychat-qol-extension/${encodeURIComponent(tag)}`;
    }
    if (project === 'dev') return c.devRepoRaw;
    if (project === 'android') return c.androidRepoRaw;
    throw new Error(`Unknown project: ${project}`);
  }

  async function text(project, file, fallback = null) {
    const c = await config();
    const rawBase = await baseFor(c, project);

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
    if (stableLatestPromise) return stableLatestPromise;
    stableLatestPromise = (async () => {
      const c = await config();
      try {
        const r = await fetch('/api/distribution/stable', { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (data.version) return { ...data, source: data.fallback ? 'fallback' : 'live-worker' };
        }
      } catch (_) {}
      try {
        const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-extension/releases/latest', {
          cache: 'no-store', headers: { Accept: 'application/vnd.github+json' }
        });
        if (r.ok) {
          const rel = await r.json();
          return {
            version: String(rel.tag_name || `v${c.stableVersion}`).replace(/^v/, ''),
            tagName: rel.tag_name || `v${c.stableVersion}`,
            publishedAt: rel.published_at,
            releaseUrl: rel.html_url,
            source: 'live-github-api'
          };
        }
      } catch (_) {}
      return {
        version: c.stableVersion,
        tagName: `v${c.stableVersion}`,
        releaseUrl: c.stableReleaseUrl,
        source: 'fallback'
      };
    })();
    return stableLatestPromise;
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
      const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-extension/releases/tags/dev-build', {
        cache: 'no-store', headers: { Accept: 'application/vnd.github+json' }
      });
      if (r.ok) {
        const rel = await r.json();
        const body = String(rel.body || '');
        const referenceCommit = body.match(/Reference commit:\s*`?([0-9a-f]{7,40})`?/i)?.[1] || '';
        const lastBuild = body.match(/Last build:\s*([^\n\r]+)/i)?.[1]?.trim() || rel.published_at || '';
        return {
          available: true,
          label: rel.name || 'Development build',
          tagName: rel.tag_name || 'dev-build',
          publishedAt: rel.published_at,
          lastBuild,
          referenceCommit,
          releaseUrl: rel.html_url,
          source: 'live-github-api'
        };
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

    // Browser-side fallback: query the latest tagged release and prefer its update.json asset.
    try {
      const r = await fetch('https://api.github.com/repos/drachescript/spicychat-qol-android/releases/latest', {
        cache: 'no-store', headers: { Accept: 'application/vnd.github+json' }
      });
      if (r.ok) {
        const rel = await r.json();
        const updateAsset = (rel.assets || []).find(a => String(a.name || '').toLowerCase() === 'update.json');
        if (updateAsset) {
          try {
            const ur = await fetch(updateAsset.browser_download_url, { cache: 'no-store' });
            if (ur.ok) {
              const data = await ur.json();
              return normalizeAndroid(data, rel, updateAsset.browser_download_url);
            }
          } catch (_) {}
        }

        const apk = (rel.assets || []).find(a => String(a.name || '').toLowerCase().endsWith('.apk'));
        return {
          available: !!apk,
          sourcePublic: true,
          metadataSource: 'github-release-fallback',
          app: 'SpicyChat QOL',
          packageName: 'uk.drache.spicychatqol',
          versionName: String(rel.tag_name || '').replace(/^v/, ''),
          versionCode: null,
          tag: rel.tag_name || '',
          tagName: rel.tag_name || '',
          publishedAt: rel.published_at,
          releaseUrl: rel.html_url,
          apkFile: apk?.name || '',
          apkName: apk?.name || '',
          apkUrl: apk?.browser_download_url || '',
          sha256: '',
          minimumAndroidSdk: 24
        };
      }
    } catch (_) {}

    // Last-resort bundled fallback so the public APK does not appear to vanish if GitHub is temporarily unreachable.
    try {
      const r = await fetch('/android/update.json', { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (_) {}

    return {
      available: false,
      sourcePublic: true,
      metadataSource: 'github-release-update.json',
      reason: 'release-check-unavailable'
    };
  }

  function normalizeAndroid(data, rel, updateJsonUrl = '') {
    const tag = data.tag || data.tagName || rel.tag_name || '';
    let apkUrl = data.apkUrl || '';
    let apkFile = data.apkFile || data.apkName || '';
    if (!apkUrl && apkFile) {
      const a = (rel.assets || []).find(x => String(x.name || '').toLowerCase() === String(apkFile).toLowerCase());
      apkUrl = a?.browser_download_url || '';
    }
    if (!apkFile) {
      const a = (rel.assets || []).find(x => String(x.name || '').toLowerCase().endsWith('.apk'));
      apkFile = a?.name || '';
      apkUrl ||= a?.browser_download_url || '';
    }
    return {
      ...data,
      available: data.available !== false && !!(apkUrl || rel.html_url),
      sourcePublic: true,
      metadataSource: 'github-release-update.json',
      app: data.app || 'SpicyChat QOL',
      packageName: data.packageName || 'uk.drache.spicychatqol',
      versionName: data.versionName || String(tag).replace(/^v/, ''),
      versionCode: data.versionCode ?? null,
      tag,
      tagName: tag,
      publishedAt: data.publishedAt || rel.published_at || '',
      releaseUrl: data.releaseUrl || rel.html_url || '',
      apkFile,
      apkName: apkFile,
      apkUrl,
      sha256: data.sha256 || '',
      minimumAndroidSdk: data.minimumAndroidSdk ?? 24,
      updateJsonUrl
    };
  }

  async function extensionManifest() {
    try {
      const r = await fetch('/extension/manifest.json', { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (_) {}
    const c = await config();
    const [stable, development] = await Promise.all([stableLatest(), developmentLatest()]);
    return {
      schemaVersion: 1,
      project: 'SpicyChat QoL browser extension',
      sourceRepo: c.stableRepo,
      stable,
      development
    };
  }

  return { config, text, json, stableLatest, developmentLatest, androidLatest, extensionManifest };
})();
