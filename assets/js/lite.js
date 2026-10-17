(() => {
  const CATALOG_URL = '/data/lite/catalog.json';
  const STORAGE_KEY = 'sqol-lite-builder-v1';
  const RECIPE_TYPE = 'spicychat-qol-custom-build';

  const els = {
    source: document.querySelector('[data-lite-source]'),
    status: document.querySelector('[data-lite-status]'),
    presetButtons: [...document.querySelectorAll('[data-lite-preset]')],
    modules: document.querySelector('[data-lite-modules]'),
    selectedCount: document.querySelector('[data-lite-selected-count]'),
    fileCount: document.querySelector('[data-lite-file-count]'),
    omittedCount: document.querySelector('[data-lite-omitted-count]'),
    presetName: document.querySelector('[data-lite-preset-name]'),
    dependencyNote: document.querySelector('[data-lite-dependency-note]'),
    recipePreview: document.querySelector('[data-lite-recipe-preview]'),
    exportButtons: [...document.querySelectorAll('[data-lite-export]')],
    copyButton: document.querySelector('[data-lite-copy]'),
    shareButtons: [...document.querySelectorAll('[data-lite-share]')],
    importFile: document.querySelector('[data-lite-import-file]'),
    importText: document.querySelector('[data-lite-import-text]'),
    importButton: document.querySelector('[data-lite-import]'),
    clearImportButton: document.querySelector('[data-lite-clear-import]'),
    resetButton: document.querySelector('[data-lite-reset]'),
    buildChrome: document.querySelector('[data-lite-build-chrome]'),
    buildFirefox: document.querySelector('[data-lite-build-firefox]'),
    toast: document.querySelector('[data-lite-toast]'),
    unknown: document.querySelector('[data-lite-unknown]')
  };

  let catalog = null;
  let selected = new Set();
  let unknownBundles = [];
  let preset = 'recommended-lite';
  let lastDependencyMessage = '';

  init().catch(error => {
    console.error('[QoL Lite builder]', error);
    if (els.status) {
      els.status.className = 'source-state fallback';
      els.status.textContent = 'The Lite builder could not load its module catalog. Refresh the page or try again later.';
    }
  });

  async function init() {
    const response = await fetch(CATALOG_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    catalog = await response.json();

    if (els.source) {
      els.source.textContent = `main · v${catalog.source?.version || 'current'} · ${catalog.bundleOrder.length} module groups`;
    }
    if (els.status) {
      els.status.className = 'source-state live';
      els.status.textContent = 'Module catalog loaded. Recipe building works now; downloadable custom extension packages are the next stage.';
    }

    restoreState();
    applyHashRecipe();
    normalizeSelection();
    bindEvents();
    render();
  }

  function bindEvents() {
    els.presetButtons.forEach(button => {
      button.addEventListener('click', () => applyPreset(button.dataset.litePreset));
    });

    els.modules?.addEventListener('change', event => {
      const input = event.target.closest('input[data-lite-module]');
      if (!input) return;
      const id = input.dataset.liteModule;
      if (!catalog.bundles[id] || catalog.bundles[id].required) return;

      preset = 'custom';
      if (input.checked) {
        const added = [];
        addWithDependencies(id, added);
        if (added.length > 1) {
          lastDependencyMessage = `${catalog.bundles[id].label} also needs ${added.slice(0, -1).map(labelFor).join(', ')}.`;
        } else {
          lastDependencyMessage = '';
        }
      } else {
        const dependents = selectedDependentsOf(id);
        if (dependents.length) {
          input.checked = true;
          lastDependencyMessage = `${catalog.bundles[id].label} is still needed by ${dependents.map(labelFor).join(', ')}. Remove those first.`;
          showToast(lastDependencyMessage);
          render();
          return;
        }
        selected.delete(id);
        lastDependencyMessage = '';
      }
      normalizeSelection();
      persistState();
      render();
    });

    els.exportButtons.forEach(button => button.addEventListener('click', exportRecipe));
    els.copyButton?.addEventListener('click', async () => {
      await copyText(JSON.stringify(buildRecipe(), null, 2));
      showToast('Recipe copied.');
    });
    els.shareButtons.forEach(button => button.addEventListener('click', async () => {
      const recipe = buildRecipe();
      const encoded = toBase64Url(JSON.stringify(recipe));
      const url = `${location.origin}${location.pathname}#recipe=${encoded}`;
      await copyText(url);
      history.replaceState(null, '', `#recipe=${encoded}`);
      showToast('Share link copied.');
    }));

    els.importFile?.addEventListener('change', async () => {
      const file = els.importFile.files?.[0];
      if (!file) return;
      els.importText.value = await file.text();
      importRecipeText(els.importText.value);
    });
    els.importButton?.addEventListener('click', () => importRecipeText(els.importText?.value || ''));
    els.clearImportButton?.addEventListener('click', () => {
      if (els.importText) els.importText.value = '';
      if (els.importFile) els.importFile.value = '';
    });
    els.resetButton?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      history.replaceState(null, '', location.pathname);
      applyPreset('recommended-lite');
      showToast('Builder reset to Recommended Lite.');
    });

    // The experimental browser builder accepts the current group selection
    // without requiring the user to redo it. This does not enable Firefox or
    // claim that a selected combination has passed browser compatibility tests.
    els.buildChrome?.addEventListener('click', () => {
      const code = toBase64Url(JSON.stringify({
        schema: 'sqol-experimental-recipe/v1',
        version: catalog.source?.version || 'unknown',
        modules: catalog.bundleOrder.filter(id => selected.has(id))
      }));
      location.href = '/lite/early-access/experimental/#build=' + code;
    });
    els.buildFirefox?.addEventListener('click', () => {
      showToast('Firefox custom builds are not supported in early access yet.');
    });
  }

  function applyPreset(id) {
    const profile = catalog.presets[id];
    if (!profile && id !== 'custom') return;
    preset = id;
    if (id !== 'custom') unknownBundles = [];
    if (id === 'custom') {
      if (!selected.size) selected.add('core');
    } else {
      selected = new Set(profile.bundles || []);
    }
    lastDependencyMessage = '';
    normalizeSelection();
    persistState();
    render();
  }

  function addWithDependencies(id, added = []) {
    const bundle = catalog.bundles[id];
    if (!bundle) return added;
    for (const dep of bundle.dependsOn || []) addWithDependencies(dep, added);
    if (!selected.has(id)) {
      selected.add(id);
      added.push(id);
    }
    return added;
  }

  function normalizeSelection() {
    const required = Object.entries(catalog.bundles)
      .filter(([, bundle]) => bundle.required)
      .map(([id]) => id);
    required.forEach(id => selected.add(id));

    let changed = true;
    while (changed) {
      changed = false;
      for (const id of [...selected]) {
        const bundle = catalog.bundles[id];
        if (!bundle) continue;
        for (const dep of bundle.dependsOn || []) {
          if (!selected.has(dep)) {
            selected.add(dep);
            changed = true;
          }
        }
      }
    }
  }

  function selectedDependentsOf(id) {
    return [...selected].filter(candidate => {
      if (candidate === id) return false;
      return dependsOn(candidate, id, new Set());
    });
  }

  function dependsOn(candidate, target, seen) {
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    const bundle = catalog.bundles[candidate];
    if (!bundle) return false;
    if ((bundle.dependsOn || []).includes(target)) return true;
    return (bundle.dependsOn || []).some(dep => dependsOn(dep, target, seen));
  }

  function requiredBySelected(id) {
    if (catalog.bundles[id]?.required) return ['required'];
    return selectedDependentsOf(id);
  }

  function render() {
    renderPresetButtons();
    renderModules();
    renderSummary();
    renderRecipe();
  }

  function renderPresetButtons() {
    els.presetButtons.forEach(button => {
      const active = button.dataset.litePreset === preset;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderModules() {
    if (!els.modules) return;
    els.modules.innerHTML = catalog.bundleOrder.map(id => {
      const bundle = catalog.bundles[id];
      const checked = selected.has(id);
      const neededBy = checked ? requiredBySelected(id) : [];
      const locked = bundle.required || (checked && neededBy.length > 0);
      const dependencyText = (bundle.dependsOn || []).length
        ? `Needs ${bundle.dependsOn.map(labelFor).join(' + ')}`
        : 'No optional dependencies';
      const lockText = bundle.required
        ? 'Required in every build'
        : (locked && neededBy.length ? `Needed by ${neededBy.map(labelFor).join(', ')}` : 'Optional');

      return `<label class="lite-module-card ${checked ? 'selected' : ''} ${locked ? 'locked' : ''}">
        <input type="checkbox" data-lite-module="${escapeAttr(id)}" ${checked ? 'checked' : ''} ${bundle.required ? 'disabled' : ''}>
        <span class="lite-module-check" aria-hidden="true">${checked ? '✓' : ''}</span>
        <span class="lite-module-copy">
          <span class="lite-module-title"><strong>${escapeHTML(bundle.label)}</strong><small>${bundle.files.length} runtime file${bundle.files.length === 1 ? '' : 's'}</small></span>
          <span class="lite-module-description">${escapeHTML(bundle.description)}</span>
          <span class="lite-module-meta"><em>${escapeHTML(dependencyText)}</em><em>${escapeHTML(lockText)}</em></span>
        </span>
      </label>`;
    }).join('');
  }

  function renderSummary() {
    const selectedKnown = catalog.bundleOrder.filter(id => selected.has(id));
    const selectedFiles = new Set();
    selectedKnown.forEach(id => (catalog.bundles[id].files || []).forEach(file => selectedFiles.add(file)));
    const allFiles = new Set();
    catalog.bundleOrder.forEach(id => (catalog.bundles[id].files || []).forEach(file => allFiles.add(file)));

    if (els.selectedCount) els.selectedCount.textContent = String(selectedKnown.length);
    if (els.fileCount) els.fileCount.textContent = String(selectedFiles.size);
    if (els.omittedCount) els.omittedCount.textContent = String(Math.max(0, allFiles.size - selectedFiles.size));
    if (els.presetName) els.presetName.textContent = presetLabel();
    if (els.dependencyNote) {
      els.dependencyNote.textContent = lastDependencyMessage || 'Dependencies are added automatically. Core is always included.';
    }
    if (els.unknown) {
      if (unknownBundles.length) {
        els.unknown.hidden = false;
        els.unknown.textContent = `${unknownBundles.length} module code${unknownBundles.length === 1 ? '' : 's'} from the imported recipe are not in this catalog yet. They are preserved when you export again.`;
      } else {
        els.unknown.hidden = true;
      }
    }
  }

  function renderRecipe() {
    if (els.recipePreview) els.recipePreview.textContent = JSON.stringify(buildRecipe(), null, 2);
  }

  function buildRecipe() {
    const known = catalog.bundleOrder.filter(id => selected.has(id));
    return {
      schema: 1,
      type: RECIPE_TYPE,
      source: {
        repository: catalog.source.repository,
        ref: catalog.source.ref,
        version: catalog.source.version
      },
      preset,
      bundles: [...known, ...unknownBundles],
      features: [],
      updatePolicy: {
        core: 'required',
        optionalModules: 'follow-recipe'
      }
    };
  }

  function importRecipeText(text) {
    let recipe;
    try {
      recipe = JSON.parse(String(text || '').trim());
    } catch {
      showToast('That recipe is not valid JSON.');
      return;
    }

    if (!recipe || typeof recipe !== 'object' || !Array.isArray(recipe.bundles)) {
      showToast('That file does not look like a QoL Lite recipe.');
      return;
    }

    const incoming = recipe.bundles.map(String);
    selected = new Set(incoming.filter(id => catalog.bundles[id]));
    unknownBundles = incoming.filter(id => !catalog.bundles[id]);
    preset = recipeMatchesPreset(recipe.preset, incoming) ? recipe.preset : 'custom';
    normalizeSelection();
    persistState();
    render();
    showToast('Recipe imported.');
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.bundles)) {
        selected = new Set(saved.bundles.filter(id => catalog.bundles[id]));
        unknownBundles = Array.isArray(saved.unknownBundles) ? saved.unknownBundles.map(String) : [];
        preset = (catalog.presets[saved.preset] || saved.preset === 'custom') ? (saved.preset || 'custom') : 'recommended-lite';
        return;
      }
    } catch {}
    const initial = catalog.presets['recommended-lite']?.bundles || ['core'];
    selected = new Set(initial);
    preset = 'recommended-lite';
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        preset,
        bundles: catalog.bundleOrder.filter(id => selected.has(id)),
        unknownBundles
      }));
    } catch {}
  }

  function applyHashRecipe() {
    const match = location.hash.match(/^#recipe=([^&]+)$/);
    if (!match) return;
    try {
      const recipe = JSON.parse(fromBase64Url(match[1]));
      if (!Array.isArray(recipe.bundles)) return;
      selected = new Set(recipe.bundles.filter(id => catalog.bundles[id]));
      unknownBundles = recipe.bundles.filter(id => !catalog.bundles[id]);
      preset = recipeMatchesPreset(recipe.preset, recipe.bundles.map(String)) ? recipe.preset : 'custom';
      normalizeSelection();
      persistState();
    } catch (error) {
      console.warn('[QoL Lite builder] Could not read recipe URL', error);
    }
  }

  function exportRecipe() {
    const recipe = buildRecipe();
    const blob = new Blob([`${JSON.stringify(recipe, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spicychat-qol-${preset === 'full' ? 'full' : 'lite'}-recipe.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Recipe downloaded.');
  }

  function recipeMatchesPreset(id, bundleIds) {
    const profile = catalog.presets[id];
    if (!profile || !Array.isArray(bundleIds)) return false;
    const knownIncoming = bundleIds.filter(bundleId => catalog.bundles[bundleId]);
    const expected = [...(profile.bundles || [])].sort();
    const actual = [...new Set(knownIncoming)].sort();
    return expected.length === actual.length && expected.every((value, index) => value === actual[index]);
  }

  function presetLabel() {
    if (preset === 'custom') return 'Custom';
    return catalog.presets[preset]?.label || 'Custom';
  }

  function labelFor(id) {
    return catalog.bundles[id]?.label || id;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { els.toast.hidden = true; }, 2600);
  }

  function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function fromBase64Url(value) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }
})();
