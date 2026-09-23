import { readFile, writeFile } from 'node:fs/promises';

const repo = 'drachescript/spicychat-qol-android';
const api = `https://api.github.com/repos/${repo}`;
const sourceRepo = `https://github.com/${repo}`;
const token = process.env.GITHUB_TOKEN || '';

const apiHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'SpicyChat-QoL-Website-Manifest-Sync',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};

async function fetchJson(url, headers = apiHeaders) {
  const response = await fetch(url, { headers, redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, { headers, redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
}

function releaseAsset(release, predicate) {
  return (release.assets || []).find(predicate) || null;
}

function digestSha256(asset) {
  const digest = String(asset?.digest || '');
  return digest.toLowerCase().startsWith('sha256:') ? digest.slice(7) : '';
}

async function versionCodeFromTag(tag) {
  const url = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(tag)}/android_app/pubspec.yaml`;
  const text = await fetchText(url, { 'User-Agent': 'SpicyChat-QoL-Website-Manifest-Sync' });
  const match = text.match(/^version:\s*\d+\.\d+\.\d+\+(\d+)\s*$/m);
  return match ? Number(match[1]) : null;
}

async function writeJsonIfChanged(path, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  let previous = '';
  try {
    previous = await readFile(path, 'utf8');
  } catch {}
  if (previous === next) return false;
  await writeFile(path, next, 'utf8');
  console.log(`updated ${path}`);
  return true;
}

const release = await fetchJson(`${api}/releases/latest`);
if (!release?.tag_name) throw new Error('Latest Android release has no tag_name.');

const tag = String(release.tag_name);
const versionName = tag.replace(/^v/i, '');
const updateAsset = releaseAsset(
  release,
  (asset) => String(asset.name || '').toLowerCase() === 'update.json'
);
const apkAsset = releaseAsset(
  release,
  (asset) => String(asset.name || '').toLowerCase().endsWith('.apk')
);

let upstream = {};
if (updateAsset?.browser_download_url) {
  try {
    upstream = await fetchJson(updateAsset.browser_download_url, {
      Accept: 'application/json',
      'User-Agent': 'SpicyChat-QoL-Website-Manifest-Sync'
    });
  } catch (error) {
    console.warn(`Could not read release update.json; using release metadata: ${error.message}`);
  }
}

let versionCode = Number(upstream.versionCode);
if (!Number.isFinite(versionCode) || versionCode <= 0) {
  versionCode = await versionCodeFromTag(tag);
}

const apkFile = String(
  upstream.apkFile || upstream.apkName || apkAsset?.name || ''
);
const apkUrl = String(
  upstream.apkUrl || apkAsset?.browser_download_url || ''
);
const sha256 = String(upstream.sha256 || digestSha256(apkAsset));

const manifest = {
  ...upstream,
  schemaVersion: Number(upstream.schemaVersion) || 2,
  available: upstream.available !== false && Boolean(apkUrl || release.html_url),
  app: upstream.app || 'SpicyChat QOL',
  packageName: upstream.packageName || 'uk.drache.spicychatqol',
  versionName: upstream.versionName || versionName,
  versionCode: versionCode ?? null,
  tag: upstream.tag || upstream.tagName || tag,
  tagName: upstream.tagName || upstream.tag || tag,
  publishedAt: upstream.publishedAt || release.published_at || '',
  releaseUrl: upstream.releaseUrl || release.html_url || `${sourceRepo}/releases/tag/${tag}`,
  apkFile,
  apkName: upstream.apkName || apkFile,
  apkUrl,
  sha256,
  minimumAndroidSdk: Number(upstream.minimumAndroidSdk) || 24,
  updateJsonUrl: updateAsset?.browser_download_url || upstream.updateJsonUrl || '',
  sourceRepo,
  metadataSource: updateAsset ? 'github-release-update.json' : 'github-release-fallback',
  message: 'Automatically synced from the latest public Android GitHub release.'
};

await writeJsonIfChanged('android/manifest.json', manifest);
await writeJsonIfChanged('android/update.json', manifest);

// Keep browser-side offline fallbacks current as well.
const configPath = 'data/site-config.json';
const config = JSON.parse(await readFile(configPath, 'utf8'));
config.androidVersionFallback = manifest.versionName;
config.androidReleaseUrl = manifest.releaseUrl;
config.androidApkUrl = manifest.apkUrl;
await writeJsonIfChanged(configPath, config);

console.log(`Android manifest sync complete: ${manifest.versionName}+${manifest.versionCode ?? '?'}`);
