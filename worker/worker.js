const PROJECTS = {
  stable: { repo: 'drachescript/spicychat-qol-extension', ref: 'v0.2.0' },
  dev: { repo: 'drachescript/spicychat-qol-extension', ref: 'main' },
  android: { repo: 'drachescript/spicychat-qol-android', ref: 'main' }
};

const ALLOWED = {
  stable: new Set([
    'README.md', 'features.md', 'CHANGELOG.md', 'manifest.json',
    'feature-registry.js', 'THIRD-PARTY-NOTICES.md', 'RELEASE_NOTES.md',
    'PRIVACY.md', 'PERMISSIONS.md', 'options.html', 'options.css', 'options.js'
  ]),
  dev: new Set([
    'README.md', 'features.md', 'CHANGELOG.md', 'manifest.json',
    'feature-registry.js', 'THIRD-PARTY-NOTICES.md', 'RELEASE_NOTES.md',
    'PRIVACY.md', 'PERMISSIONS.md', 'options.html', 'options.css', 'options.js'
  ]),
  android: new Set([
    'README.md', 'android-CHANGELOG.md', 'version.json', 'update.json',
    'android/manifest.json'
  ])
};

const EXTENSION_REPO = 'drachescript/spicychat-qol-extension';
const ANDROID_REPO = 'drachescript/spicychat-qol-android';
const STABLE_TAG = 'v0.2.0';
const STABLE_VERSION = '0.2.0';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: cors });
    const u = new URL(request.url);

    if (u.pathname === '/api/source') {
      const project = u.searchParams.get('project');
      const file = u.searchParams.get('file');
      if (!PROJECTS[project] || !ALLOWED[project]?.has(file)) return new Response('Not allowed', { status: 400, headers: cors });
      return proxyRaw(project, file);
    }
    if (u.pathname === '/api/distribution/stable') return stableLatest();
    if (u.pathname === '/api/distribution/dev') return developmentLatest();
    if (u.pathname === '/api/android/latest') return androidLatest();
    if (u.pathname === '/android/manifest.json') return androidManifest();
    return new Response('Not found', { status: 404, headers: cors });
  }
};

async function proxyRaw(project, file) {
  const { repo, ref } = PROJECTS[project];
  const url = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${file}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'SpicyChat-QoL-Website' } });
  return new Response(await r.arrayBuffer(), {
    status: r.status,
    headers: {
      ...cors,
      'Content-Type': r.headers.get('Content-Type') || 'text/plain; charset=utf-8',
      'Cache-Control': project === 'stable' ? 'public,max-age=1800' : 'public,max-age=180'
    }
  });
}

async function stableLatest() {
  try {
    const rel = await githubJson(`https://api.github.com/repos/${EXTENSION_REPO}/releases/tags/${STABLE_TAG}`);
    return jsonResponse({
      available: true,
      version: String(rel.tag_name || STABLE_TAG).replace(/^v/, ''),
      tagName: rel.tag_name || STABLE_TAG,
      publishedAt: rel.published_at || '',
      releaseUrl: rel.html_url || `https://github.com/${EXTENSION_REPO}/releases/tag/${STABLE_TAG}`
    }, 600);
  } catch (_) {
    return jsonResponse({
      available: true,
      version: STABLE_VERSION,
      tagName: STABLE_TAG,
      releaseUrl: `https://github.com/${EXTENSION_REPO}/releases/tag/${STABLE_TAG}`,
      fallback: true
    }, 300);
  }
}

async function developmentLatest() {
  try {
    const rel = await githubJson(`https://api.github.com/repos/${EXTENSION_REPO}/releases/tags/dev-build`);
    const body = String(rel.body || '');
    const commit = body.match(/Reference commit:\s*`?([0-9a-f]{7,40})`?/i)?.[1] || '';
    const lastBuild = body.match(/Last build:\s*([^\n\r]+)/i)?.[1]?.trim() || rel.published_at || '';
    return jsonResponse({
      available: true,
      label: rel.name || 'Development build',
      tagName: rel.tag_name || 'dev-build',
      publishedAt: rel.published_at || '',
      lastBuild,
      referenceCommit: commit,
      releaseUrl: rel.html_url || `https://github.com/${EXTENSION_REPO}/releases/tag/dev-build`,
      chromeAsset: asset(rel, 'spicychat-qol-dev-chrome.zip'),
      firefoxAsset: asset(rel, 'spicychat-qol-dev-firefox.zip')
    }, 120);
  } catch (_) {
    return jsonResponse({
      available: true,
      label: 'Development build',
      tagName: 'dev-build',
      releaseUrl: `https://github.com/${EXTENSION_REPO}/releases/tag/dev-build`,
      fallback: true
    }, 120);
  }
}

async function androidLatest() {
  // Once Android publishes a tiny version/update file, prefer that declared metadata.
  for (const file of ['version.json', 'update.json']) {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/${ANDROID_REPO}/main/${file}`, { headers: { 'User-Agent': 'SpicyChat-QoL-Website' } });
      if (r.ok) {
        const data = await r.json();
        return jsonResponse({ ...data, available: data.available !== false, sourcePublic: true }, 180);
      }
    } catch (_) {}
  }

  try {
    const rel = await githubJson(`https://api.github.com/repos/${ANDROID_REPO}/releases/latest`);
    const apk = (rel.assets || []).find(a => String(a.name).toLowerCase().endsWith('.apk'));
    return jsonResponse({
      available: true,
      sourcePublic: true,
      versionName: String(rel.tag_name || '').replace(/^v/, ''),
      tagName: rel.tag_name || '',
      publishedAt: rel.published_at || '',
      releaseUrl: rel.html_url || '',
      apkUrl: apk?.browser_download_url || '',
      apkName: apk?.name || ''
    }, 180);
  } catch (_) {
    return jsonResponse({ available: false, sourcePublic: true, reason: 'no-public-apk-release' }, 180);
  }
}

async function androidManifest() {
  const latest = await androidLatest();
  const data = await latest.json();
  return jsonResponse({
    schemaVersion: 1,
    available: !!data.available,
    versionName: data.versionName || '',
    tagName: data.tagName || '',
    publishedAt: data.publishedAt || '',
    releaseUrl: data.releaseUrl || 'https://github.com/drachescript/spicychat-qol-android/releases',
    apkUrl: data.apkUrl || '',
    apkName: data.apkName || '',
    sourceRepo: `https://github.com/${ANDROID_REPO}`
  }, 180);
}

async function githubJson(url) {
  const r = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SpicyChat-QoL-Website',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return r.json();
}

function asset(rel, name) {
  const a = (rel.assets || []).find(x => String(x.name).toLowerCase() === name.toLowerCase());
  return a ? { name: a.name, url: a.browser_download_url, size: a.size || 0 } : null;
}

function jsonResponse(data, maxAge = 180) {
  return Response.json(data, { headers: { ...cors, 'Cache-Control': `public,max-age=${maxAge}` } });
}
