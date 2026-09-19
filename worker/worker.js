const EXTENSION_REPO = 'drachescript/spicychat-qol-extension';
const ANDROID_REPO = 'drachescript/spicychat-qol-android';
const STABLE_FALLBACK_TAG = 'v0.2.0';
const STABLE_FALLBACK_VERSION = '0.2.0';

const PROJECTS = {
  stable: { repo: EXTENSION_REPO, ref: null }, // resolved from latest stable release
  dev: { repo: EXTENSION_REPO, ref: 'main' },
  android: { repo: ANDROID_REPO, ref: 'main' }
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
    'README.md', 'android-CHANGELOG.md', 'update.json', 'version.json',
    'android/manifest.json'
  ])
};

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
      if (!PROJECTS[project] || !ALLOWED[project]?.has(file)) {
        return new Response('Not allowed', { status: 400, headers: cors });
      }
      return proxyRaw(project, file);
    }

    if (u.pathname === '/api/distribution/stable') return stableLatest();
    if (u.pathname === '/api/distribution/dev') return developmentLatest();
    if (u.pathname === '/api/android/latest') return androidLatest();
    if (u.pathname === '/api/extension/latest' || u.pathname === '/extension/manifest.json') return extensionManifest();
    if (u.pathname === '/android/manifest.json' || u.pathname === '/android/update.json') return androidManifest();

    return new Response('Not found', { status: 404, headers: cors });
  }
};

async function proxyRaw(project, file) {
  const repo = PROJECTS[project].repo;
  let ref = PROJECTS[project].ref;

  if (project === 'stable') {
    try {
      const rel = await latestStableRelease();
      ref = rel.tag_name || STABLE_FALLBACK_TAG;
    } catch (_) {
      ref = STABLE_FALLBACK_TAG;
    }
  }

  const url = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${file}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'SpicyChat-QoL-Website' } });

  return new Response(await r.arrayBuffer(), {
    status: r.status,
    headers: {
      ...cors,
      'Content-Type': r.headers.get('Content-Type') || 'text/plain; charset=utf-8',
      'Cache-Control': project === 'stable' ? 'public,max-age=900' : 'public,max-age=120'
    }
  });
}

async function stableLatest() {
  try {
    const rel = await latestStableRelease();
    return jsonResponse(stableReleaseData(rel), 300);
  } catch (_) {
    return jsonResponse({
      available: true,
      version: STABLE_FALLBACK_VERSION,
      tagName: STABLE_FALLBACK_TAG,
      releaseUrl: `https://github.com/${EXTENSION_REPO}/releases/tag/${STABLE_FALLBACK_TAG}`,
      fallback: true
    }, 120);
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
      chromeAsset: findAsset(rel, ['spicychat-qol-dev-chrome.zip']),
      firefoxAsset: findAsset(rel, ['spicychat-qol-dev-firefox.zip'])
    }, 90);
  } catch (_) {
    return jsonResponse({
      available: true,
      label: 'Development build',
      tagName: 'dev-build',
      releaseUrl: `https://github.com/${EXTENSION_REPO}/releases/tag/dev-build`,
      fallback: true
    }, 90);
  }
}

async function extensionManifest() {
  const [stableResponse, devResponse] = await Promise.all([stableLatest(), developmentLatest()]);
  const stable = await stableResponse.json();
  const development = await devResponse.json();

  return jsonResponse({
    schemaVersion: 1,
    project: 'SpicyChat QoL browser extension',
    sourceRepo: `https://github.com/${EXTENSION_REPO}`,
    stable: {
      ...stable,
      chromeStoreUrl: 'https://chromewebstore.google.com/detail/dragonscript-spicychat-qo/jdbhnaohfjnmkfpfddnjilmpaemkmabh',
      firefoxStoreUrl: 'https://addons.mozilla.org/en-US/firefox/addon/dragonscript-spicychat-qol-dev/'
    },
    development
  }, 90);
}

