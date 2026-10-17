(() => {
  'use strict';

  // EARLY ACCESS: fixed Core + OOC recipe only. Do not use this script to
  // package arbitrary selections from the main /lite/ recipe builder.
  const CHANNEL = 'core-ooc-ea';
  const SCRIPTS = Object.freeze([
    'content/core-settings-defaults.js',
    'custom/ooc-runtime-core.js',
    'content/ooc.js',
    'content/ooc-composer.js'
  ]);
  const STYLE = 'content/styles/ooc.css';
  const OPTIONS = 'custom/ooc-options.html';
  const ICON = 'icons/icon48.png';
  const PATHS = Object.freeze([
    ...SCRIPTS, STYLE, OPTIONS,
    'custom/ooc-options.css', 'custom/ooc-options.js', ICON
  ]);
  const REQUIRED_SET = new Set(PATHS);
  const TEXT = new TextEncoder();
  const ui = {
    version: document.querySelector('[data-ea-version]'),
    status: document.querySelector('[data-ea-status]'),
    download: document.querySelector('[data-ea-download]'),
    install: document.querySelector('[data-ea-install]'),
    reconnect: document.querySelector('[data-ea-reconnect]'),
    connected: document.querySelector('[data-ea-connected]'),
    details: document.querySelector('[data-ea-details]')
  };
  let release = null;
  let folder = null;
  let working = false;

  function status(message, error = false) {
    if (ui.status) {
      ui.status.textContent = message;
      ui.status.classList.toggle('error', error);
    }
  }

  function setBusy(busy) {
    working = busy;
    for (const button of [ui.download, ui.install, ui.reconnect]) {
      if (button) button.disabled = busy;
    }
  }

  function safePath(path) {
    return typeof path === 'string' && /^[a-zA-Z0-9_./-]+$/.test(path) &&
      path.length < 160 && !path.startsWith('/') &&
      !path.split('/').includes('..') && !path.split('/').includes('.') &&
      !path.includes('//');
  }

  async function loadRelease() {
    const response = await fetch('./release.json', {cache: 'no-store'});
    if (!response.ok) throw Error('Cannot load the early-access release catalog (' + response.status + ').');
    const data = await response.json();
    if (data.schema !== 'sqol-lite-early-access/v1' ||
        data.channel !== CHANNEL || data.status !== 'experimental-test-only' ||
        !/^\d+\.\d+\.\d+$/.test(data.version) ||
        !/^[a-f0-9]{40}$/.test(data.source?.commit || '') ||
        data.source.repository !== 'drachescript/spicychat-qol-extension' ||
        data.name !== 'SpicyChat QoL — Core + OOC (test)' ||
        JSON.stringify(data.features) !== JSON.stringify(['ooc']) ||
        Object.keys(data.files || {}).length !== PATHS.length ||
        !PATHS.every(path => safePath(path) && /^[0-9a-f]{40}$/.test(data.files[path] || ''))) {
      throw Error('Release catalog failed the fixed OOC recipe validation.');
    }
    release = data;
    if (ui.version) ui.version.textContent = 'v' + data.version + ' · Core + OOC only';
    return data;
  }

  function makeManifest(data) {
    return {
      manifest_version: 3,
      name: data.name,
      version: data.version,
      description: 'Experimental minimal installation: OOC presets and chat composer controls only.',
      permissions: ['storage'],
      content_scripts: [{
        matches: [
          'https://spicychat.ai/chat/*', 'https://www.spicychat.ai/chat/*',
          'https://spicychat.ai/*/chat/*', 'https://www.spicychat.ai/*/chat/*'
        ],
        js: [...SCRIPTS], css: [STYLE], run_at: 'document_idle'
      }],
      options_page: OPTIONS,
      action: {
        default_title: 'Core + OOC test — open settings via extension details',
        default_icon: {'48': ICON}
      },
      icons: {'48': ICON}
    };
  }

  async function gitBlobSha1(bytes) {
    const header = TEXT.encode('blob ' + bytes.byteLength + '\0');
    const all = new Uint8Array(header.length + bytes.length);
    all.set(header);
    all.set(bytes, header.length);
    const digest = await crypto.subtle.digest('SHA-1', all);
    return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  async function packageFiles() {
    const data = release || await loadRelease();
    const base = 'https://raw.githubusercontent.com/' +
      data.source.repository + '/' + data.source.commit + '/';
    let done = 0;
    const pairs = await Promise.all(PATHS.map(async path => {
      const response = await fetch(base + path, {cache: 'no-store', mode: 'cors'});
      if (!response.ok) throw Error('Could not download verified source file ' + path +
        ' (' + response.status + ').');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const sha = await gitBlobSha1(bytes);
      if (sha !== data.files[path]) {
        throw Error('Integrity check failed for ' + path + '. No files were installed.');
      }
      done += 1;
      status('Verified ' + done + '/' + PATHS.length + ' source files…');
      return [path, bytes];
    }));
    const map = new Map(pairs);
    const manifest = makeManifest(data);
    map.set('manifest.json', TEXT.encode(JSON.stringify(manifest, null, 2) + '\n'));
    return map;
  }

  // Small ZIP32 writer using stored entries (no CDN, JSZip, or remote code).
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const [path, bytes] of files) {
      const name = TEXT.encode(path);
      const crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(8, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, bytes.length, true);
      lv.setUint32(22, bytes.length, true);
      lv.setUint16(26, name.length, true);
      local.set(name, 30);
      localParts.push(local, bytes);

      const central = new Uint8Array(46 + name.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, bytes.length, true);
      cv.setUint32(24, bytes.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length + bytes.length;
    }
    const centralLength = centralParts.reduce((sum, bytes) => sum + bytes.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.size, true);
    ev.setUint16(10, files.size, true);
    ev.setUint32(12, centralLength, true);
    ev.setUint32(16, offset, true);
    return new Blob([...localParts, ...centralParts, end], {type: 'application/zip'});
  }

  async function openDatabase() {
    if (!('indexedDB' in window)) return null;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sqol-lite-early-access', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('settings');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function rememberFolder(handle) {
    try {
      const db = await openDatabase();
      if (!db) return;
      await new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        tx.objectStore('settings').put(handle, 'folder');
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (error) {
      console.warn('[QoL Custom EA] Could not remember selected folder', error);
    }
  }

  async function loadRememberedFolder() {
    try {
      const db = await openDatabase();
      if (!db) return null;
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const request = tx.objectStore('settings').get('folder');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return result;
    } catch (error) {
      console.warn('[QoL Custom EA] Could not restore folder', error);
      return null;
    }
  }

  async function permissionFor(handle) {
    const options = {mode: 'readwrite'};
    if ((await handle.queryPermission(options)) === 'granted') return true;
    return (await handle.requestPermission(options)) === 'granted';
  }

  async function chooseFolder(useNew = false) {
    if (!('showDirectoryPicker' in window)) {
      throw Error('Direct folder installation requires desktop Chrome or Brave with File System Access. Use Download ZIP instead.');
    }
    let next = !useNew ? folder : null;
    if (!next) {
      next = await window.showDirectoryPicker({mode: 'readwrite', id: 'sqol-custom-ea'});
    }
    if (!await permissionFor(next)) throw Error('Write permission was not granted.');
    folder = next;
    await rememberFolder(next);
    if (ui.connected) ui.connected.textContent = 'Selected folder: ' + next.name;
    return next;
  }

  async function readFile(handle, path) {
    const parts = path.split('/');
    let dir = handle;
    try {
      for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
      const file = await dir.getFileHandle(parts[parts.length - 1]);
      return new Uint8Array(await (await file.getFile()).arrayBuffer());
    } catch (error) {
      if (error.name === 'NotFoundError') return null;
      throw error;
    }
  }

  async function writeFile(handle, path, bytes) {
    const parts = path.split('/');
    let dir = handle;
    for (const part of parts.slice(0, -1)) {
      dir = await dir.getDirectoryHandle(part, {create: true});
    }
    const file = await dir.getFileHandle(parts[parts.length - 1], {create: true});
    const writer = await file.createWritable();
    try { await writer.write(bytes); await writer.close(); }
    catch (error) { await writer.abort().catch(() => {}); throw error; }
  }

  async function removeFile(handle, path) {
    const parts = path.split('/');
    let dir = handle;
    for (const part of parts.slice(0, -1)) {
      try { dir = await dir.getDirectoryHandle(part); } catch { return; }
    }
    try { await dir.removeEntry(parts[parts.length - 1]); }
    catch (error) { if (error.name !== 'NotFoundError') throw error; }
  }

  async function validateFolder(handle) {
    const manifestBytes = await readFile(handle, 'manifest.json');
    if (manifestBytes) {
      let installed;
      try { installed = JSON.parse(new TextDecoder().decode(manifestBytes)); }
      catch { throw Error('This folder contains an invalid manifest.json. No files were changed.'); }
      const js = installed?.content_scripts?.[0]?.js;
      if (installed.name !== 'SpicyChat QoL — Core + OOC (test)' ||
          installed.manifest_version !== 3 ||
          !Array.isArray(js) || JSON.stringify(js) !== JSON.stringify(SCRIPTS) ||
          installed.options_page !== OPTIONS ||
          JSON.stringify(installed.permissions) !== JSON.stringify(['storage'])) {
        throw Error('This is not the dedicated Core + OOC early-access folder. Full QoL and unrelated extensions are protected.');
      }
      return installed.version;
    }
    for await (const [name] of handle.entries()) {
      throw Error('Choose an empty installation folder, or your existing Core + OOC folder. "' + name + '" is already here.');
    }
    return null;
  }

  async function applyToFolder(handle, files) {
    const existingVersion = await validateFolder(handle);
    if (existingVersion) status('Backing up your v' + existingVersion + ' installation…');
    const originals = new Map();
    for (const path of files.keys()) originals.set(path, await readFile(handle, path));
    if (existingVersion) {
      const backups = await handle.getDirectoryHandle('.qol-custom-backups', {create: true});
      const backup = await backups.getDirectoryHandle(
        'v' + existingVersion.replace(/[^0-9.]/g, '') + '-' +
        new Date().toISOString().replace(/[^0-9TZ]/g, '-'), {create: true}
      );
      for (const [path, bytes] of originals) {
        if (bytes) await writeFile(backup, path, bytes);
      }
    }
    const written = [];
    try {
      // Manifest last: a partially written installation is never marked as the
      // new version. Browser reload remains a separate explicit user action.
      for (const [path, bytes] of files) {
        if (path === 'manifest.json') continue;
        await writeFile(handle, path, bytes);
        written.push(path);
      }
      await writeFile(handle, 'manifest.json', files.get('manifest.json'));
      written.push('manifest.json');
    } catch (error) {
      let rollbackFailed = false;
      for (const path of written.reverse()) {
        try {
          const original = originals.get(path);
          if (original === null) await removeFile(handle, path);
          else await writeFile(handle, path, original);
        } catch { rollbackFailed = true; }
      }
      throw Error('Update interrupted. ' +
        (rollbackFailed ? 'Automatic rollback was incomplete; see .qol-custom-backups in the folder. ' :
          'Previous files were restored. ') + error.message);
    }
    return existingVersion;
  }

  async function operate(fn) {
    if (working) return;
    setBusy(true);
    try { await fn(); }
    catch (error) {
      if (error.name === 'AbortError') status('Folder selection cancelled.');
      else {
        console.error('[QoL Custom EA]', error);
        status(error.message || 'Unexpected update error.', true);
      }
    } finally { setBusy(false); }
  }

  ui.download?.addEventListener('click', () => operate(async () => {
    const files = await packageFiles();
    const objectUrl = URL.createObjectURL(makeZip(files));
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = 'spicychat-qol-custom-core-ooc-v' + release.version + '.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    status('Downloaded Core + OOC v' + release.version + '. Extract the ZIP and load its folder using Chrome/Brave Developer Mode.');
  }));

  ui.install?.addEventListener('click', () => operate(async () => {
    // The file picker must run before any network fetch to preserve the user gesture.
    const handle = await chooseFolder();
    const previous = await validateFolder(handle);
    const files = await packageFiles();
    await applyToFolder(handle, files);
    status((previous ? 'Updated' : 'Installed') + ' Core + OOC v' + release.version +
      ' in "' + handle.name + '". ' +
      (previous ? 'Now click Reload for this extension on chrome://extensions.' :
        'Now use Load unpacked in chrome://extensions and select this folder.'));
  }));

  ui.reconnect?.addEventListener('click', () => operate(async () => {
    await chooseFolder(true);
    const version = await validateFolder(folder);
    status(version ? 'Connected to Core + OOC v' + version + '. Use Install / Update to apply the current release.' :
      'Connected to an empty folder. Install / Update will write the Core + OOC files.');
  }));

  (async () => {
    try {
      await loadRelease();
      if (!('showDirectoryPicker' in window)) {
        if (ui.install) ui.install.disabled = true;
        if (ui.reconnect) ui.reconnect.disabled = true;
        if (ui.details) ui.details.textContent = 'Folder updates need a recent desktop Chrome/Brave browser; ZIP download remains available.';
      } else {
        folder = await loadRememberedFolder();
        if (folder && ui.connected) {
          ui.connected.textContent = 'Remembered folder: ' + folder.name + ' (permission requested when updating)';
        }
      }
      status('Ready: verified Core + OOC early access v' + release.version + '. Other modules are not available in this test.');
    } catch (error) {
      status(error.message, true);
      if (ui.download) ui.download.disabled = true;
      if (ui.install) ui.install.disabled = true;
    }
  })();
})();
