const REPOS = {
  stable: 'drachescript/spicychat-qol-extention',
  dev: 'drachescript/spicychat-qol-dev',
  android: 'drachescript/spicychat-qol-android'
};

const ALLOWED = {
  stable: new Set([
    'README.md', 'features.md', 'CHANGELOG.md', 'manifest.json',
    'THIRD-PARTY-NOTICES.md', 'android-CHANGELOG.md',
    'options.html', 'options.css', 'options.js'
  ]),
  dev: new Set([
    'README.md', 'features.md', 'CHANGELOG.md', 'manifest.json',
    'THIRD-PARTY-NOTICES.md',
    'options.html', 'options.css', 'options.js'
  ]),
  android: new Set([
    'README.md', 'CHANGELOG.md', 'android-CHANGELOG.md',
    'version.json', 'update.json', 'pubspec.yaml'
  ])
};

const CHROME_DEV_URL = 'https://chromewebstore.google.com/detail/dragonscript-spicychat-qo/jdbhnaohfjnmkfpfddnjilmpaemkmabh';
const FIREFOX_DEV_URL = 'https://addons.mozilla.org/en-US/firefox/addon/dragonscript-spicychat-qol-dev/';
const FIREFOX_DEV_API = 'https://addons.mozilla.org/api/v5/addons/addon/dragonscript-spicychat-qol-dev/';
const FALLBACK_CHROME_DEV_VERSION = '0.1.8.70';
const FALLBACK_FIREFOX_DEV_VERSION = '0.1.9.45';

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
      if (!REPOS[project] || !ALLOWED[project]?.has(file)) {
        return new Response('Not allowed', { status: 400, headers: cors });
      }
      return proxyRaw(project, file);
    }

    if (u.pathname === '/api/distribution/chrome-dev') return chromeDevLatest();
    if (u.pathname === '/api/distribution/firefox-dev') return firefoxDevLatest();
    if (u.pathname === '/api/android/latest') return androidLatest();

    return new Response('Not found', { status: 404, headers: cors });
  }
};

async function proxyRaw(project, file) {
  const url = `https://raw.githubusercontent.com/${REPOS[project]}/main/${file}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'SpicyChat-QoL-Website' } });
  return new Response(await r.arrayBuffer(), {
    status: r.status,
    headers: {
      ...cors,
      'Content-Type': r.headers.get('Content-Type') || 'text/plain; charset=utf-8',
      'Cache-Control': 'public,max-age=300'
    }
  });
}

async function chromeDevLatest() {
  try {
    const r = await fetch(CHROME_DEV_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpicyChat-QoL-Website/1.0)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (r.ok) {
      const html = await r.text();
      const patterns = [
        /SpicyChat\s+QoL\s+DEVELOPMENT\s+BUILD\s+v([0-9]+(?:\.[0-9]+)+)/i,
        /DEVELOPMENT\s+BUILD\s+v([0-9]+(?:\.[0-9]+)+)/i,
        /"version"\s*:\s*"([0-9]+(?:\.[0-9]+)+)"/i
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          return jsonResponse({ version: match[1], url: CHROME_DEV_URL, status: 'published' }, 300);
        }
      }
    }
  } catch (_) {}

  return jsonResponse({
    version: FALLBACK_CHROME_DEV_VERSION,
    url: CHROME_DEV_URL,
    status: 'published',
    fallback: true
  }, 300);
}

async function firefoxDevLatest() {
  try {
    const r = await fetch(FIREFOX_DEV_API, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SpicyChat-QoL-Website'
      }
    });
    if (r.ok) {
      const data = await r.json();
      const current = data.current_version || {};
      const version = current.version || current.version_string || data.version;
      if (version) {
        return jsonResponse({
          version,
          url: FIREFOX_DEV_URL,
          status: data.status || 'public',
          experimental: !!data.is_experimental,
          firefoxAndroid: true,
          lastUpdated: data.last_updated || current.file?.created || ''
        }, 180);
      }
    }
  } catch (_) {}

  return jsonResponse({
    version: FALLBACK_FIREFOX_DEV_VERSION,
    url: FIREFOX_DEV_URL,
    status: 'public',
    experimental: true,
    firefoxAndroid: true,
    fallback: true
  }, 180);
}

async function androidLatest() {
  // Prefer a tiny root file once the Android repo publishes one.
  for (const file of ['version.json', 'update.json']) {
    try {
      const v = await fetch(`https://raw.githubusercontent.com/${REPOS.android}/main/${file}`, {
        headers: { 'User-Agent': 'SpicyChat-QoL-Website' }
      });
      if (v.ok) {
        const data = await v.json();
        return jsonResponse({ ...data, available: data.available !== false }, 180);
      }
    } catch (_) {}
  }

  // Otherwise use the latest GitHub release and locate an APK asset.
  const r = await fetch(`https://api.github.com/repos/${REPOS.android}/releases/latest`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SpicyChat-QoL-Website',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!r.ok) return jsonResponse({ available: false }, 180);

  const rel = await r.json();
  const apk = (rel.assets || []).find(a => String(a.name).toLowerCase().endsWith('.apk'));
  return jsonResponse({
    available: true,
    versionName: String(rel.tag_name || '').replace(/^v/, ''),
    tagName: rel.tag_name,
    publishedAt: rel.published_at,
    releaseUrl: rel.html_url,
    apkUrl: apk?.browser_download_url || '',
    apkName: apk?.name || ''
  }, 180);
}

function jsonResponse(data, maxAge = 180) {
  return Response.json(data, {
    headers: { ...cors, 'Cache-Control': `public,max-age=${maxAge}` }
  });
}