async function androidLatest() {
  let rel;
  try {
    rel = await githubJson(`https://api.github.com/repos/${ANDROID_REPO}/releases/latest`);
  } catch (_) {
    return jsonResponse({
      available: false,
      sourcePublic: true,
      metadataSource: 'github-release-update.json',
      reason: 'no-public-apk-release'
    }, 90);
  }

  // update.json attached to the latest tagged release is the source of truth.
  const updateAsset = findAssetRaw(rel, ['update.json']);
  if (updateAsset) {
    try {
      const r = await fetch(updateAsset.browser_download_url, {
        headers: { 'User-Agent': 'SpicyChat-QoL-Website', 'Accept': 'application/octet-stream' },
        redirect: 'follow'
      });
      if (r.ok) {
        const data = await r.json();
        return jsonResponse(normalizeAndroidUpdate(data, rel, updateAsset), 90);
      }
    } catch (_) {}
  }

  // If a release exists but update.json is missing, expose conservative release/APK metadata.
  const apk = (rel.assets || []).find(a => String(a.name || '').toLowerCase().endsWith('.apk'));
  return jsonResponse({
    available: !!apk,
    sourcePublic: true,
    metadataSource: 'github-release-fallback',
    app: 'SpicyChat QOL',
    packageName: 'uk.drache.spicychatqol',
    versionName: String(rel.tag_name || '').replace(/^v/, ''),
    versionCode: null,
    tag: rel.tag_name || '',
    tagName: rel.tag_name || '',
    publishedAt: rel.published_at || '',
    releaseUrl: rel.html_url || '',
    apkFile: apk?.name || '',
    apkName: apk?.name || '',
    apkUrl: apk?.browser_download_url || '',
    sha256: '',
    minimumAndroidSdk: 24,
    updateJsonUrl: updateAsset?.browser_download_url || ''
  }, 90);
}

function normalizeAndroidUpdate(data, rel, updateAsset) {
  const apkFile = data.apkFile || data.apkName || '';
  let apkUrl = data.apkUrl || '';
  if (!apkUrl && apkFile) {
    const a = (rel.assets || []).find(x => String(x.name || '').toLowerCase() === String(apkFile).toLowerCase());
    apkUrl = a?.browser_download_url || '';
  }
  if (!apkUrl) {
    const a = (rel.assets || []).find(x => String(x.name || '').toLowerCase().endsWith('.apk'));
    apkUrl = a?.browser_download_url || '';
  }

  const tag = data.tag || data.tagName || rel.tag_name || '';
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
    apkFile: apkFile || ((rel.assets || []).find(x => String(x.name || '').toLowerCase().endsWith('.apk'))?.name || ''),
    apkName: apkFile || ((rel.assets || []).find(x => String(x.name || '').toLowerCase().endsWith('.apk'))?.name || ''),
    apkUrl,
    sha256: data.sha256 || '',
    minimumAndroidSdk: data.minimumAndroidSdk ?? 24,
    updateJsonUrl: updateAsset.browser_download_url
  };
}

async function androidManifest() {
  const response = await androidLatest();
  const data = await response.json();

  return jsonResponse({
    schemaVersion: 2,
    available: !!data.available,
    app: data.app || 'SpicyChat QOL',
    packageName: data.packageName || 'uk.drache.spicychatqol',
    versionName: data.versionName || '',
    versionCode: data.versionCode ?? null,
    tag: data.tag || data.tagName || '',
    tagName: data.tagName || data.tag || '',
    publishedAt: data.publishedAt || '',
    releaseUrl: data.releaseUrl || `https://github.com/${ANDROID_REPO}/releases`,
    apkFile: data.apkFile || data.apkName || '',
    apkName: data.apkName || data.apkFile || '',
    apkUrl: data.apkUrl || '',
    sha256: data.sha256 || '',
    minimumAndroidSdk: data.minimumAndroidSdk ?? 24,
    updateJsonUrl: data.updateJsonUrl || '',
    metadataSource: data.metadataSource || 'github-release-update.json',
    sourceRepo: `https://github.com/${ANDROID_REPO}`,
    reason: data.reason || ''
  }, 90);
}

async function latestStableRelease() {
  // GitHub's /releases/latest ignores prereleases, so rolling dev-build cannot become Stable.
  return githubJson(`https://api.github.com/repos/${EXTENSION_REPO}/releases/latest`);
}

function stableReleaseData(rel) {
  return {
    available: true,
    version: String(rel.tag_name || STABLE_FALLBACK_TAG).replace(/^v/, ''),
    tagName: rel.tag_name || STABLE_FALLBACK_TAG,
    publishedAt: rel.published_at || '',
    releaseUrl: rel.html_url || `https://github.com/${EXTENSION_REPO}/releases/tag/${STABLE_FALLBACK_TAG}`
  };
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

function findAssetRaw(rel, names) {
  const wanted = names.map(n => n.toLowerCase());
  return (rel.assets || []).find(x => wanted.includes(String(x.name || '').toLowerCase())) || null;
}

function findAsset(rel, names) {
  const a = findAssetRaw(rel, names);
  return a ? { name: a.name, url: a.browser_download_url, size: a.size || 0 } : null;
}

function jsonResponse(data, maxAge = 90) {
  return Response.json(data, { headers: { ...cors, 'Cache-Control': `public,max-age=${maxAge}` } });
}
