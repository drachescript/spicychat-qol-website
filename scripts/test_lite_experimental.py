#!/usr/bin/env python3
"""Experimental selectable-module website builder source/closure smoke checks.

Executed by the website branch CI. Static proof only, not live Chrome runtime.
"""
from __future__ import annotations

import json
import urllib.request
import os
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / 'lite/early-access/experimental-release.json'
PAGE = ROOT / 'lite/index.html'
SCRIPT = ROOT / 'assets/js/lite-features.js'


class HTMLAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.files = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'script' and data.get('src'):
            self.files.append(data['src'])
        elif tag == 'link' and 'stylesheet' in data.get('rel', '') and data.get('href'):
            self.files.append(data['href'])


def fetch_json(url):
    with urllib.request.urlopen(
        urllib.request.Request(url, headers={**{'User-Agent':'SQoL-Custom-Experimental-CI'},
            **({'Authorization':'Bearer '+os.environ['GITHUB_TOKEN']} if
               url.startswith('https://api.github.com/') and os.environ.get('GITHUB_TOKEN') else {})}),
        timeout=35
    ) as response:
        return json.load(response)


def main():
    release = json.loads(RELEASE.read_text(encoding='utf-8'))
    assert release['schema'] == 'sqol-experimental-modules/v1'
    assert release['status'] == 'experimental-unvalidated'
    assert release['version'] == '0.2.62'
    assert release['repository'] == 'drachescript/spicychat-qol-extension'
    assert len(release['commit']) == len(release['tree']) == 40
    assert SCRIPT.is_file() and PAGE.is_file()

    refs = HTMLAssets()
    refs.feed(PAGE.read_text(encoding='utf-8'))
    for path in refs.files:
        if path.startswith('/'):
            assert (ROOT / path.lstrip('/')).is_file(), path
    page = PAGE.read_text(encoding='utf-8')
    for control in ('data-features-list', 'data-features-download', 'data-features-install',
                    'data-features-export', 'data-features-share', 'data-features-import',
                    'data-features-recipe-preview', 'data-features-categories'):
        assert control in page, 'Unified Lite builder missing ' + control
    redirect = (ROOT / 'lite/early-access/experimental/index.html').read_text(encoding='utf-8')
    assert "location.search + location.hash" in redirect
    assert "location.replace('/lite/'" in redirect
    assert 'lite-experimental.js' not in page
    assert 'lite-features.js' in page
    for control in ('data-features-category-add','data-features-category-clear',
                    'data-features-build-stats'):
        assert control in page, 'Missing Custom builder usability control: '+control
    assert 'lite.js' not in page
    assert 'lite-experimental.js' not in redirect

    base = f"https://raw.githubusercontent.com/{release['repository']}/{release['commit']}"
    modules = fetch_json(base + '/build/modules.json')
    manifest = fetch_json(base + '/manifest.json')
    tree = fetch_json(
        f"https://api.github.com/repos/{release['repository']}/git/trees/{release['tree']}?recursive=1"
    )
    assert manifest['version'] == release['version']
    assert not tree['truncated']
    sources = {item['path'] for item in tree['tree'] if item['type'] == 'blob'}
    # v0.2.52 uses primary-file ownership contracts; the old nine-group
    # modules.json is a compatibility fallback and no longer a full inventory.
    all_content_scripts = {f for s in manifest['content_scripts'] for f in s.get('js', [])}
    all_css = {f for s in manifest['content_scripts'] for f in s.get('css', [])}
    assert all_content_scripts <= sources
    assert all_css <= sources
    catalog = fetch_json(base + '/build/feature-catalog.json')
    assert catalog['schema'] == 'sqol-custom-feature-catalog/v1'
    assert catalog['version'] == release['version']
    assert catalog['featureCount'] >= 129
    assert catalog['featureCount'] == len(catalog['features'])
    index = fetch_json(base + '/build/custom-package-index.json')
    assert index['schema'] == 'spicychat-qol-custom-package-assets/v1'
    assert index['sourceVersion'] == release['version']
    assert index['newFeaturesDefaultOff'] is True
    assert len(index['features']) >= catalog['featureCount']
    owned = {row['id']: row for row in index['features']}
    assert sum(bool(row['settings']) for row in index['features']) >= 33
    for fid in ['bot-archive','bot-backup','lorebook-backup','bot-status']:
        assert index['features'][next(i for i,r in enumerate(index['features']) if r['id']==fid)]['settings'], fid
    assert 'bot-status' not in {f['id'] for f in catalog['features']}, 'Background-only feature requires special packaging; never add it as a content script'

    assert all(not row['defaultSelected'] and not row['defaultUpdatesEnabled'] for row in owned.values())
    for feature in catalog['features']:
        row = owned[feature['id']]
        assert row['runtime'] == feature['runtimeScripts'][0]
        assert set(row['settings']) == set(feature['settingsScripts'])
        assert set(row['styles']) == set(feature['cssFiles'])
        assert set(row['dependencies']) == set(feature['requiredFeatures'])
    assert sum(bool(f.get('settingsScripts')) for f in catalog['features']) >= 35
    assert sum(bool(f.get('cssFiles')) for f in catalog['features']) >= 24

    assert all(set(f['requiredFeatures']) <= {x['id'] for x in catalog['features']} for f in catalog['features'])
    names = {f['id'] for f in catalog['features']}
    assert {'bot-blocking','auto-blocking','language-filter','bulk-blocking','ooc','chat-index', 'auto-images','auto-voice','character-pictures', 'model-quick-access', 'chat-lorebook-manager', 'previously-chatted-indicator'} <= names
    assert {'Blocking','Filtering','Pictures'} <= set(catalog['sections'])
    incoming={'chat-width-controls','chat-smart-folders','native-memory-probe',
              'chat-lorebook-recall','chat-lorebook-suggestions','private-lorebook-bridge'}
    assert incoming <= {f['id'] for f in catalog['features']}
    owned={f['id']: f for f in catalog['features']}
    assert 'context-keeper' in owned['private-lorebook-bridge']['requiredFeatures']
    assert 'chat-lorebook-manager' in owned['chat-lorebook-recall']['requiredFeatures']
    assert 'content/private-lorebook-archive-upload-main.js' in owned['private-lorebook-bridge']['requiredHelpers']
    assert 'content/styles/private-lorebook-bridge.css' in owned['private-lorebook-bridge']['cssFiles']
    assert 'content/styles/chat-smart-folders.css' in owned['chat-smart-folders']['cssFiles']
    assert 'bot-status' not in owned, 'Background-only Bot Status is not a content selector'
    history = 'content/chat-history-navigator.js'
    assert history in owned['chat-bookmarks']['requiredHelpers']
    assert history in next(row for row in index['features'] if row['id']=='chat-bookmarks')['helpers']
    assert history in sources
    assert 'settings/feature-panels/native-memory-probe.js' in owned['native-memory-probe']['settingsScripts']
    assert 'background/features/background-native-memory-probe.js' in owned['native-memory-probe']['backgroundFiles']
    assert 'settings/feature-panels/native-memory-probe.js' in sources
    assert 'background/features/background-context-keeper-storage.js' in owned['context-keeper']['backgroundFiles']
    assert 'background/features/background-chat-lorebook-local.js' in owned['chat-lorebook-manager']['backgroundFiles']
    assert 'background/features/background-native-memory-probe.js' in owned['native-memory-probe']['backgroundFiles']

    assert sum(bool(f.get('settingsScripts')) for f in catalog['features']) >= 35
    assert sum(bool(f.get('cssFiles')) for f in catalog['features']) >= 24
    for expected in ['ooc','story-day-tracker','wiki-lorebook-importer']:
        assert next(f for f in catalog['features'] if f['id']==expected)['cssFiles']
    assert all(set(f['runtimeScripts'] + f.get('requiredHelpers',[]) + f['cssFiles']) <= sources for f in catalog['features'])
    assert 'core' in modules['bundleOrder']
    assert len(modules['bundleOrder']) == 9

    def closure(wanted):
        selected = set()
        def walk(bundle):
            if bundle in selected:
                return
            for dep in modules['bundles'][bundle].get('dependsOn', []):
                walk(dep)
            selected.add(bundle)
        walk('core')
        for item in wanted: walk(item)
        return selected

    minimal = closure(['interface'])
    combined = closure(['chat', 'creator'])
    selected_min = {f for b in minimal for f in modules['bundles'][b]['files']}
    selected_combined = {f for b in combined for f in modules['bundles'][b]['files']}
    assert 'content/core.js' in selected_min
    assert 'content/ooc.js' not in selected_min
    assert 'content/lorebook-backup.js' not in selected_combined
    assert 'content/ooc.js' in selected_combined
    assert 'content/bot-backup.js' in selected_combined
    assert 'content/styles/ooc.css' in all_css
    assert 'background-entry.js' in sources
    assert 'options.html' in sources
    assert 'content/build-profile.js' in sources
    assert 'background/feature-build-profile.js' in sources
    print('PASS experimental module catalog:', len(modules['bundleOrder']),
          'groups,', len(all_content_scripts), 'manifest JS,',
          len(all_css), 'CSS; pinned to v' + release['version'])
    print('PASS dependency closure: Core+Interface', len(selected_min),
          'scripts; Chat+Creator', len(selected_combined), 'scripts')


if __name__ == '__main__':
    main()
